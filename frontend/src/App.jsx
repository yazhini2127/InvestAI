import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Wallet from "./pages/Wallet";
import Portfolio from "./pages/Portfolio";
import Transactions from "./pages/Transactions";
import SIPPlans from "./pages/SIPPlans";
import AIAdvisor from "./pages/AIAdvisor";
import MarketNews from "./pages/MarketNews";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={<Dashboard />} />

      <Route path="/wallet" element={<Wallet />} />

      <Route path="/portfolio" element={<Portfolio />} />

      <Route path="/sip-plans" element={<SIPPlans />} />
      <Route
    path="/settings"
    element={<Settings />}
/>
      
      <Route
    path="/ai-advisor"
    element={<AIAdvisor />}
    
/>



      <Route
    path="/transactions"
    element={<Transactions />}
/>
<Route
    path="/market-news"
    element={<MarketNews />}
/>
<Route
    path="/profile"
    element={<Profile />}
/>
    </Routes>
  );
}

export default App;