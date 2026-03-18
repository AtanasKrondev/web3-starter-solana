# Web3 Solana Starter

A modern starter kit for building Solana dApps with Next.js 16, React 19, and optimized user/developer experience.

## 🚀 Features

- **Next.js 16** - App Router, Server Components, and optimized routing
- **React 19** - Latest React features with Server and Client Components
- **Solana Integration** - Full Solana web3.js and wallet adapter support
- **Modern UI** - Beautiful components with Shadcn/ui, Tailwind CSS, and Radix UI
- **TypeScript** - Full type safety throughout the application
- **SWR** - Efficient data fetching with caching and revalidation

## 📋 Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm/yarn
- A Solana wallet (Phantom, Backpack, etc.)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/AtanasKrondev/web3-starter-solana.git
cd web3-starter-solana
```

2. Install dependencies:
```bash
pnpm install
# or
npm install
# or
yarn install
```

## 🏃‍♂️ Getting Started

1. Start the development server:
```bash
pnpm dev
# or
npm run dev
# or
yarn dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

3. Connect your Solana wallet to start interacting with the demo

## 🎯 Demo Features

The starter includes interactive demos for common Solana operations:

### Network Connection
- Check connection status to Solana networks
- Switch between mainnet-beta, devnet, and testnet

### Account Management
- View wallet balance and account information
- Display public key and account details

### Token Operations
- Create associated token accounts
- Interact with SPL tokens
- View token balances and metadata

### Program Interaction
- Interact with custom Solana programs
- Read program data and accounts
- Execute program instructions

### Transaction Signing
- Sign messages and transactions
- Send SOL to other addresses
- View transaction confirmations

## 📁 Project Structure

```
├── app/                  # Next.js app directory
│   ├── demo/            # Demo pages and components
│   │   ├── account/     # Account management demos
│   │   ├── network/     # Network connection demos
│   │   ├── program/     # Program interaction demos
│   │   ├── sign/        # Transaction signing demos
│   │   ├── token/       # Token operation demos
│   │   └── transfer/    # SOL transfer demos
│   └── page.tsx         # Landing page
├── components/          # Reusable UI components
├── config/             # Configuration files
├── hooks/              # Custom React hooks
├── idl/                # Solana program IDL files
├── lib/                # Utility functions and helpers
└── public/             # Static assets
```

## 🔧 Configuration

### Solana Network
Configure the Solana network in your environment variables:

```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
# or mainnet-beta, testnet
```

### Custom Programs
Add your program IDL files to the `idl/` directory and update the imports in your components.

## 📚 Key Dependencies

- `@solana/web3.js` - Solana blockchain interaction
- `@solana/wallet-adapter-react` - Wallet connection management
- `@solana/spl-token` - SPL token operations
- `@coral-xyz/anchor` - Anchor framework support
- `swr` - Data fetching and caching
- `@radix-ui/*` - Accessible UI primitives
- `tailwindcss` - Utility-first CSS framework

## 🚀 Building for Production

1. Build the application:
```bash
pnpm build
# or
npm run build
# or
yarn build
```

2. Start the production server:
```bash
pnpm start
# or
npm start
# or
yarn start
```

## 🌐 Deployment

### Vercel (Recommended)
The easiest way to deploy is using the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

### Other Platforms
This is a standard Next.js application and can be deployed to any platform that supports Node.js.

## 📖 Learn More

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [Solana Documentation](https://docs.solana.com/) - Solana blockchain documentation
- [Anchor Framework](https://www.anchor-lang.com/) - Solana program development framework
- [Wallet Adapter](https://github.com/solana-labs/wallet-adapter) - Solana wallet integration guide

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

Built with ❤️ by [HackBG](https://hack.bg) using open source software.
