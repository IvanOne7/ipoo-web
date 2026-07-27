import Link from "next/link";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/" className="text-sm font-semibold text-primary">
        ← Volver a iPoo
      </Link>
      <div className="prose prose-sm mt-6 max-w-none">{children}</div>
      <div className="mt-10 flex flex-wrap gap-4 border-t pt-6 text-sm text-muted-foreground">
        <Link href="/legal/privacidad" className="hover:text-primary">
          Privacidad
        </Link>
        <Link href="/legal/aviso-legal" className="hover:text-primary">
          Aviso legal
        </Link>
        <Link href="/legal/cookies" className="hover:text-primary">
          Cookies
        </Link>
        <Link href="/ayuda" className="hover:text-primary">
          Ayuda
        </Link>
      </div>
    </main>
  );
}