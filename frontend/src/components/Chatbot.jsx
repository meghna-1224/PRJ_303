import { useState } from "react";
import { sendChatMessage } from "../services/api";
import "./Chatbot.css";

function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");

    const [messages, setMessages] = useState([
        {
            sender: "bot",
            text: "Hi! 👋 I'm the PGRKAM Assistant. How can I help you?"
        }
    ]);

    const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = {
        sender: "user",
        text: message
    };

    setMessages((prev) => [...prev, userMessage]);

    const currentMessage = message;
    setMessage("");

    try {
        const data = await sendChatMessage(currentMessage);

        const botMessage = {
            sender: "bot",
            text: data.response
        };

        setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
        const botMessage = {
            sender: "bot",
            text: "Sorry, I'm having trouble connecting to the chatbot right now. Please try again."
        };

        setMessages((prev) => [...prev, botMessage]);

        console.error("Chatbot error:", error);
    }
};

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

                    <div className="chatbot-header">
                        <div>
                            <strong>PGRKAM Assistant</strong>
                            <span>Online</span>
                        </div>

                        <button
                            className="chatbot-close"
                            onClick={() => setIsOpen(false)}
                        >
                            ✕
                        </button>
                    </div>

                    <div className="chatbot-messages">

                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`chat-message ${msg.sender}`}
                            >
                                {msg.text}
                            </div>
                        ))}

                    </div>

                    <div className="chatbot-input-area">

                        <input
                            type="text"
                            placeholder="Ask something..."
                            value={message}
                            onChange={(event) =>
                                setMessage(event.target.value)
                            }
                            onKeyDown={handleKeyDown}
                        />

                        <button onClick={handleSend}>
                            ➤
                        </button>

                    </div>

                </div>
            )}
        </>
    );
}

export default Chatbot;