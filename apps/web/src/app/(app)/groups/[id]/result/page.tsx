"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Wallet, Gift } from "lucide-react";
import { apiClient } from "@/api/client";

type Assignment = { receiver: { id: number; name: string | null } };
type GroupInfo = { minGiftCents: number | null; maxGiftCents: number | null; eventDate: string | null };

function formatGiftRange(min: number | null, max: number | null): string | null {
  const hasMin = typeof min === "number";
  const hasMax = typeof max === "number";
  const fmt = (cents: number) => (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  if (hasMin && hasMax) return `R$ ${fmt(min)} – ${fmt(max)}`;
  if (hasMin) return `a partir de R$ ${fmt(min)}`;
  if (hasMax) return `até R$ ${fmt(max)}`;
  return null;
}

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const participantId = searchParams.get("participantId");
  const participantName = searchParams.get("name");

  const { data: assignment, isLoading, error } = useQuery({
    queryKey: ["assignment", id, participantId],
    queryFn: async () => {
      const url = participantId
        ? `/groups/${id}/assignment?participantId=${participantId}`
        : `/groups/${id}/assignment`;
      const response = await apiClient.get<Assignment>(url);
      return response.data;
    },
  });

  const { data: group } = useQuery({
    queryKey: ["group", id],
    queryFn: async () => {
      const response = await apiClient.get<GroupInfo>(`/groups/${id}`);
      return response.data;
    },
  });

  const giftRangeText = group ? formatGiftRange(group.minGiftCents, group.maxGiftCents) : null;
  const eventDateText = group?.eventDate
    ? new Date(group.eventDate).toLocaleDateString("pt-BR", { timeZone: "UTC", day: "2-digit", month: "2-digit" })
    : null;

  return (
    <div className="min-h-screen flex flex-col text-white bg-brand-gradient px-6 pt-8 pb-10">
      <Link href={`/groups/${id}`} className="text-white/90 mb-10 inline-block">‹ Voltar</Link>

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        {isLoading && <p className="text-white/80">Carregando...</p>}
        {error && <p className="text-white/90">Sorteio ainda não disponível.</p>}

        {assignment && (
          <>
            <div className="bg-primary-dark rounded-28px p-4 mb-5">
              <Image src="/icons/icon.png" alt="" width={96} height={96} />
            </div>
            <p className="text-xs tracking-widest text-white/70 font-semibold mb-2">
              {participantName ? `${participantName.toUpperCase()} TIROU` : "VOCÊ TIROU"}
            </p>
            <h1 className="font-display text-3xl font-semibold capitalize mb-5 max-w-xs">
              {assignment.receiver.name?.toLowerCase()}
            </h1>

            {(giftRangeText || eventDateText) && (
              <span className="inline-flex items-center gap-1.5 bg-white/15 rounded-full px-4 py-2 text-sm">
                <Wallet className="w-3.5 h-3.5" />
                {giftRangeText}
                {giftRangeText && eventDateText && " · "}
                {eventDateText && `entrega ${eventDateText}`}
              </span>
            )}
          </>
        )}
      </div>

      {assignment && (
        <div className="space-y-3">
          <Link
            href={`/groups/${id}/suggestions/${assignment.receiver.id}?name=${encodeURIComponent(assignment.receiver.name ?? "")}`}
            className="flex items-center justify-center gap-2 w-full bg-white text-primary rounded-2xl py-3.5 font-semibold"
          >
            <Gift className="w-4 h-4" /> Ver sugestões de presente
          </Link>
          <Link
            href={`/groups/${id}`}
            className="block text-center w-full border border-white/40 text-white rounded-2xl py-3.5 font-semibold"
          >
            Voltar ao grupo
          </Link>
        </div>
      )}
    </div>
  );
}