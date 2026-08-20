import { useEffect } from "react";

/** Stub — o dashboard de projetos (DESIGN.md › Admin Area) vem na próxima sessão. */
export function AdminPage() {
  useEffect(() => {
    document.title = "Admin — Arthur Henrique";
    const robots = document.querySelector('meta[name="robots"]');
    if (robots) {
      robots.setAttribute("content", "noindex, nofollow");
    } else {
      const meta = document.createElement("meta");
      meta.name = "robots";
      meta.content = "noindex, nofollow";
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <main className="flex min-h-dvh items-center justify-center px-6">
      <p className="font-mono text-label-md uppercase text-text-muted">
        Admin — em construção
      </p>
    </main>
  );
}
