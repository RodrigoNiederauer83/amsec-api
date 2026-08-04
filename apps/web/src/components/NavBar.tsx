import Image from "next/image";

export function Navbar() {
  return (
    <header className="mx-auto max-w-6xl px-6 py-6 flex items-center gap-3">
      <Image src="/images/mascote-aberto.png" alt="" width={40} height={40} className="object-contain" />
      <span className="font-display text-xl font-semibold">
        <span className="text-primary-dark">Secre</span>
        <span className="text-primary">tin</span>
      </span>
    </header>
  );
}