import Image from "next/image";

export function Navbar() {
  return (
    <header className="mx-auto max-w-6xl px-6 py-6 flex items-center">
      <Image src="/images/logo_horizontal.png" alt="Secretin" width={160} height={61} priority />
    </header>
  );
}