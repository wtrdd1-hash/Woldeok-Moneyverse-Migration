import { getServerLocale } from '@/lib/locale-server';
import { localeLabel } from '@/lib/locale';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, AlertOctagon, HeartHandshake, FileText, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return {
    title: localeLabel(
      locale,
      '머니버스 안전 센터 (Safety Center)',
      'Safety Center | Woldeok Moneyverse',
      'セーフティセンター | Woldeok Moneyverse',
      '安全中心 | Woldeok Moneyverse'
    ),
    description: localeLabel(
      locale,
      '아동·청소년 보호 지침, 비회원 긴급 콘텐츠 삭제 및 권리 구제 센터',
      'Child safety policies, non-member emergency content takedown, and user redress center.',
      '青少年保護方針、非会員向け緊急コンテンツ削除および権利救済センター',
      '未成年保护守则、非会员紧急违规内容下架及申诉中心'
    ),
  };
}

export default async function SafetyCenterPage() {
  const locale = await getServerLocale();
  return (
    <div data-page="safety-center" className="mv-page grid gap-6 py-6 max-w-4xl mx-auto px-4">
      <PageHeader
        eyebrow="SAFETY & CONSUMER PROTECTION"
        title={localeLabel(
          locale,
          '머니버스 안전 & 권리 보호 센터',
          'Safety & User Protection Center',
          '安心・安全および権利保護センター',
          '安全与权益保护中心',
          'Trung tâm An toàn & Bảo vệ Quyền lợi'
        )}
      >
        {localeLabel(
          locale,
          '모든 사용자와 청소년이 안심하고 이용할 수 있는 가상 경제 생태계를 지향합니다.',
          'Dedicated to building a safe, transparent virtual economy ecosystem for all users and minors.',
          'すべてのユーザーと青少年が安心して利用できる仮想経済エコシステムを目指します。',
          '致力于为所有用户与未成年人营造安全放心的虚拟经济生态体系。'
        )}
      </PageHeader>

      {/* 긴급 삭제 강조 배너 */}
      <Card className="border-destructive/30 bg-destructive/5 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertOctagon className="size-5 text-destructive" />
            <Badge variant="destructive">
              {localeLabel(locale, 'TAKE IT DOWN Act 준수', 'TAKE IT DOWN Act Compliance', 'TAKE IT DOWN法 遵守', '遵循 TAKE IT DOWN 法案')}
            </Badge>
          </div>
          <CardTitle className="text-lg font-bold text-destructive mt-1">
            {localeLabel(
              locale,
              '비동의 사생활 침해 및 유해 콘텐츠 긴급 삭제 지원',
              'Emergency Removal Support for Non-Consensual & Harmful Content',
              '同意のないプライバシー侵害および有害コンテンツの緊急削除対応',
              '非自愿隐私侵犯与有害违规内容紧急下架支持'
            )}
          </CardTitle>
          <CardDescription className="text-xs text-foreground/80">
            {localeLabel(
              locale,
              '회원 가입이나 로그인 없이도 본인 또는 법정대리인 자격으로 즉시 긴급 콘텐츠 삭제를 요청할 수 있습니다.',
              'Submit immediate takedown requests as a victim or legal guardian without signing in.',
              '会員登録やログインなしで、本人または法定代理人として緊急コンテンツ削除を要請できます。',
              '无需注册或登录，本人或法定监护人均可立即提交紧急违规内容下架申请。'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="destructive" className="font-semibold text-xs min-h-10">
            <Link href="/safety/takedown" className="flex items-center gap-1.5">
              {localeLabel(
                locale,
                '비회원 긴급 콘텐츠 삭제 접수처 바로가기',
                'Emergency Content Takedown Desk',
                '非会員向け緊急コンテンツ削除受付へ',
                '前往非会员紧急违规内容下架受理处'
              )}{' '}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* 3대 안전 지침 그리드 */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border shadow-xs">
          <CardHeader className="p-4 pb-2">
            <ShieldCheck className="size-6 text-primary mb-1" />
            <CardTitle className="text-sm font-semibold">
              {localeLabel(locale, '미성년자 보호 및 연령 보증', 'Minor Protection & Age Assurance', '未成年者保護および年齢確認', '未成年保护与年龄验证')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground leading-relaxed">
            {localeLabel(
              locale,
              '만 14세 미만 아동·청소년 계정은 상업 마케팅 및 사행성 모의 게임 접근이 엄격히 차단되며 법정대리인의 동의 절차를 준수합니다.',
              'Users under 14 are strictly blocked from speculative simulation and marketing, adhering to guardian consent.',
              '14歳未満の未成年者アカウントは商業マーケティングや射幸的模擬体験から保護され、保護者同意を徹底します。',
              '严格限制 14 周岁以下未成年人接触商业营销与投机性模拟活动，并全面遵循监护人法定同意程序。'
            )}
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader className="p-4 pb-2">
            <HeartHandshake className="size-6 text-emerald-600 mb-1" />
            <CardTitle className="text-sm font-semibold">
              {localeLabel(locale, '안전한 1:1 상호작용', 'Safe Interactions', '安全な1対1インタラクション', '安全的互动交流')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground leading-relaxed">
            {localeLabel(
              locale,
              '비공개 대화에서의 스토킹, 괴롭힘, 금전 요구 등은 원클릭 차단 및 영구 감사 증거 보존 시스템을 통해 즉각 보호됩니다.',
              'Harassment, stalking, or financial solicitation is immediately halted via 1-click block and immutable audit trails.',
              '嫌がらせ、ストーキング、金銭要求はワンクリック遮断と改ざん防止監査ログにより速やかに保護されます。',
              '私聊中骚扰、跟踪或索取财物等行为，将通过一键屏蔽及防篡改审计日志机制实施即时保护。'
            )}
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader className="p-4 pb-2">
            <FileText className="size-6 text-blue-600 mb-1" />
            <CardTitle className="text-sm font-semibold">
              {localeLabel(locale, '공정한 분쟁 해결 및 구제', 'Fair Dispute Resolution', '公正な紛争解決と救済', '公正的争议化解与申诉')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground leading-relaxed">
            {localeLabel(
              locale,
              '콘텐츠 삭제 또는 계정 제한 처분에 대해 소명 및 재심(Appeal) 절차를 보장하며 투명한 처리 결과를 고지합니다.',
              'Guarantees fair appeal procedures for moderation actions and provides transparent review notices.',
              'モデレーション措置に対する異議申し立て手続きを保障し、透明性の高い審査結果をお知らせします。',
              '针对处罚或下架措施提供申诉复议渠道，并透明告知处理进展与审核结论。'
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
