"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { apiClient } from "@/api/client";
import { formatCentsToBRL, extractCentsFromInput } from "@/utils/currency";

type GroupDetail = {
  name: string;
  minGiftCents: number | null;
  maxGiftCents: number | null;
};

export default function EditGroupPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [minGiftCents, setMinGiftCents] = useState<number | null>(null);
  const [maxGiftCents, setMaxGiftCents] = useState<number | null>(null);

  const { data: group, isLoading } = useQuery({
    queryKey: ["group", id],
    queryFn: async () => {
      const response = await apiClient.get<GroupDetail>(`/groups/${id}`);
      return response.data;
    },
  });

  useEffect(() => {
    if (group) {
      setName(group.name);
      setMinGiftCents(group.minGiftCents ?? null);
      setMaxGiftCents(group.maxGiftCents ?? null);
    }
  }, [group]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      await apiClient.patch(`/groups/${id}/settings`, { name, minGiftCents, maxGiftCents });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", id] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      router.push(`/groups/${id}`);
    },
    onError: (error: any) => alert(error.response?.data?.error ?? "Não foi possível salvar."),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiClient.delete(`/groups/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      router.push("/groups");
    },
    onError: () => alert("Não foi possível excluir o grupo."),
  });

  function handleDelete() {
    if (confirm(`Tem certeza que deseja excluir "${name}"? Essa ação não pode ser desfeita.`)) {
      deleteMutation.mutate();
    }
  }

  const fieldWrapperClass = "bg-surface rounded-xl px-4 py-2.5";
  const labelClass = "text-[11px] uppercase tracking-wide text-muted font-medium";
  const valueInputClass =
    "w-full bg-transparent border-none p-0 text-base text-primary-dark placeholder:text-muted/60 focus:outline-none focus:ring-0";

  if (isLoading) {
    return <div className="max-w-sm mx-auto px-6 py-16 text-center text-muted">Carregando...</div>;
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-10">
      <Link href={`/groups/${id}`} className="text-primary mb-4 inline-block">‹ Voltar</Link>
      <h1 className="font-display text-3xl font-semibold text-primary-dark mb-1">Editar grupo</h1>
      <p className="text-muted text-sm mb-8">As mudanças valem para todos os integrantes.</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateMutation.mutate();
        }}
        className="space-y-3"
      >
        <div className={fieldWrapperClass}>
          <label className={labelClass}>Nome do grupo</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={valueInputClass} />
        </div>

        <div className="flex gap-3">
          <div className={`flex-1 ${fieldWrapperClass}`}>
            <label className={labelClass}>Valor mínimo</label>
            <input
              value={typeof minGiftCents === "number" ? formatCentsToBRL(minGiftCents) : ""}
              onChange={(e) => setMinGiftCents(extractCentsFromInput(e.target.value))}
              placeholder="R$ 0,00"
              inputMode="numeric"
              className={valueInputClass}
            />
          </div>
          <div className={`flex-1 ${fieldWrapperClass}`}>
            <label className={labelClass}>Valor máximo</label>
            <input
              value={typeof maxGiftCents === "number" ? formatCentsToBRL(maxGiftCents) : ""}
              onChange={(e) => setMaxGiftCents(extractCentsFromInput(e.target.value))}
              placeholder="R$ 0,00"
              inputMode="numeric"
              className={valueInputClass}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="w-full bg-brand-gradient text-white rounded-2xl py-3.5 font-semibold shadow-button disabled:opacity-50 mt-4"
        >
          {updateMutation.isPending ? "Salvando..." : "Salvar alterações"}
        </button>
      </form>

      <button
        onClick={handleDelete}
        disabled={deleteMutation.isPending}
        className="flex items-center justify-center gap-2 w-full text-red-600 bg-red-50 rounded-2xl py-3.5 font-semibold mt-3 disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" />
        {deleteMutation.isPending ? "Excluindo..." : "Excluir grupo"}
      </button>
    </div>
  );
}