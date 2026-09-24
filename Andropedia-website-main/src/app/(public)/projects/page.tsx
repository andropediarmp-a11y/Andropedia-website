import { publicProjects } from "@/content/projects";
import { KineticPageHeader } from "@/components/motion/KineticPageHeader";
import { ProjectLedger } from "@/components/projects/ProjectLedger";

export default function ProjectsPage() {
  return (
    <div className="surface-paper min-h-[70svh]">
      <KineticPageHeader label="Release ledger" title="Club projects." description="Real work, published with its actual development state." />
      <main className="site-container section-space-compact"><ProjectLedger projects={publicProjects} /></main>
    </div>
  );
}
