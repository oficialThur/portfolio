import { SpatialContainer } from "@/components/spatial/SpatialContainer.jsx";
import { Navigation } from "@/components/portfolio/Navigation.jsx";
import { About } from "@/components/portfolio/About.jsx";
import { Projects } from "@/components/portfolio/Projects.jsx";
import { Contact } from "@/components/portfolio/Contact.jsx";

export function HomePage() {
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
