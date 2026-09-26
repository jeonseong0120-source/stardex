"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type User = { email: string; name: string; role: string };
export function AuthWidget() {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  useEffect(() => { fetch("/api/me").then(r => r.ok ? r.json() : null).then(v => setUser(v?.user ?? null)).catch(() => {}); }, []);

  async function signOut() {
    setIsSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setOpen(false);
    } finally {
      setIsSigningOut(false);
    }
  }

  const initial = user?.name?.trim().slice(0, 1).toUpperCase() ?? "S";

  return <>
    <button className="auth-widget-button" onClick={() => setOpen(true)}>{user ? user.name : "로그인"}</button>
    {open && createPortal(
      <div className="auth-modal-backdrop" onClick={() => setOpen(false)}>
        <section className="auth-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="auth-title">
          <button className="auth-modal-close" onClick={() => setOpen(false)} aria-label="닫기">×</button>
          <div className="auth-modal-mark" aria-hidden="true">✦</div>
          <p className="eyebrow">STARDEX 계정</p>
          <h2 id="auth-title">{user ? "계정이 연결되어 있어요" : "컬렉션을 저장하세요"}</h2>
          {user ? <>
            <div className="auth-profile">
              <span className="auth-avatar" aria-hidden="true">{initial}</span>
              <div><strong>{user.name}</strong><span>{user.email}</span></div>
            </div>
            <p className="auth-supporting-copy">수집한 카드와 컬렉션 진행도가 이 계정에 안전하게 저장됩니다.</p>
            <div className="auth-modal-actions">
              <button className="auth-outline-button" onClick={() => location.href = "/api/auth/google"}>다른 Google 계정으로 연결</button>
              <button className="auth-logout-button" onClick={signOut} disabled={isSigningOut}>{isSigningOut ? "로그아웃 중…" : "로그아웃"}</button>
            </div>
          </> : <>
            <p className="auth-supporting-copy">Google 계정으로 로그인하면 카드 컬렉션과 진행도를 저장하고 어느 기기에서나 이어볼 수 있어요.</p>
            <button className="auth-google-button" onClick={() => location.href = "/api/auth/google"}><span aria-hidden="true">G</span> Google로 계속하기</button>
            <p className="auth-privacy-note">로그인으로 공개 프로필 정보와 이메일만 사용합니다.</p>
          </>}
        </section>
      </div>,
      document.body,
    )}
  </>;
}
