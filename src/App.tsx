import React, { useEffect, useState } from "react";
import { createThirdwebClient } from "thirdweb";
import { inAppWallet } from "thirdweb/wallets";
import axios from "axios";
import { jwtDecode } from "jwt-decode";


const TEST_CLIENT_ID = "f0b4( PLEASE PLACE YOUR ACTUAL CLIENT ID )8d6";

export const client = createThirdwebClient({ clientId: TEST_CLIENT_ID });

export default function App() {
  const [status, setStatus] = useState("Initializing...");
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    const handleWalletConnection = async () => {
      try {
        setStatus("Initializing Thirdweb client...");

        // Retrieve JWT from local storage
        const WP_JWT = localStorage.getItem("jwtToken");

        if (!WP_JWT) {
          throw new Error("JWT not found in local storage.");
        }

        console.log("Retrieved JWT:", WP_JWT);

        // Validate the token structure by decoding it
        try {
          const decoded = jwtDecode(WP_JWT);
          console.log("Decoded JWT:", decoded);
        } catch (error) {
          throw new Error("Invalid JWT format.");
        }

        // Set headers for API calls
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${WP_JWT}`,
        };

        // Step 1: Request JWT token from API
        const jwtApiUrl = "https://demo.ENDPOINT URL.com/api/v1/auth/jwt";
        setStatus("Requesting JWT token from API...");
        const { data } = await axios.post(jwtApiUrl, {}, { headers });

        if (!data || !data.data) {
          throw new Error("JWT token not returned from API. Check response format.");
        }

        const JWT_TOKEN = data.data;

        // Decode JWT token to inspect its structure
        const decoded = jwtDecode<{ email: string; sub: string }>(JWT_TOKEN);
        console.log("Decoded JWT:", decoded);

        // Access the email and user ID directly from the decoded token
        const email = decoded?.email;
        const userId = decoded?.sub; // Extract the user ID
        console.log("Extracted Email:", email);
        console.log("Extracted User ID:", userId);

        // Step 2: Connect wallet using Thirdweb
        const wallet = inAppWallet();
        setStatus("Connecting wallet...");
        const account = await wallet.connect({
          client,
          strategy: "jwt",
          jwt: JWT_TOKEN,
        });

        setWalletAddress(account.address);
        setStatus("Wallet connected successfully!");

        // Step 3: Send wallet address, email, and user ID to WordPress
        const wpApiUrl =
          "https://demo.ENDPOINT URL.com/api/v1/auth/update-wallet-address";
        setStatus("Sending wallet address, email, and user ID to WordPress...");
        await axios.post(
          wpApiUrl,
          { walletAddress: account.address, email, userId },
          { headers }
        );

        setStatus("Wallet address, email, and user ID sent to WordPress successfully!");

        // Optional: Disconnect wallet after the operation
        await wallet.disconnect();
        setStatus("Wallet disconnected successfully.");
      } catch (error) {
        console.error("Error during wallet connection:", error);

        // Enhanced error handling
        if (axios.isAxiosError(error)) {
          setStatus(
            `Axios Error: ${error.response?.data?.message || error.message}. Check API and JWT token.`
          );
        } else {
          setStatus(`Unexpected Error: ${(error as Error).message}`);
        }
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
