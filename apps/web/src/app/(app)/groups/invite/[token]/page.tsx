"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";

type InvitePreview = {
  groupId: number;
  groupName: string;
  owner: { id: number; name: string | null };
  members: { id: number; name: string | null }[];
};

export default function InvitePreviewPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [isJoining, setIsJoining] = useState(false);

  const { data: invite, isLoading, error } = useQuery({
    queryKey: ["invite", token],
    queryFn: async () => {
      const response = await apiClient.get<InvitePreview>(`/groups/invite/${token}`);
      return response.data;
    },
    enabled: !authLoading && !!user,
  });

  async function handleJoin() {
    setIsJoining(true);
    try {
      const response = await apiClient.post(`/groups/invite/${token}/join`);
      router.push(`/groups/${response.data.groupId}`);
    } catch (error: any) {
      alert(error.response?.data?.error ?? "Não foi possível entrar no grupo.");
      setIsJoining(false);
    }
  }

  if (authLoading || !user) {
    return <div className="max-w-sm mx-auto px-6 py-16 text-center text-muted">Carregando...</div>;
  }

  if (isLoading) {
    return <div className="max-w-sm mx-auto px-6 py-16 text-center text-muted">Carregando convite...</div>;
  }

  if (error || !invite) {
    return (
      <div className="max-w-sm mx-auto px-6 py-16 text-center">
        <p className="text-red-600">Este convite é inválido ou expirou.</p>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-16 text-center">
      <h1 className="font-display text-2xl font-semibold text-primary-dark mb-2">
        Você foi convidado!
      </h1>
      <p className="text-muted mb-8">
        Entrar no grupo <strong className="text-primary-dark">{invite.groupName}</strong>, de{" "}
        {invite.owner.name}?
      </p>
      <button
        onClick={handleJoin}
        disabled={isJoining}
        className="w-full bg-primary text-white rounded-full py-3.5 font-semibold disabled:opacity-50"
      >
        {isJoining ? "Entrando..." : "Entrar no grupo"}
      </button>
    </div>
  );
}