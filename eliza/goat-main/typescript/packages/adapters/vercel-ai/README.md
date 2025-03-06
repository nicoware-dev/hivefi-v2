<div align="center">
<a href="https://github.com/goat-sdk/goat">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="GOAT" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Vercel AI SDK Adapter for GOAT

Integrate the more than +200 onchain tools of GOAT with [Vercel AI SDK](https://sdk.vercel.ai).

## Installation
```
npm install @goat-sdk/adapter-vercel-ai
yarn add @goat-sdk/adapter-vercel-ai
pnpm add @goat-sdk/adapter-vercel-ai
```

## Usage

See a full working example [here](https://github.com/goat-sdk/goat/tree/main/typescript/examples/by-framework/vercel-ai).

```ts
import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";

const tools = await getOnChainTools({
    wallet: // your wallet
    plugins: // your plugins
});

const result = await generateText({
    model: openai("gpt-4o-mini"),
    tools: tools,
    prompt: "Your prompt here",
});
```

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/goat-sdk/goat">
  <img src="https://github.com/user-attachments/assets/4821833e-52e5-4126-a2a1-59e9fa9bebd7" alt="GOAT" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
<div>
</footer>
