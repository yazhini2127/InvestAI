import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import "./BuySell.css";

function BuySell() {
   const storedUser = localStorage.getItem("user");
const user = storedUser ? JSON.parse(storedUser) : null;
const userId = user?.id;

    const [investments, setInvestments] = useState([]);
    const [selectedInvestment, setSelectedInvestment] = useState("");

    const [quantity, setQuantity] = useState("");
    const [action, setAction] = useState("BUY");

    const [walletBalance, setWalletBalance] = useState(0);
    const [portfolioQuantity, setPortfolioQuantity] = useState(0);

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState("");

    // =====================================================
    // FORMAT CURRENCY
    // =====================================================

    const formatCurrency = (amount) => {
        return Number(amount || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    // =====================================================
    // GET INVESTMENT PRICE
    // =====================================================

    const getInvestmentPrice = (investment) => {
        if (!investment) {
            return 0;
        }

        return Number(
            investment.current_price ??
            investment.currentPrice ??
            investment.price ??
            investment.market_price ??
            investment.marketPrice ??
            investment.share_price ??
            investment.amount ??
            0
        );
    };

    // =====================================================
    // LOAD INVESTMENTS
    // =====================================================

    const loadInvestments = useCallback(async () => {
        try {
            const response = await api.get("/investments");

            console.log("Investments API:", response.data);

            if (response.data.success) {
                const data =
                    response.data.data ||
                    response.data.investments ||
                    [];

                setInvestments(
                    Array.isArray(data) ? data : []
                );
            } else {
                setError(
                    response.data.message ||
                    "Failed to load investments"
                );
            }
        } catch (err) {
            console.error("Investment Error:", err);

            setError(
                err.response?.data?.message ||
                "Failed to load investments"
            );
        }
    }, []);

    // =====================================================
    // LOAD WALLET
    // =====================================================

    const loadWallet = useCallback(async () => {
        try {
            const response = await api.get(
                `/wallet/${userId}`
            );

            console.log("Wallet API:", response.data);

            if (response.data.success) {
                const wallet =
                    response.data.data ||
                    response.data.wallet ||
                    {};

                const balance = Number(
                    wallet.balance ??
                    wallet.wallet_balance ??
                    wallet.amount ??
                    wallet.available_balance ??
                    0
                );

                setWalletBalance(balance);
            } else {
                setWalletBalance(0);
            }
        } catch (err) {
            console.error("Wallet Error:", err);
            setWalletBalance(0);
        }
    }, [userId]);

    // =====================================================
    // LOAD PORTFOLIO QUANTITY
    // =====================================================

    const loadPortfolioQuantity = useCallback(
        async (investmentId) => {
            if (!investmentId) {
                setPortfolioQuantity(0);
                return;
            }

            try {
                // IMPORTANT:
                // PortfolioRoutes.js has router.get("/:userId")
                // Therefore correct URL is /portfolio/2

                const response = await api.get(
                    `/portfolio/${userId}`
                );

                console.log(
                    "Portfolio API:",
                    response.data
                );

                if (response.data.success) {
                    const data =
                        response.data.data ||
                        response.data.portfolio ||
                        [];

                    const portfolioList =
                        Array.isArray(data)
                            ? data
                            : [data];

                    const item =
                        portfolioList.find(
                            (portfolio) =>
                                Number(
                                    portfolio.investment_id
                                ) ===
                                Number(investmentId)
                        );

                    const ownedQuantity = Number(
                        item?.quantity || 0
                    );

                    console.log(
                        "Owned Quantity:",
                        ownedQuantity
                    );

                    setPortfolioQuantity(
                        ownedQuantity
                    );
                } else {
                    setPortfolioQuantity(0);
                }
            } catch (err) {
                console.error(
                    "Portfolio Error:",
                    err
                );

                setPortfolioQuantity(0);
            }
        },
        [userId]
    );

    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {
        let mounted = true;

        const fetchInitialData = async () => {
            try {
                if (mounted) {
                    setPageLoading(true);
                    setError("");
                }

                await Promise.all([
                    loadInvestments(),
                    loadWallet(),
                ]);
            } catch (err) {
                console.error(
                    "Initial Load Error:",
                    err
                );
            } finally {
                if (mounted) {
                    setPageLoading(false);
                }
            }
        };

        fetchInitialData();

        return () => {
            mounted = false;
        };
    }, [loadInvestments, loadWallet]);

    // =====================================================
    // REFRESH
    // =====================================================

    const handleRefresh = async () => {
        try {
            setError("");
            setPageLoading(true);

            await Promise.all([
                loadInvestments(),
                loadWallet(),
            ]);

            if (
                selectedInvestment
            ) {
                await loadPortfolioQuantity(
                    selectedInvestment
                );
            }
        } catch (err) {
            console.error(
                "Refresh Error:",
                err
            );

            setError(
                "Failed to refresh data"
            );
        } finally {
            setPageLoading(false);
        }
    };

    // =====================================================
    // SELECTED INVESTMENT
    // =====================================================

    const selected = investments.find(
        (investment) =>
            Number(
                investment.investment_id ??
                investment.id
            ) ===
            Number(selectedInvestment)
    );

    const currentPrice =
        getInvestmentPrice(selected);

    const enteredQuantity = Number(
        quantity || 0
    );

    const totalAmount =
        currentPrice *
        enteredQuantity;

    // =====================================================
    // INVESTMENT CHANGE
    // =====================================================

    const handleInvestmentChange = async (
        event
    ) => {
        const investmentId =
            event.target.value;

        setSelectedInvestment(
            investmentId
        );

        setQuantity("");
        setError("");

        if (investmentId) {
            await loadPortfolioQuantity(
                investmentId
            );
        } else {
            setPortfolioQuantity(0);
        }
    };

    // =====================================================
    // BUY / SELL TAB
    // =====================================================

    const handleActionChange = async (
        newAction
    ) => {
        setAction(newAction);
        setQuantity("");
        setError("");

        if (
            selectedInvestment
        ) {
            await loadPortfolioQuantity(
                selectedInvestment
            );
        } else {
            setPortfolioQuantity(0);
        }
    };

    // =====================================================
    // TRANSACTION
    // =====================================================

    const handleTransaction = async () => {
        setError("");

        if (!selectedInvestment) {
            alert(
                "⚠️ Please select an investment."
            );
            return;
        }

        if (
            !quantity ||
            Number(quantity) <= 0
        ) {
            alert(
                "⚠️ Please enter a valid quantity."
            );
            return;
        }

        if (!selected) {
            alert(
                "❌ Investment not found."
            );
            return;
        }

        if (currentPrice <= 0) {
            alert(
                "❌ Current investment price is not available."
            );
            return;
        }

        // BUY CHECK
        if (
            action === "BUY" &&
            totalAmount > walletBalance
        ) {
            alert(
                `❌ Insufficient wallet balance.\n\nAvailable: ₹${formatCurrency(
                    walletBalance
                )}\nRequired: ₹${formatCurrency(
                    totalAmount
                )}`
            );
            return;
        }

        // SELL CHECK
        if (
            action === "SELL" &&
            enteredQuantity >
                portfolioQuantity
        ) {
            alert(
                `❌ You only have ${portfolioQuantity} shares.`
            );
            return;
        }

        try {
            setLoading(true);

            const endpoint =
                action === "BUY"
                    ? "/buy-sell/buy"
                    : "/buy-sell/sell";

            const requestData = {
                user_id: userId,
                investment_id:
                    Number(
                        selectedInvestment
                    ),
                quantity:
                    enteredQuantity,
            };

            console.log(
                "Transaction Request:",
                requestData
            );

            const response =
                await api.post(
                    endpoint,
                    requestData
                );

            console.log(
                "Transaction Response:",
                response.data
            );

            if (response.data.success) {
                alert(
                    action === "BUY"
                        ? "✅ Investment purchased successfully!"
                        : "✅ Investment sold successfully!"
                );

                setQuantity("");

                // Refresh wallet
                await loadWallet();

                // Refresh investments
                await loadInvestments();

                // Refresh portfolio
                await loadPortfolioQuantity(
                    selectedInvestment
                );
            } else {
                setError(
                    response.data.message ||
                    "Transaction failed"
                );
            }
        } catch (err) {
            console.error(
                "Transaction Error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Transaction failed"
            );
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // PAGE LOADING
    // =====================================================

    if (pageLoading) {
        return (
            <div className="buy-sell-page">

                <div className="buy-sell-loading">

                    <div className="loading-icon">
                        📈
                    </div>

                    <h2>
                        Loading Investments...
                    </h2>

                    <p>
                        Please wait while
                        InvestAI loads your
                        trading data.
                    </p>

                </div>

            </div>
        );
    }

    // =====================================================
    // UI
    // =====================================================

    return (
        <div className="buy-sell-page">

            {/* HEADER */}

            <div className="buy-sell-header">

                <div>

                    <span className="page-label">
                        INVESTAI TRADING
                    </span>

                    <h1>
                        📈 Buy & Sell
                    </h1>

                    <p>
                        Buy or sell your
                        investments easily
                        and securely.
                    </p>

                </div>

                <button
                    className="refresh-trading"
                    onClick={handleRefresh}
                    disabled={loading}
                >
                    🔄 Refresh
                </button>

            </div>

            {/* WALLET */}

            <div className="wallet-trading-card">

                <div className="wallet-icon">
                    💰
                </div>

                <div>

                    <span>
                        Available Wallet Balance
                    </span>

                    <strong>
                        ₹
                        {formatCurrency(
                            walletBalance
                        )}
                    </strong>

                </div>

            </div>

            {/* ERROR */}

            {error && (
                <div className="trading-error">
                    ❌ {error}
                </div>
            )}

            {/* MAIN */}

            <div className="trading-grid">

                {/* TRADE CARD */}

                <div className="trading-card">

                    {/* TABS */}

                    <div className="trade-tabs">

                        <button
                            type="button"
                            className={
                                action === "BUY"
                                    ? "active-buy"
                                    : ""
                            }
                            onClick={() =>
                                handleActionChange(
                                    "BUY"
                                )
                            }
                        >
                            ↗ BUY
                        </button>

                        <button
                            type="button"
                            className={
                                action === "SELL"
                                    ? "active-sell"
                                    : ""
                            }
                            onClick={() =>
                                handleActionChange(
                                    "SELL"
                                )
                            }
                        >
                            ↘ SELL
                        </button>

                    </div>

                    {/* INVESTMENT */}

                    <label>
                        Select Investment
                    </label>

                    <select
                        value={
                            selectedInvestment
                        }
                        onChange={
                            handleInvestmentChange
                        }
                    >

                        <option value="">
                            -- Select Investment --
                        </option>

                        {investments.map(
                            (investment) => {

                                const investmentId =
                                    investment.investment_id ??
                                    investment.id;

                                const price =
                                    getInvestmentPrice(
                                        investment
                                    );

                                return (
                                    <option
                                        key={
                                            investmentId
                                        }
                                        value={
                                            investmentId
                                        }
                                    >
                                        {
                                            investment.investment_name ??
                                            investment.name
                                        }
                                        {" - ₹"}
                                        {formatCurrency(
                                            price
                                        )}
                                    </option>
                                );
                            }
                        )}

                    </select>

                    {/* SELECTED INVESTMENT */}

                    {selected && (
                        <div className="selected-investment">

                            <div className="investment-symbol">
                                📊
                            </div>

                            <div>

                                <h3>
                                    {
                                        selected.investment_name ??
                                        selected.name
                                    }
                                </h3>

                                <span>
                                    {
                                        selected.investment_type ??
                                        "Investment"
                                    }

                                    {" • "}

                                    Risk:{" "}

                                    {
                                        selected.risk_level ??
                                        "Medium"
                                    }
                                </span>

                            </div>

                            <strong>
                                ₹
                                {formatCurrency(
                                    currentPrice
                                )}
                            </strong>

                        </div>
                    )}

                    {/* HOLDINGS */}

                    {action === "SELL" &&
                        selected && (
                            <div className="holding-info">

                                📦 You currently own{" "}

                                <strong>
                                    {
                                        portfolioQuantity
                                    }
                                </strong>

                                {" "}shares.

                            </div>
                        )}

                    {/* QUANTITY */}

                    <label>
                        Quantity
                    </label>

                    <input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="Enter quantity"
                        value={quantity}
                        onChange={(event) =>
                            setQuantity(
                                event.target.value
                            )
                        }
                    />

                    {/* SUMMARY */}

                    <div className="trade-summary">

                        <div>

                            <span>
                                Current Price
                            </span>

                            <strong>
                                ₹
                                {formatCurrency(
                                    currentPrice
                                )}
                            </strong>

                        </div>

                        <div>

                            <span>
                                Quantity
                            </span>

                            <strong>
                                {
                                    enteredQuantity ||
                                    0
                                }
                            </strong>

                        </div>

                        <div className="total-row">

                            <span>
                                Total Amount
                            </span>

                            <strong>
                                ₹
                                {formatCurrency(
                                    totalAmount
                                )}
                            </strong>

                        </div>

                    </div>

                    {/* CONFIRM BUTTON */}

                    <button
                        type="button"
                        className={
                            action === "BUY"
                                ? "confirm-buy"
                                : "confirm-sell"
                        }
                        onClick={
                            handleTransaction
                        }
                        disabled={
                            loading ||
                            !selectedInvestment ||
                            !quantity ||
                            currentPrice <= 0
                        }
                    >

                        {loading
                            ? "⏳ Processing..."
                            : action === "BUY"
                            ? "↗ Confirm Buy"
                            : "↘ Confirm Sell"}

                    </button>

                </div>

                {/* INFORMATION */}

                <div className="trading-info">

                    <div className="info-card">

                        <div className="info-icon">
                            🛡️
                        </div>

                        <h3>
                            Smart Trading
                        </h3>

                        <p>
                            InvestAI automatically
                            updates your wallet,
                            portfolio and
                            transaction history
                            after every trade.
                        </p>

                    </div>

                    <div className="info-card">

                        <div className="info-icon">
                            ⚡
                        </div>

                        <h3>
                            Real-time Calculation
                        </h3>

                        <p>
                            Total amount is
                            calculated automatically
                            using the current
                            investment price.
                        </p>

                    </div>

                    <div className="info-card">

                        <div className="info-icon">
                            🔄
                        </div>

                        <h3>
                            Automatic Updates
                        </h3>

                        <p>
                            Your wallet, portfolio
                            and transaction history
                            update automatically
                            after every trade.
                        </p>

                    </div>

                </div>

            </div>

            {/* FOOTER */}

            <footer className="buy-sell-footer">
                © 2026 InvestAI • Smart Investing
                with AI
            </footer>

        </div>
    );
}

export default BuySell;