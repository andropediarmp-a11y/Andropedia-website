import Image from "next/image";

interface AndropediaLogoProps {
  className?: string;
  priority?: boolean;
  sizes?: string;
}

/**
 * Renders the supplied official full lockup without tracing or recolouring it.
 * The web asset is a transparent, tightly cropped derivative of the supplied
 * JPEG; the original source remains available in public/brand for reference.
 */
export function AndropediaLogo({
  className,
  priority = false,
  sizes = "(max-width: 768px) 70vw, 32rem",
}: AndropediaLogoProps) {
  return (
    <Image
      src="/brand/andropedia-logo-clean.png"
      alt="Andropedia"
      width={1044}
      height={667}
      className={`h-auto max-w-full object-contain ${className ?? ""}`}
      style={{ objectFit: "contain" }}
      priority={priority}
      sizes={sizes}
      draggable={false}
    />
  );
}
