"use client";

import * as React from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./select";

export interface CustomSelectOption {
  value: string;
  label: string;
}

export interface CustomSelectProps {
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: { target: { name?: string; value: string } }) => void;
  onBlur?: (e: any) => void;
  options: (string | CustomSelectOption)[];
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  size?: "sm" | "default" | "lg";
  title?: string;
  "aria-invalid"?: boolean | "true" | "false";
}

export const CustomSelect = React.forwardRef<HTMLButtonElement, CustomSelectProps>(
  (
    {
      name,
      value,
      defaultValue,
      onChange,
      onBlur,
      options,
      className,
      placeholder,
      disabled,
      size = "lg",
      "aria-invalid": ariaInvalid,
      ...props
    },
    ref
  ) => {
    // Standardize options format to { value, label }
    const formattedOptions = options.map((opt) =>
      typeof opt === "string" ? { value: opt, label: opt } : opt
    );

    // Keep track of internal state if the component is used in an uncontrolled manner
    const [internalValue, setInternalValue] = React.useState(defaultValue || "");
    const currentValue = value !== undefined ? value : internalValue;

    const handleValueChange = (val: string | null) => {
      const finalVal = val ?? "";
      if (value === undefined) {
        setInternalValue(finalVal);
      }
      if (onChange) {
        // Construct a synthetic change event structure for React Hook Form compatibility
        onChange({
          target: {
            name,
            value: finalVal,
          },
        });
      }
    };

    return (
      <Select
        name={name}
        value={currentValue}
        onValueChange={handleValueChange}
        defaultValue={defaultValue}
        disabled={disabled}
      >
        <SelectTrigger
          ref={ref}
          className={className}
          size={size}
          aria-invalid={ariaInvalid}
          onBlur={onBlur}
          {...props}
        >
          <SelectValue placeholder={placeholder || "Select option"} />
        </SelectTrigger>
        <SelectContent className="w-full min-w-[var(--anchor-width)]">
          {formattedOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
);

CustomSelect.displayName = "CustomSelect";
