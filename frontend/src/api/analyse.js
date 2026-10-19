
const API_URL = 'https://navis-ai-g3x1.onrender.com/analyse';

export async function analyseMessage(message) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      source: 'navis_web',
    }),
  });

  if (!response.ok) {
    throw new Error('Backend error: ' + response.status);
  }

  const data = await response.json();

  return {
    ...data,
    riskLevel: data.risk_level,
    reasons: Array.isArray(data.reasons) ? data.reasons : [],
  };
}
