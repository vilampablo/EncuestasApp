import React, { useState } from 'react';
import '../styles/ShareModal.css';
import { BiSolidCopy } from "react-icons/bi";

const ShareModal = ({ open, onClose, threadId }) => {
    const [copied, setCopied] = useState(false);
    const link = `http://localhost:5173/sharedForm/${threadId}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(link).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Show "Copied!" for 2 seconds
        });
    };

    if (!open) return null;

    return (
        <>
            <div className="overlay" onClick={onClose}></div>
            <div className="modal">
                <div className="modal-content">
                    <h2>Send form</h2>
                    <p className='link-label'>Link</p> 
                    <div className='share-link-container' onClick={handleCopy} style={{ cursor: "pointer" }}>
                        <p className='share-link' >{link}</p>
                        <BiSolidCopy style={{margin: "10px"}}/>
                    </div>
                    {copied && <span className='copied-message'>Copied to clipboard!</span>}
                </div>
            </div>
        </>
    );
};

export default ShareModal;
