"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function MascotInteractive() {
  return (
    <div className="anti-gravity-mascot relative flex w-full flex-col items-center justify-center py-4 select-none">
      {/* Standalone transparent mascot */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="relative h-[420px] w-[220px] sm:h-[480px] sm:w-[250px] lg:h-[520px] lg:w-[280px]">
          <Image
            src="/mascot-waving.png"
            alt="Waving Mascot"
            fill
            priority
            sizes="(max-width: 768px) 240px, 300px"
            className="object-contain drop-shadow-[0_0_35px_rgba(0,102,255,0.35)] select-none pointer-events-none"
          />
        </div>
      </motion.div>
    </div>
  );
}
