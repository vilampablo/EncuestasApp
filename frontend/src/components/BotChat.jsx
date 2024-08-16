import React from "react";

import '../styles/BotChat.css'

function BotChat({title, chat_content}) {
    return (
        <div className="chat-container">
            <p className="chat-title">{title}</p>
            <p className="chat-content">{chat_content}</p>
            <textarea className="chat-input"></textarea>
            <input type="submit" value="Submit" />
        </div>
    );
}

export default BotChat