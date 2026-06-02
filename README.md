🤖 AI Chatbot (ChatGPT Clone) - MERN Stack

A full-stack, responsive AI chatbot application built with the MERN stack (MongoDB, Express.js, React, Node.js) and powered by Google's Gemini API. This project features a sleek, dark-mode UI inspired by modern SaaS AI products.

✨ Features

User Authentication: Secure Signup and Login using JWT and HTTP-only cookies.

Persistent Chat History: Conversations and messages are saved securely to a MongoDB database.

Conversation Management: Create new chats, navigate between past conversations via a collapsible sidebar, and auto-generate chat titles.

Real-time AI Responses: Powered by Google's powerful gemini-2.5-flash model.

Modern UI/UX: Fully responsive design, custom scrollbars, loading states, and a premium dark-mode aesthetic using Tailwind CSS.

Optimistic UI Updates: Instant message rendering for a seamless user experience.

🛠️ Tech Stack

Frontend:

React (Hooks, Context, Router)

Tailwind CSS (Styling & Responsiveness)

Axios (API Client)

Lucide React (Icons)

Backend:

Node.js & Express.js

MongoDB & Mongoose (ODM)

Google Generative AI SDK (@google/generative-ai)

JWT (JSON Web Tokens) & Cookie Parser

🚀 Getting Started

Follow these steps to set up the project locally on your machine.

Prerequisites

Make sure you have the following installed:

Node.js (v16 or higher)

MongoDB (Local or MongoDB Atlas)

A Google Gemini API Key

1. Clone the Repository

git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
cd your-repo-name


2. Backend Setup

Open a terminal and navigate to the backend directory (e.g., server):

cd server
npm install


Create a .env file in the root of your server directory and add the following:

PORT=8000
MONGO_URI=your_mongodb_connection_string
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_google_gemini_api_key


Start the backend server:

npm run dev
# Server should now be running on http://localhost:8000


3. Frontend Setup

Open a new terminal and navigate to the frontend directory (e.g., client):

cd client
npm install


(Optional) If you are using Vite, create a .env file in the client directory:

VITE_API_URL=http://localhost:8000/api/v1


Start the React application:

npm run dev
# or npm start for Create React App


The application will open in your browser at http://localhost:3000 (or http://localhost:5173 if using Vite).

📁 Folder Structure

Backend

server/
├── controllers/
│   ├── user.controller.js
│   ├── chat.controller.js
│   └── ai.controller.js
├── models/
│   ├── User.js
│   ├── Conversation.js
│   └── Message.js
├── routes/
│   ├── user.routes.js
│   ├── chat.routes.js
│   └── ai.routes.js
├── app.js
├── server.js
└── .env


Frontend

client/
├── src/
│   ├── components/
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   └── ChatPage.jsx
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── tailwind.config.js


🔌 API Endpoints Reference

Authentication

POST /api/v1/users/register - Register a new user

POST /api/v1/users/login - Authenticate user & set cookie

Conversations

POST /api/v1/conversations - Create a new conversation

GET /api/v1/conversations - Get all conversations for logged-in user

Messages & AI

GET /api/v1/messages/:conversationId - Get history for a specific chat

POST /api/v1/ai/generate - Send prompt to AI and save messages to DB

🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check issues page.

📝 License

This project is licensed under the MIT License.