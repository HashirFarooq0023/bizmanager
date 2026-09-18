/**
 * Rule: Icon Box & Stroke Consistency
 * Checks for non-square icon wrappers or erratic icon bounding boxes.
 */
export function checkIconConsistency(iconWrapper) {
  const violations = [];
  const width = iconWrapper.width;
  const height = iconWrapper.height;

  if (width && height && Math.abs(width - height) > 4) {
    violations.push({
      rule: 'Icon soup',
      element: iconWrapper.selector,
      dimensions: `${width}x${height}`,
      message: `Icon wrapper has non-square aspect ratio (${width}px × ${height}px), causing erratic icon alignment.`,
      fix: 'Normalize icon wrappers to square dimensions (e.g. w-9 h-9 or w-8 h-8 rounded-lg/rounded-full).'
    });
  }

  return violations;
}

export default { check: checkIconConsistency };
