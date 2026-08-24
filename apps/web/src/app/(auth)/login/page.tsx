"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@amsec/shared";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { apiClient } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginForm) {
    try {
      const response = await apiClient.post("/auth/login", data);
      await signIn(response.data.token);
      router.push("/groups");
    } catch (error: any) {
      alert(error.response?.data?.error ?? "Erro ao entrar. Tente novamente.");
    }
  }

  async function handleGoogleSuccess(credentialResponse: CredentialResponse) {
    if (!credentialResponse.credential) return;
    try {
      const response = await apiClient.post("/auth/google", {
        idToken: credentialResponse.credential,
      });
      await signIn(response.data.token);
      router.push("/groups");
    } catch (error: any) {
      alert(error.response?.data?.error ?? "Erro ao entrar com Google.");
    }
  }

  const inputClass =
    "w-full appearance-none bg-surface rounded-xl py-3.5 pl-11 pr-11 text-base text-primary-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary border border-solid border-[#EBDFFB]";

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white flex flex-col items-center">
        <Image src="/images/logo_vertical.png" alt="" width={160} height={160} />
      </div>

      <p className="text-center text-muted text-sm mb-8">
        Seu amigo secreto, sem bagunça no grupo da família.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-1">
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
          <input
            {...register("email")}
            type="email"
            placeholder="E-mail"
            autoCapitalize="none"
            className={inputClass}
          />
        </div>
        {errors.email && <p className="text-red-600 text-xs mb-3 mt-1">{errors.email.message}</p>}

        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
          <input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="Senha"
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>}

        <div className="text-right mt-2 mb-4">
          <Link href="/forgot-password" className="text-sm text-primary">
            Esqueci minha senha
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-brand-gradient text-white rounded-2xl p-4 font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-button"
        >
          {isSubmitting ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="flex-1 h-px bg-surface" />
        <span className="text-xs text-muted">ou</span>
        <div className="flex-1 h-px bg-surface" />
      </div>

      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => alert("Erro ao entrar com Google.")}
          shape="pill"
          theme="outline"
          size="large"
          text="continue_with"
          width="320"
        />
      </div>

      <p className="text-center text-muted mt-6">
        Não tem conta? <Link href="/register" className="text-primary font-semibold">Cadastre-se</Link>
      </p>
    </div>
  );
}