import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import LoadingIndicator from '../components/LoadingIndicator';
import '../styles/SharedFormPage.css';
import { jwtDecode } from 'jwt-decode';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';

const SharedFormPage = () => {
    const { formReference } = useParams();
    const [formContent, setFormContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState({});
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [email, setEmail] = useState('');

    useEffect(() => {
        checkLoginStatus();
        getFormContent();
    }, []);

    const refreshToken = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        try {
            const res = await api.post('/api/token/refresh/', { refresh: refreshToken });
            if (res.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                setIsLoggedIn(true);
            } else {
                setIsLoggedIn(false);
            }
        } catch (error) {
            console.error('Failed to refresh token', error);
            setIsLoggedIn(false);
        }
    };

    const checkLoginStatus = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
            setIsLoggedIn(false);
            return;
        }

        try {
            const decoded = jwtDecode(token);
            const tokenExpiration = decoded.exp;
            const now = Date.now() / 1000;

            if (tokenExpiration < now) {
                await refreshToken();
            } else {
                setIsLoggedIn(true);
                api.get(`/api/get_email/`)
                    .then((res) => {
                        setEmail(res.data.email);
                    })
                    .catch((err) => {
                        console.error(err);
                        setIsLoggedIn(false);
                    });
            }
        } catch (error) {
            console.error('Invalid token', error);
            setIsLoggedIn(false);
        }
    };

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

        const textarea = document.querySelector(`textarea[name='question-${questionId}']`);
        if (textarea) {
            textarea.style.height = 'auto';
            const maxHeight = 200;
            const paddingTop = parseFloat(window.getComputedStyle(textarea).paddingTop);
            const paddingBottom = parseFloat(window.getComputedStyle(textarea).paddingBottom);
            const contentHeight = textarea.scrollHeight;
            textarea.style.height = `${Math.min(contentHeight - paddingTop - paddingBottom, maxHeight)}px`;
        }
    };

    const handleClear = (questionId) => {
        setAnswers((prevAnswers) => ({
            ...prevAnswers,
            [questionId]: '',
        }));
    };

    const handleReset = () => {
        setAnswers({});
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

    const handleSwitchAccount = () => {
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
        window.location.reload();
    };

    if (loading) return <LoadingIndicator />;

    return (
        <div className='SharedFormPage'>
            <div className='shared-form-container'>
                <div className='shared-form-header'>
                    <h1 className='shared-form-title'>{formContent.shared_form.title}</h1>
                    {!isLoggedIn && (
                        <p className="sign-in-message">
                            <Link to={`/loginByForm/${formReference}`} className="signin-link">Sign in</Link> to save your progress
                        </p>
                    )}
                    {isLoggedIn && <p className='sign-in-message'>{email}<Link to={`/loginByForm/${formReference}`} className="switch-account-link" onClick={handleSwitchAccount}>Switch account</Link></p>}
                </div>
                <form onSubmit={handleSubmit}>
                    {formContent.shared_form.questions.map((question, index) => (
                        <div key={index} className='shared-form-question-container'>
                            <div className='shared-form-question'>
                                <label>{question.question_text}</label>
                                {question.type === 'open' && (
                                    <textarea
                                        name={`question-${index}`}
                                        value={answers[index] || ''}
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        className='shared-form-textarea'
                                        rows="1"
                                    />
                                )}
                                {question.type === 'multiple_choice' && (
                                    <div className='multiple-choice-options'>
                                        {question.choices.map((choice, choiceIndex) => (
                                            <div key={choiceIndex} className='choice-option'>
                                                <input
                                                    type='radio'
                                                    name={`question-${index}`}
                                                    value={choice}
                                                    checked={answers[index] === choice}
                                                    onChange={(e) => handleChange(index, e.target.value)}
                                                />
                                                <label>{choice}</label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {question.type === 'binary' && (
                                    <div className='binary-options'>
                                        <div className='choice-option'>
                                            <input
                                                type='radio'
                                                name={`question-${index}`}
                                                value='True'
                                                checked={answers[index] === 'True'}
                                                onChange={(e) => handleChange(index, e.target.value)}
                                            />
                                            <label>True</label>
                                        </div>
                                        <div className='choice-option'>
                                            <input
                                                type='radio'
                                                name={`question-${index}`}
                                                value='False'
                                                checked={answers[index] === 'False'}
                                                onChange={(e) => handleChange(index, e.target.value)}
                                            />
                                            <label>False</label>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {answers[index] && (
                                <button
                                    type='button'
                                    onClick={() => handleClear(index)}
                                    className='shared-form-clear-button'
                                >
                                    Clear answer
                                </button>
                            )}
                        </div>
                    ))}
                    <div className='shared-form-submit-container'>
                        <button type='submit' className='shared-form-submit-button'>Submit</button>
                        <button type='button' onClick={handleReset} className='shared-form-reset-button'>
                            Clear form
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SharedFormPage;
