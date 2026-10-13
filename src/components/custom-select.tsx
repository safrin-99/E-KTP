'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Icon } from '@/components/icons';

export type SelectOption = { label: string; value: string; description?: string };

type CustomSelectProps = {
  name?: string;
  value?: string;
  defaultValue?: string;
  options: SelectOption[];
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  buttonClassName?: string;
  menuClassName?: string;
  ariaLabel?: string;
};

export function CustomSelect({
  name,
  value,
  defaultValue = '',
  options,
  onChange,
  placeholder = 'Pilih opsi',
  disabled = false,
  invalid = false,
  buttonClassName = '',
  menuClassName = '',
  ariaLabel,
}: CustomSelectProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const listId = useId();
  const currentValue = value !== undefined ? value : internalValue;
  const selected = options.find((option) => option.value === currentValue);

  useEffect(() => {
    if (!open) return;
    const handlePointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('pointerdown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) optionRefs.current[activeIndex]?.focus();
  }, [open, activeIndex]);

  function choose(option: SelectOption) {
    if (value === undefined) setInternalValue(option.value);
    onChange?.(option.value);
    setOpen(false);
  }

  function handleButtonKey(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (['ArrowDown', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      const selectedIndex = options.findIndex((option) => option.value === currentValue);
      setActiveIndex(Math.max(0, selectedIndex));
      setOpen(true);
    }
  }

  function handleOptionKey(event: ReactKeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index + 1) % options.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index - 1 + options.length) % options.length);
    } else if (event.key === 'Home') {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      setActiveIndex(options.length - 1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      choose(options[index]);
    }
  }

  return (
    <div ref={rootRef} className="relative w-full">
      {name && <input type="hidden" name={name} value={currentValue} />}
      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-invalid={invalid || undefined}
        onClick={() => {
          if (!open) {
            const selectedIndex = options.findIndex((option) => option.value === currentValue);
            setActiveIndex(Math.max(0, selectedIndex));
          }
          setOpen((state) => !state);
        }}
        onKeyDown={handleButtonKey}
        className={`field-shell flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border ${invalid ? 'border-rose-300 bg-rose-50/40' : 'border-[#dce1d8] bg-white'} px-3.5 text-left text-[13px] text-[#243c34] outline-none disabled:cursor-not-allowed disabled:opacity-50 ${buttonClassName}`}
      >
        <span className={selected ? 'truncate font-medium' : 'truncate text-[#929b94]'}>{selected?.label ?? placeholder}</span>
        <Icon name="chevron-down" size={16} className={`shrink-0 text-[#78887e] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div id={listId} role="listbox" aria-label={ariaLabel} className={`dropdown-menu menu-surface absolute right-0 top-[calc(100%+7px)] z-50 max-h-64 w-full overflow-y-auto rounded-xl border border-[#e0e4dc] bg-[#fffefa] p-1.5 ${menuClassName}`}>
          {options.map((option, index) => {
            const isSelected = option.value === currentValue;
            return (
              <button
                ref={(node) => { optionRefs.current[index] = node; }}
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                tabIndex={activeIndex === index ? 0 : -1}
                onClick={() => choose(option)}
                onMouseEnter={() => setActiveIndex(index)}
                onKeyDown={(event) => handleOptionKey(event, index)}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${isSelected ? 'bg-[#eaf0e6] text-[#1b5143]' : 'text-[#43534a] hover:bg-[#f4f5ef]'} ${activeIndex === index ? 'outline outline-1 outline-[#cad8c8]' : ''}`}
              >
                <span className="min-w-0">
                  <span className="block text-[13px] font-medium">{option.label}</span>
                  {option.description && <span className="mt-0.5 block text-[11px] leading-4 text-[#8a938b]">{option.description}</span>}
                </span>
                {isSelected && <Icon name="check" size={15} className="shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
