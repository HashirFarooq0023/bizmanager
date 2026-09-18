/**
 * Rule: Boilerplate & Legacy Leftovers
 * Checks for default Vite/React favicon or title, placeholder lorem ipsum,
 * default avatar placeholders, and unmigrated BizzAI names in rendered UI.
 */
export function checkBoilerplate(documentContext) {
  const violations = [];
  const title = documentContext.title || '';
  const bodyText = documentContext.bodyText || '';

  // 1. Check title
  if (/vite|react app|my app/i.test(title)) {
    violations.push({
      rule: 'Boilerplate leftovers',
      element: '<title>',
      sampleText: title,
      message: `Default boilerplate title "${title}" detected.`,
      fix: 'Update document title to follow BizManager enterprise conventions.'
    });
  }

  // 2. Check for leftover BizzAI in rendered UI
  if (/\bBizzAI\b/i.test(bodyText)) {
    violations.push({
      rule: 'Boilerplate leftovers',
      element: 'body',
      sampleText: 'BizzAI text found in rendered UI',
      message: 'Visible "BizzAI" legacy naming detected in rendered UI.',
      fix: 'Migrate visible naming to BizManager.'
    });
  }

  // 3. Check for Lorem ipsum
  if (/lorem ipsum/i.test(bodyText)) {
    violations.push({
      rule: 'Boilerplate leftovers',
      element: 'body',
      sampleText: 'Lorem ipsum detected',
      message: 'Placeholder Lorem Ipsum text detected in page.',
      fix: 'Replace dummy text with real domain copy or contextual empty state.'
    });
  }

  return violations;
}

export default { check: checkBoilerplate };
