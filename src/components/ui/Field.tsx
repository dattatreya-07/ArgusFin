import React from 'react';

export interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id?: string;
  error?: string;
  helperText?: string;
  hint?: string;
  required?: boolean;
  children?: React.ReactNode;
  rightElement?: React.ReactNode;
  className?: string;
}

export function Field({
  label,
  id: explicitId,
  error,
  helperText,
  hint,
  required,
  children,
  rightElement,
  className = '',
  type = 'text',
  placeholder,
  value,
  onChange,
  ...inputProps
}: FieldProps) {
  const generatedId = React.useId();
  const id = explicitId || generatedId;
  const resolvedHelper = hint || helperText;
  const errorId = error ? `${id}-error` : undefined;
  const helperId = resolvedHelper ? `${id}-helper` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-xs font-semibold text-ink">
          {label} {required && <span className="text-accent">*</span>}
        </label>
        {rightElement && <div>{rightElement}</div>}
      </div>

      <div>
        {children ? (
          React.isValidElement(children) ? (
            React.cloneElement(children as React.ReactElement<any>, {
              id,
              'aria-invalid': !!error,
              'aria-describedby': describedBy,
            })
          ) : (
            children
          )
        ) : (
          <input
            id={id}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className="w-full px-3.5 py-2.5 min-h-[48px] border border-border bg-surface rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-base text-ink placeholder:text-ink-muted/60 transition"
            {...inputProps}
          />
        )}
      </div>

      {error && (
        <p id={errorId} role="alert" className="text-xs font-semibold text-[#7A1410]">
          {error}
        </p>
      )}

      {resolvedHelper && !error && (
        <p id={helperId} className="text-xs text-ink-muted">
          {resolvedHelper}
        </p>
      )}
    </div>
  );
}

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  maxLength?: number;
  currentLength?: number;
  characterCount?: number;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, hint, maxLength, currentLength, characterCount, id: explicitId, ...props }, ref) => {
    const generatedId = React.useId();
    const id = explicitId || generatedId;
    const count = characterCount ?? currentLength;

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-xs font-semibold text-ink">
            {label}
          </label>
        )}
        <textarea
          id={id}
          ref={ref}
          maxLength={maxLength}
          className={`w-full px-3.5 py-3 rounded-md border border-border bg-surface text-ink text-base leading-relaxed placeholder:text-ink-muted/60 focus:outline-none focus:ring-2 focus:ring-accent shadow-soft transition ${className}`}
          {...props}
        />
        <div className="flex justify-between items-center text-xs text-ink-muted">
          <span>{hint || ''}</span>
          {maxLength !== undefined && count !== undefined && (
            <span>
              {count} / {maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full px-3.5 py-2.5 min-h-[48px] rounded-md border border-border bg-surface text-ink text-base focus:outline-none focus:ring-2 focus:ring-accent shadow-soft transition ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
