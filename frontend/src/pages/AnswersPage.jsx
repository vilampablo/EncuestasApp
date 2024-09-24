import React, { useState, useEffect } from 'react';
import api from '../api';
import SideBar from '../components/SideBar';
import { useParams } from 'react-router-dom';

import '../styles/AnswersPage.css';

function AnswersPage() {
    const [formResponses, setFormResponses] = useState([]);
    const [formAnswers, setFormAnswers] = useState([]);
    const [loading, setLoading] = useState(true);

    const { form_response_id } = useParams();

    useEffect(() => {
        getFormAnswers();
    }, []);

    const getFormAnswers = () => {
        console.log(form_response_id)
        api.get(`/api/form-answers/${form_response_id}/`)
            .then((res) => res.data)
            .then((data) => {
                setFormAnswers(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                alert("Failed to fetch form answers. Please try again.");
            });
    };

    return (
        <><p>Answers</p></>
    );
}  

export default AnswersPage; 