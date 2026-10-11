function ResultCard({ result }) {
  // Support both old (riskLevel) and new (risk_level) formats
  const riskLevel = result.risk_level || result.riskLevel || 'Low'
  const riskClass = riskLevel.toLowerCase()

  // Support both "result" field and old logic
  const decision = result.result || (riskLevel === 'Low' ? 'Safe' : 'Risky')

  const reasons = result.reasons || []

  return (
    <section className={'result-card risk-' + riskClass}>
      <div className="result-top">
        <div className="result-block">
          <span className="result-label">Risk Level</span>
          <span className={'risk-badge badge-' + riskClass}>
            {riskLevel}
          </span>
        </div>

        <div className="result-block">
          <span className="result-label">Final Decision</span>
          <span className={'decision-text decision-' + decision.toLowerCase()}>
            {decision}
          </span>
        </div>
      </div>

      <div className="result-reasons">
        <h3 className="reasons-title">Why?</h3>
        <ul className="reasons-list">
          {reasons.map((reason, index) => (
            <li key={index}>{reason}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default ResultCard