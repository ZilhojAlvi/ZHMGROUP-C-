"use client";

import { InputHTMLAttributes, LabelHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";
import { AlertCircle } from "lucide-react";

interface FieldWrapperProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  htmlFor?: string;
}

export function FieldWrapper({ label, error, hint, required, children, htmlFor }: FieldWrapperProps) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-sm font-medium text-navy-800 dark:text-brand-100"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="flex items-center gap-1 text-xs text-rose-500 animate-fade-in">
          <AlertCircle size={13} /> {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-navy-400 dark:text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, required, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <FieldWrapper label={label} error={error} hint={hint} required={required} htmlFor={inputId}>
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full rounded-xl border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-navy-300 dark:placeholder:text-slate-500 transition-all duration-200 outline-none",
              "border-black/10 dark:border-white/10 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10",
              error && "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-400">
              {rightIcon}
            </span>
          )}
        </div>
      </FieldWrapper>
    );
  }
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, required, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <FieldWrapper label={label} error={error} hint={hint} required={required} htmlFor={inputId}>
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-xl border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-navy-300 dark:placeholder:text-slate-500 transition-all duration-200 outline-none resize-none",
            "border-black/10 dark:border-white/10 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10",
            error && "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10",
            className
          )}
          {...props}
        />
      </FieldWrapper>
    );
  }
);
Textarea.displayName = "Textarea";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { label: string; value: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, required, options, placeholder, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <FieldWrapper label={label} error={error} hint={hint} required={required} htmlFor={inputId}>
        <select
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-xl border bg-surface px-4 py-2.5 text-sm text-foreground transition-all duration-200 outline-none appearance-none cursor-pointer",
            "border-black/10 dark:border-white/10 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10",
            error && "border-rose-400",
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </FieldWrapper>
    );
  }
);
Select.displayName = "Select";

export function FormLabel({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-medium text-navy-800", className)} {...props} />;
}
