import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

/**
 * The standing disclaimer, on every page.
 *
 * Its wording is the product's, not this rewrite's: WLD is game data and the
 * service offers no exchange for money. It appeared on every original view
 * and is carried across unchanged.
 */
export function SiteFooter() {
  return (
    <footer className="mt-10 grid gap-3 pb-6 text-xs text-muted-foreground">
      <Separator />
      <nav aria-label="하단 메뉴" className="flex flex-wrap gap-x-4 gap-y-1">
        <Link href="/terms" className="hover:text-foreground">
          이용약관
        </Link>
        <Link href="/privacy" className="hover:text-foreground">
          개인정보처리방침
        </Link>
        <Link href="/status" className="hover:text-foreground">
          서비스 상태
        </Link>
      </nav>
      <p>모든 화폐와 보상은 게임 안에서만 쓰는 가상 데이터입니다.</p>
      <p>© 2026 Woldeok Moneyverse</p>
    </footer>
  );
}
