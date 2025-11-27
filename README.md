Grow Tree SUI

A viral prize pool game on SUI blockchain. Water the tree to grow it - the player who completes it wins 50%!

## Quick Start

### 1. Deploy Contract
```
cd contracts
sui move build
sui client publish --gas-budget 200000000
```

### 2. Configure Frontend
```
cd frontend
copy .env.example .env.local
# Edit .env.local with your contract addresses
```

### 3. Run Locally
```
npm install
npm run dev
```

### 4. Deploy to Vercel
- Push to GitHub
- Import to Vercel
- Set root directory: frontend
- Add environment variables
- Deploy!

## Game Mechanics
- ðŸ’§ Water Cost: 0.05 SUI
- ðŸŒ±â†’ðŸŒ¿â†’ðŸŒ³â†’ðŸ”¥ Four growth phases
- ðŸ† Winner: 50% of prize pool
- ðŸ”„ 25% rolls to next round
