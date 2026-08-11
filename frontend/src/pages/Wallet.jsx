import { useState } from "react";

function Wallet() {
  const [balance, setBalance] = useState(10000);
  const [amount, setAmount] = useState("");
  const [transactions, setTransactions] = useState([
    { type: "Deposit", amount: 5000 },
    { type: "Withdraw", amount: 1000 },
  ]);

  const handleDeposit = () => {
    const value = Number(amount);

    if (!value || value <= 0) {
      alert("Enter a valid amount");
      return;
    }

    setBalance(balance + value);

    setTransactions([
      {
        type: "Deposit",
        amount: value,
      },
      ...transactions,
    ]);

    setAmount("");
  };

  const handleWithdraw = () => {
    const value = Number(amount);

    if (!value || value <= 0) {
      alert("Enter a valid amount");
      return;
    }

    if (value > balance) {
      alert("Insufficient Balance");
      return;
    }

    setBalance(balance - value);

    setTransactions([
      {
        type: "Withdraw",
        amount: value,
      },
      ...transactions,
    ]);

    setAmount("");
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

      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "20px",
          width: "350px",
        }}
      >
        <h2>Current Balance</h2>
        <h1>₹ {balance.toLocaleString()}</h1>
      </div>

      <input
        type="number"
        placeholder="Enter Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{
          padding: "10px",
          width: "250px",
          marginRight: "10px",
        }}
      />

      <button
        onClick={handleDeposit}
        style={{
          padding: "10px 20px",
          marginRight: "10px",
          cursor: "pointer",
        }}
      >
        Add Money
      </button>

      <button
        onClick={handleWithdraw}
        style={{
          padding: "10px 20px",
          cursor: "pointer",
        }}
      >
        Withdraw
      </button>

      <div
        style={{
          marginTop: "40px",
          background: "#fff",
          padding: "20px",
          borderRadius: "10px",
        }}
      >
        <h2>Recent Transactions</h2>

        <table
          border="1"
          cellPadding="10"
          style={{
            width: "100%",
            marginTop: "20px",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th>Type</th>
              <th>Amount</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((item, index) => (
              <tr key={index}>
                <td>{item.type}</td>
                <td>₹ {item.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Wallet;