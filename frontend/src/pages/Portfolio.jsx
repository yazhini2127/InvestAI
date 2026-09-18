import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

// ======================================================
// GET USER ID
// ======================================================

const getUserId = () => {
  const storedUser =
    localStorage.getItem("user") ||
    localStorage.getItem("userData");

  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);

      return (
        user.user_id ??
        user.userId ??
        user.id ??
        localStorage.getItem("userId") ??
        localStorage.getItem("user_id") ??
        1
      );
    } catch {
      return (
        localStorage.getItem("userId") ||
        localStorage.getItem("user_id") ||
        1
      );
    }
  }

  return (
    localStorage.getItem("userId") ||
    localStorage.getItem("user_id") ||
    1
  );
};

// ======================================================
// PORTFOLIO COMPONENT
// ======================================================

const Portfolio = () => {
  const navigate = useNavigate();

  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ====================================================
  // LOAD PORTFOLIO
  // ====================================================

  const loadPortfolio = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const userId = getUserId();

      console.log(
        "📊 Loading portfolio for user:",
        userId
      );

      const response = await fetch(
        `${API_URL}/portfolio/${userId}`
      );

      if (!response.ok) {
        throw new Error(
          `Server error: ${response.status}`
        );
      }

      const data = await response.json();

      console.log(
        "📊 Portfolio response:",
        data
      );

      if (!data.success) {
        throw new Error(
          data.message ||
            "Failed to load portfolio"
        );
      }

      setPortfolio(
        Array.isArray(data.portfolio)
          ? data.portfolio
          : []
      );
    } catch (err) {
      console.error(
        "❌ Portfolio Load Error:",
        err
      );

      setPortfolio([]);

      setError(
        err.message ||
          "Failed to load portfolio"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ====================================================
  // INITIAL LOAD
  // ====================================================

  useEffect(() => {
    let active = true;

    const fetchInitialPortfolio = async () => {
      try {
        const userId = getUserId();

        const response = await fetch(
          `${API_URL}/portfolio/${userId}`
        );

        if (!response.ok) {
          throw new Error(
            `Server error: ${response.status}`
          );
        }

        const data = await response.json();

        if (!active) return;

        if (!data.success) {
          throw new Error(
            data.message ||
              "Failed to load portfolio"
          );
        }

        setPortfolio(
          Array.isArray(data.portfolio)
            ? data.portfolio
            : []
        );
      } catch (err) {
        if (!active) return;

        console.error(
          "❌ Initial Portfolio Error:",
          err
        );

        setError(
          err.message ||
            "Failed to load portfolio"
        );

        setPortfolio([]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchInitialPortfolio();

    return () => {
      active = false;
    };
  }, []);

  // ====================================================
  // DELETE INVESTMENT
  // ====================================================

  const deleteInvestment = async (
    portfolioId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this investment?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(portfolioId);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/portfolio/${portfolioId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to delete investment"
        );
      }

      setPortfolio((current) =>
        current.filter(
          (item) =>
            item.portfolio_id !==
            portfolioId
        )
      );

      setSuccess(
        "Investment deleted successfully."
      );
    } catch (err) {
      console.error(
        "❌ Delete Error:",
        err
      );

      setError(
        err.message ||
          "Failed to delete investment"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ====================================================
  // TOTAL INVESTED
  // ====================================================

  const totalInvested = useMemo(() => {
    return portfolio.reduce(
      (total, item) =>
        total +
        Number(
          item.invested_amount || 0
        ),
      0
    );
  }, [portfolio]);

  // ====================================================
  // CURRENT VALUE
  // ====================================================

  const currentValue = useMemo(() => {
    return portfolio.reduce(
      (total, item) => {
        const quantity = Number(
          item.quantity || 0
        );

        const currentPrice = Number(
          item.current_price || 0
        );

        return (
          total +
          quantity * currentPrice
        );
      },
      0
    );
  }, [portfolio]);

  // ====================================================
  // PROFIT / LOSS
  // ====================================================

  const totalProfitLoss =
    currentValue - totalInvested;

  // ====================================================
  // RETURN %
  // ====================================================

  const totalReturn =
    totalInvested > 0
      ? (totalProfitLoss /
          totalInvested) *
        100
      : 0;

  // ====================================================
  // FORMAT MONEY
  // ====================================================

  const formatMoney = (amount) => {
    return Number(
      amount || 0
    ).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // ====================================================
  // FORMAT DATE
  // ====================================================

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "N/A";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  };

  // ====================================================
  // RISK STYLE
  // ====================================================

  const getRiskStyle = (risk) => {
    const value = String(
      risk || ""
    ).toLowerCase();

    if (value === "low") {
      return "bg-green-100 text-green-700";
    }

    if (value === "high") {
      return "bg-red-100 text-red-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">

          <div className="text-6xl mb-4">
            📈
          </div>

          <h2 className="text-2xl font-bold text-slate-800">
            Loading Portfolio...
          </h2>

          <p className="mt-2 text-slate-500">
            Fetching your investments
          </p>

        </div>
      </div>
    );
  }

  // ====================================================
  // MAIN UI
  // ====================================================

  return (
    <div className="min-h-screen bg-slate-100">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-6 py-6">

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

            <div>

              <div className="flex items-center gap-3">

                <button
                  onClick={() =>
                    navigate("/dashboard")
                  }
                  className="rounded-lg bg-slate-100 px-3 py-2 text-lg transition hover:bg-slate-200"
                >
                  ←
                </button>

                <h1 className="text-3xl font-bold text-slate-900">
                  💼 My Portfolio
                </h1>

              </div>

              <p className="mt-2 text-slate-500">
                Track your investments in one place
              </p>

            </div>

            <button
              onClick={loadPortfolio}
              disabled={loading}
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              🔄 Refresh
            </button>

          </div>

        </div>

      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* ERROR */}

        {error && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">

            <span>
              ❌ {error}
            </span>

            <button
              onClick={() =>
                setError("")
              }
              className="font-bold"
            >
              ×
            </button>

          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-green-700">

            <span>
              ✅ {success}
            </span>

            <button
              onClick={() =>
                setSuccess("")
              }
              className="font-bold"
            >
              ×
            </button>

          </div>
        )}

        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

          {/* TOTAL INVESTED */}

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Total Invested
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-900">
                  ₹{formatMoney(totalInvested)}
                </h2>

              </div>

              <div className="rounded-xl bg-blue-100 p-3 text-2xl">
                💰
              </div>

            </div>

          </div>

          {/* CURRENT VALUE */}

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Current Value
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-900">
                  ₹{formatMoney(currentValue)}
                </h2>

              </div>

              <div className="rounded-xl bg-purple-100 p-3 text-2xl">
                📊
              </div>

            </div>

          </div>

          {/* PROFIT LOSS */}

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Profit / Loss
                </p>

                <h2
                  className={`mt-2 text-3xl font-bold ${
                    totalProfitLoss >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {totalProfitLoss >= 0
                    ? "+"
                    : "-"}
                  ₹
                  {formatMoney(
                    Math.abs(
                      totalProfitLoss
                    )
                  )}
                </h2>

              </div>

              <div
                className={`rounded-xl p-3 text-2xl ${
                  totalProfitLoss >= 0
                    ? "bg-green-100"
                    : "bg-red-100"
                }`}
              >
                {totalProfitLoss >= 0
                  ? "📈"
                  : "📉"}
              </div>

            </div>

          </div>

          {/* TOTAL RETURN */}

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Total Return
                </p>

                <h2
                  className={`mt-2 text-3xl font-bold ${
                    totalReturn >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {totalReturn >= 0
                    ? "+"
                    : ""}
                  {totalReturn.toFixed(2)}%
                </h2>

              </div>

              <div className="rounded-xl bg-yellow-100 p-3 text-2xl">
                ⭐
              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            INVESTMENTS TITLE
        ================================================= */}

        <div className="mt-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>

            <h2 className="text-2xl font-bold text-slate-900">
              Your Investments
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {portfolio.length} investment
              {portfolio.length !== 1
                ? "s"
                : ""}{" "}
              in your portfolio
            </p>

          </div>

          <button
            onClick={() =>
              navigate("/investments")
            }
            className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
          >
            + Add Investment
          </button>

        </div>

        {/* =================================================
            EMPTY PORTFOLIO
        ================================================= */}

        {portfolio.length === 0 ? (

          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">

            <div className="text-6xl">
              📊
            </div>

            <h3 className="mt-5 text-xl font-bold text-slate-800">
              No investments yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-slate-500">
              Start investing today and
              your investments will appear
              here.
            </p>

            <button
              onClick={() =>
                navigate("/investments")
              }
              className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Explore Investments
            </button>

          </div>

        ) : (

          /* =================================================
             INVESTMENT CARDS
          ================================================= */

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">

            {portfolio.map((item) => {

              const quantity = Number(
                item.quantity || 0
              );

              const investedAmount =
                Number(
                  item.invested_amount || 0
                );

              const currentPrice =
                Number(
                  item.current_price || 0
                );

              const currentInvestmentValue =
                quantity *
                currentPrice;

              const profitLoss =
                currentInvestmentValue -
                investedAmount;

              const returnPercentage =
                investedAmount > 0
                  ? (profitLoss /
                      investedAmount) *
                    100
                  : 0;

              return (

                <div
                  key={
                    item.portfolio_id
                  }
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >

                  {/* CARD HEADER */}

                  <div className="border-b border-slate-100 p-6">

                    <div className="flex items-start justify-between gap-4">

                      <div className="flex items-center gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                          📈
                        </div>

                        <div>

                          <h3 className="text-xl font-bold text-slate-900">
                            {item.investment_name ||
                              "Investment"}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {item.investment_type ||
                              "Investment"}
                          </p>

                        </div>

                      </div>

                      <span
                        className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${getRiskStyle(
                          item.risk_level
                        )}`}
                      >
                        Risk:{" "}
                        {item.risk_level ||
                          "Unknown"}
                      </span>

                    </div>

                  </div>

                  {/* DETAILS */}

                  <div className="grid grid-cols-2 gap-4 p-6">

                    <div className="rounded-xl bg-slate-50 p-4">

                      <p className="text-xs font-medium text-slate-500">
                        Quantity
                      </p>

                      <p className="mt-1 text-lg font-bold text-slate-900">
                        {quantity}
                      </p>

                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">

                      <p className="text-xs font-medium text-slate-500">
                        Invested Amount
                      </p>

                      <p className="mt-1 text-lg font-bold text-slate-900">
                        ₹
                        {formatMoney(
                          investedAmount
                        )}
                      </p>

                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">

                      <p className="text-xs font-medium text-slate-500">
                        Current Price
                      </p>

                      <p className="mt-1 text-lg font-bold text-slate-900">
                        ₹
                        {formatMoney(
                          currentPrice
                        )}
                      </p>

                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">

                      <p className="text-xs font-medium text-slate-500">
                        Current Value
                      </p>

                      <p className="mt-1 text-lg font-bold text-slate-900">
                        ₹
                        {formatMoney(
                          currentInvestmentValue
                        )}
                      </p>

                    </div>

                  </div>

                  {/* PROFIT / LOSS */}

                  <div className="px-6">

                    <div
                      className={`rounded-xl p-5 ${
                        profitLoss >= 0
                          ? "bg-green-50"
                          : "bg-red-50"
                      }`}
                    >

                      <div className="flex items-center justify-between">

                        <div>

                          <p className="text-sm font-medium text-slate-500">
                            Profit / Loss
                          </p>

                          <p
                            className={`mt-1 text-2xl font-bold ${
                              profitLoss >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {profitLoss >= 0
                              ? "+"
                              : "-"}
                            ₹
                            {formatMoney(
                              Math.abs(
                                profitLoss
                              )
                            )}
                          </p>

                        </div>

                        <div className="text-right">

                          <p className="text-sm font-medium text-slate-500">
                            Return
                          </p>

                          <p
                            className={`mt-1 text-xl font-bold ${
                              returnPercentage >=
                              0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {returnPercentage >=
                            0
                              ? "+"
                              : ""}
                            {returnPercentage.toFixed(
                              2
                            )}
                            %
                          </p>

                        </div>

                      </div>

                    </div>

                  </div>

                  {/* FOOTER */}

                  <div className="mt-5 border-t border-slate-100 p-6">

                    <div className="mb-5 grid grid-cols-2 gap-4">

                      <div>

                        <p className="text-xs text-slate-500">
                          Purchase Date
                        </p>

                        <p className="mt-1 font-semibold text-slate-700">
                          {formatDate(
                            item.purchase_date
                          )}
                        </p>

                      </div>

                      <div>

                        <p className="text-xs text-slate-500">
                          Portfolio ID
                        </p>

                        <p className="mt-1 font-semibold text-slate-700">
                          #
                          {
                            item.portfolio_id
                          }
                        </p>

                      </div>

                      <div>

                        <p className="text-xs text-slate-500">
                          Investment ID
                        </p>

                        <p className="mt-1 font-semibold text-slate-700">
                          #
                          {
                            item.investment_id
                          }
                        </p>

                      </div>

                      <div>

                        <p className="text-xs text-slate-500">
                          Risk Level
                        </p>

                        <p className="mt-1 font-semibold text-slate-700">
                          {item.risk_level ||
                            "Unknown"}
                        </p>

                      </div>

                    </div>

                    <button
                      onClick={() =>
                        deleteInvestment(
                          item.portfolio_id
                        )
                      }
                      disabled={
                        deletingId ===
                        item.portfolio_id
                      }
                      className="w-full rounded-xl border border-red-200 bg-red-50 py-3 font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId ===
                      item.portfolio_id
                        ? "⏳ Deleting..."
                        : "🗑️ Delete Investment"}
                    </button>

                  </div>

                </div>
              );
            })}

          </div>
        )}

        {/* FOOTER */}

        <div className="mt-10 pb-6 text-center text-sm text-slate-400">
          © 2026 InvestAI • Smart Investing with AI
        </div>

      </main>
    </div>
  );
};

export default Portfolio;