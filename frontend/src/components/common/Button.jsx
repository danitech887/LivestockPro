import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all select-none focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] rounded-xl shadow-sm';

  const sizeClasses = {
    sm: 'text-xs px-3 py-2 min-h-[38px] gap-1.5',
    md: 'text-sm px-4 py-2.5 min-h-[44px] gap-2 font-semibold',
    lg: 'text-base px-5 py-3 min-h-[50px] gap-2.5 font-bold',
    xl: 'text-lg px-6 py-3.5 min-h-[56px] gap-3 font-bold',
    icon: 'p-2.5 min-h-[44px] min-w-[44px]'
  };

  const variantClasses = {
    primary: 'bg-farm-600 hover:bg-farm-700 text-white focus:ring-farm-500 border border-farm-700 shadow-farm-600/20 shadow-md',
    dairy: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 border border-blue-700 shadow-blue-600/20 shadow-md',
    beef: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 border border-red-700 shadow-red-600/20 shadow-md',
    secondary: 'bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 focus:ring-slate-400',
    outline: 'bg-transparent hover:bg-farm-50 text-farm-700 border-2 border-farm-600 focus:ring-farm-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 border border-red-700 shadow-red-600/20 shadow-md',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500 border border-amber-700',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 border-transparent shadow-none'
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.primary} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-5 h-5 shrink-0" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="w-5 h-5 shrink-0" />}
        </>
      )}
    </button>
  );
};
