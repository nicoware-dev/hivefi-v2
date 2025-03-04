"use client";

import { useWeb3Modal } from "@web3modal/wagmi/react";

export default function ConnectButton() {
  // 4. Use modal hook

  const { open } = useWeb3Modal();

  return (
    <div>
      <button
        onClick={() => open()}
        className="rounded-md border-black border-solid border-2 px-1"
      >
        Open Connect Modal
      </button>
    </div>
  );
}