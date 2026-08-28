"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, CheckCircle2 } from "lucide-react";
import { apiClient } from "@/api/client";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError("A senha precisa ter no mínimo 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    if (!token) {
      setError("Link inválido. Solicite a recuperação novamente.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post("/auth/reset-password", { token, newPassword });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Não foi possível redefinir sua senha.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="w-full max-w-sm text-center">
        <h1 className="font-display text-2xl font-semibold text-primary-dark mb-2">Link inválido</h1>
        <p className="text-muted text-sm mb-8">
          Este link de redefinição está incompleto ou expirou. Solicite um novo.
        </p>
        <Link href="/forgot-password" className="text-primary font-semibold">Solicitar novo link</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="bg-surface rounded-2xl w-14 h-14 flex items-center justify-center mb-4 mx-auto">
          <CheckCircle2 className="w-6 h-6 text-primary" />
        </div>
        <h1 className="font-display text-2xl font-semibold text-primary-dark mb-2">Senha redefinida!</h1>
        <p className="text-muted text-sm mb-8">Já pode entrar com sua nova senha.</p>
        <button
          onClick={() => router.push("/login")}
          className="w-full bg-brand-gradient text-white rounded-2xl py-3.5 font-semibold shadow-button"
        >
          Ir para o login
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-surface rounded-2xl w-14 h-14 flex items-center justify-center mb-4">
        <Lock className="w-6 h-6 text-primary" />
      </div>

      <h1 className="font-display text-3xl font-semibold text-primary-dark mb-1">Nova senha</h1>
      <p className="text-muted text-sm mb-8">Escolha uma nova senha para sua conta.</p>

      <form onSubmit={handleSubmit}>
        <div className="relative mb-3">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Nova senha"
            className="w-full appearance-none bg-surface rounded-xl py-3.5 pl-11 pr-4 text-base text-primary-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="relative mb-1">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirme a nova senha"
            className="w-full appearance-none bg-surface rounded-xl py-3.5 pl-11 pr-4 text-base text-primary-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        {error && <p className="text-red-600 text-xs mb-3">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-brand-gradient text-white rounded-2xl py-3.5 font-semibold shadow-button disabled:opacity-50 mt-4"
        >
          {isSubmitting ? "Salvando..." : "Redefinir senha"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-muted">Carregando...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}