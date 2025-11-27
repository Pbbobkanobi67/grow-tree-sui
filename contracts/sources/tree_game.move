/// Tree Watering Prize Pool Game
module tree_game::tree_game {
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::event;
    use sui::table::{Self, Table};

    // Error Codes
    const EGamePaused: u64 = 0;
    const EInsufficientPayment: u64 = 1;
    const ETreeAlreadyMature: u64 = 2;
    const EInvalidConfig: u64 = 4;
    const EGameNotPaused: u64 = 5;

    const BASIS_POINTS: u64 = 10000;
    const FINAL_STRETCH_THRESHOLD: u64 = 8000; // 80%

    public struct AdminCap has key, store { id: UID }

    public struct GameConfig has key, store {
        id: UID,
        water_cost: u64,
        growth_per_water: u64,
        maturity_threshold: u64,
        winner_share_bps: u64,
        treasury_share_bps: u64,
        treasury: address,
        is_paused: bool
    }

    public struct TreeGame has key {
        id: UID,
        growth_progress: u64,
        prize_pool: Balance<SUI>,
        round: u64,
        total_waterings: u64,
        unique_players: u64,
        contributions: Table<address, u64>,
        top1_address: address,
        top1_amount: u64,
        top2_address: address,
        top2_amount: u64,
        top3_address: address,
        top3_amount: u64
    }

    // Events
    public struct TreeWatered has copy, drop {
        player: address,
        round: u64,
        amount_paid: u64,
        growth_phase: u8,
        phase_progress_pct: u64,
        total_prize_pool: u64,
        unique_players: u64
    }

    public struct TreeMatured has copy, drop {
        winner: address,
        round: u64,
        winner_prize: u64,
        total_waterings: u64
    }

    public struct NewRoundStarted has copy, drop {
        round: u64,
        starting_pool: u64
    }

    fun init(ctx: &mut TxContext) {
        let admin_cap = AdminCap { id: object::new(ctx) };

        let config = GameConfig {
            id: object::new(ctx),
            water_cost: 50_000_000, // 0.05 SUI
            growth_per_water: 1,
            maturity_threshold: 100,
            winner_share_bps: 5000, // 50%
            treasury_share_bps: 2500, // 25%
            treasury: tx_context::sender(ctx),
            is_paused: false
        };

        let game = TreeGame {
            id: object::new(ctx),
            growth_progress: 0,
            prize_pool: balance::zero(),
            round: 1,
            total_waterings: 0,
            unique_players: 0,
            contributions: table::new(ctx),
            top1_address: @0x0,
            top1_amount: 0,
            top2_address: @0x0,
            top2_amount: 0,
            top3_address: @0x0,
            top3_amount: 0
        };

        transfer::transfer(admin_cap, tx_context::sender(ctx));
        transfer::share_object(config);
        transfer::share_object(game);

        event::emit(NewRoundStarted { round: 1, starting_pool: 0 });
    }

    public entry fun water_tree(
        game: &mut TreeGame,
        config: &GameConfig,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        assert!(!config.is_paused, EGamePaused);
        assert!(game.growth_progress < config.maturity_threshold, ETreeAlreadyMature);

        let payment_value = coin::value(&payment);
        assert!(payment_value >= config.water_cost, EInsufficientPayment);

        let player = tx_context::sender(ctx);

        balance::join(&mut game.prize_pool, coin::into_balance(payment));

        let is_new = !table::contains(&game.contributions, player);
        if (is_new) {
            table::add(&mut game.contributions, player, 0);
            game.unique_players = game.unique_players + 1;
        };

        let contribution = table::borrow_mut(&mut game.contributions, player);
        *contribution = *contribution + payment_value;
        let player_total = *contribution;

        update_top_contributors(game, player, player_total);

        let new_growth = game.growth_progress + config.growth_per_water;
        game.growth_progress = new_growth;
        game.total_waterings = game.total_waterings + 1;

        let (phase, phase_progress) = get_phase_info(game, config);

        event::emit(TreeWatered {
            player,
            round: game.round,
            amount_paid: payment_value,
            growth_phase: phase,
            phase_progress_pct: phase_progress,
            total_prize_pool: balance::value(&game.prize_pool),
            unique_players: game.unique_players
        });

        if (new_growth >= config.maturity_threshold) {
            complete_round(game, config, player, ctx);
        }
    }

    public entry fun water_tree_exact(
        game: &mut TreeGame,
        config: &GameConfig,
        payment: &mut Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let exact_payment = coin::split(payment, config.water_cost, ctx);
        water_tree(game, config, exact_payment, ctx);
    }

    fun update_top_contributors(game: &mut TreeGame, player: address, amount: u64) {
        if (amount > game.top1_amount) {
            game.top3_address = game.top2_address;
            game.top3_amount = game.top2_amount;
            game.top2_address = game.top1_address;
            game.top2_amount = game.top1_amount;
            game.top1_address = player;
            game.top1_amount = amount;
        } else if (amount > game.top2_amount && player != game.top1_address) {
            game.top3_address = game.top2_address;
            game.top3_amount = game.top2_amount;
            game.top2_address = player;
            game.top2_amount = amount;
        } else if (amount > game.top3_amount && player != game.top1_address && player != game.top2_address) {
            game.top3_address = player;
            game.top3_amount = amount;
        }
    }

    fun get_phase_info(game: &TreeGame, config: &GameConfig): (u8, u64) {
        let progress_bps = (game.growth_progress * BASIS_POINTS) / config.maturity_threshold;
        
        if (progress_bps < 3000) {
            (1, (progress_bps * 100) / 3000)
        } else if (progress_bps < 6000) {
            (2, ((progress_bps - 3000) * 100) / 3000)
        } else if (progress_bps < 8000) {
            (3, ((progress_bps - 6000) * 100) / 2000)
        } else {
            (4, 0) // Final stretch - hidden progress
        }
    }

    fun complete_round(
        game: &mut TreeGame,
        config: &GameConfig,
        winner: address,
        ctx: &mut TxContext
    ) {
        let total_pool = balance::value(&game.prize_pool);
        let winner_amount = (total_pool * config.winner_share_bps) / BASIS_POINTS;
        let treasury_amount = (total_pool * config.treasury_share_bps) / BASIS_POINTS;

        if (winner_amount > 0) {
            let winner_coin = coin::from_balance(
                balance::split(&mut game.prize_pool, winner_amount),
                ctx
            );
            transfer::public_transfer(winner_coin, winner);
        };

        if (treasury_amount > 0) {
            let treasury_coin = coin::from_balance(
                balance::split(&mut game.prize_pool, treasury_amount),
                ctx
            );
            transfer::public_transfer(treasury_coin, config.treasury);
        };

        event::emit(TreeMatured {
            winner,
            round: game.round,
            winner_prize: winner_amount,
            total_waterings: game.total_waterings
        });

        game.growth_progress = 0;
        game.round = game.round + 1;
        game.total_waterings = 0;
        game.unique_players = 0;
        game.top1_address = @0x0;
        game.top1_amount = 0;
        game.top2_address = @0x0;
        game.top2_amount = 0;
        game.top3_address = @0x0;
        game.top3_amount = 0;

        event::emit(NewRoundStarted {
            round: game.round,
            starting_pool: balance::value(&game.prize_pool)
        });
    }

    // Admin functions
    public entry fun pause_game(_: &AdminCap, config: &mut GameConfig) {
        config.is_paused = true;
    }

    public entry fun unpause_game(_: &AdminCap, config: &mut GameConfig) {
        config.is_paused = false;
    }

    public entry fun seed_pool(_: &AdminCap, game: &mut TreeGame, funds: Coin<SUI>) {
        balance::join(&mut game.prize_pool, coin::into_balance(funds));
    }

    // View functions
    public fun get_growth_progress(game: &TreeGame): u64 { game.growth_progress }
    public fun get_prize_pool(game: &TreeGame): u64 { balance::value(&game.prize_pool) }
    public fun get_round(game: &TreeGame): u64 { game.round }
    public fun get_water_cost(config: &GameConfig): u64 { config.water_cost }
    public fun is_paused(config: &GameConfig): bool { config.is_paused }
}
