import Image from "next/image";
import Link from "next/link";

export function Navbar() {
  return (
    <header className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
      <Image src="/images/logo_horizontal.png" alt="Secretin" width={160} height={61} priority />
      <Link
        href="/login"
        className="text-sm font-semibold text-primary bg-surface rounded-full px-5 py-2.5"
      >
        Entrar
      </Link>
    </header>
  );
}