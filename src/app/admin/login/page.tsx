import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login — Admin",
  robots: { index: false, follow: false },
};

/** Stub — a tela de login (DESIGN.md › Admin Area) vem na próxima sessão. */
export default function AdminLoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6">
      <p className="font-mono text-label-md uppercase text-text-muted">
        Admin — em construção
      </p>
    </main>
  );
}
