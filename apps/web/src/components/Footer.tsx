export function Footer() {
  return (
    <footer className="border-t border-surface">
      <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-display text-lg font-semibold">
          <span className="text-primary-dark">Secre</span>
          <span className="text-primary">tin</span>
        </span>
        <p className="text-sm text-muted">
          © {new Date().getFullYear()} Secretin. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}