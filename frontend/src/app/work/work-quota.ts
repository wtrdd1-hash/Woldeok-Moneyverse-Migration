export function dailyQuotaLabel(
  takenToday: number,
  dailyLimit: number,
  isEnglish: boolean,
): string {
  return isEnglish
    ? `Completed today: ${takenToday} / ${dailyLimit}`
    : `오늘 ${takenToday}/${dailyLimit}회 완료`;
}
