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

  // Load logged-in user's portfolio
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

      setPortfolio(
        Array.isArray(response.data.portfolio)
          ? response.data.portfolio
          : []
      );
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

  // Initial portfolio loading
  useEffect(() => {
    let cancelled = false;

    const fetchPortfolio = async () => {
      try {
        setError("");

        const response = await api.get("/portfolio");

        console.log(
          "📊 Initial Portfolio response:",
          response.data
        );

        if (!response.data?.success) {
          throw new Error(
            response.data?.message ||
              "Failed to load portfolio"
          );
        }

        if (cancelled) return;

        setPortfolio(
          Array.isArray(response.data.portfolio)
            ? response.data.portfolio
            : []
        );
      } catch (err) {
        if (cancelled) return;

        console.error(
          "❌ Initial Portfolio Error:",
          err
        );

        setPortfolio([]);

        if (err.response?.status === 401) {
          setError(
            "Session expired. Please login again."
          );
        } else {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load portfolio"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchPortfolio();

    return () => {
      cancelled = true;
    };
  }, []);

  // Delete portfolio investment
  const handleDelete = async (portfolioId) => {
    if (!portfolioId) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this investment?"
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

      setPortfolio((prev) =>
        prev.filter(
          (item) =>
            item.portfolio_id !== portfolioId
        )
      );
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

  // Calculate total invested amount
  const totalInvested = useMemo(() => {
    return portfolio.reduce(
      (total, item) =>
        total + Number(item.invested_amount || 0),
      0
    );
  }, [portfolio]);

  // Calculate current value
  const currentValue = useMemo(() => {
    return portfolio.reduce((total, item) => {
      const quantity = Number(item.quantity || 0);
      const currentPrice = Number(
        item.current_price || 0
      );

      return total + quantity * currentPrice;
    }, 0);
  }, [portfolio]);

  // Calculate profit / loss
  const profitLoss = useMemo(() => {
    return currentValue - totalInvested;
  }, [currentValue, totalInvested]);

  // Calculate return percentage
  const returnPercentage = useMemo(() => {
    if (totalInvested === 0) return 0;

    return (profitLoss / totalInvested) * 100;
  }, [profitLoss, totalInvested]);

  // Currency formatter
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(Number(value || 0));
  };

  // Date formatter
  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString("en-IN");
  };

  return (
    <div
      style={{
        padding: "30px",
        minHeight: "100vh",
        background: "#f8fafc",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
          gap: "15px",
          flexWrap: "wrap",
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
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Error */}
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
              onClick={() => navigate("/login")}
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

      {/* Success */}
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

      {/* Loading */}
      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "70px 20px",
            color: "#6b7280",
          }}
        >
          <h3>Loading portfolio...</h3>
          <p>Please wait.</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px",
              marginBottom: "30px",
            }}
          >
            {/* Total Invested */}
            <div
              style={{
                background: "#fff",
                padding: "22px",
                borderRadius: "12px",
                boxShadow:
                  "0 2px 10px rgba(0,0,0,0.06)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#6b7280",
                  fontSize: "14px",
                }}
              >
                Total Invested
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

            {/* Current Value */}
            <div
              style={{
                background: "#fff",
                padding: "22px",
                borderRadius: "12px",
                boxShadow:
                  "0 2px 10px rgba(0,0,0,0.06)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#6b7280",
                  fontSize: "14px",
                }}
              >
                Current Value
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

            {/* Profit / Loss */}
            <div
              style={{
                background: "#fff",
                padding: "22px",
                borderRadius: "12px",
                boxShadow:
                  "0 2px 10px rgba(0,0,0,0.06)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#6b7280",
                  fontSize: "14px",
                }}
              >
                Profit / Loss
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

            {/* Return */}
            <div
              style={{
                background: "#fff",
                padding: "22px",
                borderRadius: "12px",
                boxShadow:
                  "0 2px 10px rgba(0,0,0,0.06)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#6b7280",
                  fontSize: "14px",
                }}
              >
                Total Return
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
                {returnPercentage >= 0
                  ? "+"
                  : ""}
                {returnPercentage.toFixed(2)}%
              </h2>
            </div>
          </div>

          {/* Investments Section */}
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "25px",
              boxShadow:
                "0 2px 10px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
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
                    color: "#6b7280",
                  }}
                >
                  {portfolio.length}{" "}
                  {portfolio.length === 1
                    ? "investment"
                    : "investments"}{" "}
                  in your portfolio
                </p>
              </div>
            </div>

            {/* Empty Portfolio */}
            {portfolio.length === 0 ? (
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
                  investments here.
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
              /* Investment Cards */
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "20px",
                }}
              >
                {portfolio.map((item) => {
                  const quantity = Number(
                    item.quantity || 0
                  );

                  const investedAmount = Number(
                    item.invested_amount || 0
                  );

                  const currentPrice = Number(
                    item.current_price || 0
                  );

                  const currentAmount =
                    quantity * currentPrice;

                  const itemProfit =
                    currentAmount -
                    investedAmount;

                  const itemReturn =
                    investedAmount > 0
                      ? (itemProfit /
                          investedAmount) *
                        100
                      : 0;

                  return (
                    <div
                      key={item.portfolio_id}
                      style={{
                        border:
                          "1px solid #e5e7eb",
                        borderRadius: "12px",
                        padding: "20px",
                      }}
                    >
                      {/* Investment Name */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          alignItems: "flex-start",
                          gap: "10px",
                        }}
                      >
                        <div>
                          <h3
                            style={{
                              margin: 0,
                              color:
                                "#111827",
                            }}
                          >
                            {
                              item.investment_name
                            }
                          </h3>

                          <p
                            style={{
                              marginTop:
                                "5px",
                              color:
                                "#6b7280",
                              fontSize:
                                "14px",
                            }}
                          >
                            {
                              item.investment_type
                            }
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
                          }}
                        >
                          {
                            item.risk_level
                          }
                        </span>
                      </div>

                      {/* Details */}
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
                            Current Price
                          </span>

                          <strong>
                            {formatCurrency(
                              currentPrice
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
                            paddingTop:
                              "10px",
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
                                itemProfit >=
                                0
                                  ? "#16a34a"
                                  : "#dc2626",
                            }}
                          >
                            {itemProfit >=
                            0
                              ? "+"
                              : ""}
                            {formatCurrency(
                              itemProfit
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
                            Return
                          </span>

                          <strong
                            style={{
                              color:
                                itemReturn >=
                                0
                                  ? "#16a34a"
                                  : "#dc2626",
                            }}
                          >
                            {itemReturn >=
                            0
                              ? "+"
                              : ""}
                            {itemReturn.toFixed(
                              2
                            )}
                            %
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
                            Purchase Date
                          </span>

                          <strong>
                            {formatDate(
                              item.purchase_date
                            )}
                          </strong>
                        </div>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() =>
                          handleDelete(
                            item.portfolio_id
                          )
                        }
                        disabled={
                          deletingId ===
                          item.portfolio_id
                        }
                        style={{
                          width: "100%",
                          marginTop:
                            "20px",
                          padding: "10px",
                          border: "none",
                          borderRadius:
                            "8px",
                          background:
                            "#dc2626",
                          color: "#fff",
                          cursor:
                            deletingId ===
                            item.portfolio_id
                              ? "not-allowed"
                              : "pointer",
                          fontWeight:
                            "600",
                          opacity:
                            deletingId ===
                            item.portfolio_id
                              ? 0.7
                              : 1,
                        }}
                      >
                        {deletingId ===
                        item.portfolio_id
                          ? "Deleting..."
                          : "Delete Investment"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Portfolio;