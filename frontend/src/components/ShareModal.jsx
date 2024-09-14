import React from 'react';
import '../styles/ShareModal.css';

const ShareModal = ({ open, onClose, threadId }) => {
    if (!open) return null;

    return (
        <>
            <div className="overlay" onClick={onClose}></div>
            <div className="modal">
                {/* <button onClick={onClose}>Close</button> */}
                <div className="modal-content">
                    <h2>Share your form</h2>
                    <p>Link: {threadId}</p> 
                </div>
            </div>
        </>
    );
};

export default ShareModal;
