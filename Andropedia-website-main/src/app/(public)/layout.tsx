import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { InteractionCursor } from "@/components/motion/InteractionCursor";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="public-site flex min-h-screen flex-col">
      <Navbar />
      <div className="pointer-events-none fixed inset-0 z-30 hidden md:block" aria-hidden="true">
        <span className="absolute left-10 top-32 text-xl font-light text-[rgba(8,10,13,0.18)]">+</span>
        <span className="absolute right-10 top-32 text-xl font-light text-[rgba(8,10,13,0.18)]">+</span>
        <span className="absolute bottom-8 left-10 text-xl font-light text-[rgba(8,10,13,0.18)]">+</span>
        <span className="absolute bottom-8 right-10 text-xl font-light text-[rgba(8,10,13,0.18)]">+</span>
      </div>
      <ScrollProgress />
      <InteractionCursor />
      <main id="main-content" tabIndex={-1} className="flex flex-1 flex-col pt-20 outline-none">
        {children}
      </main>
      <Footer />
    </div>
  );
}
