import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { PageLoader } from "../components/PageLoader";
import "../styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Arthur Henrique — Desenvolvedor Fullstack",
  description:
    "Portfólio de Arthur Henrique, desenvolvedor fullstack em Belo Horizonte. Sobre, projetos e contato — uma experiência editorial e espacial.",
};

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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background font-sans text-text-primary">
        <div hidden dangerouslySetInnerHTML={{ __html: directionContract }} />
        <div className="shadow-pattern" aria-hidden="true" />
        {children}
        <div className="grain" aria-hidden="true" />
        <PageLoader />
      </body>
    </html>
  );
}
