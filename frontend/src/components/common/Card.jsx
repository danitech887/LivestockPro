import React from 'react';

export const Card = ({
  children,
  className = '',
  title,
  subtitle,
  action,
  icon: Icon,
  padding = true,
  onClick,
  hoverable = false
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm transition-all overflow-hidden ${
        hoverable ? 'hover:shadow-md hover:border-slate-300 cursor-pointer active:scale-[0.99]' : ''
      } ${className}`}
    >
      {(title || subtitle || action || Icon) && (
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-gradient-to-r from-slate-50/50 to-white">
          <div className="flex items-center gap-3 min-w-0">
            {Icon && (
              <div className="p-2 rounded-xl bg-farm-50 text-farm-700 border border-farm-200 shrink-0">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              {title && <h3 className="font-bold text-slate-900 text-base tracking-tight truncate">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={padding ? 'p-5' : ''}>{children}</div>
    </div>
  );
};
