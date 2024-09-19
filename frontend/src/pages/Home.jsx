import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import BotChat from '../components/BotChat';
import ForoPreview from '../components/ForoPreview';
import Sidebar from '../components/SideBar';
import { FaArrowUp } from "react-icons/fa";

import { createOpenAIThread, checkRunCompletion } from '../utils/OpenAi';

import '../styles/Home.css';

function Home() {
    const [BotThreads, setBotThreads] = useState([]);
    const [selectedThread, setSelectedThread] = useState(null);
    const [BotPrompt, setBotPrompt] = useState("");
    const [formData, setFormData] = useState(null);
    const [formUpdated, setFormUpdated] = useState(false); // New state for form updates

    const chatContainerRef = useRef(null);

    useEffect(() => {
        getBotThreads();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [selectedThread]);

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    const getBotThreads = () => {
        api.get("/api/bot_thread/")
            .then((res) => res.data)
            .then((data) => {
                const sortedThreads = data.sort((a, b) => new Date(b.last_updated) - new Date(a.last_updated));
                setBotThreads(sortedThreads);

                if (sortedThreads.length > 0) {
                    const mostRecentThread = sortedThreads[0];
                    fetchThreadContent(mostRecentThread.id);
                }
            })
            .catch((err) => {
                console.error(err);
                alert("Failed to fetch threads. Please try again.");
            });
    };

    const fetchThreadContent = (threadId) => {
        api.get(`/api/bot_thread/${threadId}/`)
            .then((res) => res.data)
            .then((contentData) => {
                const thread = BotThreads.find((thread) => thread.id === threadId);
                if (thread) {
                    setSelectedThread({ ...thread, chat_content: contentData.chat_content });
                }
                scrollToBottom();
            })
            .catch((err) => {
                console.error(err);
                alert("Failed to fetch thread content. Please try again.");
            });
    };

    const createNewThread = () => {
        const threadData = {
            title: `Chat ${BotThreads.length + 1}`,
            chat_content: []
        };

        api.post("/api/bot_thread/create/", threadData)
            .then((res) => {
                if (res.status === 201) {
                    const newThread = res.data;
                    setSelectedThread(newThread);
                    setBotThreads((prevThreads) => {
                        const updatedThreads = [...prevThreads, newThread];
                        return updatedThreads.sort((a, b) => new Date(b.last_updated) - new Date(a.last_updated));
                    });
                } else {
                    alert("Thread not created!");
                }
            })
            .catch((err) => {
                console.error(err);
                alert("Failed to create thread. Please try again.");
            });
    };

    const makeForm = (formObject) => {
        setFormData(formObject);
        setFormUpdated(true); // Set formUpdated to true when a form is updated or created
    };

    const addBotMessage = (e) => {
        e.preventDefault();
        if (BotPrompt.trim() === "") {
            alert("Please enter a message.");
            return;
        }

        if (selectedThread) {
            const userMessage = { message: BotPrompt, isUser: true };
            const updatedThread = { ...selectedThread };
            if (!Array.isArray(updatedThread.chat_content)) {
                updatedThread.chat_content = [];
            }

            updatedThread.chat_content.push(userMessage);
            setSelectedThread(updatedThread);
            setBotThreads((prevThreads) =>
                prevThreads.map((thread) => (thread.id === selectedThread.id ? updatedThread : thread))
            );

            api.patch(`/api/bot_thread/${selectedThread.id}/update/`, { chat_content: userMessage })
                .then((res) => {
                    if (res.status === 200) {
                        fetchThreadContent(selectedThread.id);
                    }
                })
                .catch((err) => {
                    console.error("Failed to save user message to backend:", err);
                });

            setBotPrompt("");

            if (updatedThread.chat_content.length === 1) {
                createOpenAIThread([{ role: "user", content: BotPrompt }])
                    .then(threadResponse => {
                        const threadId = threadResponse.thread_id;
                        const runId = threadResponse.id;
                        return checkRunCompletion(threadId, runId);
                    })
                    .then(response => {
                        if (typeof response === 'string') {
                            const botMessage = { message: response, isUser: false };
                            const updatedThreadWithBot = { ...updatedThread };
                            updatedThreadWithBot.chat_content.push(botMessage);
                            setSelectedThread(updatedThreadWithBot);
                            setBotThreads((prevThreads) =>
                                prevThreads.map((thread) =>
                                    thread.id === selectedThread.id ? updatedThreadWithBot : thread
                                )
                            );
                            api.patch(`/api/bot_thread/${selectedThread.id}/update/`, { chat_content: botMessage })
                                .then((res) => {
                                    if (res.status === 200) {
                                        fetchThreadContent(selectedThread.id);
                                    }
                                })
                                .catch((err) => {
                                    console.error("Failed to add bot message:", err);
                                });
                            scrollToBottom();
                        } else if (typeof response === 'object') {
                            api.patch(`/api/bot_thread/${selectedThread.id}/form_content/`, { form_content: response })
                                .then((res) => {
                                    if (res.status === 200) {
                                        console.log(response)
                                        makeForm(response); // Pass updated form content
                                    }
                                })
                                .catch((err) => {
                                    console.error("Failed to update form content:", err);
                                });
                        }
                    })
                    .catch(err => {
                        console.error("Failed to create and run thread:", err);
                    });
            }
        } else {
            alert("No thread selected.");
        }
    };

    const handleThreadClick = (threadId) => {
        fetchThreadContent(threadId);
    };

    return (
        <div className="home-container">
            <Sidebar BotThreads={BotThreads} selectedThread={selectedThread} handleThreadClick={handleThreadClick} createNewThread={createNewThread} />
            <div className="chat-container">
                {selectedThread && (<h2 className="thread-title">{selectedThread.title}</h2>)}
                {selectedThread && (
                    <div className="chat-box" ref={chatContainerRef}>
                        <BotChat chat_content={selectedThread.chat_content} />
                    </div>
                )}
                <form onSubmit={addBotMessage} className="bot-form">
                    <input
                        type="text"
                        value={BotPrompt}
                        onChange={(e) => setBotPrompt(e.target.value)}
                        placeholder="Quiero saber..."
                    />
                    <button type="submit" disabled={!BotPrompt.trim()}>
                        <FaArrowUp />
                    </button>
                </form>
            </div>
            <div className="foro-preview">
                {selectedThread && <ForoPreview threadId={selectedThread.id} formUpdated={formUpdated} />} {/* Pass formUpdated to ForoPreview */}
            </div>
        </div>
    );
}

export default Home;
