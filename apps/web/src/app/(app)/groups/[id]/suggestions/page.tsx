"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/api/client";

type Suggestion = {
  id: number;
  content: string;
  user: { id: number; name: string | null };
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

  const grouped = suggestions?.reduce<Record<number, { name: string | null; items: Suggestion[] }>>(
    (acc, s) => {
      if (!acc[s.user.id]) acc[s.user.id] = { name: s.user.name, items: [] };
      acc[s.user.id].items.push(s);
      return acc;
    },
    {}
  );

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Link href={`/groups/${id}`} className="text-primary mb-4 inline-block">‹ Voltar</Link>
      <h1 className="font-display text-2xl font-semibold text-primary-dark mb-6">
        Bisbilhotar sugestões
      </h1>

      {isLoading && <p className="text-muted">Carregando...</p>}

      {grouped && Object.keys(grouped).length === 0 && (
        <p className="text-muted text-center py-10">Ninguém cadastrou sugestões ainda.</p>
      )}

      <div className="space-y-4">
        {grouped &&
          Object.values(grouped).map((group) => (
            <div key={group.name} className="bg-surface rounded-2xl p-4">
              <p className="font-display font-semibold text-primary-dark capitalize mb-2">
                {group.name}
              </p>
              <ul className="space-y-1.5 list-disc list-inside">
                {group.items.map((s) => (
                  <li key={s.id} className="text-sm text-primary-dark">{s.content}</li>
                ))}
              </ul>
            </div>
          ))}
      </div>
    </div>
  );
}