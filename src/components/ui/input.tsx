'use client';

import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <label className="flex w-full flex-col text-sm">
      {label && <span className="mb-1 text-slate-700">{label}</span>}
      <input
        className={`rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:ring-1 focus:ring-blue-500 ${className}`}
        {...props}
      />
    </label>
  );
};

export default Input;
