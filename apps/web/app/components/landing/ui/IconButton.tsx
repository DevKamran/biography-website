import { forwardRef } from "react";

type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: number;
};

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { children, className = "", size = 44, style, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      className={`js-icon-btn flex shrink-0 items-center justify-center rounded-full border transition-colors duration-150 ${className}`}
      style={{
        width: size,
        height: size,
        borderColor: "var(--color-border-default)",
        color: "var(--color-text-primary)",
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
});

export default IconButton;
