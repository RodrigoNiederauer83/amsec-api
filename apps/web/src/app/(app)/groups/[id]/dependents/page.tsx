"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Check } from "lucide-react";
import { apiClient } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";

type Member = { id: number; name: string | null; isDependent: boolean };
type GroupDetail = { members: Member[] };

export default function AddDependentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [guardianId, setGuardianId] = useState<number | null>(user?.id ?? null);
  const [addedNames, setAddedNames] = useState<string[]>([]);

  const { data: group } = useQuery({
    queryKey: ["group", id],
    queryFn: async () => {
      const response = await apiClient.get<GroupDetail>(`/groups/${id}`);
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(`/groups/${id}/dependents`, { name, guardianId });
    },
    onSuccess: () => {
      setAddedNames((prev) => [...prev, name]);
      setName("");
      queryClient.invalidateQueries({ queryKey: ["group", id] });
    },
    onError: (error: any) => alert(error.response?.data?.error ?? "Não foi possível adicionar."),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !guardianId) return;
    createMutation.mutate();
  }

  const fieldWrapperClass = "bg-surface rounded-xl px-4 py-2.5";
  const labelClass = "text-[11px] uppercase tracking-wide text-muted font-medium";
  const valueInputClass =
    "w-full bg-transparent border-none p-0 text-base text-primary-dark placeholder:text-muted/60 focus:outline-none focus:ring-0";

  return (
    <div className="max-w-sm mx-auto px-6 py-10">
      <Link href={`/groups/${id}`} className="text-primary mb-4 inline-block">‹ Voltar ao grupo</Link>

      <div className="bg-surface rounded-2xl w-14 h-14 flex items-center justify-center mb-4">
        <UserPlus className="w-6 h-6 text-primary" />
      </div>

      <h1 className="font-display text-3xl font-semibold text-primary-dark mb-1">Adicionar dependente</h1>
      <p className="text-muted text-sm mb-8">
        Para participantes sem conta própria — crianças, idosos, quem não tem e-mail ou celular.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className={fieldWrapperClass}>
          <label className={labelClass}>Responsável</label>
          <select
            value={guardianId ?? ""}
            onChange={(e) => setGuardianId(Number(e.target.value))}
            className={`${valueInputClass} appearance-none`}
          >
            {group?.members
              .filter((member) => !member.isDependent)
              .map((member) => (
                <option key={member.id} value={member.id} className="capitalize">
                  {member.id === user?.id ? "Eu mesmo" : member.name?.toLowerCase()}
                </option>
              ))}
          </select>
        </div>

        <div className={fieldWrapperClass}>
          <label className={labelClass}>Nome do dependente</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ex: Maria, 7 anos"
            autoFocus
            className={valueInputClass}
          />
        </div>

        <button
          type="submit"
          disabled={createMutation.isPending}
          className="w-full bg-brand-gradient text-white rounded-2xl py-3.5 font-semibold shadow-button disabled:opacity-50"
        >
          {createMutation.isPending ? "Adicionando..." : "Adicionar e continuar"}
        </button>
      </form>

      {addedNames.length > 0 && (
        <div className="mt-8">
          <p className="text-xs text-muted font-medium mb-2">
            {addedNames.length} adicionado{addedNames.length === 1 ? "" : "s"} nesta sessão
          </p>
          <div className="space-y-1.5">
            {addedNames.map((n, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-primary-dark bg-surface rounded-lg px-3 py-2">
                <Check className="w-3.5 h-3.5 text-primary shrink-0" /> {n}
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => router.push(`/groups/${id}`)}
        className="w-full text-primary font-semibold py-3.5 mt-6"
      >
        Concluído, voltar ao grupo
      </button>
    </div>
  );
}