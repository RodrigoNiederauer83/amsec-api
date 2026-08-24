export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background px-6 overflow-hidden">
      <div
        className="fixed bottom-0 left-0 right-0 h-60 md:h-75 bg-[linear-gradient(10deg,#F6F0FF_0%,rgba(246,240,255,0)_100%)] pointer-events-none"
      />
      <div className="relative z-10 w-full flex justify-center">
        {children}
      </div>
    </div>
  );
}