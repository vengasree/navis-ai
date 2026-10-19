
function ResultCard({ result }) {
  const rawRiskLevel = String(
    result?.risk_level || result?.riskLevel || ''
  ).toLowerCase()

  let riskLevel
  if (rawRiskLevel === 'high') {
    riskLevel = 'High'
  } else if (
    rawRiskLevel === 'moderate' ||
    rawRiskLevel === 'medium'
  ) {
    riskLevel = 'Medium'
  } else if (rawRiskLevel === 'low') {
    riskLevel = 'Low'
  } else {
    riskLevel = 'Unknown'
  }

  const riskClass = riskLevel.toLowerCase()

  const backendDecision = String(result?.result || '').trim()

  let decision
  if (backendDecision) {
    decision = backendDecision
  } else if (riskLevel === 'High') {
    decision = 'Risky'
  } else if (riskLevel === 'Medium') {
    decision = 'Needs Review'
  } else if (riskLevel === 'Low') {
    decision = 'Unverified'
  } else {
    decision = 'Unable to classify'
  }

  const reasons = Array.isArray(result?.reasons)
    ? result.reasons
    : []

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
          <span
            className={
              'decision-text decision-' +
              decision.toLowerCase().replace(/\s+/g, '-')
            }
          >
            {decision}
          </span>
        </div>
      </div>

      <div className="result-reasons">
        <h3 className="reasons-title">Why?</h3>
        {reasons.length > 0 ? (
          <ul className="reasons-list">
            {reasons.map((reason, index) => (
              <li key={index}>{reason}</li>
            ))}
          </ul>
        ) : (
          <p>No explanation was provided by the backend.</p>
        )}
      </div>
    </section>
  )
}

export default ResultCard
