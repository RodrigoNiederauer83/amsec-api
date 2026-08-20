"use client";

import { useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";

type GroupDetail = {
  id: number;
  name: string;
  owner: { id: number; name: string | null };
  members: { id: number; name: string | null }[];
  hasDraw: boolean;
  eventDate: string | null;
};

export default function GroupDetailPage() {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: group, isLoading } = useQuery({
    queryKey: ["group", id],
    queryFn: async () => {
      const response = await apiClient.get<GroupDetail>(`/groups/${id}`);
      return response.data;
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(`/groups/${id}/invite`);
      return response.data;
    },
    onSuccess: async (data) => {
      const inviteUrl = `${window.location.origin}/groups/invite/${data.token}`;
      const message = `Você foi convidado para o grupo "${group?.name}" no Secretin! Acesse: ${inviteUrl}`;
      if (navigator.share) {
        navigator.share({ text: message, url: inviteUrl });
      } else {
        await navigator.clipboard.writeText(message);
        alert("Convite copiado para a área de transferência!");
      }
    },
    onError: () => alert("Não foi possível gerar o convite."),
  });

  const setDateMutation = useMutation({
    mutationFn: async (eventDate: string) => {
      await apiClient.patch(`/groups/${id}/settings`, { eventDate });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["group", id] }),
    onError: () => alert("Não foi possível salvar a data."),
  });

  const drawMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(`/groups/${id}/draw`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", id] });
      alert("Sorteio realizado! Agora cada participante já pode ver o resultado.");
    },
    onError: (error: any) => alert(error.response?.data?.error ?? "Não foi possível realizar o sorteio."),
  });

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.value) return;
    setDateMutation.mutate(new Date(e.target.value).toISOString());
  }

  if (isLoading || !group) {
    return <div className="max-w-2xl mx-auto px-6 py-10 text-muted">Carregando...</div>;
  }

  const isOwner = group.owner.id === user?.id;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Link href="/groups" className="text-primary mb-4 inline-block">‹ Voltar</Link>

      <h1 className="font-display text-2xl font-semibold text-primary-dark">{group.name}</h1>
      <p className="text-sm text-muted mt-1 mb-6">Responsável: <span className="capitalize">{group.owner.name}</span></p>

      <div className="bg-surface rounded-2xl p-4 mb-3">
        <p className="text-xs text-muted mb-1">Data do evento</p>
        <p className="font-display font-semibold text-primary-dark">
          {group.eventDate ? new Date(group.eventDate).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "Não definida"}
        </p>
        {isOwner && (
          <div className="relative inline-block mt-2">
            <span className="text-sm text-primary font-semibold underline pointer-events-none">
              {group.eventDate ? "Alterar data" : "Definir data"}
            </span>
            <input
              type="date"
              onChange={handleDateChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        )}
      </div>

      {isOwner && (
        <button
          onClick={() => inviteMutation.mutate()}
          disabled={inviteMutation.isPending}
          className="w-full bg-surface text-primary rounded-full py-3.5 font-semibold mb-3 disabled:opacity-50"
        >
          {inviteMutation.isPending ? "Gerando..." : "Convidar pessoas"}
        </button>
      )}

      {isOwner && (
        <button
          onClick={() => drawMutation.mutate()}
          disabled={drawMutation.isPending || !group.eventDate || group.members.length < 3}
          className="w-full bg-primary text-white rounded-full py-3.5 font-semibold mb-3 disabled:opacity-40"
        >
          {drawMutation.isPending ? "Sorteando..." : group.hasDraw ? "Refazer sorteio" : "Realizar sorteio"}
        </button>
      )}

      {group.hasDraw && (
        <Link
          href={`/groups/${id}/result`}
          className="block text-center w-full bg-surface text-primary rounded-full py-3.5 font-semibold mb-6"
        >
          Ver meu resultado
        </Link>
      )}

      <h2 className="font-display font-semibold text-primary-dark mt-6 mb-3">
        Integrantes ({group.members.length})
      </h2>
      <div className="space-y-2">
        {group.members.map((member) => (
          <div key={member.id} className="bg-surface rounded-xl p-3">
            <p className="text-primary-dark font-medium capitalize">{member.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}