/**
 * Rule: Palette & Accent Integrity
 * Disallow default Tailwind/shadcn accents (violet-600, indigo-500, emerald-400-on-pink, etc.)
 * leaking into core surfaces/buttons instead of the documented deep zinc (#09090b) / slate system.
 */
export function checkPalette(element) {
  const violations = [];
  const className = element.className || '';

  // Look for unapproved violet or indigo accents in class list
  const unapprovedColorMatches = className.match(/\b(?:bg|text|border|ring)-(?:violet|indigo|fuchsia|purple)-(?:50|100|200|300|400|500|600|700|800|900)\b/g);

  if (unapprovedColorMatches && unapprovedColorMatches.length > 0) {
    violations.push({
      rule: 'Palette violation',
      element: element.selector,
      className: className,
      offendingTokens: unapprovedColorMatches,
      message: `Unapproved Tailwind accent color token(s) [${unapprovedColorMatches.join(', ')}] detected instead of deep zinc (#09090b) / slate design tokens.`,
      fix: 'Replace default violet/indigo accents with primary enterprise zinc/slate tokens or semantic design system classes.'
    });
  }

  return violations;
}

export default { check: checkPalette };
