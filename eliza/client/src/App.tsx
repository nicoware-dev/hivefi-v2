import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { WalletProvider } from "./components/providers/wallet-provider";

export default function App() {
  return (
    <WalletProvider>
      <RouterProvider router={router} />
    </WalletProvider>
  );
}
