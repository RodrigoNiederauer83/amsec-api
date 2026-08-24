"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { Gift, LogOut, Plus, KeyRound, Users, Calendar } from "lucide-react";
import { apiClient } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";

type Group = {
  id: number;
  name: string;
  owner: { id: number; name: string | null };
  hasDraw: boolean;
  eventDate: string | null;
  members: { id: number }[];
};

export default function GroupsListPage() {
  const { signOut } = useAuth();

  const { data: groups, isLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const response = await apiClient.get<Group[]>("/groups");
      return response.data;
    },
  });

  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" />
          <h1 className="font-display text-xl font-semibold text-primary-dark">Meus grupos</h1>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-1.5 text-sm text-primary bg-surface rounded-full px-4 py-2 font-medium"
        >
          <LogOut className="w-3.5 h-3.5" /> Sair
        </button>
      </div>

      <div className="flex-1 flex flex-col">
        {isLoading && <p className="text-muted text-center py-10">Carregando...</p>}

        {groups?.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="bg-surface rounded-3xl p-6 mb-6">
              <Image src="/images/logo_maior.png" alt="" width={72} height={72} />
            </div>
            <h2 className="font-display text-xl font-semibold text-primary-dark mb-2">
              Nenhum grupo por aqui
            </h2>
            <p className="text-muted text-sm max-w-xs">
              Crie um grupo para organizar o sorteio ou entre em um usando o código do convite.
            </p>
          </div>
        )}

        {groups && groups.length > 0 && (
          <div className="space-y-3">
            {groups.map((group) => (
              <Link
                key={group.id}
                href={`/groups/${group.id}`}
                className={
                  group.hasDraw
                    ? "block rounded-2xl p-4 shadow-card bg-brand-gradient text-white hover:opacity-90 transition-opacity"
                    : "block rounded-2xl p-4 shadow-card bg-surface hover:opacity-90 transition-opacity"
                }
              >
                <span
                  className={
                    group.hasDraw
                      ? "inline-flex items-center gap-1 text-xs font-semibold bg-white/20 rounded-full px-2.5 py-1 mb-2"
                      : "inline-flex items-center gap-1 text-xs font-semibold bg-primary/10 text-primary rounded-full px-2.5 py-1 mb-2"
                  }
                >
                  {group.hasDraw ? "✓ SORTEADO" : "AGUARDANDO SORTEIO"}
                </span>

                <p className={`font-display font-semibold capitalize ${group.hasDraw ? "text-white" : "text-primary-dark"}`}>
                  {group.name.toLowerCase()}
                </p>
                <p className={`text-xs mt-1 capitalize ${group.hasDraw ? "text-white/80" : "text-muted"}`}>
                  Responsável: {group.owner.name?.toLowerCase()}
                </p>

                <div className={`flex items-center gap-4 mt-3 text-xs ${group.hasDraw ? "text-white/90" : "text-muted"}`}>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> {group.members.length} integrantes
                  </span>
                  {group.eventDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(group.eventDate).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3 pt-10">
        <Link
          href="/groups/create"
          className="flex items-center justify-center gap-2 w-full bg-brand-gradient text-white rounded-2xl py-3.5 font-semibold shadow-button"
        >
          <Plus className="w-4 h-4" /> Novo grupo
        </Link>
        <Link
          href="/groups/join"
          className="flex items-center justify-center gap-2 w-full bg-surface text-primary rounded-2xl py-3.5 font-semibold"
        >
          <KeyRound className="w-4 h-4" /> Entrar com código
        </Link>
      </div>
    </div>
  );
}