import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { useState } from "react";
import { setToken } from "@/lib/auth";
import { API_BASE } from "@/lib/config";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Sign in — Khalti Recruiter" }] }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-[480px] w-[480px] rounded-full bg-primary/30 blur-[120px]" />
        <div className="absolute right-0 bottom-0 h-[420px] w-[420px] rounded-full bg-[oklch(0.7_0.18_310)/0.25] blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 grid min-h-screen place-items-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="mb-6 flex items-center justify-center gap-2">
            <img src="/Full Logo.png" alt="Khalti Logo" className="h-10 object-contain" />
            <div className="leading-tight border-l border-border pl-2">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Recruiter</div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card/70 p-8 shadow-xl shadow-primary/5 backdrop-blur-xl">
            <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to your recruiter workspace.</p>

              <form
              className="mt-6 space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const formData = new URLSearchParams();
                  formData.append("username", email);
                  formData.append("password", password);
                  
                  const apiBase = API_BASE;
                  const res = await fetch(`${apiBase}/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: formData,
                    credentials: "include",
                  });
                  
                  if (!res.ok) {
                    const data = await res.json();
                    alert(data.detail || "Login failed");
                    return;
                  }
                  
                  const data = await res.json();
                  setToken(data.access_token);
                  window.location.href = "/";
                } catch (err) {
                  alert("An error occurred during login");
                }
              }}
            >
              <div>
                <label className="text-xs font-medium text-muted-foreground">Email</label>
                <div className="relative mt-1">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">Password</label>
                </div>
                <div className="relative mt-1">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>

              <button type="submit"
                className="group inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground shadow-sm shadow-primary/30 transition hover:opacity-95">
                Sign in
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
