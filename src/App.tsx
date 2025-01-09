import React, { useEffect, useState } from "react";
import { createThirdwebClient } from "thirdweb";
import { inAppWallet } from "thirdweb/wallets";
import axios from "axios";

//HERE YOU NEED TO SEND THE JWT MADE BY WP Currently using static value

const WP_JWT = `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3MzY0MTEwMzksImV4cCI6MTczNjQxNDYzOSwiaXNzIjoiaHR0cHM6Ly9nb2xkZW5yb2QtaG9yc2UtNjMwNjM5Lmhvc3RpbmdlcnNpdGUuY29tIiwiZGF0YSI6eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiY29udGFjdEBnYWxpbGVvcHJvdG9jb2wuaW8iLCJlbWFpbCI6ImNvbnRhY3RAZ2FsaWxlb3Byb3RvY29sLmlvIn19.E3cVh7sgv81ZMpb5kP3dhfcZtruE41jsDLoRVH0TXvw`;


const TEST_CLIENT_ID = "f0b4cf240217a520f3ca643b912e78d6";

export const client = createThirdwebClient({ clientId: TEST_CLIENT_ID });

export default function App() {
  const [status, setStatus] = useState("Initializing...");
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    const handleWalletConnection = async () => {

      try {
        setStatus("Initializing Thirdweb client...");

        const headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${WP_JWT}`
        };

        //live link will change in production
        const livelink = "https://demo.galileoprotocol.io/api/wordpress/loginWP"
        const { data: { data: JWT_TOKEN } } = await axios.post(livelink, {}, { headers })

        console.log(JWT_TOKEN)
        const wallet = inAppWallet();

        setStatus("Connecting wallet...");

        
        const account = await wallet.connect({
          client,
          strategy: "jwt",
          jwt: JWT_TOKEN,
          // jwt: JWT_TOKEN_STATIC, // if you want to use static JWT token instead of ngrok.
        });

        setWalletAddress(account.address);
        setStatus("Wallet connected successfully!");



        // setTimeout(async () => {
        await wallet.disconnect();
        setStatus("Wallet disconnected successfully.");
        // }, 5000);
      } catch (error) {
        console.error("Error connecting wallet:", error);
        setStatus("Error connecting wallet. Check the console for details.");
      }
    };

    handleWalletConnection();
  }, []);

  return (
    <div className="App">
      <h1>Wallet Connection</h1>
      <p>{status}</p>
      {walletAddress && <p>Connected Wallet Address: {walletAddress}</p>}
    </div>
  );
}
