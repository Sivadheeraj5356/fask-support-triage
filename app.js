(function (root) {
  const categories = [
    {
      key: 'access',
      label: 'Account access',
      owner: 'Support Engineering',
      action: 'Verify identity, inspect auth/session logs, and restore account access.',
      patterns: [/\b(log ?in|sign ?in|password|otp|two[- ]factor|2fa|locked out|access denied)\b/i]
    },
    {
      key: 'billing',
      label: 'Billing and plan',
      owner: 'Billing Operations',
      action: 'Review invoice, plan, payment status, and entitlement before changing charges.',
      patterns: [/\b(invoice|billing|payment|charge|refund|plan|subscription|upgrade|downgrade)\b/i]
    },
    {
      key: 'ai-quality',
      label: 'AI response quality',
      owner: 'AI Product',
      action: 'Capture prompt, expected answer, source context, and model trace for evaluation.',
      patterns: [/\b(wrong answer|hallucinat|incorrect|ai response|chatbot|agent|model|training|fine[- ]tun)\b/i]
    },
    {
      key: 'integration',
      label: 'Integration failure',
      owner: 'Platform Engineering',
      action: 'Check API keys, webhook delivery, retries, and upstream error payloads.',
      patterns: [/\b(api|webhook|integration|crm|salesforce|hubspot|zapier|sync|token|500|404)\b/i]
    },
    {
      key: 'performance',
      label: 'Performance issue',
      owner: 'Infrastructure',
      action: 'Measure latency, affected region/account, timestamps, and recent deploy correlation.',
      patterns: [/\b(slow|timeout|timed out|latency|loading|crash|down|unavailable|error rate)\b/i]
    }
  ];

  const urgentPattern = /\b(urgent|asap|immediately|production down|outage|data loss|security|breach|cannot work|blocked)\b/i;

  function splitMessages(input) {
    return String(input || '')
      .split(/\n\s*\n+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function triageMessage(text) {
    const scores = categories.map((category) => ({
      category,
      score: category.patterns.reduce((sum, pattern) => sum + (pattern.test(text) ? 1 : 0), 0)
    }));
    scores.sort((a, b) => b.score - a.score);
    const best = scores[0];
    const matched = best.score > 0;
    const urgent = urgentPattern.test(text);
    const category = matched ? best.category : {
      label: 'General support',
      owner: 'Customer Support',
      action: 'Ask for account, expected behavior, actual behavior, and reproduction steps.'
    };
    return {
      category: category.label,
      owner: category.owner,
      priority: urgent ? 'P1 - urgent' : matched ? 'P2 - standard' : 'P3 - needs details',
      action: category.action,
      evidence: text.slice(0, 240)
    };
  }

  function triage(input) {
    const messages = splitMessages(input);
    return messages.map((message, index) => ({ index: index + 1, ...triageMessage(message) }));
  }

  function render(results) {
    const output = document.querySelector('#results');
    if (!output) return;
    if (!results.length) {
      output.innerHTML = '<p class="empty-state">Paste one or more customer messages to triage.</p>';
      return;
    }
    output.innerHTML = results.map((result) => `
      <article>
        <div class="score-row">
          <h4>Message ${result.index}: ${result.category}</h4>
          <span class="score">${result.priority}</span>
        </div>
        <ul>
          <li><strong>Owner:</strong> ${result.owner}</li>
          <li><strong>Next action:</strong> ${result.action}</li>
          <li><strong>Evidence:</strong> ${result.evidence}</li>
        </ul>
      </article>`).join('');
  }

  function boot() {
    const input = document.querySelector('#logInput');
    const button = document.querySelector('#triageButton');
    if (!input || !button) return;
    button.addEventListener('click', () => render(triage(input.value)));
  }

  const api = { triage, triageMessage, splitMessages };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root.document) root.FaskSupportTriage = api;
  if (root.document) root.addEventListener('DOMContentLoaded', boot);
})(typeof window !== 'undefined' ? window : globalThis);
