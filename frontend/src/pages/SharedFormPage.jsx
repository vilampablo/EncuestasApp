import React, { useState, useEffect } from 'react';
import api from '../api';
import { useParams } from 'react-router-dom';

import '../styles/SharedFormPage.css';

const SharedFormPage = () => {
    const { formReference } = useParams();
    const [formContent, setFormContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState({});

    useEffect(() => {
        getFormContent();
    }, []);

    const getFormContent = () => {
        api.get(`/api/forms/${formReference}/`)
            .then((res) => res.data)
            .then((data) => {
                setFormContent(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                alert("Failed to fetch form content. Please try again.");
            });
    };

    const handleChange = (questionId, value) => {
        setAnswers((prevAnswers) => ({
            ...prevAnswers,
            [questionId]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        api.post(`/api/forms/${formReference}/submit/`, { answers })
            .then(() => {
                alert("Form submitted successfully!");
            })
            .catch((err) => {
                console.error(err);
                alert("Error submitting form. Please try again.");
            });
    };

    if (loading) return <p>Loading form...</p>;

    return (
        <div className='SharedFormPage'>
            <div className='shared-form-container'>
                <div className='shared-form-header'>
                    <h1 className='shared-form-title'>{formContent.shared_form.title}</h1>
                </div>
                <form onSubmit={handleSubmit}>
                    {formContent.shared_form.questions.map((question, index) => (
                        <div key={index} className='shared-form-question'>
                            <label>{question.question_text}</label>
                            {question.type === 'open' && (
                                <input
                                    type='text'
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    className='shared-form-input'
                                />
                            )}
                            {question.type === 'multiple_choice' && (
                                <select onChange={(e) => handleChange(index, e.target.value)} className='shared-form-input'>
                                    {question.choices.map((choice, choiceIndex) => (
                                        <option key={choiceIndex} value={choice}>
                                            {choice}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    ))}
                    <button type='submit' className='shared-form-button'>Submit</button>
                </form>
            </div>
        </div>
    );
};

export default SharedFormPage;