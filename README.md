# Monad Tokens Proxy

A Cloudflare Worker that serves as a proxy for fetching token data from the Thirdweb API for the Monad blockchain.

## Features

- Fetches ERC20 token balances
- Fetches ERC721 NFT balances
- Fetches ERC1155 token balances
- Supports metadata refresh for NFTs

## Deployment

### Prerequisites

- Cloudflare account
- Thirdweb API Client ID
- Node.js and npm installed

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.dev.vars` file with your environment variables:
   ```
   THIRDWEB_CLIENT_ID=your-client-id-here
   PROTECTION_API_KEY=your-api-key-here
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Deployment to Cloudflare

#### Using Wrangler CLI

1. Login to Cloudflare:
   ```bash
   npx wrangler login
   ```

2. Deploy the worker:
   ```bash
   npm run deploy
   ```

3. Configure the environment variables in the Cloudflare dashboard.

#### Using GitHub Actions (Recommended)

Set up a GitHub Actions workflow to automatically deploy your worker when changes are pushed to your repository. You'll need to add the following secrets to your GitHub repository:

- `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID
- `THIRDWEB_CLIENT_ID`: Your Thirdweb Client ID
- `PROTECTION_API_KEY`: Your protection API key

## API Usage

The worker exposes the following endpoints:

- `/erc20?address={wallet-address}`: Get ERC20 token balances
- `/erc721?address={wallet-address}`: Get ERC721 NFT balances
- `/erc1155?address={wallet-address}`: Get ERC1155 token balances
- `/metadata/refresh/{contract-address}/{token-id}`: Refresh NFT metadata

All requests require an `X-API-Key` header matching your `PROTECTION_API_KEY`. 