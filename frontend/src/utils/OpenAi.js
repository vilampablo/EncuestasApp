// OpenAi.js

const assistantId = "asst_1HDPPPLF1GH84MzXZpdALO0F";
const apiKey = import.meta.env.VITE_REACT_OPENAI_API_KEY;

export const createOpenAIThread = async (initialMessages, toolResources = null, metadata = {}) => {
    const apiUrl = 'https://api.openai.com/v1/threads/runs';

    const payload = {
        assistant_id: assistantId,
        thread: {
            messages: initialMessages,
            tool_resources: toolResources,
            metadata: metadata
        }
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'OpenAI-Beta': 'assistants=v2'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();

        return data;
    } catch (error) {
        console.error('Failed to create and run OpenAI thread:', error);
        throw error;
    }
};

export const checkRunCompletion = (threadId, runId) => {
    const apiKey = import.meta.env.VITE_REACT_OPENAI_API_KEY;
    const runStatusUrl = `https://api.openai.com/v1/threads/${threadId}/runs/${runId}`;
    const messagesUrl = `https://api.openai.com/v1/threads/${threadId}/messages`;

    return new Promise((resolve, reject) => {
        const checkStatus = async () => {
            try {
                const response = await fetch(runStatusUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'OpenAI-Beta': 'assistants=v2'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }

                const data = await response.json();

                if (data.status === "completed") {
                    // Fetch the messages in the thread
                    const lastMessageContent = await fetchThreadMessages(threadId);
                    
                    clearInterval(intervalId); // Stop checking when the run is completed
                    resolve(lastMessageContent); // Resolve the Promise with the last message content
                } else if (data.status === "requires_action") {
                    // Check if we have tool calls and arguments in the response
                    const toolCalls = data?.required_action?.submit_tool_outputs?.tool_calls;
                    if (toolCalls && toolCalls.length > 0) {
                        const argumentsString = toolCalls[0]?.function?.arguments;
                        if (argumentsString) {
                            try {
                                // Parse the arguments string
                                const parsedArguments = JSON.parse(argumentsString);

                                // Return the parsed arguments as JSON to the backend
                                resolve(parsedArguments); // Resolve with the parsed arguments
                            } catch (parseError) {
                                console.error('Error parsing arguments:', parseError);
                                reject(parseError); // Reject on parsing error
                            }
                        } else {
                            console.error('Error: No arguments found in the tool call.');
                            reject(new Error('No arguments found in the tool call.'));
                        }
                    } else {
                        console.error('Error: No tool calls found in the response.');
                        reject(new Error('No tool calls found in the response.'));
                    }
                    clearInterval(intervalId); // Stop checking when action is required
                } else {
                    console.log(`Run status: ${data.status}, checking again in 5 seconds...`);
                }
            } catch (error) {
                console.error('Failed to check run completion:', error);
                clearInterval(intervalId); // Stop checking on error
                reject(error); // Reject the Promise on error
            }
        };

        // Function to fetch messages in the thread
        const fetchThreadMessages = async (threadId) => {
            try {
                const response = await fetch(messagesUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                        'OpenAI-Beta': 'assistants=v2'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Error fetching messages: ${response.statusText}`);
                }

                const messagesData = await response.json();

                // Retrieve the first message in the array (latest message)
                const lastMessage = messagesData.data[0];
                const messageContent = lastMessage.content[0].text.value;

                return messageContent; // Return the message content
            } catch (error) {
                console.error('Failed to fetch messages:', error);
                throw error;
            }
        };

        // Check the run status every 5 seconds
        const intervalId = setInterval(checkStatus, 5000);
    });
};

export const createOpenAIMessage = async (message, threadId) => {
    console.log("createOpenAIMessage function called");

    const apiUrl = `https://api.openai.com/v1/threads/${threadId}/messages`;

    const payload = {
        role: "user",
        content: [
            {
                type: "text",
                text: {
                    value: message
                }
            }
        ]
    };

    // Log the entire request to the console
    console.log('API Request:', {
        url: apiUrl,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'OpenAI-Beta': 'assistants=v2'
        },
        body: payload
    });

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'OpenAI-Beta': 'assistants=v2'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();

        // Log the retrieved response
        console.log('Retrieved Response from OpenAI:', data);

        return data;
    } catch (error) {
        console.error('Failed to send message to OpenAI thread:', error);
        throw error;
    }
};
