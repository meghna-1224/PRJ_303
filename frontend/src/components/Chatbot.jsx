
import { useState } from "react";
import { sendChatMessage } from "../services/api";
import "./Chatbot.css";
import ReactMarkdown from "react-markdown";

const languages = {
    en: {
        label: "English",
        welcome: "Hi! 👋 I'm the PGRKAM Assistant. How can I help you?",
        choose: "Please select your preferred language:",
        suggestionIntro: "Here are some things I can help you with:",
        questions: [
            "How do I register on PGRKAM?",
            "How do I upload my resume?",
            "How can I search for jobs?",
            "How does job matching work?"
        ]
    },
    hi: {
        label: "हिन्दी",
        welcome: "नमस्ते! 👋 मैं PGRKAM असिस्टेंट हूँ। मैं आपकी कैसे मदद कर सकता हूँ?",
        choose: "कृपया अपनी पसंदीदा भाषा चुनें:",
        suggestionIntro: "मैं इन विषयों में आपकी मदद कर सकता हूँ:",
        questions: [
            "मैं PGRKAM पर पंजीकरण कैसे करूँ?",
            "मैं अपना रिज्यूमे कैसे अपलोड करूँ?",
            "मैं नौकरियाँ कैसे खोजूँ?",
            "जॉब मैचिंग कैसे काम करती है?"
        ]
    },
    pa: {
        label: "ਪੰਜਾਬੀ",
        welcome: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! 👋 ਮੈਂ PGRKAM ਅਸਿਸਟੈਂਟ ਹਾਂ। ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?",
        choose: "ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ ਚੁਣੋ:",
        suggestionIntro: "ਮੈਂ ਇਹਨਾਂ ਵਿਸ਼ਿਆਂ ਵਿੱਚ ਤੁਹਾਡੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ:",
        questions: [
            "ਮੈਂ PGRKAM 'ਤੇ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਕਿਵੇਂ ਕਰਾਂ?",
            "ਮੈਂ ਆਪਣਾ ਰਿਜ਼ਿਊਮੇ ਕਿਵੇਂ ਅਪਲੋਡ ਕਰਾਂ?",
            "ਮੈਂ ਨੌਕਰੀਆਂ ਕਿਵੇਂ ਲੱਭਾਂ?",
            "ਜੌਬ ਮੈਚਿੰਗ ਕਿਵੇਂ ਕੰਮ ਕਰਦੀ ਹੈ?"
        ]
    }
};

function getWelcomeMessage(language) {
    if (!language || !languages[language]) {
        return "Hello! 👋 Welcome to PGRKAM Assistant. " +
            "Please select your preferred language to continue.";
    }

    return languages[language].welcome;
}

function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    const [preferredLanguage, setPreferredLanguage] = useState(
        () => localStorage.getItem("pgrkamChatLanguage")
    );

    const [messages, setMessages] = useState(() => [
        {
            sender: "bot",
            text: getWelcomeMessage(
                localStorage.getItem("pgrkamChatLanguage")
            )
        }
    ]);

    const currentLanguage = languages[preferredLanguage];

    // Save language preference
    const handleLanguageChange = (language) => {
        if (isTyping) return;

        localStorage.setItem("pgrkamChatLanguage", language);
        setPreferredLanguage(language);
        setMessage("");

        setMessages([
            {
                sender: "bot",
                text: languages[language].welcome
            }
        ]);
    };

    // Handle sending messages to Gemini
    const handleSend = async () => {
        if (!message.trim() || isTyping || !preferredLanguage) return;

        const currentMessage = message;

        setMessages((prev) => [
            ...prev,
            { sender: "user", text: currentMessage }
        ]);

        setMessage("");
        setIsTyping(true);

        try {
            const languageInstruction =
                `The user's preferred response language is ${currentLanguage.label}. ` +
                `Respond in this language unless the user explicitly requests another language.\n\n` +
                `User's question: ${currentMessage}`;

            const data = await sendChatMessage(languageInstruction);

            setMessages((prev) => [
                ...prev,
                {
                    sender: "bot",
                    text: data.response
                }
            ]);

        } catch (error) {
            setMessages((prev) => [
                ...prev,
                {
                    sender: "bot",
                    text: "Sorry, I'm having trouble connecting to the chatbot right now. Please try again."
                }
            ]);

            console.error("Chatbot error:", error);

        } finally {
            setIsTyping(false);
        }
    };

    // Handle suggested questions
    const handleSuggestionClick = (question) => {
        setMessage(question);
    };

    // Clear conversation without clearing language preference
    const handleClearChat = () => {
        if (isTyping) return;

        setMessages([
            {
                sender: "bot",
                text: getWelcomeMessage(preferredLanguage)
            }
        ]);

        setMessage("");
    };

    // Handle Enter key
    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            handleSend();
        }
    };

    return (
        <>
            {!isOpen && (
                <button
                    className="chatbot-button"
                    onClick={() => setIsOpen(true)}
                    aria-label="Open chatbot"
                >
                    💬
                </button>
            )}

            {isOpen && (
                <div className="chatbot-window">

                    {/* Header */}
                    <div className="chatbot-header">
                        <div>
                            <strong>PGRKAM Assistant</strong>
                            <span>Online</span>
                        </div>

                        <div className="chatbot-header-actions">

                            {preferredLanguage && (
                                <select
                                    className="chatbot-language-select"
                                    value={preferredLanguage}
                                    onChange={(event) =>
                                        handleLanguageChange(event.target.value)
                                    }
                                    disabled={isTyping}
                                    aria-label="Change language"
                                    title="Change language"
                                >
                                    <option value="en">EN</option>
                                    <option value="hi">हि</option>
                                    <option value="pa">ਪੰ</option>
                                </select>
                            )}

                            <button
                                className="chatbot-clear"
                                onClick={handleClearChat}
                                disabled={isTyping}
                                title="Clear conversation"
                                aria-label="Clear conversation"
                            >
                                ↻
                            </button>

                            <button
                                className="chatbot-close"
                                onClick={() => setIsOpen(false)}
                                aria-label="Close chatbot"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="chatbot-messages">

                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`chat-message ${msg.sender}`}
                            >
                                {msg.sender === "bot" ? (
                                    <ReactMarkdown>
                                        {msg.text}
                                    </ReactMarkdown>
                                ) : (
                                    msg.text
                                )}
                            </div>
                        ))}

                        {/* First-time language selection */}
                        {!preferredLanguage && (
                            <div className="language-selection">
                                <p>{languages.en.choose}</p>

                                <button
                                    className="language-option"
                                    onClick={() => handleLanguageChange("en")}
                                >
                                    English
                                </button>

                                <button
                                    className="language-option"
                                    onClick={() => handleLanguageChange("hi")}
                                >
                                    हिन्दी (Hindi)
                                </button>

                                <button
                                    className="language-option"
                                    onClick={() => handleLanguageChange("pa")}
                                >
                                    ਪੰਜਾਬੀ (Punjabi)
                                </button>
                            </div>
                        )}

                        {/* Suggested questions */}
                        {preferredLanguage &&
                            messages.length === 1 &&
                            !isTyping && (
                                <div className="suggested-questions">
                                    <p>{currentLanguage.suggestionIntro}</p>

                                    {currentLanguage.questions.map(
                                        (question, index) => (
                                            <button
                                                key={index}
                                                className="suggestion-button"
                                                onClick={() =>
                                                    handleSuggestionClick(question)
                                                }
                                            >
                                                {question}
                                            </button>
                                        )
                                    )}
                                </div>
                            )}

                        {/* Typing indicator */}
                        {isTyping && (
                            <div className="chat-message bot typing-indicator">
                                <span>PGRKAM Assistant is typing</span>

                                <div className="typing-dots">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Input */}
                    <div className="chatbot-input-area">

                        <input
                            type="text"
                            placeholder="Ask something..."
                            value={message}
                            onChange={(event) =>
                                setMessage(event.target.value)
                            }
                            onKeyDown={handleKeyDown}
                            disabled={!preferredLanguage || isTyping}
                        />

                        <button
                            onClick={handleSend}
                            disabled={!message.trim() || isTyping || !preferredLanguage}
                            aria-label="Send message"
                        >
                            ➤
                        </button>

                    </div>

                </div>
            )}
        </>
    );
}

export default Chatbot;
