# 🛡️ Navis AI — Personal AI Security Agent

Navis AI is an AI-assisted message security project designed to help users identify potentially suspicious emails, SMS messages, and chat messages. It provides a web-based interface for analyzing pasted messages and a Chrome extension designed to bring security analysis into Gmail.

The project combines a React frontend, a Flask backend, and a security analysis workflow built with LangGraph. Google Gemini is configured on the backend to support AI-powered functionality.

## ✨ Features

- **Web-based message analysis:** Paste an email, SMS, or chat message into the website for analysis.
- **Risk classification:** Presents a risk assessment, including risk levels such as Low, Moderate, or High, according to the backend's analysis.
- **Phishing indicators:** Helps identify warning signs such as suspicious links, requests for credentials or OTPs, urgency, and payment-related requests.
- **AI-assisted analysis:** Uses Google Gemini when configured and available.
- **Security recommendations:** Provides reasons and guidance to help users assess suspicious messages.
- **Gmail integration:** A Chrome extension is included for analyzing email content within Gmail.
- **Follow-up questions and reply assistance:** Available where implemented by the current backend workflow.

> **Important:** Navis AI is a prototype that assists with security assessments. It cannot guarantee that a message is safe or malicious. Always verify important requests independently.

## 🧰 Technology Stack

| Component | Technology |
|---|---|
| Frontend | React 19, Vite, JavaScript |
| Backend | Python, Flask, Flask-CORS |
| Security workflow | LangGraph |
| AI integration | Google Gemini API |
| Browser integration | Chrome Extension, Manifest V3 |
| Frontend hosting | Vercel |
| Backend hosting | Render |
| Source control | Git and GitHub |

## 📁 Project Structure

```text
navis-ai/
├── backend/
│   ├── app.py
│   ├── security_graph.py
│   ├── requirements.txt
│   └── ...
├── extension/
│   ├── manifest.json
│   ├── background/
│   ├── content/
│   ├── popup/
│   └── icons/
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   └── components/
│   ├── public/
│   ├── package.json
│   └── ...
├── .gitignore
└── README.md
```

*Note: The structure above describes the intended project layout. Check the repository for the exact current files.*

## 🌐 Live Deployment

- **Web application:** https://navis-ai-xi.vercel.app
- **Backend service:** https://navis-ai-g3xl.onrender.com
- **Backend health check:** https://navis-ai-g3xl.onrender.com/health
- **GitHub repository:** https://github.com/vengasree/navis-ai

The frontend is hosted on Vercel, while the Flask backend runs on Render. The backend health endpoint can be used to check whether the service is responding and whether the Gemini key is configured.

Opening the backend's root URL may display `404 Not Found` if no root route is defined. This does not, by itself, mean that the backend is down. The health endpoint and the actual analysis request are more useful tests.

## ⚙️ Running the Project Locally

### Prerequisites

- Python 3.10 or newer
- Node.js and npm
- Google Chrome
- Git (optional)
- A Gemini API key for Gemini-powered functionality

### 1. Clone the repository

```powershell
git clone https://github.com/vengasree/navis-ai.git
cd navis-ai
```

### 2. Set up the backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Configure the Gemini API key in PowerShell if required:

```powershell
$env:GEMINI_API_KEY="YOUR_API_KEY"
```

Start the backend using the command appropriate for the current Flask application:

```powershell
python app.py
```

The local backend is typically available at `http://127.0.0.1:5000`, depending on the application's configuration.

Keep the backend terminal running while testing locally.

### 3. Start the frontend

Open a second terminal in the project root:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, commonly `http://localhost:5173`.

The frontend API configuration must point to the correct backend address. For local development, use the local Flask address; for the deployed website, use the Render backend address.

### 4. Load the Chrome extension

1. Open Chrome and visit `chrome://extensions`.
2. Enable **Developer mode**.
3. Select **Load unpacked**.
4. Choose the `extension` directory containing `manifest.json`.
5. Open Gmail and refresh the page.
6. Test the extension using a sample email.

If the extension's code changes, reload it from `chrome://extensions` and refresh Gmail. Make sure its API endpoint points to the intended backend and that the manifest contains the required host permissions.

## 🔍 How to Use Navis AI

### Web application

1. Open https://navis-ai-xi.vercel.app.
2. Paste a sample email, SMS, or chat message into the text area.
3. Click **Analyse**.
4. Review the risk assessment and the reasons returned by the backend.
5. Follow the recommendations carefully and verify suspicious requests independently.

### Chrome extension

1. Install or load the extension in Chrome.
2. Open Gmail and select a test email.
3. Use the extension's analysis interface.
4. Review the assessment and any available recommendations or follow-up questions.

The extension should be tested separately from the website because the two interfaces may use different request-handling code.

## 🔄 How the System Works

1. **User input:** The user pastes a message into the web application or uses the Gmail extension.
2. **API request:** The frontend or extension sends the message to the Flask backend.
3. **Backend processing:** The backend validates and processes the request.
4. **Security analysis:** The security workflow evaluates the message using the implemented checks and available AI integrations.
5. **Risk response:** The backend returns structured analysis data, including the risk classification and reasons where provided.
6. **Result display:** The frontend or extension presents the returned assessment to the user.

The exact analysis steps depend on the current implementation in `backend/app.py` and `backend/security_graph.py`.

## 🔐 Security and Privacy

- Never expose the Gemini API key in frontend code or the Chrome extension.
- Store API keys as environment variables in the backend deployment.
- Never commit API keys or other secrets to GitHub.
- Do not enter passwords, OTPs, or other sensitive information into suspicious links.
- Test with synthetic messages whenever possible.
- Treat all automated classifications as advisory.
- Review how submitted message content is processed before using real personal or confidential emails.
- Use HTTPS for deployed communication and configure appropriate CORS and extension permissions.

## ⚠️ Limitations

- Security classifications can produce false positives and false negatives.
- AI-generated summaries and recommendations may be inaccurate.
- Gemini-powered functionality depends on a valid API key, model availability, and API quota.
- The free Render service may take additional time to respond after inactivity.
- The Chrome extension must be installed separately; deploying the website does not automatically publish the extension.
- The project should not be considered a substitute for professional email security software or independent verification.
