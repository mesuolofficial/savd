"use client";

import { useRef, useEffect } from "react";

type Props = {
  name: string;
  defaultValue: string;
  placeholder?: string;
};

export function RichTextEditor({ name, defaultValue, placeholder }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== defaultValue) {
      editorRef.current.innerHTML = defaultValue;
    }
  }, [defaultValue]);

  const handleInput = () => {
    if (editorRef.current && inputRef.current) {
      inputRef.current.value = editorRef.current.innerHTML;
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  return (
    <div className="border border-line rounded-lg overflow-hidden bg-white">
      {/* Force lists to show by overriding Tailwind reset inside this specific component */}
      <style>{`
        .rich-editor ul { list-style-type: disc !important; padding-left: 1.5rem !important; margin-top: 0.5rem; margin-bottom: 0.5rem; }
        .rich-editor ol { list-style-type: decimal !important; padding-left: 1.5rem !important; margin-top: 0.5rem; margin-bottom: 0.5rem; }
        .rich-editor b, .rich-editor strong { font-weight: bold !important; }
        .rich-editor i, .rich-editor em { font-style: italic !important; }
        .rich-editor u { text-decoration: underline !important; }
      `}</style>

      <div className="flex gap-1 p-2 bg-canvas border-b border-line flex-wrap">
        <button type="button" onClick={() => execCommand("bold")} className="w-8 h-8 font-bold hover:bg-line rounded" title="Bold">B</button>
        <button type="button" onClick={() => execCommand("italic")} className="w-8 h-8 italic hover:bg-line rounded" title="Italic">I</button>
        <button type="button" onClick={() => execCommand("underline")} className="w-8 h-8 underline hover:bg-line rounded" title="Underline">U</button>
        <div className="w-px h-6 bg-line mx-1 my-auto" />
        <button type="button" onClick={() => execCommand("insertUnorderedList")} className="px-2 h-8 hover:bg-line rounded font-bold text-sm" title="Bullet List">• List</button>
        <button type="button" onClick={() => execCommand("insertOrderedList")} className="px-2 h-8 hover:bg-line rounded font-bold text-sm" title="Numbered List">1. List</button>
        <div className="w-px h-6 bg-line mx-1 my-auto" />
        <button type="button" onClick={() => execCommand("removeFormat")} className="px-2 h-8 text-xs hover:bg-line rounded font-semibold" title="Clear Formatting">Clear</button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        className="rich-editor p-4 min-h-[150px] outline-none text-sm focus:ring-2 focus:ring-signal"
        style={{ lineHeight: 1.6 }}
      />
      
      <input type="hidden" ref={inputRef} name={name} defaultValue={defaultValue} />
    </div>
  );
}