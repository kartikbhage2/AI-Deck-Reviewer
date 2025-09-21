
import React from 'react';
import { TrashIcon } from './IconComponents';

interface SlideInputProps {
  slideNumber: number;
  content: string;
  onChange: (newContent: string) => void;
  onRemove: () => void;
  isRemoveDisabled: boolean;
}

export const SlideInput: React.FC<SlideInputProps> = ({
  slideNumber,
  content,
  onChange,
  onRemove,
  isRemoveDisabled,
}) => {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 transition-shadow hover:shadow-lg hover:shadow-indigo-500/10">
      <div className="flex justify-between items-center mb-2">
        <label className="font-bold text-slate-300">
          Slide {slideNumber}
        </label>
        <button
          onClick={onRemove}
          disabled={isRemoveDisabled}
          className="text-slate-500 hover:text-red-500 disabled:text-slate-700 disabled:cursor-not-allowed transition-colors"
          title={isRemoveDisabled ? "Cannot remove the last slide" : "Remove slide"}
        >
          <TrashIcon />
        </button>
      </div>
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter slide content here..."
        className="w-full h-40 bg-slate-900/50 border border-slate-600 rounded-md p-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
        rows={6}
      />
    </div>
  );
};
