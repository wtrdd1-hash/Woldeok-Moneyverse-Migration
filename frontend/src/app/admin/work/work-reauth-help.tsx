import Link from "next/link";
import type { ActionState } from "@/lib/action-state";

/** The server owns recent-auth proof; the admin page only links to the existing verification flow. */
export function WorkAutoTuneReauthHelp({
  errorCode,
}: { readonly errorCode: ActionState["errorCode"] }) {
  return (
    <div className="grid gap-2 rounded-lg border border-border/80 bg-muted/40 p-3 text-sm">
      {errorCode === "reauthentication_required" ? (
        <p role="alert" className="font-medium text-destructive">
          최근 본인 확인이 만료되어 직업 보상 정책을 변경하지 않았습니다. 본인 확인 후 이 화면으로 돌아와 다시 실행해 주세요.
        </p>
      ) : (
        <p className="text-muted-foreground">
          자동 조절은 실제 보상 정책을 변경합니다. 최근 본인 확인이 필요하며, 계정 보안에서 확인한 뒤 이 화면으로 돌아와 실행해 주세요.
        </p>
      )}
      <Link
        href="/account/security"
        className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-center font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:w-fit"
      >
        계정 보안에서 본인 확인
      </Link>
    </div>
  );
}
