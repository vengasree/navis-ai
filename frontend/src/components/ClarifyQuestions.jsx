import { useState } from 'react'

function ClarifyQuestions() {
  const [knowSender, setKnowSender] = useState('')
  const [expecting, setExpecting] = useState('')

  const answered = knowSender !== '' && expecting !== ''

  let recommendation = null

  if (answered) {
    if (knowSender === 'Yes' && expecting === 'Yes') {
      recommendation = {
        type: 'safe',
        title: 'Likely Safe',
        text: 'You know the sender and you were expecting this message. It is probably safe. Still, never share passwords or OTPs.',
      }
    } else if (knowSender === 'No' && expecting === 'No') {
      recommendation = {
        type: 'risky',
        title: 'High Risk – Do Not Respond',
        text: 'Unknown sender and unexpected message. Do not click any links or share personal details. Delete or report the message.',
      }
    } else {
      recommendation = {
        type: 'caution',
        title: 'Be Careful',
        text: 'Some details do not match. Verify through an official website or phone number before taking any action.',
      }
    }
  }

  return (
    <section className="clarify-card">
      <h3 className="clarify-title">Navis AI needs a little more information</h3>
      <p className="clarify-subtitle">Please answer these questions so I can give a better recommendation.</p>

      <div className="question">
        <p className="question-text">1. Do you know this sender?</p>
        <div className="answer-buttons">
          {['Yes', 'No'].map((option) => (
            <button
              key={option}
              className={'answer-btn' + (knowSender === option ? ' selected' : '')}
              onClick={() => setKnowSender(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="question">
        <p className="question-text">2. Were you expecting this message?</p>
        <div className="answer-buttons">
          {['Yes', 'No'].map((option) => (
            <button
              key={option}
              className={'answer-btn' + (expecting === option ? ' selected' : '')}
              onClick={() => setExpecting(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {recommendation && (
        <div className={'recommendation rec-' + recommendation.type}>
          <h4 className="rec-title">Final Recommendation: {recommendation.title}</h4>
          <p className="rec-text">{recommendation.text}</p>
        </div>
      )}
    </section>
  )
}

export default ClarifyQuestions