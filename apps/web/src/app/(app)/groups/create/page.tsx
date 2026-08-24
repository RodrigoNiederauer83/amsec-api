"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";

export default function CreateGroupPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      const response = await apiClient.post("/groups", { name });
      await queryClient.invalidateQueries({ queryKey: ["groups"] });
      router.push(`/groups/${response.data.id}`);
    } catch (error: any) {
      alert(error.response?.data?.error ?? "Erro ao criar grupo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-10">
      <Link href="/groups" className="text-primary mb-4 inline-block">‹ Voltar</Link>

      <h1 className="font-display text-3xl font-semibold text-primary-dark mb-1">Novo grupo</h1>
      <p className="text-muted text-sm mb-8">Você pode ajustar datas e valores depois.</p>

      <form onSubmit={handleSubmit}>
        <div className="bg-surface rounded-xl px-4 py-2.5 mb-4">
          <label className="text-[11px] uppercase tracking-wide text-muted font-medium">
            Nome do grupo
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ex: Natal 2026"
            autoFocus
            className="w-full bg-transparent border-none p-0 text-base text-primary-dark placeholder:text-muted/60 focus:outline-none focus:ring-0"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-brand-gradient text-white rounded-2xl py-3.5 font-semibold shadow-button disabled:opacity-50"
        >
          {isSubmitting ? "Criando..." : "Criar grupo"}
        </button>
      </form>
    </div>
  );
}