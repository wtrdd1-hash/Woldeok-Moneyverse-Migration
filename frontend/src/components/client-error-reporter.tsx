"use client";

import { useEffect, useRef } from "react";

export function ClientErrorReporter() {
  const lastReportRef = useRef<number>(0);

  useEffect(() => {
    // 1. 강제 새로고침 시 로그인 세션 유지 보장
    // sessionStorage/localStorage의 토큰이 보존되는지 점검하고 필요시 동기화
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (token) {
        if (!localStorage.getItem("token")) localStorage.setItem("token", token);
        if (!sessionStorage.getItem("token")) sessionStorage.setItem("token", token);
      }
    } catch {
      // ignore
    }

    const reportError = (errorInfo: {
      errorName: string;
      errorMessage: string;
      stack?: string;
      route: string;
    }) => {
      const now = Date.now();
      // 중복 폭주 방지 (동일 500ms 내 쓰로틀링)
      if (now - lastReportRef.current < 500) return;
      lastReportRef.current = now;

      const payload = {
        route: window.location.pathname + window.location.search,
        errorName: errorInfo.errorName,
        errorMessage: errorInfo.errorMessage,
        stack: errorInfo.stack || "",
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        userId: localStorage.getItem("userId") || sessionStorage.getItem("userId") || "anonymous"
      };

      try {
        if (navigator.sendBeacon) {
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
        // ignore telemetry transmission failure
      }
    };

    // 전역 스크립트 런타임 에러 리스너
    const handleGlobalError = (event: ErrorEvent) => {
      reportError({
        errorName: event.error?.name || "WindowError",
        errorMessage: event.message || "Script execution exception",
        stack: event.error?.stack,
        route: window.location.pathname
      });

      // ChunkLoadError 등 화면을 완전히 불러올 수 없는 치명적 에러 발생 시
      if (event.message?.includes("ChunkLoadError") || event.message?.includes("Loading chunk")) {
        console.warn("[Moneyverse] Chunk load error detected, recovering to home in 2s...");
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      }
    };

    // Promise 거부(Unhandled Rejection) 리스너
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      reportError({
        errorName: reason?.name || "UnhandledRejection",
        errorMessage: reason?.message || String(reason || "Unknown promise rejection"),
        stack: reason?.stack,
        route: window.location.pathname
      });
    };

    window.addEventListener("error", handleGlobalError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return null;
}
