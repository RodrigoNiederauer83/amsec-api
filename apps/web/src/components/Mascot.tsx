import Image from "next/image";

export function Mascot() {
  return (
    <div className="relative w-full max-w-160 aspect-square mx-auto">
      <Image
        src="/images/logo_vertical.png"
        alt="Mascote do Secretin: um cartão sorridente saindo de uma caixa de presente roxa"
        fill
        priority
        className="object-contain"
      />
    </div>
  );
}