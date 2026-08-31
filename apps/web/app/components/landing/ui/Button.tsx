import { ArrowUpRight } from "lucide-react";

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "outline" | "outline-inverse" | "ghost";
  size?: "base" | "large";
  icon?: boolean;
  className?: string;
};

const variantStyle: Record<NonNullable<ButtonProps["variant"]>, React.CSSProperties> = {
  primary: {
    backgroundColor: "var(--color-bg-accent)",
    color: "var(--color-text-on-accent)",
    borderColor: "var(--color-bg-accent)",
  },
  outline: {
    backgroundColor: "transparent",
    color: "var(--color-text-primary)",
    borderColor: "var(--color-border-strong)",
  },
  "outline-inverse": {
    backgroundColor: "transparent",
    color: "var(--color-text-inverse)",
    borderColor: "var(--color-border-strong)",
  },
  ghost: {
    backgroundColor: "transparent",
    color: "var(--color-text-primary)",
    borderColor: "transparent",
  },
};

export default function Button({
  href,
  children,
  variant = "primary",
  size = "base",
  icon = true,
  className = "",
}: ButtonProps) {
  return (
    <a
      href={href}
      data-variant={variant}
      className={`js-btn group inline-flex items-center gap-2 rounded-full border font-accent font-semibold transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
        size === "large" ? "h-14 px-7 text-lg" : "h-[52px] px-6 text-base"
      } ${className}`}
      style={variantStyle[variant]}
    >
      {children}
      {icon && (
        <ArrowUpRight
          size={size === "large" ? 20 : 18}
          className="transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      )}
    </a>
  );
}
