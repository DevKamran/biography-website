import { monoLogoSlugs, techLogoSlugs } from "@/lib/tech-logos";

export default function TagLogo({ tag }: { tag: string }) {
  const slug = techLogoSlugs[tag];
  if (!slug) return null;

  return (
    <img
      src={`https://cdn.simpleicons.org/${slug}`}
      alt=""
      aria-hidden="true"
      loading="lazy"
      className={`h-4 w-4 shrink-0 ${monoLogoSlugs.has(slug) ? "js-tag-icon-mono" : ""}`}
    />
  );
}
