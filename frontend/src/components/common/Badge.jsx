import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-full tracking-wide';

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  const variantClasses = {
    default: 'bg-slate-100 text-slate-800 border border-slate-200',
    dairy: 'bg-blue-100 text-blue-900 border border-blue-200 font-bold',
    beef: 'bg-red-100 text-red-900 border border-red-200 font-bold',
    breeding: 'bg-purple-100 text-purple-900 border border-purple-200 font-bold',
    general: 'bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold',
    active: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    sold: 'bg-amber-100 text-amber-800 border border-amber-200',
    culled: 'bg-slate-200 text-slate-700 border border-slate-300',
    warning: 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse',
    danger: 'bg-rose-100 text-rose-900 border border-rose-300 font-bold',
    info: 'bg-sky-100 text-sky-800 border border-sky-200'
  };

  return (
    <span className={`${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.default} ${className}`}>
      {children}
    </span>
  );
};
