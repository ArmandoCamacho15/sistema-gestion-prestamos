'use client';

import React from 'react';

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, children, className = '', ...props }) => {
  return (
    <div className={`rounded-lg border border-slate-100 bg-white p-4 shadow-sm ${className}`} {...props}>
      {title && <h3 className="mb-2 text-lg font-semibold text-slate-900">{title}</h3>}
      <div>{children}</div>
    </div>
  );
};

export default Card;
