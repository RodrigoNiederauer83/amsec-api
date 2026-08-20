"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/api/client";

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["assignment", id],
    queryFn: async () => {
      const response = await apiClient.get(`/groups/${id}/assignment`);
      return response.data;
    },
  });

  return (
    <div className="max-w-sm mx-auto px-6 py-10 text-center">
      <Link href={`/groups/${id}`} className="text-primary block text-left mb-8">‹ Voltar</Link>

      {isLoading && <p className="text-muted">Carregando...</p>}
      {error && <p className="text-red-600">Sorteio ainda não disponível.</p>}
      {data && (
        <>
          <p className="text-muted">Você tirou:</p>
          <p className="font-display text-3xl font-semibold text-primary-dark mt-2 capitalize">
            {data.receiver.name}
          </p>
        </>
      )}
    </div>
  );
}