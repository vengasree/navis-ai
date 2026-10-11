import { useState } from 'react'
import ResultCard from './ResultCard'
import ClarifyQuestions from './ClarifyQuestions'
import { analyseMessage } from '../api/analyse'

// SWITCH: false = use fake sample data, true = use your teammate's backend
const USE_BACKEND = true;

const sampleResults = {
  Low: {
    riskLevel: 'Low',
    reasons: [
      'No urgent or threatening language was found.',
      'No sensitive personal information was detected.',
    ],
  },
  Medium: {
    riskLevel: 'Medium',
    reasons: [
      'The message asks you to act quickly.',
      'It contains a link, but the sender is unclear.',
    ],
  },
  High: {
    riskLevel: 'High',
    reasons: [
      'The message claims your bank account will be blocked.',
      'It pressures you to click a link immediately.',
      'It asks for sensitive details such as your Aadhaar or PAN number.',
    ],
  },
}

function getSampleResult(message) {
  let level = 'Low'
  if (message.length > 60) level = 'High'
  else if (message.length > 20) level = 'Medium'
  return sampleResults[level]
}

function MessageBox() {
  const [message, setMessage] = useState('')
  const [result, setResult] = useState(null)
  const [round, setRound] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const examples = {
    bank: `URGENT: Your bank account will be blocked within 24 hours.
Click this link immediately to verify your KYC:
https://secure-bank-verify.com
Enter your Aadhaar and OTP to continue.`,
    data: `Hi, please note my details:
Aadhaar: 1234 5678 9012
PAN: ABCDE1234F
Phone: 9876543210
Password: MySecret@123`,
    normal: `Hi Priya, are we still meeting tomorrow at 5 PM for the project discussion? Let me know.`
  }

  const handleAnalyse = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      let newResult
      if (USE_BACKEND) {
        newResult = await analyseMessage(message)
      } else {
        newResult = getSampleResult(message)
      }
      setResult(newResult)
      setRound(round + 1)
    } catch (err) {
      setResult(null)
      setError('Could not reach the Navis AI backend. Please try again later.')
    }

    setLoading(false)
  }

  const handleClear = () => {
    setMessage('')
    setResult(null)
    setError('')
  }

  return (
    <>
      <section className="message-box">
        <label className="message-label" htmlFor="message-input">
          Paste your email, SMS, or chat message
        </label>

        {/* Example Buttons */}
        <div className="example-buttons">
          <button type="button" onClick={() => setMessage(examples.bank)}>
            Bank KYC Scam
          </button>
          <button type="button" onClick={() => setMessage(examples.data)}>
            Data Overshare
          </button>
          <button type="button" onClick={() => setMessage(examples.normal)}>
            Normal Message
          </button>
        </div>

        <textarea
          id="message-input"
          className="message-input"
          placeholder="Example: Dear customer, your bank account will be blocked. Click this link now..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={8}
        />

        <div className="char-count">{message.length} characters</div>

        <div className="button-row">
          <button
            className="analyse-button"
            onClick={handleAnalyse}
            disabled={message.trim() === '' || loading}
          >
            {loading ? 'Analysing...' : 'Analyse'}
          </button>

          <button
            className="clear-button"
            onClick={handleClear}
            type="button"
          >
            Clear
          </button>
        </div>

        {error && <p className="error-text">{error}</p>}
      </section>

      {result && <ResultCard result={result} />}
      {result && (result.riskLevel === 'Medium' || result.risk_level === 'Medium') && (
        <ClarifyQuestions key={round} />
      )}
    </>
  )
}

export default MessageBox
