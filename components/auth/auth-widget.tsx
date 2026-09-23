"use client";
import { useEffect, useState } from "react";

type User = { email: string; name: string; role: string };
export function AuthWidget() {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => { fetch("/api/me").then(r => r.ok ? r.json() : null).then(v => setUser(v?.user ?? null)).catch(() => {}); }, []);
  return <>
    <button className="auth-widget-button" onClick={() => setOpen(true)}>{user ? user.name : "SIGN IN"}</button>
    {open && <div className="auth-modal-backdrop" onClick={() => setOpen(false)}><section className="auth-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true"><button className="auth-modal-close" onClick={() => setOpen(false)} aria-label="닫기">×</button><p className="eyebrow">STARDEX ACCOUNT</p><h2>{user ? `안녕하세요, ${user.name}` : "컬렉션을 저장하세요"}</h2>{user ? <><p>{user.email}</p><button className="auth-google-button" onClick={() => location.href = "/api/auth/google"}>Google 계정 다시 연결</button></> : <><p>Google 계정으로 로그인하면 카드 컬렉션을 계정에 저장할 수 있습니다.</p><button className="auth-google-button" onClick={() => location.href = "/api/auth/google"}>Google로 로그인</button></>}</section></div>}
  </>;
}
