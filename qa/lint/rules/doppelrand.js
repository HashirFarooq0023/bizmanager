/**
 * Rule: Doppelrand (Double-Bezel Architecture)
 * Elevated cards must use concentric calculated inner/outer border radii and layered subtle borders
 * rather than a single generic flat outline/box.
 */
export function checkDoppelrand(element) {
  const violations = [];
  const isCard = element.className.includes('bg-card') || 
                 element.className.includes('rounded-xl') || 
                 element.className.includes('rounded-2xl') ||
                 element.className.includes('shadow-');

  if (!isCard) return violations;

  // Check if card uses flat single border without concentric bezel
  const hasDoppelrand = element.className.includes('rounded-[calc') || 
                        element.className.includes('ring-1') || 
                        element.className.includes('p-[1px]') ||
                        element.className.includes('double-bezel') ||
                        (element.hasChildWithBezel === true);

  if (!hasDoppelrand && (element.className.includes('rounded-xl') || element.className.includes('rounded-2xl'))) {
    violations.push({
      rule: 'Doppelrand violation',
      element: element.selector,
      className: element.className,
      message: 'Card uses a single flat border/radius instead of the documented concentric double-bezel (outer shell with concentric calculated inner border radius).',
      fix: 'Apply Doppelrand concentric outer shell with calculated radius rounded-[calc(2rem-0.375rem)] and hairline border.'
    });
  }

  return violations;
}

export default { check: checkDoppelrand };
