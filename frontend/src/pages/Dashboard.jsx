import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function Dashboard() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={{ flex: 1, background: "#F1F5F9", minHeight: "100vh" }}>
        <Navbar />

        <div style={{ padding: "20px" }}>
          <h1>Welcome to InvestAI</h1>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: "20px",
              marginTop: "30px",
            }}
          >
            <div style={{ background: "white", padding: "20px", borderRadius: "10px" }}>
              <h3>💰 Wallet</h3>
              <h2>$10,000</h2>
            </div>

            <div style={{ background: "white", padding: "20px", borderRadius: "10px" }}>
              <h3>📈 Portfolio</h3>
              <h2>$25,000</h2>
            </div>

            <div style={{ background: "white", padding: "20px", borderRadius: "10px" }}>
              <h3>📅 SIP</h3>
              <h2>5 Active</h2>
            </div>

            <div style={{ background: "white", padding: "20px", borderRadius: "10px" }}>
              <h3>🤖 AI Score</h3>
              <h2>92%</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;