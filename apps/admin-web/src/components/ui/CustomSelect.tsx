"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Search, ChevronDown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

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
  enableSearch?: boolean;
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
      enableSearch,
      "aria-invalid": ariaInvalid,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [internalValue, setInternalValue] = React.useState(defaultValue || "");
    const [mounted, setMounted] = React.useState(false);
    const [popoverStyle, setPopoverStyle] = React.useState<React.CSSProperties>({});

    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const searchInputRef = React.useRef<HTMLInputElement>(null);
    const popoverRef = React.useRef<HTMLDivElement>(null);

    // Merge forwarded ref with internal ref
    React.useImperativeHandle(ref, () => triggerRef.current as HTMLButtonElement);

    React.useEffect(() => {
      setMounted(true);
    }, []);

    // Standardize options format to { value, label }
    const formattedOptions: CustomSelectOption[] = React.useMemo(() => {
      return options.map((opt) =>
        typeof opt === "string" ? { value: opt, label: opt } : opt
      );
    }, [options]);

    const currentValue = value !== undefined ? value : internalValue;

    const selectedOption = React.useMemo(() => {
      return formattedOptions.find((opt) => opt.value === currentValue);
    }, [formattedOptions, currentValue]);

    const showSearchBox = enableSearch !== undefined ? enableSearch : formattedOptions.length >= 6;

    const filteredOptions = React.useMemo(() => {
      if (!searchQuery.trim()) return formattedOptions;
      const q = searchQuery.toLowerCase().trim();
      return formattedOptions.filter(
        (opt) =>
          opt.label.toLowerCase().includes(q) ||
          opt.value.toLowerCase().includes(q)
      );
    }, [formattedOptions, searchQuery]);

    // Position calculation for Floating Portal
    const updatePosition = React.useCallback(() => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const popoverHeight = 260; // Estimated max height
      const spaceBelow = window.innerHeight - rect.bottom;
      const opensUp = spaceBelow < popoverHeight && rect.top > popoverHeight;

      setPopoverStyle({
        position: "fixed",
        left: `${Math.max(12, Math.min(rect.left, window.innerWidth - Math.max(rect.width, 200) - 12))}px`,
        width: `${Math.max(rect.width, 180)}px`,
        top: opensUp ? "auto" : `${rect.bottom + 6}px`,
        bottom: opensUp ? `${window.innerHeight - rect.top + 6}px` : "auto",
        zIndex: 99999,
      });
    }, []);

    // Open & Update Position
    const handleToggleOpen = () => {
      if (disabled) return;
      if (!isOpen) {
        updatePosition();
        setIsOpen(true);
      } else {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    // Close on Outside Click or Window Scroll/Resize
    React.useEffect(() => {
      const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
        if (
          triggerRef.current?.contains(event.target as Node) ||
          popoverRef.current?.contains(event.target as Node)
        ) {
          return;
        }
        setIsOpen(false);
        setSearchQuery("");
      };

      const handleScrollOrResize = (event: Event) => {
        // If scrolling inside popover, ignore
        if (popoverRef.current?.contains(event.target as Node)) {
          return;
        }
        if (isOpen) {
          updatePosition();
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("touchstart", handleOutsideClick);
        window.addEventListener("scroll", handleScrollOrResize, true);
        window.addEventListener("resize", handleScrollOrResize);
      }

      return () => {
        document.removeEventListener("mousedown", handleOutsideClick);
        document.removeEventListener("touchstart", handleOutsideClick);
        window.removeEventListener("scroll", handleScrollOrResize, true);
        window.removeEventListener("resize", handleScrollOrResize);
      };
    }, [isOpen, updatePosition]);

    // Focus Search Input on Open
    React.useEffect(() => {
      if (isOpen && showSearchBox && searchInputRef.current) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 50);
      }
    }, [isOpen, showSearchBox]);

    const handleSelectOption = (optValue: string) => {
      if (value === undefined) {
        setInternalValue(optValue);
      }
      if (onChange) {
        onChange({
          target: {
            name,
            value: optValue,
          },
        });
      }
      setIsOpen(false);
      setSearchQuery("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;

      if (e.key === "Escape") {
        setIsOpen(false);
        setSearchQuery("");
      } else if ((e.key === "Enter" || e.key === " ") && !isOpen) {
        e.preventDefault();
        updatePosition();
        setIsOpen(true);
      } else if (e.key === "ArrowDown" && !isOpen) {
        e.preventDefault();
        updatePosition();
        setIsOpen(true);
      }
    };

    return (
      <div className="relative inline-block w-full">
        {/* Trigger Button */}
        <button
          type="button"
          ref={triggerRef}
          name={name}
          disabled={disabled}
          onClick={handleToggleOpen}
          onKeyDown={handleKeyDown}
          onBlur={onBlur}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-invalid={ariaInvalid}
          className={cn(
            "flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 text-xs text-slate-900 transition-all outline-none cursor-pointer hover:border-slate-300 hover:bg-white focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50 select-none shadow-xs font-sans",
            size === "sm" && "h-8 text-xs px-2.5 rounded-lg",
            size === "default" && "h-9 text-xs px-3 rounded-xl",
            size === "lg" && "h-10 text-xs px-3.5 rounded-xl",
            isOpen && "border-primary bg-white ring-2 ring-primary/10",
            className
          )}
          {...props}
        >
          <span className={cn("truncate text-left flex-1 font-medium", !selectedOption && "text-slate-400 font-normal")}>
            {selectedOption ? selectedOption.label : placeholder || "Select option"}
          </span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200",
              isOpen && "rotate-180 text-primary"
            )}
          />
        </button>

        {/* Portal-rendered Dropdown Popover (Floats at z-[99999] directly in body) */}
        {isOpen && mounted && createPortal(
          <div
            ref={popoverRef}
            style={popoverStyle}
            className="rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-2xl font-sans animate-in fade-in-0 zoom-in-95 duration-150"
            role="listbox"
          >
            {/* Search Box */}
            {showSearchBox && (
              <div className="p-1 pb-1.5 border-b border-slate-100 mb-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search options..."
                    className="w-full h-8 pl-8 pr-7 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-primary focus:bg-white text-slate-900 placeholder:text-slate-400"
                    onClick={(e) => e.stopPropagation()}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Option List */}
            <div className="max-h-56 overflow-y-auto space-y-0.5 scrollbar-thin">
              {filteredOptions.length === 0 ? (
                <div className="py-3 px-3 text-center text-xs text-slate-400 font-medium">
                  No matching options
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === currentValue;
                  return (
                    <div
                      key={opt.value}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelectOption(opt.value)}
                      className={cn(
                        "flex items-center justify-between py-2 px-3 text-xs rounded-xl font-semibold cursor-pointer transition-colors select-none",
                        isSelected
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-slate-700 hover:bg-primary/5 hover:text-primary"
                      )}
                    >
                      <span className="truncate pr-2">{opt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                    </div>
                  );
                })
              )}
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  }
);

CustomSelect.displayName = "CustomSelect";
