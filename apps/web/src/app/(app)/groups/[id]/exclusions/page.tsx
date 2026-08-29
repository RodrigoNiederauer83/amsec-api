"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { X, Ban } from "lucide-react";
import { apiClient } from "@/api/client";

type Member = { id: number; name: string | null; isDependent: boolean };
type GroupDetail = { members: Member[] };
type Exclusion = {
  id: number;
  userA: { id: number; name: string | null };
  userB: { id: number; name: string | null };
};

export default function ExclusionsPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [userAId, setUserAId] = useState<number | "">("");
  const [userBId, setUserBId] = useState<number | "">("");

  const { data: group } = useQuery({
    queryKey: ["group", id],
    queryFn: async () => {
      const response = await apiClient.get<GroupDetail>(`/groups/${id}`);
      return response.data;
    },
  });

  const { data: exclusions, isLoading } = useQuery({
    queryKey: ["exclusions", id],
    queryFn: async () => {
      const response = await apiClient.get<Exclusion[]>(`/groups/${id}/exclusions`);
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(`/groups/${id}/exclusions`, { userAId, userBId });
    },
    onSuccess: () => {
      setUserAId("");
      setUserBId("");
      queryClient.invalidateQueries({ queryKey: ["exclusions", id] });
    },
    onError: (error: any) => alert(error.response?.data?.error ?? "Não foi possível adicionar a exclusão."),
  });

  const deleteMutation = useMutation({
    mutationFn: async (exclusionId: number) => {
      await apiClient.delete(`/groups/${id}/exclusions/${exclusionId}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exclusions", id] }),
    onError: (error: any) => alert(error.response?.data?.error ?? "Não foi possível remover a exclusão."),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userAId || !userBId) return;
    if (userAId === userBId) {
      alert("Escolha duas pessoas diferentes.");
      return;
    }
    createMutation.mutate();
  }

  const fieldWrapperClass = "bg-surface rounded-xl px-4 py-2.5";
  const labelClass = "text-[11px] uppercase tracking-wide text-muted font-medium";
  const selectClass = "w-full bg-transparent border-none p-0 text-base text-primary-dark focus:outline-none focus:ring-0 appearance-none";

  return (
    <div className="max-w-sm mx-auto px-6 py-10">
      <Link href={`/groups/${id}/edit`} className="text-primary mb-4 inline-block">‹ Voltar</Link>

      <div className="bg-surface rounded-2xl w-14 h-14 flex items-center justify-center mb-4">
        <Ban className="w-6 h-6 text-primary" />
      </div>

      <h1 className="font-display text-3xl font-semibold text-primary-dark mb-1">Exclusões do sorteio</h1>
      <p className="text-muted text-sm mb-8">Defina quem não pode tirar quem.</p>

      <form onSubmit={handleSubmit} className="space-y-3 mb-8">
        <div className={fieldWrapperClass}>
          <label className={labelClass}>Pessoa 1</label>
          <select value={userAId} onChange={(e) => setUserAId(Number(e.target.value) || "")} className={selectClass}>
            <option value="">Selecione...</option>
            {group?.members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}{m.isDependent ? " (dependente)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className={fieldWrapperClass}>
          <label className={labelClass}>Pessoa 2</label>
          <select value={userBId} onChange={(e) => setUserBId(Number(e.target.value) || "")} className={selectClass}>
            <option value="">Selecione...</option>
            {group?.members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}{m.isDependent ? " (dependente)" : ""}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={createMutation.isPending}
          className="w-full bg-brand-gradient text-white rounded-2xl py-3.5 font-semibold shadow-button disabled:opacity-50"
        >
          {createMutation.isPending ? "Adicionando..." : "Adicionar exclusão"}
        </button>
      </form>

      <h2 className="font-display font-semibold text-primary-dark mb-3">
        Exclusões cadastradas {exclusions ? `(${exclusions.length})` : ""}
      </h2>

      {isLoading && <p className="text-muted text-sm">Carregando...</p>}

      {exclusions?.length === 0 && (
        <p className="text-muted text-sm">Nenhuma exclusão cadastrada ainda.</p>
      )}

      <div className="space-y-2">
        {exclusions?.map((exclusion) => (
          <div key={exclusion.id} className="flex items-center justify-between gap-2 bg-surface rounded-xl p-3 shadow-card">
            <p className="text-sm text-primary-dark capitalize">
              {exclusion.userA.name?.toLowerCase()} <span className="text-muted">×</span> {exclusion.userB.name?.toLowerCase()}
            </p>
            <button
              onClick={() => deleteMutation.mutate(exclusion.id)}
              disabled={deleteMutation.isPending}
              aria-label="Remover exclusão"
              className="bg-white rounded-lg p-1.5 shrink-0"
            >
              <X className="w-3.5 h-3.5 text-red-600" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}