"use client";

import Image from "next/image";

export function Mascot() {
  return (
    <div className="relative w-full max-w-[320px] aspect-[480/858] mx-auto">
      <Image
        src="/images/mascote-fechado.png"
        alt=""
        fill
        priority
        className="object-contain animate-box-closed"
      />
      <Image
        src="/images/mascote-aberto.png"
        alt="Mascote do Amigo Secreto: uma caixa de presente roxa com um cartão sorridente dentro"
        fill
        priority
        className="object-contain animate-box-open"
      />
    </div>
  );
}