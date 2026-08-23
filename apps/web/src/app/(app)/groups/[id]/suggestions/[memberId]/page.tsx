"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";
import { SquarePen, Trash2 } from "lucide-react";

type Suggestion = {
  id: number;
  content: string;
  user: { id: number; name: string | null };
};

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
    <div className="max-w-sm mx-auto px-6 py-10">
      <Link href={`/groups/${id}`} className="text-primary mb-4 inline-block">‹ Voltar</Link>
      <h1 className="font-display text-2xl font-semibold text-primary-dark capitalize mb-6">
        {isOwnCard ? "Minhas sugestões" : `Sugestões de ${memberName}`}
      </h1>

      {isLoading && <p className="text-muted">Carregando...</p>}

      <div className="space-y-2 mb-6">
        {suggestions?.map((s) => (
          <div key={s.id} className="bg-surface rounded-xl p-3">
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
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-primary-dark">{s.content}</p>
                {isOwnCard && (
                  <div className="flex gap-3 shrink-0">
                    <button
                      onClick={() => {
                        setEditingId(s.id);
                        setEditingContent(s.content);
                      }}
                      aria-label="Editar sugestão"
                    >
                      <SquarePen className="w-4 h-4 text-primary" />
                    </button>
                    <button onClick={() => deleteMutation.mutate(s.id)} aria-label="Excluir sugestão">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {suggestions?.length === 0 && (
          <p className="text-muted text-sm text-center py-6">
            {isOwnCard ? "Você ainda não cadastrou nenhuma sugestão." : "Nenhuma sugestão cadastrada ainda."}
          </p>
        )}
      </div>

      {isOwnCard && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!newContent.trim()) return;
            createMutation.mutate(newContent);
          }}
        >
          <input
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Nova sugestão de presente"
            maxLength={150}
            className="w-full appearance-none bg-surface rounded-xl p-3.5 text-base placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary mb-3"
          />
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full bg-primary text-white rounded-full py-3.5 font-semibold disabled:opacity-50"
          >
            {createMutation.isPending ? "Adicionando..." : "Adicionar sugestão"}
          </button>
        </form>
      )}
    </div>
  );
}