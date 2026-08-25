"use client";

import { useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Calendar, Wallet, UserPlus, RefreshCw, Gift, ChevronRight, Eye, LogOut, X } from "lucide-react";
import { apiClient } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";
import { Avatar } from "@/components/Avatar";

type Member = { id: number; name: string | null; avatarUrl: string | null; suggestionsCount: number };
type GroupDetail = {
  id: number;
  name: string;
  owner: { id: number; name: string | null };
  members: Member[];
  hasDraw: boolean;
  eventDate: string | null;
  minGiftCents: number | null;
  maxGiftCents: number | null;
};

function formatGiftRange(min: number | null, max: number | null): string | null {
  const hasMin = typeof min === "number";
  const hasMax = typeof max === "number";
  const fmt = (cents: number) => (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  if (hasMin && hasMax) return `R$ ${fmt(min)} – ${fmt(max)}`;
  if (hasMin) return `a partir de R$ ${fmt(min)}`;
  if (hasMax) return `até R$ ${fmt(max)}`;
  return null;
}

function daysUntil(dateString: string): number {
  const eventDate = new Date(dateString);
  const today = new Date();
  const diffMs = Date.UTC(eventDate.getUTCFullYear(), eventDate.getUTCMonth(), eventDate.getUTCDate())
    - Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const dateInputRef = useRef<HTMLInputElement>(null);

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
      const message = `Você foi convidado para o grupo "${group?.name}" no Secretin!\n\nToque no link para entrar automaticamente:\n${inviteUrl}\n\nOu use o código abaixo na opção "Entrar com código":\n${data.token}`;
      if (navigator.share) {
        navigator.share({ title: `Convite para o grupo "${group?.name}"`, text: message, url: inviteUrl });
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

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: number) => {
      await apiClient.delete(`/groups/${id}/members/${memberId}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["group", id] }),
    onError: (error: any) => alert(error.response?.data?.error ?? "Não foi possível remover este membro."),
  });

  const leaveGroupMutation = useMutation({
    mutationFn: async () => {
      await apiClient.delete(`/groups/${id}/members/me`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      router.push("/groups");
    },
    onError: (error: any) => alert(error.response?.data?.error ?? "Não foi possível sair do grupo."),
  });

  function handleRemoveMember(memberId: number, memberName: string | null) {
    if (confirm(`Remover ${memberName} do grupo?`)) {
      removeMemberMutation.mutate(memberId);
    }
  }

  function handleLeaveGroup() {
    if (confirm("Tem certeza que deseja sair deste grupo?")) {
      leaveGroupMutation.mutate();
    }
  }

  function handleDateChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.value) return;
    const [year, month, day] = event.target.value.split("-").map(Number);
    const neutralDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    setDateMutation.mutate(neutralDate.toISOString());
  }

  if (isLoading || !group) {
    return <div className="max-w-2xl mx-auto px-6 py-10 text-muted">Carregando...</div>;
  }

  const isOwner = group.owner.id === user?.id;
  const giftRangeText = formatGiftRange(group.minGiftCents, group.maxGiftCents);
  const daysRemaining = group.eventDate ? daysUntil(group.eventDate) : null;

  return (
    <div className="max-w-2xl mx-auto min-h-screen flex flex-col">
      <div className="text-white px-6 pt-8 pb-7.5 relative overflow-hidden bg-[linear-gradient(120deg,#8B5CF6,#7C3AED_55%,#5B21B6)]">
        <div className="absolute pointer-events-none -top-15 -right-12.5 w-45 h-45 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.16),transparent_70%)]" />
        <div className="relative flex items-start justify-between">
          <Link href="/groups" className="text-white/90 mb-4 inline-block">‹ Voltar</Link>
          {isOwner && (
            <Link
              href={`/groups/${id}/edit`}
              className="bg-white/20 rounded-xl p-2 hover:bg-white/30 transition-colors"
              aria-label="Editar grupo"
            >
              <Pencil className="w-4 h-4" />
            </Link>
          )}
        </div>
        <h1 className="relative font-display text-2xl font-semibold capitalize">{group.name.toLowerCase()}</h1>
        <p className="relative text-white/80 text-sm mt-1 capitalize">Responsável: {group.owner.name?.toLowerCase()}</p>
      </div>

      <div className="px-6 -mt-4 flex-1">
        <div className="mb-3 bg-white border border-[#EFE5FC] rounded-[1.375em] p-4 shadow-[0_10px_24px_rgba(46,16,101,0.07)]">
          <div className="flex gap-2.5">
            <div className="flex-1 py-3 px-3.25 rounded-2xl bg-[linear-gradient(150deg,#F9F4FF,#F2E9FE)]">
              <p className="flex items-center gap-1 text-xs text-primary font-bold mb-1">
                <Calendar className="w-3.5 h-3.5" /> DATA DO EVENTO
              </p>
              <p className="font-display font-semibold text-primary-dark">
                {group.eventDate ? new Date(group.eventDate).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "Não definida"}
              </p>
              {daysRemaining !== null && daysRemaining >= 0 && (
                <p className="text-xs text-muted mt-1">faltam {daysRemaining} dias</p>
              )}
            </div>
            <div className="flex-1 py-3 px-3.25 rounded-2xl bg-[linear-gradient(150deg,#F9F4FF,#F2E9FE)]">
              <p className="flex items-center gap-1 text-xs text-primary font-bold mb-1">
                <Wallet className="w-3.5 h-3.5" /> VALOR
              </p>
              <p className="font-display font-semibold text-primary-dark">{giftRangeText ?? "Não definido"}</p>
            </div>
          </div>

          {isOwner && (
            <div className="flex items-center gap-2 mt-4">
              <div className="relative flex-1 h-8">
                <span className="absolute inset-0 flex items-center justify-center gap-1.5 text-[10px] text-primary bg-surface rounded-xl font-semibold pointer-events-none">
                  <Calendar className="w-3.5 h-3.5" /> {group.eventDate ? "Alterar data" : "Definir data"}
                </span>
                <input
                  type="date"
                  onChange={handleDateChange}
                  className="absolute inset-0 w-full h-1/2 opacity-0 cursor-pointer"
                />
              </div>
              <button onClick={() => inviteMutation.mutate()} disabled={inviteMutation.isPending}
                className="flex items-center justify-center gap-1.5 flex-1 text-[10px] text-primary bg-surface rounded-xl py-2 font-semibold disabled:opacity-50"
              >
                <UserPlus className="w-3.5 h-3.5" /> Convidar
              </button>
              <button
                onClick={() => drawMutation.mutate()}
                disabled={drawMutation.isPending || !group.eventDate || group.members.length < 3}
                className="flex items-center justify-center gap-1.5 flex-1 text-[10px] text-primary bg-surface rounded-xl py-2 font-semibold disabled:opacity-40"
              >
                <RefreshCw className="w-3.5 h-3.5" /> {group.hasDraw ? "Novo sorteio" : "Sortear"}
              </button>
            </div>
          )}
        </div>
        {group.hasDraw && (
          <Link
            href={`/groups/${id}/result`}
            className="flex items-center justify-between text-white mt-3.5 mb-6 p-4 rounded-[20px] bg-[linear-gradient(120deg,#8B5CF6,#7C3AED_55%,#5B21B6)] shadow-[0_10px_24px_rgba(124,58,237,0.3)]"
          >
            <span className="flex items-center gap-3">
              <span className="flex items-center justify-center shrink-0 w-9.5 h-9.5 rounded-[13px] bg-white/18">
                <Gift className="w-4.5 h-4.5" />
              </span>
              <span>
                <span className="block font-semibold">Ver meu resultado</span>
                <span className="block text-xs text-white/80">Toque para revelar quem você tirou</span>
              </span>
            </span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}

        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-primary-dark">Integrantes ({group.members.length})</h2>
          {isOwner && (
            <Link href={`/groups/${id}/dependents`} className="text-xs text-primary font-semibold">
              + Adicionar dependente
            </Link>
          )}
        </div>
        <div className="space-y-2 mb-8">
          {group.members.map((member) => (
            <div key={member.id} className="flex items-center justify-between gap-2 bg-surface rounded-xl p-3 shadow-card">
              <div className="flex items-center gap-3">
                <Avatar name={member.name} avatarUrl={member.avatarUrl} />
                <div>
                  <p className="text-primary-dark font-medium capitalize">{member.name?.toLowerCase()}</p>
                  <p className="text-xs text-muted">
                    {member.id === group.owner.id ? "Organizador · " : ""}
                    {member.suggestionsCount} sugest{member.suggestionsCount === 1 ? "ão" : "ões"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Link
                  href={`/groups/${id}/suggestions/${member.id}?name=${encodeURIComponent(member.name ?? "")}`}
                  className="flex items-center gap-1 py-1.75 px-2.5 rounded-full bg-[#F7F2FF] text-[#6D28D9] text-[11.5px] font-bold"
                >
                  <Eye className="w-3 h-3" /> Sugestões
                </Link>
                {isOwner && member.id !== group.owner.id && (
                  <button
                    onClick={() => handleRemoveMember(member.id, member.name)}
                    disabled={removeMemberMutation.isPending}
                    aria-label="Remover membro"
                    className="bg-white rounded-lg p-1.5"
                  >
                    <X className="w-3.5 h-3.5 text-red-600" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="px-6 pb-10" style={{ paddingBottom: "max(2.5rem, env(safe-area-inset-bottom))" }}>
        <Link href={`/groups/${id}/suggestions`} className="block text-center w-full border border-surface text-primary rounded-2xl py-3.5 font-semibold">
          Bisbilhotar sugestões
        </Link>
      </div>
    </div>
  );
}