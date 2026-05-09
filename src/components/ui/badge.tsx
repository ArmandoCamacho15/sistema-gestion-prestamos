'use client';

import React from 'react';

export const Badge: React.FC<{ children: React.ReactNode; color?: 'green' | 'red' | 'yellow' | 'gray' }> = ({
  children,
  color = 'gray',
}) => {
  const map: Record<string, string> = {
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-amber-100 text-amber-800',
    gray: 'bg-slate-100 text-slate-800',
  };

  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${map[color]}`}>{children}</span>;
};

export default Badge;
