import React from 'react';

export default function NavItem({ icon, label, active, onClick, isCollapsed, colorClass }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3 rounded-lg transition-all group relative ${active ? 'bg-primary-500/10 text-primary-400 font-bold' : 'text-txt-muted hover:bg-dark-700/50 hover:text-txt-main'}`}
      title={isCollapsed ? label : ''}
    >
      {React.cloneElement(icon, { className: `w-5 h-5 shrink-0 transition-colors ${colorClass || ''}` })}
      {!isCollapsed && <span className="truncate">{label}</span>}
      {isCollapsed && (
         <div className="absolute left-full ml-4 px-2 py-1 bg-dark-800 text-txt-main text-xs font-bold tracking-wide rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl border border-dark-600">
           {label}
         </div>
      )}
      {active && <div className="absolute left-0 w-1 h-6 bg-primary-500 rounded-r-full" />}
    </button>
  );
}
