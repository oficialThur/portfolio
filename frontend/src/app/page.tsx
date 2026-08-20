import { SpatialContainer } from "@/src/components/spatial/SpatialContainer";
import { Navigation } from "@/src/components/portfolio/Navigation";
import { About } from "@/src/components/portfolio/About";
import { Projects } from "@/src/components/portfolio/Projects";
import { Contact } from "@/src/components/portfolio/Contact";

export default function Home() {
  return (
    <SpatialContainer
      navigation={<Navigation />}
      sections={[
        { id: "sobre", label: "Sobre", node: <About /> },
        { id: "projetos", label: "Projetos", node: <Projects /> },
        { id: "contato", label: "Contato", node: <Contact /> },
      ]}
    />
  );
}
