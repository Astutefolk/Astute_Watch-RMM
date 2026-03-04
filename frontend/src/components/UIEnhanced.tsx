'use client';

import React from 'react';
import clsx from 'clsx';

// Button with enhanced styling and glass-morphism
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const baseStyles =
    'font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500';

  const variants = {
    primary: 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-700 hover:to-primary-600 shadow-glow-primary hover:shadow-glow hover:scale-105 active:scale-95',
    secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600 transition-smooth',
    danger: 'bg-gradient-to-r from-danger-600 to-danger-500 text-white hover:from-danger-700 hover:to-danger-600 shadow-glow-danger hover:shadow-glow',
    ghost: 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-smooth',
    glass: 'glass backdrop-blur-glass text-slate-900 dark:text-white hover:bg-white/10 dark:hover:bg-white/5 border border-white/20 dark:border-white/10',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading && (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {icon && !isLoading && <span>{icon}</span>}
      {children}
    </button>
  );
}

// Card with glass-morphism effect
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'gradient';
  hoverable?: boolean;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={clsx('mb-4 pb-4 border-b border-slate-200/20 dark:border-slate-700/30', className)}>
      {children}
    </div>
  );
}

function CardContent({ children, className }: CardContentProps) {
  return <div className={className}>{children}</div>;
}

export function Card({ children, className, variant = 'default', hoverable = false, ...props }: CardProps) {
  const baseClasses = 'rounded-2xl backdrop-blur-glass transition-all duration-300 overflow-hidden';
  
  const variants = {
    default: 'bg-white/80 dark:bg-slate-900/40 border border-slate-200/30 dark:border-slate-700/30 shadow-glass dark:shadow-glass-dark',
    glass: 'glass-dark border border-slate-400/10 dark:border-primary-500/10',
    gradient: 'bg-gradient-to-br from-slate-900/40 to-slate-800/40 border border-primary-500/20 shadow-glow-primary/20',
  };

  return (
    <div
      className={clsx(
        baseClasses,
        variants[variant],
        'p-6',
        hoverable && 'hover:shadow-lg hover:border-primary-500/30 dark:hover:border-primary-500/30 hover:scale-105 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

Card.Header = CardHeader;
Card.Content = CardContent;

// Badge with enhanced styling
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export function Badge({ children, variant = 'default', size = 'md', icon }: BadgeProps) {
  const variants = {
    default: 'bg-slate-100/80 text-slate-800 dark:bg-slate-800/50 dark:text-slate-200 border border-slate-200/20 dark:border-slate-700/30',
    success: 'bg-accent-100/80 text-accent-800 dark:bg-accent-900/30 dark:text-accent-300 border border-accent-200/30 dark:border-accent-700/30',
    danger: 'bg-danger-100/80 text-danger-800 dark:bg-danger-900/30 dark:text-danger-300 border border-danger-200/30 dark:border-danger-700/30',
    warning: 'bg-warning-100/80 text-warning-800 dark:bg-warning-900/30 dark:text-warning-300 border border-warning-200/30 dark:border-warning-700/30',
    info: 'bg-primary-100/80 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300 border border-primary-200/30 dark:border-primary-700/30',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span className={clsx('inline-flex items-center gap-1.5 rounded-full font-semibold', variants[variant], sizes[size])}>
      {icon && <span>{icon}</span>}
      {children}
    </span>
  );
}

// Alert component with enhanced styling
interface AlertProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  onClose?: () => void;
}

export function Alert({ children, variant = 'info', className, icon, title, onClose }: AlertProps) {
  const variants = {
    info: 'bg-primary-50/50 text-primary-800 border border-primary-200/50 dark:bg-primary-900/20 dark:text-primary-300 dark:border-primary-800/30 shadow-glow-primary/10',
    success: 'bg-accent-50/50 text-accent-800 border border-accent-200/50 dark:bg-accent-900/20 dark:text-accent-300 dark:border-accent-800/30 shadow-glow-accent/10',
    warning: 'bg-warning-50/50 text-warning-800 border border-warning-200/50 dark:bg-warning-900/20 dark:text-warning-300 dark:border-warning-800/30',
    danger: 'bg-danger-50/50 text-danger-800 border border-danger-200/50 dark:bg-danger-900/20 dark:text-danger-300 dark:border-danger-800/30 shadow-glow-danger/10',
  };

  return (
    <div className={clsx('rounded-xl p-4 backdrop-blur-glass', variants[variant], className)}>
      <div className="flex items-start gap-3">
        {icon && <span className="mt-0.5 flex-shrink-0 text-xl">{icon}</span>}
        <div className="flex-1">
          {title && <h3 className="font-semibold mb-1">{title}</h3>}
          <div className="text-sm">{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity text-lg"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

// Input field with glass effect
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}
        <input
          className={clsx(
            'w-full px-4 py-2.5 rounded-lg border transition-all duration-300',
            'bg-white/80 dark:bg-slate-800/50 text-slate-900 dark:text-white',
            'border-slate-300/50 dark:border-slate-600/30 backdrop-blur-sm',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-105',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-danger-500 focus:ring-danger-500',
            icon && 'pl-10',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-danger-600 dark:text-danger-400 mt-1.5 font-medium">{error}</p>}
    </div>
  );
}

// StatCard for dashboard metrics
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  subtext?: string;
  trend?: string;
  color?: 'primary' | 'success' | 'danger' | 'warning';
}

export function StatCard({ label, value, icon, subtext, trend, color = 'primary' }: StatCardProps) {
  const colorMap = {
    primary: 'from-primary-600/20 to-primary-500/20 border-primary-500/30 shadow-glow-primary/20',
    success: 'from-accent-600/20 to-accent-500/20 border-accent-500/30 shadow-glow-accent/20',
    danger: 'from-danger-600/20 to-danger-500/20 border-danger-500/30 shadow-glow-danger/20',
    warning: 'from-warning-600/20 to-warning-500/20 border-warning-500/30',
  };

  const iconColorMap = {
    primary: 'text-primary-500',
    success: 'text-accent-500',
    danger: 'text-danger-500',
    warning: 'text-warning-500',
  };

  return (
    <Card variant="gradient" className={`bg-gradient-to-br ${colorMap[color]}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">{label}</h3>
        {icon && <span className={`text-3xl ${iconColorMap[color]}`}>{icon}</span>}
      </div>
      <div className="flex items-baseline gap-3">
        <p className="text-3xl lg:text-4xl font-bold gradient-text">{value}</p>
        {(subtext || trend) && (
          <div className="flex flex-col gap-1">
            {trend && <span className="text-xs font-semibold text-primary-400 dark:text-primary-300">{trend}</span>}
            {subtext && <span className="text-xs text-slate-500 dark:text-slate-400">{subtext}</span>}
          </div>
        )}
      </div>
    </Card>
  );
}

// Tabs component with enhanced styling
interface TabsContextType {
  value: string;
  onChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined);

interface TabsProps {
  defaultValue?: string;
  onChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

function TabsList({ children, className }: TabsListProps) {
  return (
    <div
      className={clsx(
        'flex gap-1 border-b border-slate-200/20 dark:border-slate-700/30 mb-6 overflow-x-auto',
        className
      )}
    >
      {children}
    </div>
  );
}

function TabsTrigger({ value, children, className }: TabsTriggerProps) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');

  const isActive = context.value === value;

  return (
    <button
      onClick={() => context.onChange(value)}
      className={clsx(
        'px-4 py-3 font-semibold text-sm border-b-2 transition-all duration-300 whitespace-nowrap',
        isActive
          ? 'border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400 shadow-glow-primary/30'
          : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300',
        className
      )}
    >
      {children}
    </button>
  );
}

function TabsContent({ value, children, className }: TabsContentProps) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');

  if (context.value !== value) return null;

  return (
    <div className={clsx('animate-fade-in', className)}>
      {children}
    </div>
  );
}

export function Tabs({ defaultValue = '', onChange, children, className }: TabsProps) {
  const [value, setValue] = React.useState(defaultValue);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    onChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ value, onChange: handleChange }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

Tabs.List = TabsList;
Tabs.Trigger = TabsTrigger;
Tabs.Content = TabsContent;

// Loading skeleton with animation
interface SkeletonProps {
  className?: string;
  count?: number;
}

export function Skeleton({ className, count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={clsx(
            'bg-gradient-to-r from-slate-200/50 via-slate-200/30 to-slate-200/50 dark:from-slate-700/50 dark:via-slate-700/30 dark:to-slate-700/50 animate-shimmer rounded-lg',
            className
          )}
        />
      ))}
    </>
  );
}

// Container
interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function Container({ children, className }: ContainerProps) {
  return (
    <div className={clsx('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8', className)}>
      {children}
    </div>
  );
}
