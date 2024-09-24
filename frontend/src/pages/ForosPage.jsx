import React, { useState, useEffect } from 'react';
import api from '../api';
import SideBar from '../components/SideBar';

import '../styles/ForosPage.css';
import '../styles/Home.css';
import '../styles/SideBar.css';
import { Navigate } from 'react-router-dom';

function ForosPage() {
    const [foros, setForos] = useState([]);
    const [formResponses, setFormResponses] = useState([]);

    useEffect(() => {
        getForos();
        getFormResponses();
    }, []);

    const getForos = () => {
        api.get("/api/bot_thread/")
            .then((res) => res.data)
            .then((data) => {
                setForos(data);
            })
            .catch((err) => {
                console.error(err);
                alert("Failed to fetch foros. Please try again.");
            });
    };

    const getFormResponses = () => {
        api.get("/api/form-responses/")
            .then((res) => res.data)
            .then((data) => {
                setFormResponses(data);
            })
            .catch((err) => {
                console.error(err);
                alert("Failed to fetch form responses. Please try again.");
            });
    };

    // Handle click by passing the foro id directly
    const handleForoClick = (form_response_id) => {
        Navigate(`/answers/${form_response_id}`);
    };

    return (
        <div className="foros-page">
            <SideBar BotThreads={foros} />
            <h1 className="foros-title">Foros</h1>
            <div className="foros-grid">
                {foros.map((foro) => (
                    <div 
                        className="foro-grid-item" 
                        key={foro.id} 
                        onClick={() => handleForoClick(foro.id)}
                    >
                        <h2>{foro.title}</h2>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ForosPage;