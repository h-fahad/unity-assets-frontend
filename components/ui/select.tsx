"use client";

import { ChevronDown, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  options: SelectOption[];
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Select({
  value = "",
  onValueChange,
  placeholder = "Select an option...",
  options = [],
  disabled = false,
  className,
  size = "md"
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Size variants
  const sizeClasses = {
    sm: "px-2 py-1 text-xs min-h-[32px]",
    md: "px-3 py-2 text-sm min-h-[40px]",
    lg: "px-4 py-3 text-base min-h-[48px]"
  };

  const iconSizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4", 
    lg: "w-5 h-5"
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (optionValue: string) => {
    if (onValueChange) {
      onValueChange(optionValue);
    }
    setIsOpen(false);
  };

  return (
    <div className={cn("relative", className)} ref={selectRef}>
      {/* Select Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          // Base styles
          "relative w-full flex items-center justify-between",
          "bg-white border border-gray-300 rounded-lg",
          "text-left text-gray-900 placeholder:text-gray-500",
          "transition-all duration-200",
          
          // Size variants
          sizeClasses[size],
          
          // Focus states
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
          
          // Hover states
          "hover:border-gray-400",
          
          // Open state
          isOpen && "ring-2 ring-blue-500 border-blue-500",
          
          // Disabled state
          disabled && "bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200",
          
          // Error state (can be added later)
          // error && "border-red-500 focus:ring-red-500 focus:border-red-500"
        )}
      >
        <span className="block truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        
        <ChevronDown 
          className={cn(
            "ml-2 flex-shrink-0 text-gray-400 transition-transform duration-200",
            iconSizeClasses[size],
            isOpen && "transform rotate-180",
            disabled && "text-gray-300"
          )}
        />
      </button>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500 text-center">
              No options available
            </div>
          ) : (
            options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => !option.disabled && handleSelect(option.value)}
                disabled={option.disabled}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-left text-sm",
                  "hover:bg-gray-50 focus:bg-gray-50 focus:outline-none",
                  "transition-colors duration-150",
                  
                  // Selected state
                  value === option.value && "bg-blue-50 text-blue-900",
                  
                  // Disabled state
                  option.disabled && "text-gray-400 cursor-not-allowed hover:bg-transparent focus:bg-transparent"
                )}
              >
                <span className="truncate">{option.label}</span>
                {value === option.value && (
                  <Check className="w-4 h-4 text-blue-600 flex-shrink-0 ml-2" />
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Simplified API components for easier usage
interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

// Alternative compound component API (similar to Radix UI)
export const SelectTrigger = ({ children, className }: SelectTriggerProps) => (
  <div className={className}>{children}</div>
);

export const SelectContent = ({ children, className }: SelectContentProps) => (
  <div className={className}>{children}</div>
);

export const SelectItem = ({ value, children, disabled, className }: SelectItemProps) => (
  <div className={className} data-value={value} data-disabled={disabled}>
    {children}
  </div>
);

export const SelectValue = ({ placeholder }: { placeholder?: string }) => (
  <span>{placeholder}</span>
);