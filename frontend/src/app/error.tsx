'use client';

import { useEffect, useState } from "react";
import { Home, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function sendTelemetry(error: Error & { readonly digest?: string }) {
  try {
    const payload = {
      route: typeof window !== "undefined" ? window.location.pathname + window.location.search : "SSR",
      errorName: error.name || "PageError",
      errorMessage: error.message || "Unknown page error",
      stack: error.stack || "",
      digest: error.digest || "",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      timestamp: new Date().toISOString(),
      userId: typeof localStorage !== "undefined" ? (localStorage.getItem("userId") || "anonymous") : "anonymous"
    };

    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
      navigator.sendBeacon("/api/v1/telemetry/client-error", blob);
    } else {
      fetch("/api/v1/telemetry/client-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(() => {});
    }
  } catch {
    // ignore telemetry error
  }
}

export default function PageError({
  error,
  reset,
}: {
  readonly error: Error & { readonly digest?: string };
  readonly reset: () => void;
}) {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    sendTelemetry(error);

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (token) {
        if (!localStorage.getItem("token")) localStorage.setItem("token", token);
        if (!sessionStorage.getItem("token")) sessionStorage.setItem("token", token);
      }
    } catch {
      // ignore
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = "/";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [error]);

  return (
    <div className="grid gap-5 py-16 text-center sm:text-left max-w-xl mx-auto" role="alert">
      <div className="grid gap-3">
        <p className="eyebrow flex items-center justify-center sm:justify-start gap-1.5 text-red-400 font-semibold text-xs">
          <AlertCircle className="size-4 text-red-500" />
          <span>화면 로드 실패 및 원인 기록 완료</span>
        </p>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          화면을 정상적으로 불러오지 못했습니다.
        </h1>
        <p className="leading-relaxed text-zinc-400 text-sm [word-break:keep-all]">
          요청하신 페이지 로드 중 예외가 감지되어 상세 원인이 시스템 원장에 자동 기록되었습니다.
          방문자의 원활한 이용을 위해 <strong className="text-primary font-bold">{countdown}초 후 홈 화면으로 자동 이동</strong>합니다.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
        <Button
          onClick={() => { window.location.href = "/"; }}
          className="min-h-11 font-bold inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Home className="size-4" />
          홈으로 즉시 이동 ({countdown}s)
        </Button>
        <Button
          onClick={() => { window.location.reload(); }}
          variant="outline"
          className="min-h-11 font-medium inline-flex items-center gap-2"
        >
          <RefreshCw className="size-4" />
          새로고침 (로그인 유지)
        </Button>
        <Button onClick={reset} variant="ghost" className="min-h-11 text-zinc-400">
          다시 시도
        </Button>
      </div>

      {error.digest && (
        <p className="tabular text-xs text-zinc-500 font-mono">오류 참조 코드: {error.digest}</p>
      )}
    </div>
  );
}
