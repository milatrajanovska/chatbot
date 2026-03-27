const images = [
    "img/support_background.jpg",
    "img/support_helper.jpg",
    "img/microsoft.jpg"
];

images.forEach(src => {
    const img = new Image();
    img.src = src;
});

let theme = "";
let conversation = [];
let index=-1;
let botKey="";
let botImg = "";
const Questions={
    Career: [
        "What are the top IT careers?",
        "How do I become a data scientist?",
        "What is the best programming language to learn?",
        "Which IT certifications are most valuable?",
        "How can I switch from a non-IT job to tech?",
        "What skills do employers look for in software developers?"
    ],
    Support: [
        "How do I fix a blue screen?",
        "My computer is slow, what can I do?",
        "How to reinstall Windows?",
        "How do I recover deleted files?",
        "Why is my internet connection unstable?",
        "How to remove a virus from my PC safely?"
    ],
    Microsoft: [
        "What is Microsoft Teams?",
        "How do I use Excel formulas?",
        "How to set up Azure?",
        "How do I share files in OneDrive?",
        "What are tips for using PowerPoint effectively?",
        "How to troubleshoot Outlook not sending emails?"
    ]
}
function ShowChatBot(topicElement) {
    let topics = document.querySelectorAll(".topic");
    const topImage = document.getElementById("topImage");

    index = Array.from(topics).indexOf(topicElement);
    if(index==0){
        theme="You are MilaBot for Information Technology Career Guide. You help people only with careers in IT, including software development, data science, cybersecurity, cloud computing, and IT management. Try to answer all theme-related questions in the language that the user writes to you. If you see kirilic letters respond in Macedonian. If the user asks something not related, respond briefly with 'This is not a topic I can help you with.' but you may still add a short friendly sentence (e.g. 'How can I help you with topic related questions'). Do not output long reasoning. You must separate reasoning and answer parts with 'reasoning/thinking:' and 'answer:'."
        topImage.style.backgroundImage = "url('img/support_background.jpg')";
        botKey="Career";
        botImg = "img/guide_user.png";
    }

    else if(index==1){
        theme="You are MilaBot for System Support Helper. You help people only with computer troubleshooting, hardware/software problems, operating system issues, and general IT support questions. Try to answer all theme-related questions in the language that the user writes to you. If you see kirilic letters respond in Macedonian. If the user asks something not related, respond briefly with 'This is not a topic I can help you with.' but you may still add a short friendly sentence (e.g. 'How can I help you with topic related questions'). Do not output long reasoning. You must separate reasoning and answer parts with 'reasoning/thinking:' and 'answer:'.";
        topImage.style.backgroundImage = "url('img/support_helper.jpg')";
        botKey="Support";
        botImg = "img/systemHelper_user.png";

    }
    else if(index==2){
        theme="You are MilaBot for Microsoft. You help people only with Microsoft products and services, including Windows, Office, Teams, Azure, and other Microsoft software or cloud solutions. Try to answer all theme-related questions in the language that the user writes to you. If you see kirilic letters respond in Macedonian. If the user asks something not related, respond briefly with 'This is not a topic I can help you with.' but you may still add a short friendly sentence (e.g. 'How can I help you with topic related questions'). Do not output long reasoning. You must separate reasoning and answer parts with 'reasoning/thinking:' and 'answer:'.";
        topImage.style.backgroundImage = "url('img/microsoft.jpg')";
        botKey="Microsoft";
        botImg = "img/windows_user1.png";
    }

    chatHistory = JSON.parse(sessionStorage.getItem("chatHistory_" + botKey)) || [];

    document.querySelector(".chatbot-container").style.display = "block";
    document.getElementById("container").style.display = "none";
    document.getElementById("home").style.display = "block";


    addPredefinedQuestions(botKey);


    if (conversation.length === 0) {
        conversation.push({ role: "system", content: theme });
    } else {
        conversation[0].content = theme;
    }

    displayChat();
    if(chatHistory.length==0){
        const chatWindow=document.getElementById("chat-window");
        chatWindow.innerHTML += `
      <div class="message-row bot">
        <img class="BotImg" src="${botImg}">
        <div class="message bot">"Hi there! How can I help you today?"</div>
      </div>`;
        FillChatHistory(chatHistory, "bot", "Hi there! How can I help you today?", botKey);
    }
}



document.querySelectorAll(".topic").forEach(topic => {
    topic.addEventListener("click", () => ShowChatBot(topic));
});


function Home(){
    document.querySelector(".chatbot-container").style.display = "none";
    document.getElementById("container").style.display = "block";
    document.getElementById("home").style.display="none";
}
const button = document.getElementById("home");
button.addEventListener("click", Home);



async function SendMessage(message) {
    if (message.trim() === "") return;

    const chatWindow = document.getElementById("chat-window");

    FillChatHistory(chatHistory,"user",message,botKey);

    chatWindow.innerHTML+=`
      <div class="message-row user">
        <img class="UserImg" src="img/userimg.png">
        <div class="Usermessage">${message}</div>
      </div>
    `;

    document.getElementById("user-input").value = "";
    chatWindow.scrollTop = chatWindow.scrollHeight;
    addUserMessage(message)

    try {
        const response = await fetch("http://localhost:5000/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ conversation })
        });

        const data = await response.json();
        const cleanedReply=cleanReply(data.reply);


        addBotMessage(cleanedReply)

        FillChatHistory(chatHistory,"bot",cleanedReply,botKey);



        chatWindow.innerHTML += `
      <div class="message-row bot">
        <img class="BotImg" src="${botImg}">
        <div class="message bot">${cleanedReply}</div>
      </div>
    `;
        chatWindow.scrollTop=chatWindow.scrollHeight;
    } catch (error) {
        console.error("Error:", error);
        chatWindow.innerHTML += `<div class="message bot error">⚠️ Oops! Something went wrong.</div>`;
        chatWindow.scrollTop=chatWindow.scrollHeight;
    }


}


function FillChatHistory(chatHistory,sender,text,botKey){
    chatHistory.push({sender:sender, text: text});
    sessionStorage.setItem("chatHistory_"+botKey,JSON.stringify(chatHistory));
}

document.getElementById("SendButton").addEventListener("click", function () {
    const message = document.getElementById("user-input").value;
    SendMessage(message);
});


function addUserMessage(text) {
    if(conversation.length<100){
        conversation.push({ role: "user", content: text });
    }
    else{
        conversation = [
            {
                role: "system",
                content: theme
            }
        ];
        conversation.push({ role: "user", content: text });
    }

}

function addBotMessage(text) {
    if(conversation.length<101){
        conversation.push({ role: "assistant", content: text });
    }
    else{
        conversation = [
            {
                role: "system",
                content: theme
            }
        ];
        conversation.push({ role: "assistent", content: text });
    }

}


function cleanReply(reply) {
    const lower = reply.toLowerCase();

    const regex = /(answer:|anwser:)/gi;
    let match;
    let lastIndex = -1;

    while ((match = regex.exec(lower)) !== null) {
        lastIndex = match.index;
    }

    if (lastIndex !== -1) {
        return reply.slice(lastIndex + 7).trim();
    }


    const fallbackMessage = "This is not a topic I can help you with.";
    if (reply.includes(fallbackMessage)) {
        return fallbackMessage;
    }


    return "⚠️ Sorry, I couldn't find a clear answer.";
}


function displayChat() {
    const chatWindow = document.getElementById("chat-window");
    chatWindow.innerHTML = "";
    chatHistory.forEach(msg => {
        if (msg.sender === "user") {
            chatWindow.innerHTML += `
              <div class="message-row user">
                <div class="Usermessage">${msg.text}</div>
                <img class="UserImg" src="img/userimg.png">
              </div>
            `;
        } else {
            chatWindow.innerHTML += `
              <div class="message-row bot">
                <img class="BotImg" src="${botImg}">
                <div class="message bot">${msg.text}</div>
              </div>
            `;
        }
    });
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function addPredefinedQuestions(botKey) {
    const container = document.getElementById("predefined-questions");
    container.innerHTML = "";

    const questions = Questions[botKey];

    container.style.display = "flex";
    container.style.overflowX = "auto";
    container.style.padding = "5px";
    container.style.gap = "5px";

    questions.forEach(q => {
        const btn = document.createElement("button");
        btn.textContent = q;
        btn.style.padding = "5px 10px";
        btn.style.border = "none";
        btn.style.borderRadius = "5px";
        btn.style.backgroundColor = " #3a7bd5";
        btn.style.color = "#fff";
        btn.style.cursor = "pointer";
        btn.style.flex = "0 0 auto";

        btn.addEventListener("click", () => {
            document.getElementById("user-input").value = q;
            SendMessage(q);
        });

        container.appendChild(btn);
    });


}
