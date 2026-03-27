require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const HF_TOKEN = process.env.HF_TOKEN;
console.log(HF_TOKEN)

app.post("/chat", async (req, res) => {
    try {
        const { conversation } = req.body;

        const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${HF_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "deepseek-ai/DeepSeek-V3.1:fireworks-ai",
                messages: conversation
            })
        });

        const data = await response.json();
        console.log("HF API raw response:", data);


        const reply = data.choices[0].message.content;

        res.json({ reply });

    } catch (error) {
        console.error(error);
        res.status(500).json({ reply: "Server error" });
    }
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});