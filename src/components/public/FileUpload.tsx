"use client";

import { useState } from "react";

type Props = {
  name: string;
  accept?: string;
  label?: string;
  hint?: string;
  required?: boolean;
};

export function FileUpload({ name, accept, label = "Click to attach a file", hint, required }: Props) {
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <div className="w-full">
      <label 
        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-line rounded-xl cursor-pointer bg-canvas/30 hover:bg-canvas/50 transition-colors"
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
          {fileName ? (
            <>
              <div className="text-3xl mb-2 text-success">✓</div>
              <p className="text-sm font-bold text-ink">{fileName}</p>
              <p className="text-xs text-mist mt-1">Click to change file</p>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-lg bg-[#EF8557]/10 text-[#EF8557] flex items-center justify-center mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm font-bold text-ink">{label}</p>
              <p className="text-xs text-mist mt-1">{hint || "PNG, JPG or PDF (Max 5MB)"}</p>
            </>
          )}
        </div>
        <input 
          type="file" 
          name={name} 
          accept={accept} 
          required={required}
          className="hidden" 
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setFileName(file.name);
            else setFileName(null);
          }}
        />
      </label>
    </div>
  );
}