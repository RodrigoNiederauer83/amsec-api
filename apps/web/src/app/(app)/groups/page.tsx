"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiClient } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";

type Group = {
  id: number;
  name: string;
  owner: { id: number; name: string | null };
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
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-semibold text-primary-dark">Meus grupos</h1>
        <button onClick={signOut} className="text-primary">Sair</button>
      </div>

      {isLoading && <p className="text-muted">Carregando...</p>}

      {groups?.length === 0 && (
        <p className="text-muted text-center py-10">Você ainda não faz parte de nenhum grupo.</p>
      )}

      <div className="space-y-3">
        {groups?.map((group) => (
          <Link
            key={group.id}
            href={`/groups/${group.id}`}
            className="block bg-surface rounded-2xl p-4 hover:opacity-90 transition-opacity"
          >
            <p className="font-display font-semibold text-primary-dark">{group.name}</p>
            <p className="text-xs text-muted mt-1">Responsável: <span className="capitalize">{group.owner.name}</span></p>
          </Link>
        ))}
      </div>

      <div className="flex gap-3 mt-6">
        <Link href="/groups/create" className="flex-1 bg-primary text-white rounded-full py-3.5 text-center font-semibold">
          + Novo grupo
        </Link>
        <Link href="/groups/join" className="flex-1 bg-surface text-primary rounded-full py-3.5 text-center font-semibold">
          Entrar com código
        </Link>
      </div>
    </div>
  );
}