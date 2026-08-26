import { useEffect, useMemo, useState } from "react";
import { SpatialContainer } from "@/components/spatial/SpatialContainer.jsx";
import { Navigation } from "@/components/portfolio/Navigation.jsx";
import { About } from "@/components/portfolio/About.jsx";
import { Projects } from "@/components/portfolio/Projects.jsx";
import { Contact } from "@/components/portfolio/Contact.jsx";
import { listProjects, visibleProjects } from "@/service/projectsApi";
import { getCurrentSubtitle } from "@/service/subtitleApi";

function projectSections(items) {
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
  const [items, setItems] = useState(null);
  const [subtitle, setSubtitle] = useState("");

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      listProjects().catch(() => []),
      getCurrentSubtitle().catch(() => null),
    ]).then(([projects, current]) => {
      if (cancelled) return;
      setItems(visibleProjects(projects));
      setSubtitle(current?.subtitle ?? "");
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const sections = useMemo(
    () => [
      { id: "sobre", label: "Sobre", node: <About body={subtitle} /> },
      ...projectSections(items ?? []),
      { id: "contato", label: "Contato", node: <Contact /> },
    ],
    [items, subtitle],
  );

  if (items === null) {
    return <div className="min-h-dvh" aria-busy="true" />;
  }

  return (
    <SpatialContainer navigation={<Navigation />} sections={sections} />
  );
}
