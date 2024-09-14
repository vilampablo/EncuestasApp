import { IoIosAdd } from "react-icons/io";
import '../styles/Home.css';

function SideBar({ BotThreads, selectedThread, handleThreadClick, createNewThread, isThreadEmpty }) {

    return (
        <div className="sidebar">
            <button 
                className="new-thread-button" 
                onClick={createNewThread} 
                disabled={isThreadEmpty} // Disable the button if the selected thread is empty
            >
                <IoIosAdd />
            </button>

            <button className="thread-item" style={{ marginBottom: "50px", marginTop: "20px" }}>
                Foros
            </button>

            <div className="threads-list">
                {BotThreads.map((thread) => (
                    <button
                        className={`thread-item ${selectedThread?.id === thread.id ? 'active' : ''}`}
                        key={thread.id}
                        onClick={() => handleThreadClick(thread.id)}
                        disabled={selectedThread?.id === thread.id} // Disable the button if it is the selected thread
                    >
                        <span>{thread.title}</span>
                    </button>
                ))}
            </div>
        </div>
        );
    }

export default SideBar