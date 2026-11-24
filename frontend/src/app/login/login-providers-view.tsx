import Link from 'next/link';
import { apiOrNull } from '@/lib/api';
import { submitLocalLogin } from './actions';

export async function LoginProvidersView({
  error,
  notice,
}: {
  readonly error?: string | undefined;
  readonly notice?: string | undefined;
}) {
  const data = await apiOrNull<{ providers: { id: string; enabled: boolean }[] }>(
    '/api/v1/auth/providers',
  );
  const rawProviders = data?.providers ?? [
    { id: 'google', enabled: true },
    { id: 'discord', enabled: true },
  ];
  const enabled = new Set(rawProviders.filter((p) => p.enabled).map((p) => p.id));

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1240px] mx-auto animate-fade-in">
      {/* 1. Game-Economy Hero Banner with Neon City Skyline, Moon & W Emblem */}
      <section
        aria-labelledby="auth-hero-title"
        className="relative flex items-center justify-between bg-gradient-to-br from-[#141a32]/95 to-[#0d1123]/98 border border-[#8b5cf6]/25 rounded-2xl p-8 lg:p-10 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
      >
        <div className="relative z-10 flex flex-col gap-3 max-w-[580px]">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#a78bfa] uppercase">
            <span>✦</span>
            <span>WOLDEOK MONEYVERSE • AUTH</span>
          </div>
          <h2 id="auth-hero-title" className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            로그인
          </h2>
          <p className="text-sm lg:text-base text-[#cbd5e1] leading-relaxed">
            게임형 금융 · 가상경제 서비스<br />
            <span className="text-xs text-[#94a3b8]">실제 서비스 기능 및 권한에 따라 표시</span>
          </p>

          <Link
            href="/bank"
            className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 bg-transparent border border-[#a78bfa]/40 hover:border-[#c084fc] hover:bg-[#8b5cf6]/10 text-sm font-semibold text-white rounded-xl transition-all w-fit"
          >
            <span>페이지 기능 확인</span>
            <span>&rarr;</span>
          </Link>
        </div>

        {/* Hero Right Visual: Neon Skyline SVG, Moon Ring, W Gem Badge */}
        <div className="relative z-0 hidden md:flex items-center justify-center min-w-[320px] h-[220px]" aria-hidden="true">
          <svg className="absolute right-0 bottom-[-20px] h-[220px] opacity-70 pointer-events-none" viewBox="0 0 400 220" fill="none">
            <path
              d="M40 220V120H70V80H90V220H130V60H160V100H180V220H220V90H240V40H260V220H300V110H330V70H350V220H400V220H0V220H40Z"
              fill="url(#neon-auth-skyline)"
              opacity="0.4"
            />
            <path
              d="M120 220V110H140V70H170V220H210V50H230V20H250V220H280V130H310V90H340V220Z"
              fill="url(#neon-auth-buildings)"
              opacity="0.6"
            />
            <defs>
              <linearGradient id="neon-auth-skyline" x1="200" y1="40" x2="200" y2="220" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8b5cf6" stopOpacity="0.6" />
                <stop offset="1" stopColor="#1e1b4b" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="neon-auth-buildings" x1="230" y1="20" x2="230" y2="220" gradientUnits="userSpaceOnUse">
                <stop stopColor="#c084fc" stopOpacity="0.8" />
                <stop offset="1" stopColor="#312e81" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>

          {/* Moon Glow Ring */}
          <div className="absolute right-8 top-4 w-36 h-36 rounded-full border-2 border-[#8b5cf6]/50 bg-radial from-[#8b5cf6]/20 to-transparent shadow-[0_0_35px_rgba(139,92,246,0.35)]" />

          {/* W Emblem Crown Badge */}
          <div className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1e1b4b]/95 to-[#0f172a]/95 border border-[#a78bfa]/40 flex items-center justify-center shadow-[0_0_25px_rgba(139,92,246,0.35)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/favicon.ico" alt="W Emblem" className="w-12 h-12 object-contain drop-shadow-[0_0_10px_rgba(192,132,252,0.6)]" />
          </div>
        </div>
      </section>

      {/* Notice & Error Alerts */}
      {notice && (
        <div className="p-4 bg-[#1e1b4b]/80 border border-[#8b5cf6]/40 text-[#c084fc] rounded-xl text-xs font-semibold">
          {notice}
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-950/70 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      {/* 2. Dual-Card 2-Column Exact Grid Layout (Matching v2026.11.23.10 preview) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left Card: Input Credentials */}
        <article className="bg-[#11162b] border border-[#8b5cf6]/20 rounded-2xl p-6 lg:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.35)] flex flex-col gap-5">
          <div className="border-b border-[#1f2647] pb-4">
            <h3 className="text-lg font-bold text-white tracking-tight">로그인 · 계정/정보 입력</h3>
          </div>

          <form action={submitLocalLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="auth-email" className="text-xs font-semibold text-[#cbd5e1]">
                이메일 주소
              </label>
              <input
                id="auth-email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                maxLength={254}
                placeholder="name@example.com"
                required
                className="w-full px-4 py-3 bg-[#0b0f1d] border border-slate-700/30 focus:border-[#8b5cf6] focus:bg-[#0d1326] text-white placeholder-slate-500 rounded-xl text-sm outline-none transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="auth-password" className="text-xs font-semibold text-[#cbd5e1]">
                  비밀번호
                </label>
                <a href="/forgot-password" className="text-xs text-[#b9a8ff] hover:text-white">
                  비밀번호 찾기
                </a>
              </div>
              <input
                id="auth-password"
                name="password"
                type="password"
                autoComplete="current-password"
                maxLength={128}
                placeholder="비밀번호 입력"
                required
                className="w-full px-4 py-3 bg-[#0b0f1d] border border-slate-700/30 focus:border-[#8b5cf6] focus:bg-[#0d1326] text-white placeholder-slate-500 rounded-xl text-sm outline-none transition-all"
              />
            </div>


            <button
              type="submit"
              className="mt-2 w-full py-3.5 px-4 bg-[#6d44ba] hover:bg-[#7c3aed] text-white font-bold rounded-xl shadow-[0_4px_16px_rgba(109,68,186,0.4)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.5)] transition-all flex items-center justify-center gap-2 text-sm"
            >
              <span>자체 계정으로 로그인</span>
              <span>&rarr;</span>
            </button>
          </form>
        </article>

        {/* Right Card: Safe Usage & Verified Auth Pipeline */}
        <article className="bg-[#11162b] border border-[#8b5cf6]/20 rounded-2xl p-6 lg:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.35)] flex flex-col gap-5">
          <div className="border-b border-[#1f2647] pb-4">
            <h3 className="text-lg font-bold text-white tracking-tight">안전한 이용</h3>
          </div>

          <div className="flex flex-col gap-4">
            {/* Item 1: Social Login Options */}
            <div className="p-4 bg-[#0b0f1d]/80 border border-slate-700/20 rounded-xl flex flex-col gap-3">
              <div className="text-sm font-bold text-[#f1f5f9]">Google · Discord · 자체 로그인</div>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                연동된 소셜 계정으로 신속하고 안전하게 세션을 연결합니다.
              </p>
              <div className="flex flex-col gap-2 mt-1">
                {enabled.has('discord') && (
                  <a
                    href="/auth/discord/authorize"
                    className="flex items-center justify-center gap-2.5 py-2.5 px-4 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                    <span>Discord 계정으로 계속하기</span>
                  </a>
                )}
                {enabled.has('google') && (
                  <a
                    href="/auth/google/authorize"
                    className="flex items-center justify-center gap-2.5 py-2.5 px-4 bg-[#1e293b] hover:bg-[#334155] border border-slate-700/40 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                  >
                    <span>Google 계정으로 계속하기</span>
                  </a>
                )}
              </div>
            </div>

            {/* Item 2: Terms & Privacy */}
            <div className="p-4 bg-[#0b0f1d]/80 border border-slate-700/20 rounded-xl">
              <div className="text-sm font-bold text-[#f1f5f9] mb-1">약관 · 개인정보처리방침</div>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                계정 진입 시{' '}
                <a href="/terms" target="_blank" className="text-[#a78bfa] underline hover:text-[#c084fc]">
                  이용약관
                </a>{' '}
                및{' '}
                <a href="/privacy" target="_blank" className="text-[#a78bfa] underline hover:text-[#c084fc]">
                  개인정보처리방침
                </a>
                에 동의한 것으로 처리됩니다.
              </p>
            </div>

            {/* Item 3: Inline Validation */}
            <div className="p-4 bg-[#0b0f1d]/80 border border-slate-700/20 rounded-xl">
              <div className="text-sm font-bold text-[#f1f5f9] mb-1">인라인 유효성 검사</div>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                실시간 입력 형식 검증 및 위변조 방지 CSRF 토큰이 안전하게 적용됩니다.
              </p>
            </div>

            {/* Item 4: Real Server Response */}
            <div className="p-4 bg-[#0b0f1d]/80 border border-slate-700/20 rounded-xl">
              <div className="text-sm font-bold text-[#f1f5f9] mb-1">실제 서버 응답으로만 완료 표시</div>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                실제 백엔드 PBKDF2/Argon2id 검증 및 원장 데이터 세션이 발급됩니다.
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
