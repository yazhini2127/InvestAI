import { useState } from "react";
import api from "../services/api";

function Wallet() {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // LOAD WALLET
  // =====================================================
  const fetchWallet = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/wallet");

      console.log("💰 Wallet Response:", response.data);

      if (response.data?.success) {
        const walletBalance = Number(
          response.data?.wallet?.balance || 0
        );

        setBalance(walletBalance);
      } else {
        setBalance(0);

        setError(
          response.data?.message ||
            "Failed to load wallet"
        );
      }
    } catch (err) {
      console.error(
        "❌ Wallet Error:",
        err.response?.data || err.message
      );

      setBalance(0);

      setError(
        err.response?.data?.message ||
          "Failed to load wallet"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD WALLET ON FIRST RENDER
  // =====================================================
  if (!loading && balance === 0 && !error && !message) {
    fetchWallet();
  }

  // =====================================================
  // DEPOSIT
  // =====================================================
  const handleDeposit = async () => {
    const value = Number(amount);

    if (!Number.isFinite(value) || value <= 0) {
      setError("Enter a valid amount");
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await api.post(
        "/wallet/deposit",
        {
          amount: value,
        }
      );

      console.log(
        "💰 Deposit Response:",
        response.data
      );

      if (response.data?.success) {
        setMessage("Money added successfully");
        setAmount("");

        if (response.data?.wallet) {
          setBalance(
            Number(
              response.data.wallet.balance || 0
            )
          );
        } else {
          await fetchWallet();
        }
      } else {
        setError(
          response.data?.message ||
            "Deposit failed"
        );
      }
    } catch (err) {
      console.error(
        "❌ Deposit Error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Deposit failed"
      );
    }
  };

  // =====================================================
  // WITHDRAW
  // =====================================================
  const handleWithdraw = async () => {
    const value = Number(amount);

    if (!Number.isFinite(value) || value <= 0) {
      setError("Enter a valid amount");
      return;
    }

    if (value > balance) {
      setError("Insufficient Balance");
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await api.post(
        "/wallet/withdraw",
        {
          amount: value,
        }
      );

      console.log(
        "💸 Withdraw Response:",
        response.data
      );

      if (response.data?.success) {
        setMessage(
          "Money withdrawn successfully"
        );
        setAmount("");

        if (response.data?.wallet) {
          setBalance(
            Number(
              response.data.wallet.balance || 0
            )
          );
        } else {
          await fetchWallet();
        }
      } else {
        setError(
          response.data?.message ||
            "Withdraw failed"
        );
      }
    } catch (err) {
      console.error(
        "❌ Withdraw Error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Withdraw failed"
      );
    }
  };

  // =====================================================
  // FORMAT BALANCE
  // =====================================================
  const formattedBalance =
    balance.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // =====================================================
  // UI
  // =====================================================
  return (
    <div
      style={{
        padding: "30px",
        background: "#F1F5F9",
        minHeight: "100vh",
      }}
    >
      <h1>💰 Wallet</h1>

      {/* Loading */}
      {loading && (
        <p>Loading wallet...</p>
      )}

      {/* Error */}
      {error && (
        <p
          style={{
            color: "#dc2626",
            background: "#fee2e2",
            padding: "10px",
            borderRadius: "8px",
            maxWidth: "500px",
          }}
        >
          ❌ {error}
        </p>
      )}

      {/* Success */}
      {message && (
        <p
          style={{
            color: "#166534",
            background: "#dcfce7",
            padding: "10px",
            borderRadius: "8px",
            maxWidth: "500px",
          }}
        >
          ✅ {message}
        </p>
      )}

      {!loading && (
        <>
          {/* Balance Card */}
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "10px",
              marginBottom: "20px",
              width: "350px",
              boxShadow:
                "0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            <h2>Current Balance</h2>

            <h1>
              ₹ {formattedBalance}
            </h1>
          </div>

          {/* Amount Input */}
          <input
            type="number"
            min="1"
            placeholder="Enter Amount"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError("");
              setMessage("");
            }}
            style={{
              padding: "10px",
              width: "250px",
              marginRight: "10px",
              border: "1px solid #ccc",
              borderRadius: "6px",
            }}
          />

          {/* Deposit */}
          <button
            onClick={handleDeposit}
            style={{
              padding: "10px 20px",
              marginRight: "10px",
              cursor: "pointer",
              background: "#16a34a",
              color: "white",
              border: "none",
              borderRadius: "6px",
            }}
          >
            💰 Add Money
          </button>

          {/* Withdraw */}
          <button
            onClick={handleWithdraw}
            style={{
              padding: "10px 20px",
              cursor: "pointer",
              background: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "6px",
            }}
          >
            💸 Withdraw
          </button>
        </>
      )}
    </div>
  );
}

export default Wallet;