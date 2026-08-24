"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@amsec/shared";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Check } from "lucide-react";
import { apiClient } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue = watch("password") ?? "";
  const isPasswordStrong = passwordValue.length >= 6;

  async function onSubmit(data: RegisterForm) {
    try {
      await apiClient.post("/auth/register", data);
      const loginResponse = await apiClient.post("/auth/login", {
        email: data.email,
        password: data.password,
      });
      await signIn(loginResponse.data.token);
      router.push("/groups");
    } catch (error: any) {
      alert(error.response?.data?.error ?? "Erro ao cadastrar. Tente novamente.");
    }
  }

  const fieldWrapperClass = "bg-surface rounded-xl px-4 py-2.5";
  const labelClass = "text-[11px] uppercase tracking-wide text-muted font-medium";
  const valueInputClass =
    "w-full bg-transparent border-none p-0 text-base text-primary-dark placeholder:text-muted/60 focus:outline-none focus:ring-0";

  return (
    <div className="w-full max-w-sm -mt-12">
      <Link href="/login" className="text-primary mb-6 inline-block">‹ Voltar</Link>

      <Image src="/images/logo_maior.png" alt="" width={56} height={56} className="mb-4" />

      <h1 className="font-display text-3xl font-semibold text-primary-dark mb-1">Criar conta</h1>
      <p className="text-muted text-sm mb-8">Leva menos de um minuto.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className={fieldWrapperClass}>
          <label className={labelClass}>Nome</label>
          <input {...register("name")} placeholder="Seu nome" className={valueInputClass} />
        </div>
        {errors.name && <p className="text-red-600 text-xs">{errors.name.message}</p>}

        <div className={fieldWrapperClass}>
          <label className={labelClass}>E-mail</label>
          <input
            {...register("email")}
            type="email"
            placeholder="seu@email.com"
            autoCapitalize="none"
            className={valueInputClass}
          />
        </div>
        {errors.email && <p className="text-red-600 text-xs">{errors.email.message}</p>}

        <div className={fieldWrapperClass}>
          <label className={labelClass}>Telefone</label>
          <input
            {...register("phoneNumber")}
            placeholder="ex: +5511999998888"
            className={valueInputClass}
          />
        </div>
        {errors.phoneNumber && <p className="text-red-600 text-xs">{errors.phoneNumber.message}</p>}

        <div className={fieldWrapperClass}>
          <div className="flex items-center justify-between">
            <label className={labelClass}>Senha</label>
            {isPasswordStrong && (
              <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                <Check className="w-3.5 h-3.5" /> segura
              </span>
            )}
          </div>
          <input
            {...register("password")}
            type="password"
            placeholder="••••••••"
            className={valueInputClass}
          />
        </div>
        {errors.password && <p className="text-red-600 text-xs">{errors.password.message}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-brand-gradient text-white rounded-2xl p-4 font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-button"
        >
          {isSubmitting ? "Criando..." : "Criar conta"}
        </button>
      </form>

      <p className="text-center text-muted mt-6">
        Já tem conta? <Link href="/login" className="text-primary font-semibold">Entrar</Link>
      </p>
    </div>
  );
}