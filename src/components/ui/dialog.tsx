'use client';

import React from 'react';

export const Dialog: React.FC<{ open?: boolean; onClose?: () => void; title?: React.ReactNode; children?: React.ReactNode }> = ({
  open = false,
  onClose,
  title,
  children,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded bg-white p-6 shadow-lg">
        {title && <h3 className="mb-4 text-lg font-semibold">{title}</h3>}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Dialog;
