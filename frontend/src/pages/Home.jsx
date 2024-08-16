import { useState, useEffect } from 'react'
import api from '../api'
import BotChat from '../components/BotChat'

import '../styles/Home.css'

function Home() {
    const [BotThreads, setBotThreads] = useState([])
    const [BotPrompt, setBotPrompt] = useState("")
    const [title, setTitle] = useState("")

    useEffect(() => {
        getBotThreads()
    }, [])

    const getBotThreads = () => {
        api
            .get("/api/bot_thread/")
            .then((res) => res.data)
            .then((data) => { setBotThreads(data); console.log(data) })
            .catch((err) => alert(err));
    }

    const addBotThread = (e) => {
        e.preventDefault()

        const threadData = {
            title: title,
            chat_content: BotPrompt,
            questions: []
        }

        api.post("/api/bot_thread/create/", threadData).then((res) => {
            if (res.status === 201) {
                alert("Thread created!");
                getBotThreads();
            } else alert("Thread not created!")
        }).catch((err) => alert(err))
    }

    return (
        <div>
            <div>
                <h2>Threads</h2>
                {BotThreads.map((thread) => <BotChat title={thread.title} chat_content={thread.chat_content} key={thread.id}/>)}
            </div>
            <h2>Create Thread</h2>
            <form onSubmit={addBotThread}>
                <label htmlFor="title">Title: </label>
                <input
                    type="text"
                    name="title"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <br />
                <label htmlFor="content">Content: </label>
                <br />
                <textarea
                    name="content"
                    id="content"
                    required 
                    cols="30"
                    rows="10"
                    value={BotPrompt}
                    onChange={(e) => setBotPrompt(e.target.value)}
                ></textarea>
                <br />
                <input type="submit" value="Submit" />
            </form>
        </div>
    );
}

export default Home