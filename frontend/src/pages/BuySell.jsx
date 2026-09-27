import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import api from "../services/api";
import "./BuySell.css";

function BuySell() {
    const [investments, setInvestments] = useState([]);
    const [platforms, setPlatforms] = useState([]);

    const [selectedInvestment, setSelectedInvestment] =
        useState("");

    const [selectedPlatform, setSelectedPlatform] =
        useState("");

    const [quantity, setQuantity] = useState("");
    const [action, setAction] = useState("BUY");

    const [walletBalance, setWalletBalance] = useState(0);
    const [portfolioQuantity, setPortfolioQuantity] =
        useState(0);

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // =====================================================
    // FORMAT CURRENCY
    // =====================================================

    const formatCurrency = (amount) => {
        return Number(amount || 0).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        );
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
    // GET ARRAY DATA
    // =====================================================

    const getArrayData = (response) => {
        const body = response?.data;

        if (!body) {
            return [];
        }

        if (Array.isArray(body)) {
            return body;
        }

        if (Array.isArray(body.data)) {
            return body.data;
        }

        if (Array.isArray(body.investments)) {
            return body.investments;
        }

        if (Array.isArray(body.platforms)) {
            return body.platforms;
        }

        if (Array.isArray(body.rows)) {
            return body.rows;
        }

        if (Array.isArray(body.result)) {
            return body.result;
        }

        return [];
    };

    // =====================================================
    // LOAD INVESTMENTS
    // =====================================================

    const loadInvestments = useCallback(async () => {
        try {
            const response =
                await api.get("/investments");

            console.log(
                "📊 Investments:",
                response.data
            );

            if (response.data?.success === false) {
                throw new Error(
                    response.data?.message ||
                        "Failed to load investments"
                );
            }

            const data = getArrayData(response);

            setInvestments(
                Array.isArray(data) ? data : []
            );
        } catch (err) {
            console.error(
                "❌ Investment Error:",
                err
            );

            setInvestments([]);

            setError(
                err.response?.data?.message ||
                    err.message ||
                    "Failed to load investments"
            );
        }
    }, []);

    // =====================================================
    // LOAD PLATFORMS
    // =====================================================

    const loadPlatforms = useCallback(async () => {
        try {
            const response =
                await api.get("/platforms");

            console.log(
                "🏦 Platforms:",
                response.data
            );

            if (response.data?.success === false) {
                throw new Error(
                    response.data?.message ||
                        "Failed to load platforms"
                );
            }

            const data = getArrayData(response);

            setPlatforms(
                Array.isArray(data) ? data : []
            );
        } catch (err) {
            console.error(
                "❌ Platform Error:",
                err
            );

            setPlatforms([]);

            setError(
                err.response?.data?.message ||
                    err.message ||
                    "Failed to load platforms"
            );
        }
    }, []);

    // =====================================================
    // LOAD WALLET
    // =====================================================

    const loadWallet = useCallback(async () => {
        try {
            const response =
                await api.get("/wallet");

            console.log(
                "💰 Wallet:",
                response.data
            );

            if (response.data?.success === false) {
                throw new Error(
                    response.data?.message ||
                        "Failed to load wallet"
                );
            }

            const wallet =
                response.data?.data ||
                response.data?.wallet ||
                response.data?.result ||
                {};

            const balance = Number(
                wallet.balance ??
                    wallet.wallet_balance ??
                    wallet.amount ??
                    wallet.available_balance ??
                    0
            );

            setWalletBalance(
                Number.isFinite(balance)
                    ? balance
                    : 0
            );
        } catch (err) {
            console.error(
                "❌ Wallet Error:",
                err
            );

            setWalletBalance(0);

            setError(
                err.response?.data?.message ||
                    err.message ||
                    "Failed to load wallet"
            );
        }
    }, []);

    // =====================================================
    // LOAD PLATFORM-WISE PORTFOLIO QUANTITY
    // =====================================================

    const loadPortfolioQuantity = useCallback(
        async (
            investmentId,
            platformId
        ) => {
            if (
                !investmentId ||
                !platformId
            ) {
                setPortfolioQuantity(0);
                return;
            }

            try {
                const response =
                    await api.get("/portfolio");

                console.log(
                    "📦 Portfolio:",
                    response.data
                );

                const rawData =
                    response.data?.data ??
                    response.data?.portfolio ??
                    response.data?.result ??
                    response.data;

                let portfolioList = [];

                if (Array.isArray(rawData)) {
                    portfolioList = rawData;
                } else if (
                    Array.isArray(
                        rawData?.data
                    )
                ) {
                    portfolioList =
                        rawData.data;
                } else if (
                    Array.isArray(
                        rawData?.portfolio
                    )
                ) {
                    portfolioList =
                        rawData.portfolio;
                }

                const matchingItems =
                    portfolioList.filter(
                        (item) => {
                            const itemInvestmentId =
                                Number(
                                    item?.investment_id ??
                                        item?.investmentId ??
                                        item?.investment
                                            ?.investment_id ??
                                        item?.investment
                                            ?.id ??
                                        0
                                );

                            const itemPlatformId =
                                Number(
                                    item?.platform_id ??
                                        item?.platformId ??
                                        item?.platform
                                            ?.platform_id ??
                                        item?.platform
                                            ?.id ??
                                        0
                                );

                            return (
                                itemInvestmentId ===
                                    Number(
                                        investmentId
                                    ) &&
                                itemPlatformId ===
                                    Number(
                                        platformId
                                    )
                            );
                        }
                    );

                const ownedQuantity =
                    matchingItems.reduce(
                        (total, item) =>
                            total +
                            Number(
                                item?.quantity ||
                                    0
                            ),
                        0
                    );

                setPortfolioQuantity(
                    Number.isFinite(
                        ownedQuantity
                    )
                        ? ownedQuantity
                        : 0
                );
            } catch (err) {
                console.error(
                    "❌ Portfolio Quantity Error:",
                    err
                );

                setPortfolioQuantity(0);
            }
        },
        []
    );

    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {
        const timer = setTimeout(
            async () => {
                setPageLoading(true);
                setError("");

                await Promise.allSettled([
                    loadInvestments(),
                    loadPlatforms(),
                    loadWallet(),
                ]);

                setPageLoading(false);
            },
            0
        );

        return () =>
            clearTimeout(timer);
    }, [
        loadInvestments,
        loadPlatforms,
        loadWallet,
    ]);

    // =====================================================
    // REFRESH
    // =====================================================

    const handleRefresh = async () => {
        setError("");
        setSuccess("");
        setPageLoading(true);

        try {
            await Promise.all([
                loadInvestments(),
                loadPlatforms(),
                loadWallet(),
            ]);

            if (
                selectedInvestment &&
                selectedPlatform
            ) {
                await loadPortfolioQuantity(
                    selectedInvestment,
                    selectedPlatform
                );
            }
        } catch (err) {
            console.error(
                "❌ Refresh Error:",
                err
            );

            setError(
                "Failed to refresh trading data"
            );
        } finally {
            setPageLoading(false);
        }
    };

    // =====================================================
    // SELECTED INVESTMENT
    // =====================================================

    const selected = useMemo(() => {
        return investments.find(
            (investment) =>
                Number(
                    investment?.investment_id ??
                        investment?.id
                ) ===
                Number(selectedInvestment)
        );
    }, [
        investments,
        selectedInvestment,
    ]);

    // =====================================================
    // SELECTED PLATFORM
    // =====================================================

    const selectedPlatformData =
        useMemo(() => {
            return platforms.find(
                (platform) =>
                    Number(
                        platform?.platform_id ??
                            platform?.id
                    ) ===
                    Number(selectedPlatform)
            );
        }, [
            platforms,
            selectedPlatform,
        ]);

    // =====================================================
    // CURRENT PRICE
    // =====================================================

    const currentPrice =
        getInvestmentPrice(selected);

    // =====================================================
    // QUANTITY
    // =====================================================

    const enteredQuantity =
        Number(quantity || 0);

    // =====================================================
    // TOTAL AMOUNT
    // =====================================================

    const totalAmount =
        currentPrice *
        enteredQuantity;

    // =====================================================
    // AFTER TRADE BALANCE
    // =====================================================

    const afterTradeBalance =
        action === "BUY"
            ? walletBalance - totalAmount
            : walletBalance + totalAmount;

    // =====================================================
    // BUY VALIDATION
    // =====================================================

    const insufficientBalance =
        action === "BUY" &&
        totalAmount > walletBalance;

    // =====================================================
    // SELL VALIDATION
    // =====================================================

    const insufficientHoldings =
        action === "SELL" &&
        enteredQuantity >
            portfolioQuantity;

    // =====================================================
    // VALID QUANTITY
    // =====================================================

    const invalidQuantity =
        !quantity ||
        enteredQuantity <= 0 ||
        !Number.isInteger(
            enteredQuantity
        );

    // =====================================================
    // INVESTMENT CHANGE
    // =====================================================

    const handleInvestmentChange =
        async (event) => {
            const investmentId =
                event.target.value;

            setSelectedInvestment(
                investmentId
            );

            setQuantity("");
            setPortfolioQuantity(0);
            setError("");
            setSuccess("");

            if (
                investmentId &&
                selectedPlatform
            ) {
                await loadPortfolioQuantity(
                    investmentId,
                    selectedPlatform
                );
            }
        };

    // =====================================================
    // PLATFORM CHANGE
    // =====================================================

    const handlePlatformChange =
        async (event) => {
            const platformId =
                event.target.value;

            setSelectedPlatform(
                platformId
            );

            setQuantity("");
            setPortfolioQuantity(0);
            setError("");
            setSuccess("");

            if (
                platformId &&
                selectedInvestment
            ) {
                await loadPortfolioQuantity(
                    selectedInvestment,
                    platformId
                );
            }
        };

    // =====================================================
    // BUY / SELL CHANGE
    // =====================================================

    const handleActionChange =
        async (newAction) => {
            setAction(newAction);
            setQuantity("");
            setError("");
            setSuccess("");

            if (
                selectedInvestment &&
                selectedPlatform
            ) {
                await loadPortfolioQuantity(
                    selectedInvestment,
                    selectedPlatform
                );
            } else {
                setPortfolioQuantity(0);
            }
        };

    // =====================================================
    // TRANSACTION
    // =====================================================

    const handleTransaction =
        async () => {
            setError("");
            setSuccess("");

            if (!selectedPlatform) {
                setError(
                    "Please select an investment platform."
                );
                return;
            }

            if (!selectedInvestment) {
                setError(
                    "Please select an investment."
                );
                return;
            }

            if (invalidQuantity) {
                setError(
                    "Quantity must be a positive whole number."
                );
                return;
            }

            if (!selected) {
                setError(
                    "Investment not found."
                );
                return;
            }

            if (currentPrice <= 0) {
                setError(
                    "Current investment price is not available."
                );
                return;
            }

            if (insufficientBalance) {
                setError(
                    `Insufficient wallet balance. Available ₹${formatCurrency(
                        walletBalance
                    )}, required ₹${formatCurrency(
                        totalAmount
                    )}.`
                );
                return;
            }

            if (insufficientHoldings) {
                const platformName =
                    selectedPlatformData?.platform_name ??
                    selectedPlatformData?.name ??
                    selectedPlatformData?.platform ??
                    "this platform";

                setError(
                    `You only own ${portfolioQuantity} shares of this investment on ${platformName}.`
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
                    investment_id:
                        Number(
                            selectedInvestment
                        ),
                    platform_id:
                        Number(
                            selectedPlatform
                        ),
                    quantity:
                        enteredQuantity,
                };

                console.log(
                    "📤 Transaction Request:",
                    requestData
                );

                const response =
                    await api.post(
                        endpoint,
                        requestData
                    );

                console.log(
                    "📥 Transaction Response:",
                    response.data
                );

                if (!response.data?.success) {
                    throw new Error(
                        response.data?.message ||
                            "Transaction failed"
                    );
                }

                setSuccess(
                    action === "BUY"
                        ? "Investment purchased successfully!"
                        : "Investment sold successfully!"
                );

                setQuantity("");

                // Refresh all related data
                await Promise.all([
                    loadWallet(),
                    loadInvestments(),
                ]);

                await loadPortfolioQuantity(
                    selectedInvestment,
                    selectedPlatform
                );
            } catch (err) {
                console.error(
                    "❌ Transaction Error:",
                    err
                );

                setError(
                    err.response?.data?.message ||
                        err.message ||
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
                        Loading Trading Data...
                    </h2>

                    <p>
                        Please wait while
                        InvestAI loads your
                        trading information.
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
                        Trade investments using
                        your available wallet
                        balance.
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

            {/* SUCCESS */}

            {success && (
                <div className="trading-success">
                    ✅ {success}
                </div>
            )}

            {/* MAIN GRID */}

            <div className="trading-grid">

                {/* TRADE CARD */}

                <div className="trading-card">

                    {/* BUY / SELL */}

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

                    {/* PLATFORM */}

                    <label>
                        Select Platform
                    </label>

                    <select
                        value={
                            selectedPlatform
                        }
                        onChange={
                            handlePlatformChange
                        }
                    >
                        <option value="">
                            -- Select Platform --
                        </option>

                        {platforms.map(
                            (platform) => {
                                const platformId =
                                    platform?.platform_id ??
                                    platform?.id;

                                const platformName =
                                    platform?.platform_name ??
                                    platform?.name ??
                                    platform?.platform ??
                                    "Platform";

                                return (
                                    <option
                                        key={
                                            platformId
                                        }
                                        value={
                                            platformId
                                        }
                                    >
                                        {platformName}
                                    </option>
                                );
                            }
                        )}
                    </select>

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
                                    investment?.investment_id ??
                                    investment?.id;

                                const price =
                                    getInvestmentPrice(
                                        investment
                                    );

                                const name =
                                    investment?.investment_name ??
                                    investment?.name ??
                                    "Investment";

                                return (
                                    <option
                                        key={
                                            investmentId
                                        }
                                        value={
                                            investmentId
                                        }
                                    >
                                        {name} - ₹
                                        {formatCurrency(
                                            price
                                        )}
                                    </option>
                                );
                            }
                        )}
                    </select>

                    {/* SELECTED PLATFORM */}

                    {selectedPlatformData && (
                        <div className="selected-investment">
                            <div className="investment-symbol">
                                🏦
                            </div>

                            <div>
                                <h3>
                                    {
                                        selectedPlatformData.platform_name ??
                                        selectedPlatformData.name ??
                                        selectedPlatformData.platform
                                    }
                                </h3>

                                <span>
                                    Selected Trading
                                    Platform
                                </span>
                            </div>
                        </div>
                    )}

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

                    {/* SELL HOLDINGS */}

                    {action === "SELL" &&
                        selected &&
                        selectedPlatformData && (
                            <div className="holding-info">
                                📦 You currently own{" "}
                                <strong>
                                    {portfolioQuantity}
                                </strong>{" "}
                                {portfolioQuantity === 1
                                    ? "share"
                                    : "shares"}{" "}
                                on{" "}
                                <strong>
                                    {selectedPlatformData.platform_name ??
                                        selectedPlatformData.name ??
                                        selectedPlatformData.platform}
                                </strong>
                                .
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
                        max={
                            action === "SELL"
                                ? portfolioQuantity
                                : undefined
                        }
                        placeholder={
                            action === "SELL"
                                ? `Max ${portfolioQuantity}`
                                : "Enter quantity"
                        }
                        value={quantity}
                        onChange={(event) => {
                            const value =
                                event.target.value;

                            if (
                                value === "" ||
                                /^\d+$/.test(value)
                            ) {
                                setQuantity(value);
                                setError("");
                            }
                        }}
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
                                {enteredQuantity ||
                                    0}
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

                        {/* AFTER BALANCE */}

                        {enteredQuantity > 0 &&
                            currentPrice > 0 && (
                                <div
                                    className="total-row"
                                    style={{
                                        borderTop:
                                            "1px solid #e5e7eb",
                                        paddingTop:
                                            "12px",
                                    }}
                                >
                                    <span>
                                        After Trade
                                        Balance
                                    </span>

                                    <strong
                                        style={{
                                            color:
                                                afterTradeBalance >=
                                                0
                                                    ? "#16a34a"
                                                    : "#dc2626",
                                        }}
                                    >
                                        ₹
                                        {formatCurrency(
                                            afterTradeBalance
                                        )}
                                    </strong>
                                </div>
                            )}
                    </div>

                    {/* VALIDATION MESSAGE */}

                    {action === "BUY" &&
                        insufficientBalance && (
                            <div className="trading-error">
                                ⚠️ Insufficient wallet
                                balance.
                            </div>
                        )}

                    {action === "SELL" &&
                        insufficientHoldings && (
                            <div className="trading-error">
                                ⚠️ You cannot sell more
                                than your current
                                holdings.
                            </div>
                        )}

                    {/* CONFIRM */}

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
                            !selectedPlatform ||
                            !selectedInvestment ||
                            invalidQuantity ||
                            currentPrice <= 0 ||
                            insufficientBalance ||
                            insufficientHoldings
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
                            Your wallet,
                            portfolio and
                            transaction history
                            are updated after
                            every successful trade.
                        </p>
                    </div>

                    <div className="info-card">
                        <div className="info-icon">
                            ⚡
                        </div>

                        <h3>
                            Instant Calculation
                        </h3>

                        <p>
                            Total trade value and
                            remaining wallet
                            balance are calculated
                            automatically.
                        </p>
                    </div>

                    <div className="info-card">
                        <div className="info-icon">
                            🔄
                        </div>

                        <h3>
                            Platform-wise Holdings
                        </h3>

                        <p>
                            Holdings are checked
                            separately for each
                            investment platform.
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