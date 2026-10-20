const HEADER_LABELS = Object.freeze({
  'Part Number': 'Part number',
  'Early-Warning Capacity': 'Early-warning capacity',
  'Professional Dependence': 'Professional dependence',
});

export function displayTableHeader(label) {
  return HEADER_LABELS[label] || label;
}

export function hasDisplayTableHeader(label) {
  return Object.hasOwn(HEADER_LABELS, label);
}
