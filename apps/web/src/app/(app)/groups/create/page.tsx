"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
    <div className="max-w-sm mx-auto px-6 py-16">
      <h1 className="font-display text-2xl font-semibold text-primary-dark text-center mb-8">
        Novo grupo
      </h1>
      <form onSubmit={handleSubmit}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do grupo (ex: Natal 2026)"
          autoFocus
          className="w-full border border-surface rounded-xl p-3.5 text-base mb-4"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-white rounded-full py-3.5 font-semibold disabled:opacity-50"
        >
          {isSubmitting ? "Criando..." : "Criar grupo"}
        </button>
      </form>
    </div>
  );
}