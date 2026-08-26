import { useMemo } from "react";
import { SpatialContainer } from "@/components/spatial/SpatialContainer.jsx";
import { Navigation } from "@/components/portfolio/Navigation.jsx";
import { About } from "@/components/portfolio/About.jsx";
import { Projects } from "@/components/portfolio/Projects.jsx";
import { Contact } from "@/components/portfolio/Contact.jsx";
import { visibleProjects } from "@/data/projects.js";

function projectSections() {
  const items = visibleProjects();

  if (items.length === 0) {
    return [
      {
        id: "projetos",
        label: "Projetos",
        node: <Projects items={[]} showHeading />,
      },
    ];
  }

  return items.map((project, index) => ({
    id: index === 0 ? "projetos" : `projeto-${index + 1}`,
    label: "Projetos",
    ariaLabel: `Projetos — ${project.name}`,
    node: <Projects items={[project]} showHeading={index === 0} />,
  }));
}

export function HomePage() {
  const sections = useMemo(
    () => [
      { id: "sobre", label: "Sobre", node: <About /> },
      ...projectSections(),
      { id: "contato", label: "Contato", node: <Contact /> },
    ],
    [],
  );

  return (
    <SpatialContainer navigation={<Navigation />} sections={sections} />
  );
}
