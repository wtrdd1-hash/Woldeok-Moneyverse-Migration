/** Existing seed text mixes annual and hourly yields and falsely cites a national guarantee. */
export function safeBondDescription(description: string): string {
  return description
    .replace(/확정\s*쿠폰이자율/g, '서버 표시 연 금리')
    .replace(/\(시간당\s*[\d.]+%\)/g, '(시간별 지급액 검증 중)')
    .replace(/원금\s*100%\s*국가\s*보증\.?/g, '실제 국가 원리금 보증이 적용되지 않습니다.');
}
