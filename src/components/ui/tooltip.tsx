'use client';

import React from 'react';

export const Tooltip: React.FC<{ content: React.ReactNode; children?: React.ReactNode }> = ({ content, children }) => {
  return (
    <span className="relative group inline-block">
      {children}
      <span className="pointer-events-none absolute -top-8 left-1/2 hidden w-max -translate-x-1/2 transform rounded bg-slate-800 px-2 py-1 text-xs text-white group-hover:block">
        {content}
      </span>
    </span>
  );
};

export default Tooltip;
