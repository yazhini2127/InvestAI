**# 🚀 InvestAI**



**### AI-Powered Investment Management System**



**InvestAI is a full-stack web application designed to help users manage their investments, portfolio, wallet, transactions, SIP plans, and market information with the support of Artificial Intelligence.**



**---**



**## 📌 Project Overview**



**InvestAI provides a centralized platform for managing personal investments. The system combines investment management features with AI-powered assistance to help users understand and manage their investment activities.**



**The application provides an interactive dashboard where users can view their portfolio, wallet balance, transactions, SIP plans, market news, and AI-generated investment guidance.**



**---**



**## 🎯 Objectives**



**\* Provide a simple platform for investment management.**

**\* Track investments and portfolio performance.**

**\* Manage wallet balance and transactions.**

**\* Support SIP investment planning.**

**\* Provide market-related news and information.**

**\* Offer AI-powered investment assistance.**

**\* Maintain secure user authentication and data management.**



**---**



**## ✨ Key Features**



**### 👤 User Management**



**\* User Registration**

**\* User Login**

**\* JWT-based Authentication**

**\* User Profile**

**\* Application Settings**



**### 📊 Dashboard**



**\* Wallet Balance**

**\* Portfolio Value**

**\* Investment Summary**

**\* SIP Summary**

**\* Investment Performance**



**### 💰 Investment Management**



**\* View Available Investments**

**\* Buy Investments**

**\* Sell Investments**

**\* Track Investment Quantity**

**\* Calculate Investment Value**



**### 📈 Portfolio**



**\* View Current Holdings**

**\* Invested Amount**

**\* Current Value**

**\* Profit / Loss**

**\* Portfolio Summary**



**### 💳 Wallet**



**\* Wallet Balance**

**\* Add Funds**

**\* Investment Transactions**

**\* Balance Updates**



**### 🧾 Transactions**



**\* Buy Transactions**

**\* Sell Transactions**

**\* SIP Transactions**

**\* Transaction History**

**\* Investment Summary**



**### 🔄 SIP Plans**



**\* Create SIP Plans**

**\* View Active SIP Plans**

**\* Manage SIP Investments**

**\* Track SIP Details**



**### 📰 Market News**



**\* View Market News**

**\* Display Investment-related Information**

**\* Market Information Dashboard**



**### 🤖 AI Advisor**



**\* AI-powered investment assistance**

**\* Natural language questions**

**\* Investment-related guidance**

**\* Personalized responses**

**\* AI Chat History**

**\* Delete Chat History**

**\* Clear Chat History**



**### 💬 AI Chat**



**\* Interactive AI conversation**

**\* Natural language interaction**

**\* Financial question answering**

**\* Chat history management**



**---**



**## 🛠️ Technologies Used**



**### Frontend**



**\* React.js**

**\* Vite**

**\* JavaScript**

**\* HTML5**

**\* CSS3**

**\* React Router**

**\* React Markdown**



**### Backend**



**\* Node.js**

**\* Express.js**

**\* REST API**

**\* MySQL**

**\* mysql2**

**\* JWT**

**\* bcryptjs**

**\* dotenv**

**\* CORS**



**### Artificial Intelligence**



**\* OpenAI API**



**### Development Tools**



**\* Visual Studio Code**

**\* Git**

**\* GitHub**

**\* Postman**

**\* MySQL Workbench**



**---**



**## 📸 Screenshots**



**### 🔐 Login**



**!\[Login](screenshots/login.jpeg)**



**### 📊 Dashboard**



**!\[Dashboard](screenshots/dashboard.jpeg)**



**### 📈 Investments**



**!\[Investments](screenshots/investments.jpeg)**



**### 💱 Buy \& Sell**



**!\[Buy \& Sell](screenshots/buy-sell.jpeg)**



**### 💼 Portfolio**



**!\[Portfolio](screenshots/portfolio.jpeg)**



**### 💰 Wallet**



**!\[Wallet](screenshots/wallet.jpeg)**



**### 🧾 Transactions**



**!\[Transactions](screenshots/transactions.jpeg)**



**### 🔄 SIP Plans**



**!\[SIP Plans](screenshots/sip-plans.jpeg)**



**### 📰 Market News**



**!\[Market News](screenshots/market-news.jpeg)**



**### 🤖 AI Investment Advisor**



**!\[AI Investment Advisor](screenshots/ai-advisor.jpeg)**



**### 👤 Profile**



**!\[Profile](screenshots/profile.jpeg)**



**### ⚙️ Settings**



**!\[Settings](screenshots/settings.jpeg)**



**---**



**## 🏗️ System Architecture**



**```text**

&#x20;                   **┌──────────────────────┐**

&#x20;                   **│        User          │**

&#x20;                   **└──────────┬───────────┘**

&#x20;                              **│**

&#x20;                              **▼**

&#x20;                   **┌──────────────────────┐**

&#x20;                   **│   React Frontend     │**

&#x20;                   **│      + Vite          │**

&#x20;                   **└──────────┬───────────┘**

&#x20;                              **│**

&#x20;                         **REST API**

&#x20;                              **│**

&#x20;                              **▼**

&#x20;                   **┌──────────────────────┐**

&#x20;                   **│   Node.js + Express  │**

&#x20;                   **│       Backend        │**

&#x20;                   **└───────┬───────┬──────┘**

&#x20;                           **│       │**

&#x20;                           **▼       ▼**

&#x20;                  **┌────────────┐ ┌──────────────┐**

&#x20;                  **│   MySQL    │ │  OpenAI API  │**

&#x20;                  **│  Database  │ │  AI Advisor  │**

&#x20;                  **└────────────┘ └──────────────┘**

**```**



**---**



**## 🗂️ Project Structure**



**```text**

**InvestAI/**

**│**

**├── frontend/**

**│   ├── src/**

**│   │   ├── components/**

**│   │   ├── pages/**

**│   │   ├── services/**

**│   │   ├── context/**

**│   │   ├── hooks/**

**│   │   └── assets/**

**│   │**

**│   ├── package.json**

**│   └── vite.config.js**

**│**

**├── backend/**

**│   ├── config/**

**│   ├── controllers/**

**│   ├── middleware/**

**│   ├── models/**

**│   ├── routes/**

**│   ├── .env**

**│   ├── package.json**

**│   └── server.js**

**│**

**├── screenshots/**

**│   ├── login.jpeg**

**│   ├── dashboard.jpeg**

**│   ├── investments.jpeg**

**│   ├── buy-sell.jpeg**

**│   ├── portfolio.jpeg**

**│   ├── wallet.jpeg**

**│   ├── transactions.jpeg**

**│   ├── sip-plans.jpeg**

**│   ├── market-news.jpeg**

**│   ├── ai-advisor.jpeg**

**│   ├── profile.jpeg**

**│   └── settings.jpeg**

**│**

**└── README.md**

**```**



**---**



**## 🗄️ Database Modules**



**InvestAI uses MySQL for storing and managing application data.**



**### Main Tables**



**\* `users` – User account and authentication information**

**\* `investments` – Available investment information**

**\* `portfolio` – User investment holdings**

**\* `transactions` – Buy, sell, and SIP transaction records**

**\* `wallet` – User wallet and balance information**

**\* `sip\_plans` – SIP investment plans**

**\* `market\_news` – Market-related news information**

**\* `ai\_chat\_history` – AI Advisor conversation history**



**---**



**## 🔄 Application Workflow**



**```text**

**User Registration / Login**

&#x20;         **│**

&#x20;         **▼**

&#x20;     **Dashboard**

&#x20;         **│**

&#x20;   **┌─────┼───────────────┐**

&#x20;   **▼     ▼               ▼**

**Investments Portfolio    Wallet**

&#x20;   **│       │               │**

&#x20;   **▼       ▼               ▼**

&#x20;**Buy/Sell  Holdings      Add Funds**

&#x20;   **│       │               │**

&#x20;   **└───────┼───────────────┘**

&#x20;           **▼**

&#x20;      **Transactions**

&#x20;           **│**

&#x20;           **▼**

&#x20;        **SIP Plans**

&#x20;           **│**

&#x20;           **▼**

&#x20;      **Market News**

&#x20;           **│**

&#x20;           **▼**

&#x20;      **AI Advisor**

&#x20;           **│**

&#x20;           **▼**

&#x20;      **AI Assistance**

**```**



**---**



**## 🔐 Security**



**InvestAI implements basic application security mechanisms including:**



**\* JWT-based authentication**

**\* Password hashing using bcryptjs**

**\* Environment variables for sensitive configuration**

**\* Protected API routes**

**\* CORS configuration**

**\* Secure database access**



**> \*\*Note:\*\* API keys, database passwords, and other sensitive credentials should be stored only in the local `.env` file and should not be committed to GitHub.**



**---**



**## ⚙️ Installation and Setup**



**### 1. Clone the Repository**



**```bash**

**git clone https://github.com/yazhini2127/InvestAI.git**

**cd InvestAI**

**```**



**### 2. Backend Setup**



**```bash**

**cd backend**

**npm install**

**npm start**

**```**



**Create a `.env` file inside the `backend` folder:**



**```env**

**PORT=5000**

**DB\_HOST=localhost**

**DB\_USER=root**

**DB\_PASSWORD=YOUR\_MYSQL\_PASSWORD**

**DB\_NAME=invest\_ai**

**JWT\_SECRET=YOUR\_JWT\_SECRET**

**OPENAI\_API\_KEY=YOUR\_OPENAI\_API\_KEY**

**```**



**### 3. Frontend Setup**



**Open another terminal:**



**```bash**

**cd frontend**

**npm install**

**npm run dev**

**```**



**The frontend will run using the Vite development server.**



**---**



**## 🌐 Application**



**Frontend:**



**```text**

**http://localhost:5173**

**```**



**Backend:**



**```text**

**http://localhost:5000**

**```**



**---**



**## 🧪 Testing Tools**



**The backend REST APIs can be tested using:**



**\* Postman**

**\* Browser**

**\* Frontend application**



**Database operations can be verified using:**



**\* MySQL Workbench**



**---**



**## 🚀 Future Enhancements**



**Possible future improvements include:**



**\* Real-time stock market data**

**\* Advanced investment analytics**

**\* AI-based portfolio recommendations**

**\* Risk prediction**

**\* Investment performance charts**

**\* Stock price alerts**

**\* Automated SIP reminders**

**\* Mobile application**

**\* Cloud deployment**

**\* Advanced financial forecasting**

**\* Enhanced AI-powered financial planning**



**---**



**## 🎓 Academic Project**



**\*\*Project Name:\*\* InvestAI**

**\*\*Project Type:\*\* Full-Stack Web Application**

**\*\*Domain:\*\* Investment Management \& Artificial Intelligence**

**\*\*Frontend:\*\* React.js + Vite**

**\*\*Backend:\*\* Node.js + Express.js**

**\*\*Database:\*\* MySQL**

**\*\*AI Technology:\*\* OpenAI API**



**This project was developed as an academic project to demonstrate practical knowledge of full-stack web development, database management, REST APIs, authentication, and Artificial Intelligence integration.**



**---**



**## 👩‍💻 Developer**



**\*\*Yazhini\*\***



**B.Sc. Computer Science**



**GitHub: `yazhini2127`**



**---**



**## 📄 License**



**This project is developed for educational and academic purposes.**



