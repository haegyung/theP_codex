import * as React from "react";

export type MsThemeMode = "light" | "dark" | "highContrast";

type ThemeContextValue = {
  mode: MsThemeMode;
};

const ThemeContext = React.createContext<ThemeContextValue>({ mode: "light" });

type ThemeTokenSet = {
  theme: MsThemeMode;
  children: React.ReactNode;
  className?: string;
};

export function MsFluentTheme({ theme, children, className }: ThemeTokenSet) {
  return (
    <ThemeContext.Provider value={{ mode: theme }}>
      <div
        data-ms-theme={theme}
        className={`ms-fluent-root${className ? ` ${className}` : ""}`}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

type ButtonState =
  | "rest"
  | "hover"
  | "active"
  | "focus"
  | "disabled"
  | "selected";
type ButtonVariant = "primary" | "secondary";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  state?: ButtonState;
  variant?: ButtonVariant;
  fullWidth?: boolean;
};

export function MsButton({
  children,
  state,
  variant = "primary",
  fullWidth,
  className,
  type = "button",
  disabled,
  "aria-pressed": ariaPressedProp,
  ...props
}: ButtonProps) {
  const classes = ["ms-fluent-button"];
  if (variant === "secondary") classes.push("ms-fluent-button-secondary");
  if (state) classes.push(`ms-fluent-button-${state}`);
  if (fullWidth) classes.push("ms-fluent-button-full");
  if (className) classes.push(className);

  const isDisabled = disabled || state === "disabled";
  const ariaPressed =
    ariaPressedProp ?? (state === "selected" ? true : undefined);

  return (
    <button
      {...props}
      type={type}
      disabled={isDisabled}
      aria-pressed={ariaPressed}
      className={classes.join(" ")}
    >
      {children}
    </button>
  );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  helperText?: string;
  state?: "rest" | "hover" | "focus" | "invalid";
};

export function MsInput({
  label,
  helperText,
  className,
  state,
  id,
  "aria-describedby": ariaDescribedByProp,
  "aria-invalid": ariaInvalidProp,
  ...props
}: InputProps) {
  const generatedId = React.useId();
  const inputId = id ?? `ms-input-${generatedId}`;
  const helperId = helperText ? `${inputId}-helper` : undefined;
  const ariaDescribedBy =
    [ariaDescribedByProp, helperId].filter(Boolean).join(" ") || undefined;
  const ariaInvalid = state === "invalid" ? true : ariaInvalidProp;
  const isInvalid = ariaInvalid === true || ariaInvalid === "true";

  const inputClass = ["ms-fluent-input"];
  if (state) inputClass.push(`ms-fluent-input-${state}`);
  if (isInvalid && state !== "invalid")
    inputClass.push("ms-fluent-input-invalid");
  if (className) inputClass.push(className);

  return (
    <div className="ms-fluent-field">
      {label && (
        <label htmlFor={inputId} className="ms-fluent-label">
          {label}
        </label>
      )}
      <input
        {...props}
        id={inputId}
        className={inputClass.join(" ")}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
      />
      {helperText && (
        <small
          id={helperId}
          className={`ms-fluent-helper${isInvalid ? " ms-fluent-helper-error" : ""}`}
        >
          {helperText}
        </small>
      )}
    </div>
  );
}

type CardProps = {
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function MsCard({ title, children, className }: CardProps) {
  return (
    <section className={`ms-fluent-card${className ? ` ${className}` : ""}`}>
      {title && <h3 className="ms-fluent-card-title">{title}</h3>}
      {children}
    </section>
  );
}

type DialogProps = {
  open: boolean;
  title?: React.ReactNode;
  children: React.ReactNode;
  onClose: () => void;
  closeOnBackdrop?: boolean;
  className?: string;
};

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selectors = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
  ];

  return Array.from(
    container.querySelectorAll<HTMLElement>(selectors.join(",")),
  ).filter((element) => element.getAttribute("aria-hidden") !== "true");
}

export function MsDialog({
  open,
  title,
  children,
  onClose,
  closeOnBackdrop = true,
  className,
}: DialogProps) {
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const dialogId = React.useId();
  const previouslyFocusedRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const dialogNode = dialogRef.current;
    if (!dialogNode) {
      return;
    }

    const focusable = getFocusableElements(dialogNode);
    (focusable[0] ?? dialogNode).focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = getFocusableElements(dialogNode);
      if (focusableElements.length === 0) {
        event.preventDefault();
        dialogNode.focus();
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && activeElement === first) {
        event.preventDefault();
        last.focus();
        return;
      }

      if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    dialogNode.addEventListener("keydown", handleKeyDown);
    return () => {
      dialogNode.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedRef.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  const titleId = title ? `${dialogId}-title` : undefined;
  const onBackdropMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="ms-fluent-dialog-backdrop"
      onMouseDown={onBackdropMouseDown}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`ms-fluent-dialog${className ? ` ${className}` : ""}`}
      >
        <header className="ms-fluent-dialog-header">
          {title && (
            <h2 id={titleId} className="ms-fluent-dialog-title">
              {title}
            </h2>
          )}
          <button
            type="button"
            className="ms-fluent-button ms-fluent-dialog-close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </header>
        <div className="ms-fluent-dialog-content">{children}</div>
      </div>
    </div>
  );
}

export function useMsTheme(): MsThemeMode {
  const ctx = React.useContext(ThemeContext);
  return ctx.mode;
}
