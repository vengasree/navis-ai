
# 🛡️ Navis AI — Personal AI Security Agent

Navis AI is a student project that helps users identify potentially dangerous messages. It provides a web-based chatbot for analyzing pasted messages and a Chrome extension for analyzing emails inside Gmail.

## ✨ Features

- **Chatbot interface:** Analyze pasted emails, SMS messages, and chat messages.
- **Email security analysis:** Classifies messages as Low, Moderate, or High risk.
- **Phishing detection:** Looks for credential requests, suspicious links, pressure tactics, and payment-related warning signs.
- **AI email summary:** Uses Google Gemini when configured.
- **Action recommendations:** Suggests what to do with a suspicious message.
- **Reply assistance:** Can provide an editable reply draft when appropriate.
- **Gmail integration:** Analyzes email content inside Gmail using the Chrome extension.
- **Follow-up questions:** Can use additional user context to refine an assessment.

> **Disclaimer:** Navis AI is a prototype, not a guarantee of safety. Always verify suspicious requests independently. Never share passwords or OTPs in response to an email.

## 🧰 Technology stack

- Frontend: React 19, Vite
- Backend: Python, Flask, Flask-CORS, LangGraph
- AI: Google Gemini API (optional)
- Local model integration: Ollama (optional)
- Browser integration: Chrome Extension, Manifest V3

## 📁 Project structure

```text
navis-ai/
├── backend/
│   ├── app.py
│   ├── security_graph.py
│   ├── .gitignore
│   └── venv/                 # Local virtual environment
├── extension/
│   ├── manifest.json
│   ├── background/
│   ├── content/
│   ├── popup/
│   └── icons/
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
├── .gitignore
└── README.md
```

## ✅ Requirements

Install these before running the project:

- Python 3.10 or newer
- Node.js and npm
- Google Chrome
- Git (optional, for cloning the repository)
- Gemini API key (optional, for Gemini-powered features)
- Ollama (optional, for the local-model integration)

## 🚀 Installation

### 1. Get the project

Clone your GitHub repository:

```powershell
git clone YOUR_GITHUB_REPOSITORY_URL
cd navis-ai
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with the actual URL of your repository.

Alternatively, download the repository as a ZIP from GitHub and extract it.

### 2. Set up the backend

Open PowerShell in the project root:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install flask flask-cors requests langgraph
```

If PowerShell blocks virtual-environment activation, run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\venv\Scripts\Activate.ps1
```

### 3. Configure Gemini (optional)

Create an API key using Google AI Studio:

https://aistudio.google.com/apikey

Set the key in the same PowerShell window used to start Flask:

```powershell
$env:GEMINI_API_KEY="YOUR_API_KEY"
```

Optionally configure the model:

```powershell
$env:GEMINI_MODEL="gemini-2.5-flash-lite"
```

Start the backend from the `backend` directory:

```powershell
python app.py
```

The backend should be available at:

`http://127.0.0.1:5000`

Keep this terminal running while using Navis AI.

If Gemini is not configured or unavailable, the backend may use a fallback summary. Gemini-powered features will not be available in that case.

**Protect your API key:** Never commit it to GitHub or put it in the README. If a key is exposed, revoke it and create a replacement.

### 4. Set up the chatbot frontend

Open a **second terminal** at the project root:

```powershell
cd frontend
npm install
npm run dev
```

Vite will display a local address, commonly:

`http://localhost:5173`

Open the displayed address in Chrome.

To use the chatbot, paste a message into the text area, click **Analyse**, and review the risk assessment and reasons.

Keep both the frontend and backend terminals running.

> The frontend must be configured to send analysis requests to the running backend. If analysis fails, check the backend URL used by the frontend and the Flask terminal for errors.

### 5. Install the Gmail Chrome extension

1. Open Google Chrome.
2. Navigate to `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the project's `extension` folder—the folder containing `manifest.json`.
6. Confirm that Navis AI appears in the extensions list.
7. Start the backend if it is not already running.
8. Open Gmail and refresh the page.
9. Open an email and review the Navis AI security panel.

After changing extension files, click **Reload** on the extension page and refresh Gmail.

The extension uses the backend URL configured in its source. If you deploy the backend elsewhere, update the extension's backend URL and configure the required permissions.

## 🧪 How to use Navis AI

### Web chatbot

1. Start the backend.
2. Start the frontend.
3. Open the Vite address in Chrome.
4. Paste an email, SMS, or chat message.
5. Click **Analyse**.
6. Review the risk level, decision, and warning signs.

### Gmail extension

1. Start the backend.
2. Open Gmail.
3. Open the email you want to assess.
4. Review the Navis AI panel.
5. Answer any follow-up questions if prompted.
6. Review any suggested reply before using it.

Navis AI does not automatically send reply drafts.

Use synthetic test messages for testing. Do not test by clicking suspicious links or sharing real credentials.

## 🧩 Optional: Ollama

The backend includes an optional local-model integration. To try it, install Ollama:

https://ollama.com/

Then run:

```powershell
ollama pull qwen2.5:3b
```

Ollama normally runs as a background service on Windows. The current security graph relies on deterministic security checks for its risk decision, so local-model output is advisory.

## 🔧 Troubleshooting

### Chatbot page does not open

- Confirm that `npm install` completed successfully.
- Run `npm run dev` from the `frontend` directory.
- Open the exact local URL printed by Vite.

### Chatbot cannot analyze messages

- Confirm Flask is running in the backend terminal.
- Check that the frontend sends requests to the correct backend address.
- Check the browser developer console and backend terminal for errors.
- Confirm that Flask CORS is configured for the frontend origin.

### Gmail extension does not respond

- Confirm Flask is running.
- Open `chrome://extensions` and check for extension errors.
- Reload the extension and refresh Gmail.
- Confirm the extension's backend URL points to the running Flask server.

### Gemini is unavailable

- Verify that `GEMINI_API_KEY` is set in the same terminal used to start Flask.
- Check the backend terminal for API errors.
- Confirm the selected model is available to your API key.
- Restart Flask after changing environment variables.

### Port 5000 is occupied

Stop the process using the port or configure a different backend port and update the frontend and extension URLs to match.

## 🔐 Security and privacy

- Email risk assessments can be incorrect.
- A known sender name or domain does not guarantee a message is legitimate.
- Do not provide passwords, OTPs, or sensitive information in response to suspicious messages.
- Avoid using private personal information in demonstrations.
- The Flask development server is intended for local development, not direct public deployment.
- Before deploying, use HTTPS, protect API keys, restrict access, and review how submitted email content is handled.
- Other users cannot access your local backend remotely without a reachable deployment and corresponding configuration changes.

## ⚠️ Limitations

- Risk classifications may produce false positives or false negatives.
- AI-generated summaries and reply suggestions may be inaccurate.
- Gemini requires a valid API key and available API quota.
- Local use requires the backend and frontend to be running.
- The project has not been independently security-audited.

## 📜 License

No license has been specified yet. Add a license file if you want to define the terms under which others may use, modify, or distribute the project.
