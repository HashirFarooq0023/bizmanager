/**
 * Rule: Tabular Numerics
 * Every currency value (PKR, Rs), stock count, timestamp, and metric card
 * must use font-mono tabular-nums to prevent visual column wobbling.
 */
export function checkNumerics(element) {
  const violations = [];
  const text = (element.innerText || element.textContent || '').trim();

  // Check if text is numeric currency, price, or metric
  const isCurrency = /(?:Rs\.?|PKR|\$)\s*[\d,]+(?:\.\d+)?/i.test(text);
  const isNumberCount = /^[\d,]+(?:\.\d+)?\s*(?:items|pcs|qty|orders)?$/i.test(text);
  const isTimestamp = /\b\d{1,2}:\d{2}(?::\d{2})?\b|\b\d{4}-\d{2}-\d{2}\b|\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/.test(text);

  if (isCurrency || isNumberCount || isTimestamp) {
    const hasFontMono = element.className.includes('font-mono') || (element.computedStyle && element.computedStyle.fontFamily && element.computedStyle.fontFamily.toLowerCase().includes('mono'));
    const hasTabularNums = element.className.includes('tabular-nums') || (element.computedStyle && element.computedStyle.fontVariantNumeric && element.computedStyle.fontVariantNumeric.includes('tabular-nums'));

    if (!hasFontMono || !hasTabularNums) {
      violations.push({
        rule: 'Numerics violation',
        element: element.selector,
        sampleText: text.substring(0, 35),
        className: element.className,
        message: `Numeric value "${text.substring(0, 25)}" is not set in 'font-mono tabular-nums', causing column wobble.`,
        fix: 'Add class "font-mono tabular-nums" to numeric display element.'
      });
    }
  }

  return violations;
}

export default { check: checkNumerics };
