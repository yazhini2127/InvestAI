import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Portfolio = () => {
  const navigate = useNavigate();

  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // LOAD PORTFOLIO
  // =====================================================

  const loadPortfolio = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/portfolio");

      console.log("📊 Portfolio response:", response.data);

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Failed to load portfolio"
        );
      }

      const data = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data?.portfolio)
        ? response.data.portfolio
        : [];

      setPortfolio(data);
    } catch (err) {
      console.error("❌ Portfolio Load Error:", err);

      setPortfolio([]);

      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load portfolio"
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPortfolio();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadPortfolio]);

  // =====================================================
  // GROUP PORTFOLIO
  // Investment + Platform = ONE HOLDING
  // =====================================================

  const groupedPortfolio = useMemo(() => {
    const grouped = {};

    portfolio.forEach((item) => {
      const investmentId = Number(
        item?.investment_id ??
          item?.investmentId ??
          0
      );

      const platformId = Number(
        item?.platform_id ??
          item?.platformId ??
          0
      );

      const investmentName =
        item?.investment_name ||
        item?.investmentName ||
        "Unknown Investment";

      const platformName =
        item?.platform_name ||
        item?.platformName ||
        item?.platform ||
        "Unknown Platform";

      /*
        Important:
        Investment + Platform together create the group.

        Example:
        ITC + Groww
        ITC + Zerodha

        These will remain separate.
      */

      const key =
        investmentId > 0
          ? `investment_${investmentId}_platform_${platformId}`
          : `name_${investmentName
              .toLowerCase()
              .trim()}_platform_${platformId}`;

      if (!grouped[key]) {
        grouped[key] = {
          ...item,

          quantity: 0,
          invested_amount: 0,
          current_value: 0,

          platform_name: platformName,
          platform_id: platformId,

          portfolioIds: [],
        };
      }

      const quantity = Number(item?.quantity || 0);

      const investedAmount = Number(
        item?.invested_amount ??
          item?.investedAmount ??
          0
      );

      const currentPrice = Number(
        item?.current_price ??
          item?.currentPrice ??
          0
      );

      grouped[key].quantity += quantity;

      grouped[key].invested_amount +=
        investedAmount;

      grouped[key].current_value +=
        quantity * currentPrice;

      if (item?.portfolio_id) {
        grouped[key].portfolioIds.push(
          item.portfolio_id
        );
      }
    });

    return Object.values(grouped);
  }, [portfolio]);

  // =====================================================
  // SUMMARY
  // =====================================================

  const totalInvested = useMemo(() => {
    return groupedPortfolio.reduce(
      (total, item) =>
        total + Number(item.invested_amount || 0),
      0
    );
  }, [groupedPortfolio]);

  const currentValue = useMemo(() => {
    return groupedPortfolio.reduce(
      (total, item) =>
        total + Number(item.current_value || 0),
      0
    );
  }, [groupedPortfolio]);

  const profitLoss = useMemo(() => {
    return currentValue - totalInvested;
  }, [currentValue, totalInvested]);

  const returnPercentage = useMemo(() => {
    if (totalInvested <= 0) {
      return 0;
    }

    return (
      (profitLoss / totalInvested) *
      100
    );
  }, [profitLoss, totalInvested]);

  // =====================================================
  // FORMATTERS
  // =====================================================

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value || 0));
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (portfolioId) => {
    if (!portfolioId) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this investment holding?"
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(portfolioId);
      setError("");
      setSuccess("");

      const response = await api.delete(
        `/portfolio/${portfolioId}`
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to delete investment"
        );
      }

      setSuccess(
        response.data?.message ||
          "Investment deleted successfully"
      );

      /*
        Remove the deleted row from local state.
      */
      setPortfolio((prev) =>
        prev.filter(
          (item) =>
            Number(item.portfolio_id) !==
            Number(portfolioId)
        )
      );

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(
        "❌ Portfolio Delete Error:",
        err
      );

      if (err.response?.status === 401) {
        setError(
          "Session expired. Please login again."
        );
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to delete investment"
        );
      }
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // LOGIN REDIRECT
  // =====================================================

  const handleLogin = () => {
    navigate("/login");
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      style={{
        padding: "30px",
        minHeight: "100vh",
        background: "#f8fafc",
      }}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "15px",
          flexWrap: "wrap",
          marginBottom: "25px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "30px",
              fontWeight: "700",
              color: "#111827",
            }}
          >
            My Portfolio
          </h1>

          <p
            style={{
              marginTop: "8px",
              marginBottom: 0,
              color: "#6b7280",
            }}
          >
            Track your investments and portfolio
            performance
          </p>
        </div>

        <button
          onClick={loadPortfolio}
          disabled={loading}
          style={{
            padding: "10px 18px",
            border: "none",
            borderRadius: "8px",
            background: "#2563eb",
            color: "#fff",
            cursor: loading
              ? "not-allowed"
              : "pointer",
            fontWeight: "600",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading
            ? "Refreshing..."
            : "🔄 Refresh"}
        </button>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#b91c1c",
            padding: "14px 16px",
            borderRadius: "8px",
            marginBottom: "20px",
            border: "1px solid #fecaca",
          }}
        >
          ❌ {error}

          {error.includes("login") && (
            <button
              onClick={handleLogin}
              style={{
                marginLeft: "15px",
                padding: "6px 12px",
                border: "none",
                borderRadius: "6px",
                background: "#b91c1c",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Login
            </button>
          )}
        </div>
      )}

      {/* =================================================
          SUCCESS
      ================================================= */}

      {success && (
        <div
          style={{
            background: "#dcfce7",
            color: "#166534",
            padding: "14px 16px",
            borderRadius: "8px",
            marginBottom: "20px",
            border: "1px solid #bbf7d0",
          }}
        >
          ✅ {success}
        </div>
      )}

      {/* =================================================
          LOADING
      ================================================= */}

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "70px 20px",
            color: "#6b7280",
          }}
        >
          <div
            style={{
              fontSize: "40px",
              marginBottom: "10px",
            }}
          >
            📊
          </div>

          <h3>Loading portfolio...</h3>

          <p>
            Please wait while we fetch your investments.
          </p>
        </div>
      ) : (
        <>
          {/* =================================================
              SUMMARY CARDS
          ================================================= */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px",
              marginBottom: "30px",
            }}
          >
            {/* TOTAL INVESTED */}

            <div
              style={{
                background: "#fff",
                padding: "22px",
                borderRadius: "12px",
                boxShadow:
                  "0 2px 10px rgba(0,0,0,0.06)",
                border: "1px solid #e5e7eb",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#6b7280",
                  fontSize: "14px",
                }}
              >
                💰 Total Invested
              </p>

              <h2
                style={{
                  marginTop: "10px",
                  marginBottom: 0,
                  color: "#111827",
                }}
              >
                {formatCurrency(totalInvested)}
              </h2>
            </div>

            {/* CURRENT VALUE */}

            <div
              style={{
                background: "#fff",
                padding: "22px",
                borderRadius: "12px",
                boxShadow:
                  "0 2px 10px rgba(0,0,0,0.06)",
                border: "1px solid #e5e7eb",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#6b7280",
                  fontSize: "14px",
                }}
              >
                📊 Current Value
              </p>

              <h2
                style={{
                  marginTop: "10px",
                  marginBottom: 0,
                  color: "#111827",
                }}
              >
                {formatCurrency(currentValue)}
              </h2>
            </div>

            {/* PROFIT / LOSS */}

            <div
              style={{
                background: "#fff",
                padding: "22px",
                borderRadius: "12px",
                boxShadow:
                  "0 2px 10px rgba(0,0,0,0.06)",
                border: "1px solid #e5e7eb",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#6b7280",
                  fontSize: "14px",
                }}
              >
                📈 Profit / Loss
              </p>

              <h2
                style={{
                  marginTop: "10px",
                  marginBottom: 0,
                  color:
                    profitLoss >= 0
                      ? "#16a34a"
                      : "#dc2626",
                }}
              >
                {profitLoss >= 0 ? "+" : ""}
                {formatCurrency(profitLoss)}
              </h2>
            </div>

            {/* RETURN */}

            <div
              style={{
                background: "#fff",
                padding: "22px",
                borderRadius: "12px",
                boxShadow:
                  "0 2px 10px rgba(0,0,0,0.06)",
                border: "1px solid #e5e7eb",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#6b7280",
                  fontSize: "14px",
                }}
              >
                🎯 Total Return
              </p>

              <h2
                style={{
                  marginTop: "10px",
                  marginBottom: 0,
                  color:
                    returnPercentage >= 0
                      ? "#16a34a"
                      : "#dc2626",
                }}
              >
                {returnPercentage >= 0 ? "+" : ""}
                {returnPercentage.toFixed(2)}%
              </h2>
            </div>
          </div>

          {/* =================================================
              PORTFOLIO OVERVIEW
          ================================================= */}

          {groupedPortfolio.length > 0 && (
            <div
              style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "25px",
                marginBottom: "25px",
                boxShadow:
                  "0 2px 10px rgba(0,0,0,0.06)",
                border: "1px solid #e5e7eb",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  color: "#111827",
                }}
              >
                Portfolio Overview
              </h2>

              <div
                style={{
                  marginTop: "20px",
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "15px",
                }}
              >
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "10px",
                    background: "#eff6ff",
                  }}
                >
                  <div
                    style={{
                      color: "#6b7280",
                      fontSize: "13px",
                    }}
                  >
                    Holdings
                  </div>

                  <strong
                    style={{
                      display: "block",
                      marginTop: "5px",
                      fontSize: "22px",
                      color: "#1d4ed8",
                    }}
                  >
                    {groupedPortfolio.length}
                  </strong>
                </div>

                <div
                  style={{
                    padding: "16px",
                    borderRadius: "10px",
                    background: "#f0fdf4",
                  }}
                >
                  <div
                    style={{
                      color: "#6b7280",
                      fontSize: "13px",
                    }}
                  >
                    Portfolio Status
                  </div>

                  <strong
                    style={{
                      display: "block",
                      marginTop: "5px",
                      fontSize: "22px",
                      color:
                        profitLoss >= 0
                          ? "#16a34a"
                          : "#dc2626",
                    }}
                  >
                    {profitLoss >= 0
                      ? "Positive"
                      : "Negative"}
                  </strong>
                </div>

                <div
                  style={{
                    padding: "16px",
                    borderRadius: "10px",
                    background: "#fefce8",
                  }}
                >
                  <div
                    style={{
                      color: "#6b7280",
                      fontSize: "13px",
                    }}
                  >
                    Return
                  </div>

                  <strong
                    style={{
                      display: "block",
                      marginTop: "5px",
                      fontSize: "22px",
                      color: "#ca8a04",
                    }}
                  >
                    {returnPercentage.toFixed(2)}%
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* =================================================
              INVESTMENTS
          ================================================= */}

          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "25px",
              boxShadow:
                "0 2px 10px rgba(0,0,0,0.06)",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                gap: "15px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    color: "#111827",
                  }}
                >
                  Your Investments
                </h2>

                <p
                  style={{
                    marginTop: "6px",
                    marginBottom: 0,
                    color: "#6b7280",
                  }}
                >
                  {groupedPortfolio.length}{" "}
                  {groupedPortfolio.length === 1
                    ? "holding"
                    : "holdings"}{" "}
                  in your portfolio
                </p>
              </div>

              <button
                onClick={() =>
                  navigate("/investments")
                }
                style={{
                  padding: "9px 15px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#2563eb",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                + Explore Investments
              </button>
            </div>

            {/* =================================================
                EMPTY
            ================================================= */}

            {groupedPortfolio.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  color: "#6b7280",
                }}
              >
                <div
                  style={{
                    fontSize: "45px",
                    marginBottom: "15px",
                  }}
                >
                  📊
                </div>

                <h3
                  style={{
                    marginBottom: "8px",
                    color: "#374151",
                  }}
                >
                  No investments yet
                </h3>

                <p>
                  Your portfolio is empty.
                  Start investing to see your
                  holdings here.
                </p>

                <button
                  onClick={() =>
                    navigate("/investments")
                  }
                  style={{
                    marginTop: "15px",
                    padding: "10px 18px",
                    border: "none",
                    borderRadius: "8px",
                    background: "#2563eb",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  View Investments
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(300px, 1fr))",
                  gap: "20px",
                }}
              >
                {groupedPortfolio.map(
                  (item, index) => {
                    const quantity = Number(
                      item.quantity || 0
                    );

                    const investedAmount =
                      Number(
                        item.invested_amount || 0
                      );

                    const currentAmount =
                      Number(
                        item.current_value || 0
                      );

                    const currentPrice =
                      Number(
                        item.current_price || 0
                      );

                    const itemProfit =
                      currentAmount -
                      investedAmount;

                    const itemReturn =
                      investedAmount > 0
                        ? (itemProfit /
                            investedAmount) *
                          100
                        : 0;

                    /*
                      Since this card represents one
                      Investment + Platform holding,
                      use the first portfolio row
                      as the delete target.
                    */
                    const portfolioId =
                      item.portfolioIds?.[0];

                    return (
                      <div
                        key={`${item.investment_id}-${item.platform_id}-${index}`}
                        style={{
                          border:
                            "1px solid #e5e7eb",
                          borderRadius: "14px",
                          padding: "20px",
                          background: "#fff",
                        }}
                      >
                        {/* NAME */}

                        <div
                          style={{
                            display: "flex",
                            justifyContent:
                              "space-between",
                            alignItems:
                              "flex-start",
                            gap: "10px",
                          }}
                        >
                          <div>
                            <h3
                              style={{
                                margin: 0,
                                color:
                                  "#111827",
                                fontSize:
                                  "19px",
                              }}
                            >
                              {item.investment_name}
                            </h3>

                            <p
                              style={{
                                marginTop:
                                  "5px",
                                marginBottom: 0,
                                color:
                                  "#6b7280",
                                fontSize:
                                  "14px",
                              }}
                            >
                              {item.investment_type}
                            </p>
                          </div>

                          <span
                            style={{
                              padding:
                                "5px 10px",
                              borderRadius:
                                "20px",
                              background:
                                "#f3f4f6",
                              fontSize:
                                "12px",
                              color:
                                "#374151",
                              fontWeight:
                                "600",
                            }}
                          >
                            {item.risk_level ||
                              "N/A"}
                          </span>
                        </div>

                        {/* PLATFORM */}

                        <div
                          style={{
                            marginTop: "14px",
                          }}
                        >
                          <span
                            style={{
                              display:
                                "inline-block",
                              padding:
                                "6px 11px",
                              borderRadius:
                                "7px",
                              background:
                                "#eff6ff",
                              color:
                                "#1d4ed8",
                              fontSize:
                                "12px",
                              fontWeight:
                                "600",
                            }}
                          >
                            🏦{" "}
                            {item.platform_name ||
                              "Unknown Platform"}
                          </span>
                        </div>

                        {/* DETAILS */}

                        <div
                          style={{
                            marginTop:
                              "20px",
                            display: "grid",
                            gap: "12px",
                          }}
                        >
                          <div
                            style={{
                              display:
                                "flex",
                              justifyContent:
                                "space-between",
                            }}
                          >
                            <span
                              style={{
                                color:
                                  "#6b7280",
                              }}
                            >
                              Quantity
                            </span>

                            <strong>
                              {quantity}
                            </strong>
                          </div>

                          <div
                            style={{
                              display:
                                "flex",
                              justifyContent:
                                "space-between",
                            }}
                          >
                            <span
                              style={{
                                color:
                                  "#6b7280",
                              }}
                            >
                              Invested
                            </span>

                            <strong>
                              {formatCurrency(
                                investedAmount
                              )}
                            </strong>
                          </div>

                          <div
                            style={{
                              display:
                                "flex",
                              justifyContent:
                                "space-between",
                            }}
                          >
                            <span
                              style={{
                                color:
                                  "#6b7280",
                              }}
                            >
                              Current Value
                            </span>

                            <strong>
                              {formatCurrency(
                                currentAmount
                              )}
                            </strong>
                          </div>

                          <div
                            style={{
                              display:
                                "flex",
                              justifyContent:
                                "space-between",
                            }}
                          >
                            <span
                              style={{
                                color:
                                  "#6b7280",
                              }}
                            >
                              Current Price
                            </span>

                            <strong>
                              {formatCurrency(
                                currentPrice
                              )}
                            </strong>
                          </div>

                          {/* P/L */}

                          <div
                            style={{
                              display:
                                "flex",
                              justifyContent:
                                "space-between",
                              paddingTop:
                                "12px",
                              borderTop:
                                "1px solid #e5e7eb",
                            }}
                          >
                            <span
                              style={{
                                color:
                                  "#6b7280",
                              }}
                            >
                              Profit / Loss
                            </span>

                            <strong
                              style={{
                                color:
                                  itemProfit >= 0
                                    ? "#16a34a"
                                    : "#dc2626",
                              }}
                            >
                              {itemProfit >= 0
                                ? "+"
                                : ""}
                              {formatCurrency(
                                itemProfit
                              )}
                            </strong>
                          </div>

                          {/* RETURN */}

                          <div
                            style={{
                              display:
                                "flex",
                              justifyContent:
                                "space-between",
                            }}
                          >
                            <span
                              style={{
                                color:
                                  "#6b7280",
                              }}
                            >
                              Return
                            </span>

                            <strong
                              style={{
                                color:
                                  itemReturn >= 0
                                    ? "#16a34a"
                                    : "#dc2626",
                              }}
                            >
                              {itemReturn >= 0
                                ? "+"
                                : ""}
                              {itemReturn.toFixed(2)}%
                            </strong>
                          </div>

                          {/* PURCHASE DATE */}

                          <div
                            style={{
                              display:
                                "flex",
                              justifyContent:
                                "space-between",
                            }}
                          >
                            <span
                              style={{
                                color:
                                  "#6b7280",
                              }}
                            >
                              Purchase Date
                            </span>

                            <strong>
                              {formatDate(
                                item.purchase_date
                              )}
                            </strong>
                          </div>
                        </div>

                        {/* DELETE */}

                        {portfolioId && (
                          <button
                            onClick={() =>
                              handleDelete(
                                portfolioId
                              )
                            }
                            disabled={
                              deletingId ===
                              portfolioId
                            }
                            style={{
                              width: "100%",
                              marginTop:
                                "20px",
                              padding:
                                "10px",
                              border: "none",
                              borderRadius:
                                "8px",
                              background:
                                "#dc2626",
                              color: "#fff",
                              cursor:
                                deletingId ===
                                portfolioId
                                  ? "not-allowed"
                                  : "pointer",
                              fontWeight:
                                "600",
                              opacity:
                                deletingId ===
                                portfolioId
                                  ? 0.7
                                  : 1,
                            }}
                          >
                            {deletingId ===
                            portfolioId
                              ? "Deleting..."
                              : "🗑️ Delete Holding"}
                          </button>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Portfolio;