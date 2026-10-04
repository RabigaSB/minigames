export function formatToK(num: number): string {
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

export function formatRelativeTime(timestamp: string, now = Date.now()): string {
  const createdAt = new Date(timestamp).getTime();
  if (Number.isNaN(createdAt)) return 'Unknown time';

  const elapsedMilliseconds = Math.max(0, now - createdAt);
  const elapsedMinutes = Math.floor(elapsedMilliseconds / 60_000);
  if (elapsedMinutes < 1) return 'just now';
  if (elapsedMinutes < 60) return `${elapsedMinutes} min ago`;

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) {
    return `${elapsedHours} hour${elapsedHours === 1 ? '' : 's'} ago`;
  }

  const elapsedDays = Math.floor(elapsedHours / 24);
  if (elapsedDays < 7) return `${elapsedDays} day${elapsedDays === 1 ? '' : 's'} ago`;

  const elapsedWeeks = Math.floor(elapsedDays / 7);
  if (elapsedWeeks < 4) return `${elapsedWeeks} week${elapsedWeeks === 1 ? '' : 's'} ago`;

  const elapsedMonths = Math.floor(elapsedDays / 30);
  if (elapsedDays < 365) {
    const months = Math.min(11, Math.max(1, elapsedMonths));
    return `${months} month${months === 1 ? '' : 's'} ago`;
  }

  const elapsedYears = Math.floor(elapsedDays / 365);
  return `${Math.max(1, elapsedYears)} year${elapsedYears === 1 ? '' : 's'} ago`;
}
