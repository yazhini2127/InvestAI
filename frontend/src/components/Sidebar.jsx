import { Link, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  
    const menuItems = [
  { name: "🏠 Dashboard", path: "/dashboard" },
  { name: "📈 Investments", path: "/investments" },
  { name: "💼 Portfolio", path: "/portfolio" },
  { name: "💰 Wallet", path: "/wallet" },
  { name: "🔄 Transactions", path: "/transactions" },
  { name: "📅 SIP Plans", path: "/sip-plans" },
  { name: "🤖 AI Advisor", path: "/ai-advisor" },
  { name: "📰 Market News", path: "/market-news" },
  { name: "👤 Profile", path: "/profile" },
  { name: "⚙️ Settings", path: "/settings" },
];
  

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div
      style={{
        width: "240px",
        minHeight: "100vh",
        background: "#0F172A",
        color: "white",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <h2 style={{ marginBottom: "30px" }}>📈 InvestAI</h2>

      {menuItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          style={{
            display: "block",
            color: "white",
            textDecoration: "none",
            padding: "13px 10px",
            marginBottom: "8px",
            borderRadius: "8px",
          }}
        >
          {item.name}
        </Link>
      ))}

      <button
        onClick={handleLogout}
        style={{
          width: "100%",
          marginTop: "20px",
          padding: "13px 10px",
          background: "transparent",
          border: "none",
          color: "white",
          textAlign: "left",
          fontSize: "16px",
          cursor: "pointer",
          borderRadius: "8px",
        }}
      >
        🚪 Logout
      </button>
    </div>
  );
}

export default Sidebar;