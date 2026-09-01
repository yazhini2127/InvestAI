import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div
      style={{
        width: "250px",
        height: "100vh",
        background: "#0F172A",
        color: "white",
        padding: "20px",
      }}
    >
      <h2 style={{ color: "#16A34A" }}>📈 InvestAI</h2>

      <hr />

      <p><Link to="/dashboard" style={{ color: "white", textDecoration: "none" }}>🏠 Dashboard</Link></p>

      <p>💼 Portfolio</p>

      <p>
         <Link
             to="/wallet"
             style={{
                color: "white",
                textDecoration: "none",
             }}
         >
            💰 Wallet
         </Link>
      </p>

      <p>🔄 Transactions</p>

      <p>📅 SIP Plans</p>

      <p>🤖 AI Advisor</p>

      <p>📰 Market News</p>

      <p>👤 Profile</p>

      <p>⚙️ Settings</p>

      <p style={{ color: "red" }}>🚪 Logout</p>
    </div>
  );
}

export default Sidebar;