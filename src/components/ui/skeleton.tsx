'use client';

import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return <div className={`animate-pulse rounded-md bg-slate-100 ${className}`} />;
};

export default Skeleton;
