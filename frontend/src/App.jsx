import { useEffect, useRef } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { PageLoader } from "./components/PageLoader.jsx";
import { RequireAuth } from "./components/RequireAuth.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { AdminPage } from "./pages/AdminPage.jsx";
import { AdminLoginPage } from "./pages/AdminLoginPage.jsx";
import { NotFoundPage } from "./pages/NotFoundPage.jsx";

const directionContract = `<!--
  DIRECTION CONTRACT — portfolio /
  THESIS: Espaço editorial-experimental de desenvolvedor: a tipografia lidera e a
  navegação é a assinatura — travessia espacial horizontal em vez de scroll
  vertical convencional. Recusa o template SaaS (hero + CTA + grid de cards).
  OWN-WORLD: Onyx #353839 como canvas único; Inter dominante (display denso,
  tracking negativo), JetBrains Mono para labels/metadata; cinzas frios em
  hierarquia restrita; sem sombras em componentes; bordas hairline #6E7476;
  atmosfera = manchas de sombra difusas fixas no canvas + grain sutil.
  STORY: O visitante entende em segundos quem é Arthur Henrique (dev fullstack,
  Belo Horizonte), atravessa Sobre → Projetos → Contato como movimento pelo
  espaço e termina num convite direto de contato.
  FIRST VIEWPORT: Label mono SOBRE à esquerda; display-xl "Olá, sou o / Arthur
  Henrique" dominante; metadata mono à direita; nav em coluna vertical no canto
  superior direito; Projetos entrevisível (blur + scale) na borda direita como
  antecipação; setas finas nas laterais.
  FORM: Mundo pinned por docs/design/DESIGN.md + sketch — direção fixada pelo
  brief (pinned vence o roll; sem concept-seed). Trajetória com proporção áurea:
  escala geométrica 0.85^|t|, arco vertical alternado por seção.
  FINISH: unreviewed and undocumented is unfinished; this build ends with the
  finish review, the verdict, and DESIGN.md (pinned — já existente, não reescrito).
-->`;

function PortfolioAtmosphere() {
  const { pathname } = useLocation();
  if (pathname !== "/") return null;

  return (
    <>
      <div className="shadow-pattern" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <PageLoader />
    </>
  );
}

/**
 * Em SPA a troca de rota não move o foco. Sem isso, quem usa leitor de tela
 * continua "preso" no link antigo. Foca o <main> da nova página assim que ele
 * existe (Admin passa por um estado de verificação antes de renderizar).
 */
function RouteFocus() {
  const { pathname } = useLocation();
  const previousPath = useRef(pathname);

  useEffect(() => {
    // StrictMode roda o efeito duas vezes no mount; comparar o path evita
    // roubar o foco da página no carregamento inicial.
    if (previousPath.current === pathname) {
      return undefined;
    }
    previousPath.current = pathname;

    let frame;
    let attempts = 0;

    function focusMain() {
      const main = document.querySelector("main");

      if (main) {
        main.focus({ preventScroll: true });
        return;
      }

      if (attempts < 300) {
        attempts += 1;
        frame = requestAnimationFrame(focusMain);
      }
    }

    frame = requestAnimationFrame(focusMain);
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <>
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>
      <div hidden dangerouslySetInnerHTML={{ __html: directionContract }} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminPage />
            </RequireAuth>
          }
        />
        <Route path="/login" element={<AdminLoginPage />} />
        {/* Catch-all: sem isso, qualquer URL desconhecida renderiza tela em branco. */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <RouteFocus />
      <PortfolioAtmosphere />
    </>
  );
}
