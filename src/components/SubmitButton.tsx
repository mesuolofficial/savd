"use client";

import { useFormStatus } from "react-dom";

type Props = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  /** Text shown next to the spinner while this button's form is submitting. */
  pendingLabel?: string;
  /** If set, the browser asks for confirmation first (good for Delete). */
  confirmMessage?: string;
};

/**
 * Drop-in replacement for <button type="submit"> inside a <form action={serverAction}>.
 * - shows a spinner on the button that was clicked
 * - disables every submit button of that form until the action finishes (no double clicks)
 * Give buttons that share a form a `name` + `value` so only the clicked one shows the spinner.
 */
export function SubmitButton({ children, pendingLabel, confirmMessage, className = "", name, value, onClick, disabled, ...rest }: Props) {
  const { pending, data } = useFormStatus();
  const mine = pending && (!name || data?.get(name) === value);

  return (
    <button
      {...rest}
      type="submit"
      name={name}
      value={value}
      disabled={pending || disabled}
      aria-busy={mine}
      className={`${className} ${mine ? "cursor-wait opacity-80" : ""}`}
      onClick={(e) => {
        if (confirmMessage && !window.confirm(confirmMessage)) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
    >
      {mine ? (
        <span className="inline-flex items-center justify-center gap-2">
          <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
          {pendingLabel ?? children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
