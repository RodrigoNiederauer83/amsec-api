"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { apiClient } from "@/api/client";

type Suggestion = {
  id: number;
  content: string;
  user: { id: number; name: string | null; avatarUrl: string | null };
};

type PersonSuggestions = {
  name: string | null;
  avatarUrl: string | null;
  items: Suggestion[];
};

export default function AllSuggestionsPage() {
  const { id } = useParams<{ id: string }>();

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ["suggestions", id],
    queryFn: async () => {
      const response = await apiClient.get<Suggestion[]>(`/groups/${id}/suggestions`);
      return response.data;
    },
  });

  const suggestionsByPerson = suggestions?.reduce<Record<number, PersonSuggestions>>((acc, s) => {
    if (!acc[s.user.id]) {
      acc[s.user.id] = { name: s.user.name, avatarUrl: s.user.avatarUrl, items: [] };
    }
    acc[s.user.id].items.push(s);
    return acc;
  }, {});

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Link href={`/groups/${id}`} className="text-primary mb-4 inline-block">‹ Voltar</Link>
      <h1 className="font-display text-3xl font-semibold text-primary-dark mb-1">Bisbilhotar sugestões</h1>
      <p className="text-muted text-sm mb-8">O que cada um do grupo gostaria de ganhar.</p>

      {isLoading && <p className="text-muted text-center py-10">Carregando...</p>}

      {suggestionsByPerson && Object.keys(suggestionsByPerson).length === 0 && (
        <p className="text-muted text-center py-10">Ninguém cadastrou sugestões ainda.</p>
      )}

      <div className="space-y-3">
        {suggestionsByPerson &&
          Object.values(suggestionsByPerson).map((personSuggestions) => (
            <div key={personSuggestions.name} className="bg-surface rounded-2xl p-4 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <Avatar name={personSuggestions.name} avatarUrl={personSuggestions.avatarUrl} size={28} />
                  <p className="font-display font-semibold text-primary-dark capitalize">
                    {personSuggestions.name?.toLowerCase()}
                  </p>
                </div>
                <span className="text-xs text-muted shrink-0">
                  {personSuggestions.items.length} {personSuggestions.items.length === 1 ? "ideia" : "ideias"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {personSuggestions.items.map((s) => (
                  <span key={s.id} className="bg-white text-primary-dark text-sm rounded-full px-3 py-1.5">
                    {s.content}
                  </span>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}