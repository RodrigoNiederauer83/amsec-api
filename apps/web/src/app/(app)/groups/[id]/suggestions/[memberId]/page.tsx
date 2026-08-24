"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Gift, SquarePen, Trash2, Plus } from "lucide-react";
import { apiClient } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";

type Suggestion = { id: number; content: string; user: { id: number; name: string | null } };

export default function MemberSuggestionsPage() {
  const { id, memberId } = useParams<{ id: string; memberId: string }>();
  const searchParams = useSearchParams();
  const memberName = searchParams.get("name");
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newContent, setNewContent] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");

  const isOwnCard = user?.id === Number(memberId);

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ["suggestions", id, memberId],
    queryFn: async () => {
      const response = await apiClient.get<Suggestion[]>(`/groups/${id}/suggestions?userId=${memberId}`);
      return response.data;
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["suggestions", id, memberId] });

  const createMutation = useMutation({
    mutationFn: async (content: string) => apiClient.post(`/groups/${id}/suggestions`, { content }),
    onSuccess: () => {
      setNewContent("");
      invalidate();
    },
    onError: () => alert("Não foi possível adicionar a sugestão."),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ suggestionId, content }: { suggestionId: number; content: string }) =>
      apiClient.patch(`/groups/${id}/suggestions/${suggestionId}`, { content }),
    onSuccess: () => {
      setEditingId(null);
      invalidate();
    },
    onError: () => alert("Não foi possível editar a sugestão."),
  });

  const deleteMutation = useMutation({
    mutationFn: async (suggestionId: number) => apiClient.delete(`/groups/${id}/suggestions/${suggestionId}`),
    onSuccess: invalidate,
    onError: () => alert("Não foi possível excluir a sugestão."),
  });

  return (
    <div className="min-h-screen flex flex-col max-w-sm mx-auto px-6 py-10">
      <div>
        <Link href={`/groups/${id}`} className="text-primary mb-4 inline-block">‹ Voltar</Link>
        <h1 className="font-display text-3xl font-semibold text-primary-dark mb-1">
          {isOwnCard ? "Minhas sugestões" : "Sugestões"}
        </h1>
        <p className="text-muted text-sm mb-8 capitalize">
          {isOwnCard ? "Ajude quem tirou você a acertar o presente." : `de ${memberName?.toLowerCase()}`}
        </p>
      </div>

      <div className="flex-1 flex flex-col">
        {isLoading && <p className="text-muted text-center">Carregando...</p>}

        {suggestions?.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="bg-surface rounded-3xl p-6 mb-5">
              <Gift className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-display text-lg font-semibold text-primary-dark mb-2">
              {isOwnCard ? "Nenhuma sugestão ainda" : "Nenhuma sugestão cadastrada ainda"}
            </h2>
            {isOwnCard && (
              <p className="text-muted text-sm max-w-xs">
                Adicione ideias simples: tamanho, cor, marca preferida.
              </p>
            )}
          </div>
        )}

        {suggestions && suggestions.length > 0 && (
          <div className="space-y-2">
            {suggestions.map((s) => (
              <div key={s.id} className="bg-surface rounded-xl p-3 shadow-card">
                {editingId === s.id ? (
                  <div className="space-y-2">
                    <input
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="w-full appearance-none bg-white rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      maxLength={150}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateMutation.mutate({ suggestionId: s.id, content: editingContent })}
                        className="text-xs text-primary font-semibold"
                      >
                        Salvar
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-xs text-muted">
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-primary-dark flex items-center gap-2">
                      <Gift className="w-3.5 h-3.5 text-primary shrink-0" /> {s.content}
                    </p>
                    {isOwnCard && (
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            setEditingId(s.id);
                            setEditingContent(s.content);
                          }}
                          aria-label="Editar sugestão"
                          className="bg-white rounded-lg p-1.5"
                        >
                          <SquarePen className="w-3.5 h-3.5 text-primary" />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(s.id)}
                          aria-label="Excluir sugestão"
                          className="bg-white rounded-lg p-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {isOwnCard && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!newContent.trim()) return;
            createMutation.mutate(newContent);
          }}
          className="pt-6"
        >
          <div className="relative mb-3">
            <SquarePen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
            <input
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Nova sugestão de presente"
              maxLength={150}
              className="w-full appearance-none bg-surface rounded-xl py-3.5 pl-11 pr-4 text-base placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex items-center justify-center gap-2 w-full bg-brand-gradient text-white rounded-2xl py-3.5 font-semibold shadow-button disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> {createMutation.isPending ? "Adicionando..." : "Adicionar sugestão"}
          </button>
        </form>
      )}
    </div>
  );
}