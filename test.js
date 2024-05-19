const fetch = require('node-fetch');

const apiKey = "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"; // Replace this with your actual API key
const modelsUrl = "https://api.groq.com/openai/v1/models";
const chatCompletionUrl = "https://api.groq.com/openai/v1/chat/completions";

async function fetchModels() {
    try {
        const response = await fetch(modelsUrl, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Available models:", data);
        return data;
    } catch (error) {
        console.error("Error fetching models:", error);
    }
}

async function performChatCompletion(modelId) {
    const chatPayload = {
        model: modelId,
        messages: [
            { role: "system", content: "You're a mental therapist. Below are given questions and there answer. Give a recommendation whether user is stressed or not? Always give a definitive answer!" },
            { role: "user", content: "Question 1: How are you feeling right now?" },
            { role: "user", content: "Answer 1: I feel a little sad" },
            { role: "user", content: "Question 2: How was your day?" },
            { role: "user", content: "Answer 2: I had a terrible day" }
        ],
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
            throw new Error(`Failed to perform chat completion: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Chat completion response:", data);
    } catch (error) {
        console.error("Error during chat completion:", error);
    }
}

async function testApiEndpoints() {
    // Fetch models first
    const modelsData = await fetchModels();
    
    // If models are successfully fetched, perform chat completion with the first available model
    if (modelsData && modelsData.data && modelsData.data.length > 0) {
        const firstModelId = modelsData.data[0].id;
        console.log(`Using model ID: ${firstModelId} for chat completion`);
        await performChatCompletion(firstModelId);
    } else {
        console.log("No models available to perform chat completion");
    }
}

testApiEndpoints();