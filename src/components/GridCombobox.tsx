import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface GridComboboxProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
}

export default function GridCombobox({ value, onChange, options, placeholder, className }: GridComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const inputValueRef = useRef(inputValue);
  useEffect(() => {
    inputValueRef.current = inputValue;
  }, [inputValue]);

  // Sync local state when external value changes
  useEffect(() => {
    if (value !== inputValueRef.current && document.activeElement !== inputRef.current) {
      setInputValue(value || '');
      inputValueRef.current = value || '';
    }
  }, [value]);

  const updateCoords = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      // Only show if the input is actually visible on screen
      if (rect.width > 0 && rect.height > 0) {
        setCoords({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener('resize', updateCoords);
      window.addEventListener('scroll', updateCoords, true);
    }
    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords, true);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        if (inputRef.current && document.activeElement === inputRef.current) {
           onChange(inputValue);
        }
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, inputValue, onChange]);

  const filteredOptions = options.filter(opt => opt.toLowerCase().includes(inputValue.toLowerCase()));

  return (
    <div className="relative w-full h-full flex items-center">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        placeholder={placeholder}
        onChange={(e) => {
          setInputValue(e.target.value);
          inputValueRef.current = e.target.value;
          setIsOpen(true);
        }}
        onFocus={() => {
          setIsOpen(true);
          updateCoords();
        }}
        onBlur={() => {
          // Defer blur to allow clicking dropdown items
          setTimeout(() => {
            if (!dropdownRef.current?.contains(document.activeElement)) {
              onChange(inputValueRef.current);
            }
          }, 150);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setIsOpen(false);
            onChange(inputValue);
            inputRef.current?.blur();
          } else if (e.key === 'Escape') {
            setIsOpen(false);
            setInputValue(value);
            inputRef.current?.blur();
          }
        }}
        className={`${className} pr-8 flex-1`}
      />
      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-black/30">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </div>
      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: coords.top + 6,
            left: coords.left,
            width: Math.max(coords.width, 220), // minimum width for dropdown
            zIndex: 9999,
          }}
          className="max-h-64 overflow-y-auto bg-[#1C1C1E]/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-[0_12px_40px_rgb(0,0,0,0.4)] p-1.5 flex flex-col font-medium animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* iOS-like pointer triangle on top */}
          <div 
            style={{
               position: 'absolute',
               top: -6,
               left: 20,
               width: 0,
               height: 0,
               borderLeft: '7px solid transparent',
               borderRight: '7px solid transparent',
               borderBottom: '7px solid rgba(28, 28, 30, 0.95)',
            }} 
          />
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, idx) => (
              <button
                key={idx}
                type="button"
                onMouseDown={(e) => {
                  // Prevent input from blurring immediately
                  e.preventDefault();
                }}
                onClick={() => {
                  setInputValue(opt);
                  inputValueRef.current = opt;
                  onChange(opt);
                  setIsOpen(false);
                  inputRef.current?.blur();
                }}
                className="w-full text-left px-3.5 py-2.5 text-[13.5px] text-white hover:bg-[#007AFF] hover:text-white rounded-[7px] transition-colors focus:bg-[#007AFF] focus:outline-none"
              >
                {opt}
              </button>
            ))
          ) : (
            <div className="px-3.5 py-3 text-[13px] text-[#8E8E93] text-center">Žádné shody</div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
