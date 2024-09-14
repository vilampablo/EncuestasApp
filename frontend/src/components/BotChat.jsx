import React from "react";
import '../styles/BotChat.css';

function BotChat({ title, chat_content = [] }) {
    return (
        <div className="chat-container">
            <div className="message-box">
                {Array.isArray(chat_content) && chat_content.length > 0 ? (
                    chat_content.map((content, index) => (
                        <p
                            key={index}
                            className={`message ${content.isUser ? 'user-message' : 'bot-message'}`}
                        >
                            {content.message}
                        </p>
                    ))
                ) : (
                    <></>
                )}
            </div>
        </div>
    );
}

export default BotChat;
