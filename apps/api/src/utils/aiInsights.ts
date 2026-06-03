export function movingAverage(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function customerTag(totalVisits: number, lastVisit?: Date | null) {
  if (!lastVisit) return "New";
  const inactive = Date.now() - lastVisit.getTime() > 60 * 24 * 60 * 60 * 1000;
  if (inactive) return "Inactive";
  if (totalVisits >= 8) return "VIP";
  if (totalVisits >= 3) return "Regular";
  return "New";
}
