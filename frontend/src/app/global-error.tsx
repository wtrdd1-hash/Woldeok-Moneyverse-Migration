'use client';

import { useEffect, useState } from "react";

function sendTelemetry(error: Error & { readonly digest?: string }) {
  try {
    const payload = {
      route: typeof window !== "undefined" ? window.location.pathname + window.location.search : "SSR",
      errorName: error.name || "GlobalRootError",
      errorMessage: error.message || "Unknown root layout error",
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
    // ignore
  }
}

export default function GlobalError({
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
    <html lang="ko">
      <body
        style={{
          background: "#090A0F",
          color: "#F9FAFB",
          fontFamily: "system-ui, -apple-system, sans-serif",
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          padding: "2rem",
        }}
      >
        <div style={{ display: "grid", gap: "1.25rem", maxWidth: "34rem", textAlign: "center" }} role="alert">
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: "#EF4444", fontSize: "0.875rem", fontWeight: 700 }}>
            <span>⚠️ 시스템 예외 감지 및 원인 원장 기록 완료</span>
          </div>
          <h1 style={{ fontSize: "1.75rem", margin: 0, fontWeight: 900, letterSpacing: "-0.025em" }}>
            화면을 불러오지 못했습니다.
          </h1>
          <p style={{ lineHeight: 1.8, margin: 0, color: "#9CA3AF", fontSize: "0.95rem" }}>
            페이지 로드 오류가 감지되어 서버에 상세 원인이 기록되었습니다.<br />
            <strong style={{ color: "#3B82F6" }}>{countdown}초 후 홈 화면으로 자동 복구 이동</strong>합니다.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap", paddingTop: "0.5rem" }}>
            <button
              type="button"
              onClick={() => { window.location.href = "/"; }}
              style={{
                background: "#2563EB",
                border: 0,
                borderRadius: "10px",
                color: "#FFFFFF",
                cursor: "pointer",
                fontWeight: 700,
                minHeight: "44px",
                padding: "0 1.5rem",
              }}
            >
              홈으로 즉시 이동 ({countdown}s)
            </button>
            <button
              type="button"
              onClick={() => { window.location.reload(); }}
              style={{
                background: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "10px",
                color: "#F3F4F6",
                cursor: "pointer",
                fontWeight: 600,
                minHeight: "44px",
                padding: "0 1.25rem",
              }}
            >
              새로고침 (로그인 유지)
            </button>
          </div>
          {error.digest && (
            <p style={{ fontSize: "0.75rem", margin: 0, color: "#6B7280", fontFamily: "monospace" }}>
              참조 코드: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
