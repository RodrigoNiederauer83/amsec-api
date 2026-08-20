"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
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
    <div className="max-w-sm mx-auto px-6 py-16">
      <h1 className="font-display text-2xl font-semibold text-primary-dark text-center mb-2">
        Entrar em um grupo
      </h1>
      <p className="text-muted text-center text-sm mb-8">Cole o código que você recebeu</p>
      <form onSubmit={handleJoin}>
        <input
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Código do convite"
          className="w-full border border-surface rounded-xl p-3.5 text-base mb-4"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-white rounded-full py-3.5 font-semibold disabled:opacity-50"
        >
          {isSubmitting ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}