import { useState, type FormEvent } from "react";
import { KeyRound, LockKeyhole, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNomi } from "../store";
import { PageHeader } from "../components/NomiShell";

type SavedAccount = { id: string; label: string; username: string };
const KEY = "nomi_agent_accounts";
const loadAccounts = (): SavedAccount[] => { try { const value = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(value) ? value : []; } catch { return []; } };

export default function AccountsPage() {
  const { language } = useNomi();
  const [accounts, setAccounts] = useState<SavedAccount[]>(loadAccounts);
  const [label, setLabel] = useState(""); const [username, setUsername] = useState("");
  const ar = language === "ar";
  const save = (next: SavedAccount[]) => { setAccounts(next); localStorage.setItem(KEY, JSON.stringify(next)); };
  const submit = (event: FormEvent) => { event.preventDefault(); if (!label.trim() || !username.trim()) return; save([...accounts, { id: crypto.randomUUID(), label: label.trim(), username: username.trim() }]); setLabel(""); setUsername(""); };
  return <div><PageHeader title={ar ? "حسابات الوكيل" : "Agent accounts"} subtitle={ar ? "احفظ أسماء حساباتك ليعرف نومي أين ينفّذ طلباتك. كلمات المرور لا تُحفظ هنا." : "Save account names so Nomi knows where to act. Passwords are never stored here."} /><div className="mx-auto w-full max-w-3xl space-y-6 px-5 pb-12">
    <div className="flex items-start gap-3 rounded-3xl border border-border bg-card p-4"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary"><ShieldCheck className="size-[18px]" /></span><p className="pt-1 text-sm leading-6 text-muted-foreground">{ar ? "أضف اسم الخدمة واسم الحساب فقط. الربط الآمن للخدمات يتم من صفحة التكاملات." : "Add only the service and account name. Secure service connections stay in Integrations."}</p></div>
    <form onSubmit={submit} className="space-y-3 rounded-3xl border border-border bg-card p-4"><div className="grid gap-3 sm:grid-cols-2"><Input value={label} onChange={(event) => setLabel(event.target.value)} placeholder={ar ? "الخدمة، مثل Gmail" : "Service, e.g. Gmail"} className="h-12 rounded-full px-4" /><Input value={username} onChange={(event) => setUsername(event.target.value)} placeholder={ar ? "اسم الحساب" : "Account name"} className="h-12 rounded-full px-4" /></div><Button type="submit" className="h-11 px-5"><Plus className="size-4" />{ar ? "حفظ الحساب" : "Save account"}</Button></form>
    {accounts.length ? <div className="space-y-2">{accounts.map((account) => <div key={account.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"><span className="grid size-11 place-items-center rounded-full bg-secondary"><KeyRound className="size-[18px]" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-bold">{account.label}</span><span className="block truncate text-xs text-muted-foreground">{account.username}</span></span><Button size="icon-sm" variant="ghost" onClick={() => save(accounts.filter((item) => item.id !== account.id))} aria-label={ar ? "حذف" : "Delete"}><Trash2 className="size-4" /></Button></div>)}</div> : <div className="grid min-h-48 place-items-center rounded-3xl border border-dashed border-border text-center"><div><LockKeyhole className="mx-auto size-6 text-muted-foreground" /><p className="mt-3 text-sm text-muted-foreground">{ar ? "لا توجد حسابات محفوظة" : "No saved accounts"}</p></div></div>}
  </div></div>;
}