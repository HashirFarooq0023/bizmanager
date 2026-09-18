/**
 * Rule: Rainbow / Gradient Cards
 * Flags multiple unrelated hues or loud rainbow gradients across consecutive KPI cards.
 */
export function checkRainbowCards(container) {
  const violations = [];
  const cards = container.cards || [];

  if (cards.length > 1) {
    const hues = new Set();
    cards.forEach(c => {
      const cls = c.className || '';
      const hueMatch = cls.match(/\b(?:bg|from|to)-(rose|pink|fuchsia|purple|violet|indigo|blue|sky|cyan|teal|emerald|green|lime|amber|yellow|orange)-(?:400|500|600|700)\b/g);
      if (hueMatch) {
        hueMatch.forEach(h => hues.add(h.split('-')[1]));
      }
    });

    if (hues.size >= 4) {
      violations.push({
        rule: 'Rainbow/gradient cards',
        element: container.selector,
        message: `KPI row contains ${hues.size} contrasting loud color hues ([${Array.from(hues).join(', ')}]), creating a generic rainbow template appearance.`,
        fix: 'Harmonize cards under a disciplined deep zinc/slate scheme with single semantic indicators.'
      });
    }
  }

  return violations;
}

export default { check: checkRainbowCards };
