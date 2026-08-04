import { ChevronDown } from "lucide-react";
import { Mascot } from "./Mascot";

export function Hero() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 py-16 md:py-20 grid md:grid-cols-2 gap-12 items-center">
      <div className="text-center md:text-left">
        <h1 className="font-display text-4xl md:text-5xl font-semibold text-primary-dark leading-tight">
          Amigo secreto sem grupo de WhatsApp lotado de spoiler
        </h1>
        <p className="mt-6 text-lg text-muted max-w-md mx-auto md:mx-0">
          Crie o grupo, convide todo mundo, defina as regras e deixe o sorteio cuidar do resto — cada pessoa só vê quem tirou.
        </p>
        <a 
          href="#como-funciona" 
          className="mt-8 inline-flex items-center justify-center rounded-full bg-primary
          text-white font-display font-medium px-8 py-3.5 hover:bg-primary-dark transition-colors">
            Ver como funciona
        </a>
      </div>
      <Mascot />
      <a href="#como-funciona"
        aria-label="Rolar para ver mais"
        className="hidden md:flex absolute left-1/2 -translate-x-1/2 -bottom-8 text-muted hover:text-primary transition-colors animate-bounce-slow"
      >
        <ChevronDown className="w-6 h-6" />
      </a>
    </section>
  );
}