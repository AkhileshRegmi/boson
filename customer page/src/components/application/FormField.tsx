import { forwardRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type BaseProps = {
  label: string;
  required?: boolean;
  error?: string;
  prefilled?: boolean;
  hint?: string;
  id: string;
};

type FieldProps = BaseProps &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "id"> & {
    as?: "input";
  };

type TextareaFieldProps = BaseProps &
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> & {
    as: "textarea";
  };

export type FormFieldProps = FieldProps | TextareaFieldProps;

export const FormField = forwardRef<HTMLInputElement | HTMLTextAreaElement, FormFieldProps>(
  function FormField(props, ref) {
    const { label, required, error, prefilled, hint, id, ...rest } = props as BaseProps & {
      as?: "input" | "textarea";
    } & Record<string, unknown>;

    const isMissing = Boolean(error);
    const showPrefill = prefilled && !isMissing;

    const baseClass = cn(
      "transition-colors",
      isMissing &&
        "border-[oklch(0.82_0.16_75)] bg-[oklch(0.82_0.16_75)]/10 focus-visible:ring-[oklch(0.82_0.16_75)]",
      showPrefill && "border-khalti/30 bg-khalti/[0.03]"
    );

    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor={id} className="text-sm font-medium">
            {label}
            {required && <span className="ml-0.5 text-khalti">*</span>}
          </Label>
          {showPrefill && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-khalti">
              <Sparkles className="h-3 w-3" /> prefilled
            </span>
          )}
        </div>
        {(props as TextareaFieldProps).as === "textarea" ? (
          <Textarea
            id={id}
            ref={ref as React.Ref<HTMLTextAreaElement>}
            className={cn(baseClass, "min-h-[100px]")}
            aria-invalid={isMissing}
            {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <Input
            id={id}
            ref={ref as React.Ref<HTMLInputElement>}
            className={baseClass}
            aria-invalid={isMissing}
            {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
        {isMissing ? (
          <p className="flex items-center gap-1.5 text-xs font-medium text-[oklch(0.5_0.13_60)]">
            <AlertCircle className="h-3.5 w-3.5" />
            {error}
          </p>
        ) : hint ? (
          <p className="text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </div>
    );
  }
);
