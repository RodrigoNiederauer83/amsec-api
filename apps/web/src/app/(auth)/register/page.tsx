"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@amsec/shared";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

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

  const inputClass =
    "w-full appearance-none bg-surface rounded-xl p-3.5 text-base text-primary-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <div className="w-full max-w-sm">
      <h1 className="font-display text-3xl font-semibold text-primary-dark text-center mb-8">
        Criar conta
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-1">
        <input {...register("name")} placeholder="Nome" className={inputClass} />
        {errors.name && <p className="text-red-600 text-xs mb-3">{errors.name.message}</p>}

        <input
          {...register("email")}
          type="email"
          placeholder="E-mail"
          className={inputClass}
        />
        {errors.email && <p className="text-red-600 text-xs mb-3">{errors.email.message}</p>}

        <input
          {...register("phoneNumber")}
          placeholder="Telefone (ex: +5511999998888)"
          className={inputClass}
        />
        {errors.phoneNumber && <p className="text-red-600 text-xs mb-3">{errors.phoneNumber.message}</p>}

        <input
          {...register("password")}
          type="password"
          placeholder="Senha"
          className={inputClass}
        />
        {errors.password && <p className="text-red-600 text-xs mb-3">{errors.password.message}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-white rounded-full p-4 font-semibold mt-4 hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Criando..." : "Criar conta"}
        </button>
      </form>

      <Link href="/login" className="block text-center text-primary mt-5">
        Já tem conta? Entrar
      </Link>
    </div>
  );
}
