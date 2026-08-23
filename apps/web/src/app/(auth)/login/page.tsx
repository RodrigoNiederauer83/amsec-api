"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@amsec/shared";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
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

  return (
    <div className="w-full max-w-sm">
      <h1 className="font-display text-3xl font-semibold text-primary-dark text-center mb-8">
        Secretin
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-1">
        <input
          {...register("email")}
          type="email"
          placeholder="E-mail"
          className="w-full appearance-none bg-surface rounded-xl p-3.5 text-base text-primary-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.email && <p className="text-red-600 text-xs mb-3">{errors.email.message}</p>}

        <input
          {...register("password")}
          type="password"
          placeholder="Senha"
          className="w-full appearance-none bg-surface rounded-xl p-3.5 text-base text-primary-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.password && <p className="text-red-600 text-xs mb-3">{errors.password.message}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-white rounded-full p-4 font-semibold mt-4 hover:bg-primary-dark transition-colors disabled:opacity-50"
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

      <Link href="/register" className="block text-center text-primary mt-5">
        Não tem conta? Cadastre-se
      </Link>
    </div>
  );
}