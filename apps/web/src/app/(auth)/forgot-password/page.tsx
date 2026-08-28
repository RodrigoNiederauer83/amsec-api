"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@amsec/shared";
import { z } from "zod";
import Link from "next/link";
import { Mail, KeyRound } from "lucide-react";
import { apiClient } from "@/api/client";

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordForm) {
    try {
      await apiClient.post("/auth/forgot-password", data);
    } finally {
      // sempre mostra a mesma tela de sucesso, mesmo se der erro de rede,
      // já que a API nunca revela se o e-mail existe ou não
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="bg-surface rounded-2xl w-14 h-14 flex items-center justify-center mb-4 mx-auto">
          <Mail className="w-6 h-6 text-primary" />
        </div>
        <h1 className="font-display text-2xl font-semibold text-primary-dark mb-2">Verifique seu e-mail</h1>
        <p className="text-muted text-sm mb-8">
          Se este e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha em alguns minutos.
        </p>
        <Link href="/login" className="text-primary font-semibold">‹ Voltar para o login</Link>
      </div>
    );
  }

  return (
  <>
    <div
      className="fixed top-0 left-0 right-0 px-6 z-10"
      style={{ paddingTop: "max(1.5rem, env(safe-area-inset-top))" }}
    >
      <Link href="/login" className="text-primary inline-block">‹ Voltar</Link>
    </div>

    <div className="w-full max-w-sm">
      <div className="bg-surface rounded-2xl w-14 h-14 flex items-center justify-center mb-4">
        <KeyRound className="w-6 h-6 text-primary" />
      </div>

      <h1 className="font-display text-3xl font-semibold text-primary-dark mb-1">Esqueci minha senha</h1>
      <p className="text-muted text-sm mb-8">Informe seu e-mail para receber instruções de redefinição.</p>

      <form onSubmit={handleSubmit(onSubmit)}>
          <div className="relative mb-1">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
            <input
              {...register("email")}
              type="email"
              placeholder="E-mail"
              autoCapitalize="none"
              className="w-full appearance-none bg-surface rounded-xl py-3.5 pl-11 pr-4 text-base text-primary-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {errors.email && <p className="text-red-600 text-xs mb-3">{errors.email.message}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand-gradient text-white rounded-2xl py-3.5 font-semibold shadow-button disabled:opacity-50 mt-4"
          >
            {isSubmitting ? "Enviando..." : "Enviar instruções"}
          </button>
        </form>
    </div>
  </>
);
}

