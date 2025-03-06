<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Avnu GOAT Plugin

Get quotes and swap on [Avnu](https://app.avnu.fi)

## Installation
```bash
npm install @goat-sdk/plugin-avnu
yarn add @goat-sdk/plugin-avnu
pnpm add @goat-sdk/plugin-avnu
```

## Usage
```typescript
import { avnu } from '@goat-sdk/plugin-avnu';

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
       avnu()
    ]
});
```

## Tools
* Swap tokens

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/4821833e-52e5-4126-a2a1-59e9fa9bebd7" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
