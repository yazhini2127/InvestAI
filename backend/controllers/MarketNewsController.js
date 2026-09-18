const MarketNews = require("../models/MarketNewsModel");
const axios = require("axios");

// =====================================================
// GET MARKET NEWS
// =====================================================

exports.getMarketNews = (req, res) => {
    MarketNews.getMarketNews((err, result) => {
        if (err) {
            console.error("Market News Error:", err);

            return res.status(500).json({
                success: false,
                message: err.message,
            });
        }

        res.status(200).json({
            success: true,
            news: result || [],
        });
    });
};

// =====================================================
// GET LIVE MARKET DATA
// NIFTY 50 + SENSEX
// =====================================================

exports.getMarketData = async (req, res) => {
    try {
        const symbols = [
            "^NSEI",
            "^BSESN",
        ];

        const results = await Promise.all(
            symbols.map(async (symbol) => {
                try {
                    const response = await axios.get(
                        "https://query1.finance.yahoo.com/v8/finance/chart/" +
                            encodeURIComponent(symbol),
                        {
                            params: {
                                range: "1d",
                                interval: "1m",
                            },
                            timeout: 10000,
                        }
                    );

                    const result =
                        response.data?.chart?.result?.[0];

                    if (!result) {
                        return {
                            symbol,
                            success: false,
                            message: "No market data found",
                        };
                    }

                    const meta = result.meta || {};

                    const price =
                        Number(
                            meta.regularMarketPrice ??
                            meta.previousClose ??
                            0
                        );

                    const previousClose =
                        Number(
                            meta.previousClose ??
                            meta.chartPreviousClose ??
                            0
                        );

                    const change =
                        price - previousClose;

                    const changePercent =
                        previousClose !== 0
                            ? (change / previousClose) * 100
                            : 0;

                    return {
                        symbol,
                        price: Number(price.toFixed(2)),
                        previousClose: Number(
                            previousClose.toFixed(2)
                        ),
                        change: Number(
                            change.toFixed(2)
                        ),
                        changePercent: Number(
                            changePercent.toFixed(2)
                        ),
                        currency:
                            meta.currency || "INR",
                        exchange:
                            meta.exchangeName || "NSE",
                    };
                } catch (error) {
                    console.error(
                        `Market API Error - ${symbol}:`,
                        error.message
                    );

                    return {
                        symbol,
                        success: false,
                        message:
                            "Unable to fetch market data",
                    };
                }
            })
        );

        const nifty = results.find(
            (item) => item.symbol === "^NSEI"
        );

        const sensex = results.find(
            (item) => item.symbol === "^BSESN"
        );

        // =================================================
        // INDIAN MARKET TIMING
        // Monday - Friday
        // 09:15 AM - 03:30 PM IST
        // =================================================

        const now = new Date();

        const indiaTime = new Intl.DateTimeFormat(
            "en-IN",
            {
                timeZone: "Asia/Kolkata",
                weekday: "short",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            }
        ).formatToParts(now);

        const parts = {};

        indiaTime.forEach((part) => {
            parts[part.type] = part.value;
        });

        const weekday = parts.weekday;
        const hour = Number(parts.hour);
        const minute = Number(parts.minute);

        const currentMinutes =
            hour * 60 + minute;

        const marketStart = 9 * 60 + 15;
        const marketEnd = 15 * 60 + 30;

        const isWeekday =
            weekday !== "Sat" &&
            weekday !== "Sun";

        const isOpen =
            isWeekday &&
            currentMinutes >= marketStart &&
            currentMinutes <= marketEnd;

        res.status(200).json({
            success: true,

            market: {
                status: isOpen
                    ? "Open"
                    : "Closed",

                exchange:
                    "NSE / BSE",

                tradingHours:
                    "09:15 AM - 03:30 PM IST",

                timezone:
                    "Asia/Kolkata",
            },

            nifty: nifty || null,

            sensex: sensex || null,

            updatedAt:
                new Date().toISOString(),
        });
    } catch (error) {
        console.error(
            "Market Data Error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to fetch market data",
            error: error.message,
        });
    }
};