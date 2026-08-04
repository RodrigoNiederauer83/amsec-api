const steps = [
  {
    number: "1",
    title: "Crie o grupo",
    description: "Dá um nome pro grupo, defina data e valor do presente.",
  },
  {
    number: "2",
    title: "Convide todo mundo",
    description: "Compartilhe o link de convite onde quiser — WhatsApp, e-mail, o que for.",
  },
  {
    number: "3",
    title: "Combine as regras",
    description: "Marque quem não pode tirar quem, se houver alguma restrição no grupo.",
  },
  {
    number: "4",
    title: "Faça o sorteio",
    description: "Cada participante vê só o próprio resultado, no seu tempo.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-primary-dark">
            Como funciona
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map(({ number, title, description }) => (
            <div key={number} className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-white font-display font-semibold text-lg flex items-center justify-center mx-auto mb-4">
                {number}
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
      </div>
    </section>
  );
}