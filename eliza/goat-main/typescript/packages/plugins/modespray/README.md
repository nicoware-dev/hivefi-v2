<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# ModeSpray GOAT Plugin
This plugin enables AI agents to interact with [ModeSpray](https://modespray.xyz/) on Mode Network, allowing them to **Spray** assets to multiple recipients in a single transaction.

## Installation

```bash
npm install @goat-sdk/plugin-modespray
yarn add @goat-sdk/plugin-modespray
pnpm add @goat-sdk/plugin-modespray
```

## Usage

```typescript
import { modeSpray } from "@goat-sdk/plugin-modespray";

const tools = await getOnChainTools({
    wallet: viem(wallet),
    plugins: [
        modeSpray(),
    ],
});
```

## Tools
- Spray assets to multiple recipients in a single transaction

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/4821833e-52e5-4126-a2a1-59e9fa9bebd7" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
