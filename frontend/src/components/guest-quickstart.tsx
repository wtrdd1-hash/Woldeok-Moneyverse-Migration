import Link from 'next/link';
import { ArrowRight, BookOpen, Calculator, Compass } from 'lucide-react';
import { TranslatedText as T } from '@/components/translated-text';
import { getGuestEntryPaths } from '@/lib/guest-entry-paths';
import type { Locale } from '@/lib/locale';

/**
 * First useful public action before registration.
 *
 * Deliberately contains no client-side reward, login-success claim, fake
 * signup event, analytics cookie, or representation of WLD as cash.
 */
export function GuestQuickstart({ locale }: { readonly locale: Locale }) {
  const paths = getGuestEntryPaths(locale);

  return (
    <section
      aria-labelledby="guest-quickstart-heading"
      className="g1-panel p-5 sm:p-6"
      data-testid="guest-quickstart"
    >
      <h2 id="guest-quickstart-heading" className="text-base font-bold text-foreground">
        <T
          korean="먼저 하나를 직접 체험해 보세요"
          english="See how it works before creating an account"
          japanese="アカウント作成前に体験してみましょう"
          chinese="注册账户前，先亲自体验"
          vietnamese="Trải nghiệm thử một tính năng ngay"
        />
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        <T
          korean="금융 계산기와 경제 용어는 로그인 없이 볼 수 있습니다. WLD는 실제 현금이나 금융상품이 아닌 게임 재화입니다."
          english="Explore finance tools and definitions without signing in. WLD is fictional game currency, not cash or an investment."
          japanese="金融計算機や用語解説はログイン不要です。WLDは現金や金融商品ではなくゲーム内通貨です。"
          chinese="无需登录即可使用金融计算器和阅读金融术语。WLD是游戏内虚拟货币，不是真实现金或投资产品。"
          vietnamese="Khám phá các công cụ tính toán và thuật ngữ tài chính không cần đăng nhập. WLD là tiền ảo mô phỏng, không phải tiền thật."
        />
      </p>
      <nav aria-labelledby="guest-quickstart-heading" className="mt-4 grid gap-3 sm:grid-cols-3">
        <Link
          href={paths.calculator}
          data-guest-entry="calculator"
          className="group flex min-h-12 items-center gap-3 rounded-md border border-[var(--g1-line)] bg-[var(--g1-night)] p-3 hover:border-[var(--g1-violet)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--g1-violet)]"
        >
          <Calculator aria-hidden="true" className="size-5 shrink-0 text-[var(--g1-violet)]" />
          <span className="min-w-0 flex-1 text-sm font-semibold text-foreground">
            <T
              korean="복리 계산 직접 해보기"
              english="Try a compound calculator"
              japanese="複利を計算する"
              chinese="试用复利计算器"
              vietnamese="Thử máy tính lãi kép"
            />
          </span>
          <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground group-hover:translate-x-0.5" />
        </Link>
        <Link
          href={paths.glossary}
          data-guest-entry="glossary"
          className="group flex min-h-12 items-center gap-3 rounded-md border border-[var(--g1-line)] bg-[var(--g1-night)] p-3 hover:border-[var(--g1-violet)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--g1-violet)]"
        >
          <BookOpen aria-hidden="true" className="size-5 shrink-0 text-[var(--g1-violet)]" />
          <span className="min-w-0 flex-1 text-sm font-semibold text-foreground">
            <T
              korean="경제 용어부터 배우기"
              english="Learn finance terms"
              japanese="金融用語を学ぶ"
              chinese="学习金融术语"
              vietnamese="Học thuật ngữ tài chính"
            />
          </span>
          <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground group-hover:translate-x-0.5" />
        </Link>
        <Link
          href={paths.features}
          data-guest-entry="features"
          className="group flex min-h-12 items-center gap-3 rounded-md border border-[var(--g1-line)] bg-[var(--g1-night)] p-3 hover:border-[var(--g1-violet)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--g1-violet)]"
        >
          <Compass aria-hidden="true" className="size-5 shrink-0 text-[var(--g1-violet)]" />
          <span className="min-w-0 flex-1 text-sm font-semibold text-foreground">
            <T
              korean="가상경제 기능 알아보기"
              english="Explore the fictional economy"
              japanese="仮想経済の機能を見る"
              chinese="了解虚拟经济玩法"
              vietnamese="Tìm hiểu kinh tế mô phỏng"
            />
          </span>
          <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground group-hover:translate-x-0.5" />
        </Link>
      </nav>
    </section>
  );
}
