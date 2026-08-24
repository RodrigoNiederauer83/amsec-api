"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { KeyRound } from "lucide-react";
import { apiClient } from "@/api/client";

export default function JoinGroupPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [token, setToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!token.trim()) return;
    setIsSubmitting(true);
    try {
      const response = await apiClient.post(`/groups/invite/${token.trim()}/join`);
      await queryClient.invalidateQueries({ queryKey: ["groups"] });
      router.push(`/groups/${response.data.groupId}`);
    } catch (error: any) {
      alert(error.response?.data?.error ?? "Código inválido ou expirado.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-10">
      <Link href="/groups" className="text-primary mb-4 inline-block">‹ Voltar</Link>

      <div className="bg-surface rounded-2xl w-14 h-14 flex items-center justify-center mb-4">
        <KeyRound className="w-6 h-6 text-primary" />
      </div>

      <h1 className="font-display text-3xl font-semibold text-primary-dark mb-1">
        Entrar em um grupo
      </h1>
      <p className="text-muted text-sm mb-8">Cole o código que você recebeu</p>

      <form onSubmit={handleJoin}>
        <input
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Cole o código que você recebeu"
          className="w-full appearance-none bg-surface rounded-xl p-3.5 text-base text-primary-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary mb-4"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-brand-gradient text-white rounded-2xl py-3.5 font-semibold shadow-button disabled:opacity-50"
        >
          {isSubmitting ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}