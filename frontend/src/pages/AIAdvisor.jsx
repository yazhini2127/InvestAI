import { useCallback, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import api from "../services/api";
import "./AIAdvisor.css";

function AIAdvisor() {
    const userId = 2;

    // =====================================================
    // STATES
    // =====================================================

    const [question, setQuestion] = useState("");
    const [response, setResponse] = useState("");

    const [language, setLanguage] = useState("ta");
    const [riskLevel, setRiskLevel] = useState("Medium");

    const [history, setHistory] = useState([]);
    const [expandedChat, setExpandedChat] = useState(null);

    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);

    const [error, setError] = useState("");
    const [historyError, setHistoryError] = useState("");

    // Speech state
    const [isSpeaking, setIsSpeaking] = useState(false);

    // =====================================================
    // QUICK QUESTIONS
    // =====================================================

    const quickQuestions =
        language === "ta"
            ? [
                  "SIP என்றால் என்ன?",
                  "Investment என்றால் என்ன?",
                  "Stock என்றால் என்ன?",
                  "Investment risk என்றால் என்ன?",
                  "நான் ஏன் முதலீடு செய்ய வேண்டும்?",
                  "Portfolio என்றால் என்ன?"
              ]
            : [
                  "What is SIP?",
                  "What is investment?",
                  "What is a stock?",
                  "What is investment risk?",
                  "Why should I invest?",
                  "What is a portfolio?"
              ];

    // =====================================================
    // STOP SPEAKING
    // =====================================================

    const stopSpeaking = useCallback(() => {
        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }

        setIsSpeaking(false);
    }, []);

    // =====================================================
    // CLEANUP ONLY WHEN COMPONENT UNMOUNTS
    // IMPORTANT:
    // No setState inside this effect
    // =====================================================

    useEffect(() => {
        return () => {
            if ("speechSynthesis" in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    // =====================================================
    // CLEAN MARKDOWN FOR SPEECH
    // =====================================================

    const cleanTextForSpeech = (text) => {
        if (!text) {
            return "";
        }

        return text
            .replace(/#{1,6}\s?/g, "")
            .replace(/\*\*/g, "")
            .replace(/__/g, "")
            .replace(/\*/g, "")
            .replace(/`/g, "")
            .replace(/>\s?/g, "")
            .replace(/\[(.*?)\]\(.*?\)/g, "$1")
            .replace(/\n+/g, ". ")
            .replace(/\s+/g, " ")
            .trim();
    };

    // =====================================================
    // SPEAK AI ANSWER
    // =====================================================

    const speakResponse = useCallback(
        (text) => {
            if (!text || !text.trim()) {
                return;
            }

            if (!("speechSynthesis" in window)) {
                setError(
                    language === "ta"
                        ? "உங்கள் browser text-to-speech-ஐ support செய்யவில்லை."
                        : "Your browser does not support text-to-speech."
                );

                return;
            }

            // Stop previous speech
            window.speechSynthesis.cancel();

            const cleanText =
                cleanTextForSpeech(text);

            if (!cleanText) {
                return;
            }

            const utterance =
                new SpeechSynthesisUtterance(
                    cleanText
                );

            utterance.lang =
                language === "ta"
                    ? "ta-IN"
                    : "en-IN";

            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 1;

            utterance.onstart = () => {
                setIsSpeaking(true);
            };

            utterance.onend = () => {
                setIsSpeaking(false);
            };

            utterance.onerror = (event) => {
                console.error(
                    "Speech error:",
                    event
                );

                setIsSpeaking(false);

                if (
                    event.error !== "canceled"
                ) {
                    setError(
                        language === "ta"
                            ? "AI பதிலை பேச வைக்க முடியவில்லை."
                            : "Unable to speak AI answer."
                    );
                }
            };

            window.speechSynthesis.speak(
                utterance
            );
        },
        [language]
    );

    // =====================================================
    // LOAD HISTORY
    // =====================================================

    const loadHistory = useCallback(async () => {
        try {
            setHistoryLoading(true);
            setHistoryError("");

            const res = await api.get(
                `/ai-advisor/chat-history/${userId}`
            );

            console.log(
                "CHAT HISTORY:",
                res.data
            );

            const historyData =
                res.data?.history ||
                res.data?.data ||
                [];

            setHistory(
                Array.isArray(historyData)
                    ? historyData
                    : []
            );
        } catch (err) {
            console.error(
                "HISTORY ERROR:",
                err
            );

            setHistory([]);

            setHistoryError(
                language === "ta"
                    ? "Chat history-ஐ load செய்ய முடியவில்லை."
                    : "Unable to load chat history."
            );
        } finally {
            setHistoryLoading(false);
        }
    }, [language]);

    // =====================================================
    // INITIAL HISTORY
    // =====================================================

    useEffect(() => {
        let cancelled = false;

        const fetchHistory = async () => {
            try {
                const res = await api.get(
                    `/ai-advisor/chat-history/${userId}`
                );

                if (cancelled) {
                    return;
                }

                const historyData =
                    res.data?.history ||
                    res.data?.data ||
                    [];

                setHistory(
                    Array.isArray(historyData)
                        ? historyData
                        : []
                );

                setHistoryError("");
            } catch (err) {
                if (cancelled) {
                    return;
                }

                console.error(
                    "INITIAL HISTORY ERROR:",
                    err
                );

                setHistory([]);

                setHistoryError(
                    "Unable to load chat history."
                );
            }
        };

        fetchHistory();

        return () => {
            cancelled = true;
        };
    }, []);

    // =====================================================
    // CHANGE LANGUAGE
    // IMPORTANT:
    // Do NOT use useEffect for this
    // =====================================================

    const changeLanguage = (newLanguage) => {
        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }

        setIsSpeaking(false);
        setLanguage(newLanguage);
        setError("");
    };

    // =====================================================
    // ASK AI
    // =====================================================

    const askAI = async () => {
        const text = question.trim();

        if (!text) {
            setError(
                language === "ta"
                    ? "தயவுசெய்து உங்கள் கேள்வியை உள்ளிடுங்கள்."
                    : "Please enter your question."
            );

            return;
        }

        try {
            setLoading(true);
            setError("");
            setResponse("");

            // Stop current speech
            if ("speechSynthesis" in window) {
                window.speechSynthesis.cancel();
            }

            setIsSpeaking(false);

            const res = await api.post(
                "/ai-advisor/advisor",
                {
                    userId,
                    question: text,
                    language,
                    riskLevel
                }
            );

            console.log(
                "GEMINI RESPONSE:",
                res.data
            );

            if (!res.data?.success) {
                throw new Error(
                    res.data?.message ||
                        "Gemini AI request failed."
                );
            }

            const aiAnswer =
                res.data?.answer ||
                res.data?.response ||
                "";

            if (!aiAnswer) {
                throw new Error(
                    "Gemini returned an empty response."
                );
            }

            setResponse(aiAnswer);
            setQuestion("");

            // Reload history
            await loadHistory();

        } catch (err) {
            console.error(
                "GEMINI AI ERROR:",
                err
            );

            setError(
                err?.response?.data?.message ||
                    err?.response?.data?.error ||
                    err?.message ||
                    "Gemini AI request failed."
            );
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // QUICK QUESTION
    // =====================================================

    const askQuickQuestion = (text) => {
        stopSpeaking();

        setQuestion(text);
        setResponse("");
        setError("");
    };

    // =====================================================
    // DELETE SINGLE CHAT
    // =====================================================

    const deleteChat = async (chatId) => {
        if (!chatId) {
            return;
        }

        try {
            setError("");

            await api.delete(
                `/ai-advisor/chat-history/${chatId}`
            );

            setHistory(
                (previousHistory) =>
                    previousHistory.filter(
                        (chat) =>
                            chat.chat_id !== chatId
                    )
            );

            if (expandedChat === chatId) {
                setExpandedChat(null);
            }
        } catch (err) {
            console.error(
                "DELETE CHAT ERROR:",
                err
            );

            setError(
                language === "ta"
                    ? "Chat-ஐ delete செய்ய முடியவில்லை."
                    : "Unable to delete chat."
            );
        }
    };

    // =====================================================
    // CLEAR ALL HISTORY
    // =====================================================

    const clearHistory = async () => {
        if (history.length === 0) {
            return;
        }

        const confirmed = window.confirm(
            language === "ta"
                ? "அனைத்து chat history-ஐ delete செய்யவா?"
                : "Are you sure you want to delete all chat history?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            await api.delete(
                `/ai-advisor/chat-history/user/${userId}`
            );

            stopSpeaking();

            setHistory([]);
            setResponse("");
            setExpandedChat(null);
        } catch (err) {
            console.error(
                "CLEAR HISTORY ERROR:",
                err
            );

            setError(
                language === "ta"
                    ? "Chat history-ஐ clear செய்ய முடியவில்லை."
                    : "Unable to clear chat history."
            );
        }
    };

    // =====================================================
    // VOICE INPUT
    // =====================================================

    const startVoiceInput = () => {
        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setError(
                language === "ta"
                    ? "உங்கள் browser voice input-ஐ support செய்யவில்லை."
                    : "Your browser does not support voice input."
            );

            return;
        }

        const recognition =
            new SpeechRecognition();

        recognition.lang =
            language === "ta"
                ? "ta-IN"
                : "en-IN";

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setError("");
        };

        recognition.onresult = (
            event
        ) => {
            const transcript =
                event.results?.[0]?.[0]
                    ?.transcript;

            if (transcript) {
                setQuestion(transcript);
            }
        };

        recognition.onerror = (
            event
        ) => {
            console.error(
                "VOICE INPUT ERROR:",
                event
            );

            let message;

            if (
                event.error ===
                "not-allowed"
            ) {
                message =
                    language === "ta"
                        ? "Microphone permission-ஐ allow செய்யுங்கள்."
                        : "Please allow microphone permission.";
            } else if (
                event.error ===
                "no-speech"
            ) {
                message =
                    language === "ta"
                        ? "உங்கள் குரல் கேட்கவில்லை. மீண்டும் முயற்சிக்கவும்."
                        : "No speech detected. Please try again.";
            } else {
                message =
                    language === "ta"
                        ? "Voice input பெற முடியவில்லை."
                        : "Unable to capture voice input.";
            }

            setError(message);
        };

        try {
            recognition.start();
        } catch (err) {
            console.error(
                "VOICE START ERROR:",
                err
            );
        }
    };

    // =====================================================
    // ENTER KEY
    // =====================================================

    const handleKeyDown = (event) => {
        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {
            event.preventDefault();

            if (!loading) {
                askAI();
            }
        }
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="ai-advisor-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="ai-header">

                <div>
                    <h1>
                        🤖 AI Investment Advisor
                    </h1>

                    <p>
                        {language === "ta"
                            ? "முதலீடு பற்றி கேட்டு தெரிந்து கொள்ளுங்கள்"
                            : "Ask anything about investments"}
                    </p>
                </div>

                <div className="ai-status">
                    <span className="status-dot"></span>
                    AI Online
                </div>

            </div>

            {/* =================================================
                CONTROLS
            ================================================= */}

            <div className="ai-controls">

                <div className="control-group">

                    <label>
                        🌐 Language
                    </label>

                    <div className="language-buttons">

                        <button
                            type="button"
                            className={
                                language === "ta"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                changeLanguage("ta")
                            }
                        >
                            🇮🇳 தமிழ்
                        </button>

                        <button
                            type="button"
                            className={
                                language === "en"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                changeLanguage("en")
                            }
                        >
                            🇬🇧 English
                        </button>

                    </div>

                </div>

                <div className="control-group">

                    <label>
                        📊 Risk Level
                    </label>

                    <div className="risk-buttons">

                        {[
                            "Low",
                            "Medium",
                            "High"
                        ].map((risk) => (
                            <button
                                key={risk}
                                type="button"
                                className={
                                    riskLevel ===
                                    risk
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setRiskLevel(
                                        risk
                                    )
                                }
                            >
                                {risk}
                            </button>
                        ))}

                    </div>

                </div>

            </div>

            {/* =================================================
                QUESTION CARD
            ================================================= */}

            <div className="ai-card">

                <h2>
                    💬{" "}
                    {language === "ta"
                        ? "உங்கள் கேள்வி"
                        : "Your Question"}
                </h2>

                <textarea
                    value={question}
                    onChange={(event) =>
                        setQuestion(
                            event.target.value
                        )
                    }
                    onKeyDown={handleKeyDown}
                    placeholder={
                        language === "ta"
                            ? "உங்கள் முதலீட்டு கேள்வியை இங்கே கேளுங்கள்..."
                            : "Ask your investment question here..."
                    }
                    rows={5}
                    disabled={loading}
                />

                <div className="question-actions">

                    <button
                        type="button"
                        className="voice-button"
                        onClick={
                            startVoiceInput
                        }
                        disabled={loading}
                    >
                        🎤{" "}
                        {language === "ta"
                            ? "தமிழில் பேசுங்கள்"
                            : "Speak"}
                    </button>

                    <button
                        type="button"
                        className="ask-button"
                        onClick={askAI}
                        disabled={
                            loading ||
                            !question.trim()
                        }
                    >
                        {loading
                            ? "🤖 Gemini Thinking..."
                            : "🤖 Ask AI Advisor"}
                    </button>

                </div>

                {error && (
                    <div className="ai-error">
                        ⚠️ {error}
                    </div>
                )}

            </div>

            {/* =================================================
                AI RESPONSE
            ================================================= */}

            {(loading || response) && (
                <div className="ai-response-card">

                    <div className="response-header">

                        <div>
                            <h2>
                                🤖 AI Advisor
                            </h2>

                            <span>
                                Powered by Gemini AI
                            </span>
                        </div>

                        {!loading &&
                            response && (
                                <button
                                    type="button"
                                    className={
                                        isSpeaking
                                            ? "speak-answer-button speaking"
                                            : "speak-answer-button"
                                    }
                                    onClick={() =>
                                        isSpeaking
                                            ? stopSpeaking()
                                            : speakResponse(
                                                  response
                                              )
                                    }
                                >
                                    {isSpeaking
                                        ? "⏹ Stop"
                                        : language ===
                                          "ta"
                                        ? "🔊 பதிலை கேளுங்கள்"
                                        : "🔊 Listen"}
                                </button>
                            )}

                    </div>

                    <div className="response-content">

                        {loading ? (
                            <div className="ai-thinking">

                                <span className="thinking-icon">
                                    🤖
                                </span>

                                Gemini Thinking...

                            </div>
                        ) : (
                            <>
                                <ReactMarkdown>
                                    {response}
                                </ReactMarkdown>

                                {isSpeaking && (
                                    <div className="voice-playing">

                                        <span className="speaker-icon">
                                            🔊
                                        </span>

                                        <span>
                                            {language ===
                                            "ta"
                                                ? "AI பதிலைப் பேசுகிறது..."
                                                : "AI is speaking..."}
                                        </span>

                                        <div className="voice-waves">
                                            <i></i>
                                            <i></i>
                                            <i></i>
                                            <i></i>
                                            <i></i>
                                        </div>

                                    </div>
                                )}
                            </>
                        )}

                    </div>

                </div>
            )}

            {/* =================================================
                QUICK QUESTIONS
            ================================================= */}

            <div className="quick-card">

                <h2>
                    💡 Quick Questions
                </h2>

                <div className="quick-grid">

                    {quickQuestions.map(
                        (item, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() =>
                                    askQuickQuestion(
                                        item
                                    )
                                }
                            >
                                {item}
                            </button>
                        )
                    )}

                </div>

            </div>

            {/* =================================================
                HISTORY
            ================================================= */}

            <div className="history-card">

                <div className="history-header">

                    <div>
                        <h2>
                            💬 Previous Questions
                        </h2>

                        <span>
                            {history.length}{" "}
                            {history.length === 1
                                ? "conversation"
                                : "conversations"}
                        </span>
                    </div>

                    <div className="history-actions">

                        <button
                            type="button"
                            onClick={
                                loadHistory
                            }
                            disabled={
                                historyLoading
                            }
                        >
                            {historyLoading
                                ? "Loading..."
                                : "🔄 Refresh"}
                        </button>

                        {history.length >
                            0 && (
                            <button
                                type="button"
                                className="clear-button"
                                onClick={
                                    clearHistory
                                }
                            >
                                🗑️ Clear All
                            </button>
                        )}

                    </div>

                </div>

                {historyError && (
                    <div className="history-error">
                        ⚠️ {historyError}
                    </div>
                )}

                {historyLoading ? (
                    <div className="history-empty">
                        🔄 Loading chat history...
                    </div>
                ) : history.length ===
                  0 ? (
                    <div className="history-empty">
                        💬 No questions found
                    </div>
                ) : (
                    <div className="history-list">

                        {history.map(
                            (chat) => {

                                const isExpanded =
                                    expandedChat ===
                                    chat.chat_id;

                                const answer =
                                    chat.ai_response ||
                                    "";

                                const preview =
                                    answer.length >
                                    180
                                        ? answer.substring(
                                              0,
                                              180
                                          ) +
                                          "..."
                                        : answer;

                                return (
                                    <div
                                        className="history-item"
                                        key={
                                            chat.chat_id
                                        }
                                    >

                                        {/* QUESTION */}

                                        <div className="history-question">

                                            <strong>
                                                Q:
                                            </strong>

                                            <span>
                                                {
                                                    chat.user_question
                                                }
                                            </span>

                                        </div>

                                        {/* ANSWER */}

                                        <div className="history-answer">

                                            <strong>
                                                AI:
                                            </strong>

                                            <div className="history-answer-content">

                                                {!isExpanded ? (
                                                    <p className="history-preview">
                                                        {
                                                            preview
                                                        }
                                                    </p>
                                                ) : (
                                                    <div className="history-markdown">

                                                        <ReactMarkdown>
                                                            {
                                                                answer
                                                            }
                                                        </ReactMarkdown>

                                                        {answer && (
                                                            <button
                                                                type="button"
                                                                className="history-speak-button"
                                                                onClick={() =>
                                                                    isSpeaking
                                                                        ? stopSpeaking()
                                                                        : speakResponse(
                                                                              answer
                                                                          )
                                                                }
                                                            >
                                                                {isSpeaking
                                                                    ? "⏹ Stop"
                                                                    : "🔊 Listen to Answer"}
                                                            </button>
                                                        )}

                                                    </div>
                                                )}

                                            </div>

                                        </div>

                                        {/* FOOTER */}

                                        <div className="history-footer">

                                            <small>
                                                {chat.created_at
                                                    ? new Date(
                                                          chat.created_at
                                                      ).toLocaleString(
                                                          language ===
                                                              "ta"
                                                              ? "ta-IN"
                                                              : "en-IN"
                                                      )
                                                    : ""}
                                            </small>

                                            <div className="history-buttons">

                                                <button
                                                    type="button"
                                                    className="view-answer-button"
                                                    onClick={() =>
                                                        setExpandedChat(
                                                            isExpanded
                                                                ? null
                                                                : chat.chat_id
                                                        )
                                                    }
                                                >
                                                    {isExpanded
                                                        ? "▲ Hide Answer"
                                                        : "👁️ View Answer"}
                                                </button>

                                                <button
                                                    type="button"
                                                    className="delete-chat-button"
                                                    onClick={() =>
                                                        deleteChat(
                                                            chat.chat_id
                                                        )
                                                    }
                                                >
                                                    🗑️ Delete
                                                </button>

                                            </div>

                                        </div>

                                    </div>
                                );
                            }
                        )}

                    </div>
                )}

            </div>

            {/* =================================================
                DISCLAIMER
            ================================================= */}

            <div className="ai-disclaimer">

                ⚠️{" "}
                {language === "ta"
                    ? "இந்த AI தகவல்கள் கல்வி நோக்கத்திற்காக மட்டுமே. முதலீட்டில் சந்தை அபாயம் உள்ளது. முதலீடு செய்வதற்கு முன் உங்கள் சொந்த ஆராய்ச்சியை செய்யுங்கள்."
                    : "This AI provides educational information only. Investments involve market risks. Do your own research before investing."}

            </div>

        </div>
    );
}

export default AIAdvisor;