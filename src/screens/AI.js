import fetch from "node-fetch";

// API key for authorization
const apiKey = "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";

// API endpoint URLs
const modelsUrl = "https://api.groq.com/openai/v1/models";
const chatCompletionUrl = "https://api.groq.com/openai/v1/chat/completions"; // Correct endpoint

// Function to perform a chat completion
const performChatCompletion = async (answers) => {
    const apiKey = "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";
    const chatCompletionUrl = "https://api.openai.com/v1/chat/completions";

    const messages = [
        { role: "system", content: "You are therapist , questions to evaluate a users mental health are given and the user will also be giving answers, your task is to provide mental health advice based on the persons answers" },
        ...Object.entries(answers).flatMap(([question, answer], index) => [
            { role: "user", content: `Question ${index + 1}: ${question}` },
            { role: "user", content: `Answer ${index + 1}: ${answer}` }
        ])
    ];

    const chatPayload = {
        model: "gpt-3.5-turbo", // Use an appropriate model
        messages: messages,
        temperature: 0.5,
        max_tokens: 1024,
        top_p: 1
    };

    try {
        const response = await fetch(chatCompletionUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(chatPayload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("AI Response:", data); // Logging the response for better debugging
        return data.choices[0].message.content; // Assuming the AI response is formatted this way
    } catch (error) {
        console.error("Error during chat completion:", error);
        throw error; // Rethrow or handle the error appropriately
    }
};

// Fetch available models and perform chat completion
fetch(modelsUrl, {
    headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
    }
})
    .then((response) => response.json())
    .then((data) => {
        // Select the llama3-8b-8192 model explicitly
        const model = data.data.find(m => m.id === 'llama3-70b-8192');
        if (model) {
            return performChatCompletion(model.id);
        } else {
            throw new Error("Model llama3-70b-8192 not found");
        }
    })
    .catch((error) => console.error("Error:", error));