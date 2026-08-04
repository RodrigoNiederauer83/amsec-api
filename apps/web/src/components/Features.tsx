import { Users, Shuffle, EyeOff, CalendarClock, Gift, LogIn, type LucideIcon } from "lucide-react";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    icon: Users,
    title: "Crie e convide em segundos",
    description: "Monte o grupo, gere um link de convite e compartilhe onde quiser. Todo mundo entra sem precisar de cadastro complicado.",
  },
  {
    icon: Shuffle,
    title: "Sorteio justo, com restrições",
    description: "Defina quem não pode tirar quem — casais, familiares próximos, quem quiser — e o sorteio se ajusta automaticamente sem quebrar as regras.",
  },
  {
    icon: EyeOff,
    title: "Sigilo garantido",
    description: "Cada participante só vê o próprio resultado. Nem quem organiza o grupo consegue ver todos os pares — o segredo é levado a sério.",
  },
  {
    icon: CalendarClock,
    title: "Regras claras do evento",
    description: "Data da troca, faixa de valor do presente e local ficam combinados dentro do grupo, sem depender de mensagem perdida no WhatsApp.",
  },
  {
    icon: Gift,
    title: "Sugestões de presente",
    description: "Cada pessoa deixa dicas do que gostaria de ganhar, ajudando quem tirou seu nome a acertar o presente.",
  },
  {
    icon: LogIn,
    title: "Entrada rápida",
    description: "Entre com sua conta Google em um clique, sem precisar criar nem lembrar de mais uma senha.",
  },
];

export function Features() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <div className="text-center max-w-xl mx-auto mb-12">
        <h2 className="font-display text-3xl md:text-4xl font-semibold text-primary-dark">
          Tudo que o amigo secreto precisa, num só lugar
        </h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map(({ icon: Icon, title, description }) => (
          <div key={title} className="rounded-2xl bg-surface p-6">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Icon className="w-5 h-5 text-primary" strokeWidth={2} />
            </div>
            <h3 className="font-display text-lg font-semibold text-primary-dark mb-2">
              {title}
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}