/**
 * Rule: Optical Tightening
 * Headings text-xl and above (or h1, h2, h3) must have tightened letter-spacing (tracking-[-0.03em] or -0.025em)
 * to avoid sloppy browser-default sprawling headers.
 */
export function checkTightening(element) {
  const violations = [];
  const tag = (element.tagName || '').toLowerCase();
  const isHeadingTag = ['h1', 'h2', 'h3'].includes(tag);
  const isLargeText = element.className.includes('text-xl') || 
                      element.className.includes('text-2xl') || 
                      element.className.includes('text-3xl') || 
                      element.className.includes('text-4xl');

  if (isHeadingTag || isLargeText) {
    const hasTightening = element.className.includes('tracking-[-0.03em]') || 
                          element.className.includes('tracking-[-0.02em]') || 
                          element.className.includes('tracking-tight') ||
                          element.className.includes('tracking-tighter');

    const rawTracking = element.computedStyle?.letterSpacing;
    const isExplicitlyTightened = hasTightening || (rawTracking && parseFloat(rawTracking) < 0);

    if (!isExplicitlyTightened) {
      violations.push({
        rule: 'Tightening violation',
        element: element.selector,
        tagName: tag,
        className: element.className,
        message: `Heading or large text element is rendered with default browser letter-spacing instead of optical tightening.`,
        fix: 'Add class "tracking-[-0.03em]" to tighten typography optically.'
      });
    }
  }

  return violations;
}

export default { check: checkTightening };
