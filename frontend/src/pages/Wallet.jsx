import { useEffect, useState } from "react";
import api from "../services/api";

function Wallet() {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Temporary user ID
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userId = user?.id;

  // Load wallet when page opens
  useEffect(() => {
    let cancelled = false;

    const fetchWallet = async () => {
      try {
        const response = await api.get(`/wallet/${userId}`);

        if (!cancelled && response.data.success) {
          setBalance(Number(response.data.wallet.balance));
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Wallet Error:", err);

          setError(
            err.response?.data?.message ||
              "Failed to load wallet"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchWallet();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Deposit
  const handleDeposit = async () => {
    const value = Number(amount);

    if (!value || value <= 0) {
      alert("Enter a valid amount");
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await api.post(
        `/wallet/${userId}/deposit`,
        {
          amount: value,
        }
      );

      if (response.data.success) {
        setMessage("Money added successfully");
        setAmount("");

        // Get updated balance
        const walletResponse = await api.get(
          `/wallet/${userId}`
        );

        if (walletResponse.data.success) {
          setBalance(
            Number(walletResponse.data.wallet.balance)
          );
        }
      }
    } catch (err) {
      console.error("Deposit Error:", err);

      setError(
        err.response?.data?.message ||
          "Deposit failed"
      );
    }
  };

  // Withdraw
  const handleWithdraw = async () => {
    const value = Number(amount);

    if (!value || value <= 0) {
      alert("Enter a valid amount");
      return;
    }

    if (value > balance) {
      alert("Insufficient Balance");
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await api.post(
        `/wallet/${userId}/withdraw`,
        {
          amount: value,
        }
      );

      if (response.data.success) {
        setMessage("Money withdrawn successfully");
        setAmount("");

        // Get updated balance
        const walletResponse = await api.get(
          `/wallet/${userId}`
        );

        if (walletResponse.data.success) {
          setBalance(
            Number(walletResponse.data.wallet.balance)
          );
        }
      }
    } catch (err) {
      console.error("Withdraw Error:", err);

      setError(
        err.response?.data?.message ||
          "Withdraw failed"
      );
    }
  };

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
      {loading && <p>Loading wallet...</p>}

      {/* Error */}
      {error && (
        <p
          style={{
            color: "#dc2626",
            background: "#fee2e2",
            padding: "10px",
            borderRadius: "8px",
          }}
        >
          {error}
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
          }}
        >
          {message}
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
              ₹{" "}
              {balance.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </h1>
          </div>

          {/* Amount Input */}
          <input
            type="number"
            placeholder="Enter Amount"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value)
            }
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