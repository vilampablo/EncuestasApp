import React, { useEffect, useState, useRef } from "react";
import api from '../api';
import '../styles/ForoPreview.css';
import { MdModeEdit } from "react-icons/md";

import ShareModal from "./ShareModal";

const ForoPreview = ({ threadId, formUpdated }) => {
    const [formData, setFormData] = useState(null);
    const [editableTitle, setEditableTitle] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [apiError, setApiError] = useState(null); // State to track API error
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const inputRef = useRef(null); // Create a ref for the input
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [shareableThreadId, setShareableThreadId] = useState(null);

    useEffect(() => {
        if (threadId) {
            setLoading(true);

            api.get(`/api/bot_thread/${threadId}/form_content/`)
                .then((res) => res.data)
                .then((data) => {
                    setFormData(data.form_content);
                    setEditableTitle(data.form_content.title); // Set the initial title
                    setLoading(false);
                })
                .catch((err) => {
                    setError("Failed to load form content.");
                    setLoading(false);
                });
        }
    }, [threadId, formUpdated]); // Re-fetch data when formUpdated changes

    // This effect handles detecting clicks outside of the input field
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (inputRef.current && !inputRef.current.contains(event.target)) {
                handleTitleSave(); // Save and exit editing mode when clicked outside the input
            }
        };

        if (isEditingTitle) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isEditingTitle]); // Re-run only when editing mode changes

    const handleTitleChange = (e) => {
        setEditableTitle(e.target.value);  // Update the editable title in state immediately
        console.log("Editable title:", editableTitle);
    };

    const handleTitleSave = () => {
        // Trim the editableTitle to remove any extra spaces
        const trimmedEditableTitle = editableTitle.trim();

        // Proceed with the API call to update the title
        api.put(`/api/bot_thread/${threadId}/update_title/`, { title: trimmedEditableTitle })
            .then((response) => {
                if (response.status === 200) {
                    // Immediately update the local state to reflect the new title
                    setFormData((prevData) => ({
                        ...prevData,
                        title: trimmedEditableTitle,  // Update the formData title
                    }));

                    setIsEditingTitle(false);  // Exit edit mode
                    setApiError(null);  // Clear any previous error
                }
            })
            .catch((err) => {
                console.error("Failed to update the title.", err);
                setApiError("Failed to update title. Please try again.");  // Set API error message
            });
    };

    const handleEditClick = () => {
        setIsEditingTitle(true);
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus(); // Focus the input field when it becomes visible
            }
        }, 0);
    };

    const handleShareClick = () => {
        setShareModalOpen(true);
    
        const newSharedForm = {
            bot_thread: threadId,  // Use threadId passed as a prop
            shared_form: formData
        };
    
        api.post(`/api/forms/create/`, newSharedForm)
            .then((response) => {
                if (response.status === 201) {
                    setShareableThreadId(response.data.id);
                    console.log("Shared form created successfully:", response.data);
                }
            })
            .catch((err) => {
                // Check if the error response contains the existing form's ID
                if (err.response && err.response.data && err.response.data.id) {
                    setShareableThreadId(err.response.data.id);
                    console.log("Form already exists. Using existing form ID:", err.response.data.id);
                } else {
                    console.error("Failed to create shared form.", err);
                    setApiError("Failed to create shared form. Please try again.");
                }
            });
    };    

    if (loading) {
        return <div>Loading form...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (!formData) {
        return null;
    }

    return (
        <>
            <div className="share-modal">
                <ShareModal open={shareModalOpen} onClose={() => setShareModalOpen(false)} threadId={shareableThreadId} >
                </ShareModal>
            </div>
            <div className="form-preview">
                <div className="form-share-buttons">
                    <button className="share-button" onClick={handleShareClick}>Share</button>
                </div>
                {isEditingTitle ? (
                    <div className="title-editing">
                        <input 
                            type="text" 
                            value={editableTitle} 
                            onChange={handleTitleChange} 
                            ref={inputRef} // Attach the ref to the input field
                            className="title-input" 
                        />
                        {apiError && <p className="error-message">{apiError}</p>} {/* Display error message if present */}
                    </div>
                ) : (
                    <div className="title">
                        <h2>{formData.title}</h2>
                        <button className="title-edit-button" onClick={handleEditClick}><MdModeEdit /></button>
                    </div>
                )}

                {formData.questions.map((question, index) => (
                    <div key={index} className="question">
                        <strong>{question.question_text}</strong>
                        {question.choices && (
                            <div className="choices">
                                {question.choices.map((choice, i) => (
                                    <div key={i} className="choice">{choice}</div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </>
    );
};

export default ForoPreview;
