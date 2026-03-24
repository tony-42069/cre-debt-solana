'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function Container({
  children,
  className,
  size = 'xl',
}: ContainerProps) {
  const sizeClasses = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-none',
  };

  return (
    <div className={cn('mx-auto px-4 sm:px-6 lg:px-8', sizeClasses[size], className)}>
      {children}
    </div>
  );
}

interface SectionProps {
  children: ReactNode;
  className?: string;
  background?: 'default' | 'muted' | 'white' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Section({
  children,
  className,
  background = 'default',
  padding = 'lg',
}: SectionProps) {
  const backgroundClasses = {
    default: '',
    muted: 'bg-muted/50',
    white: 'bg-white',
    gradient: 'bg-gradient-to-br from-slate-50 to-slate-100',
  };

  const paddingClasses = {
    none: '',
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16',
  };

  return (
    <section
      className={cn(
        backgroundClasses[background],
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </section>
  );
}

interface FlexProps {
  children: ReactNode;
  className?: string;
  direction?: 'row' | 'col' | 'row_reverse' | 'col_reverse';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  wrap?: boolean;
}

export function Flex({
  children,
  className,
  direction = 'row',
  justify = 'start',
  align = 'stretch',
  gap = 'md',
  wrap = false,
}: FlexProps) {
  const directionClasses = {
    row: 'flex-row',
    col: 'flex-col',
    row_reverse: 'flex-row-reverse',
    col_reverse: 'flex-col-reverse',
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline',
  };

  const gapClasses = {
    none: '',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };

  return (
    <div
      className={cn(
        'flex',
        directionClasses[direction],
        justifyClasses[justify],
        alignClasses[align],
        gapClasses[gap],
        wrap && 'flex-wrap',
        className
      )}
    >
      {children}
    </div>
  );
}

interface StackProps {
  children: ReactNode;
  className?: string;
  gap?: 'sm' | 'md' | 'lg';
}

export function Stack({ children, className, gap = 'md' }: StackProps) {
  const gapClasses = {
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
  };

  return <div className={cn(gapClasses[gap], className)}>{children}</div>;
}

interface HideProps {
  children: ReactNode;
  below?: 'sm' | 'md' | 'lg' | 'xl';
  above?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Hide({ children, below, above }: HideProps) {
  const belowClasses = {
    sm: 'sm:hidden',
    md: 'md:hidden',
    lg: 'lg:hidden',
    xl: 'xl:hidden',
  };

  const aboveClasses = {
    sm: 'max-sm:hidden',
    md: 'max-md:hidden',
    lg: 'max-lg:hidden',
    xl: 'max-xl:hidden',
  };

  const className = below ? belowClasses[below] : above ? aboveClasses[above] : '';

  return <div className={className}>{children}</div>;
}

interface ShowProps {
  children: ReactNode;
  at?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Show({ children, at }: ShowProps) {
  const atClasses = {
    sm: 'sm:block hidden',
    md: 'md:block hidden',
    lg: 'lg:block hidden',
    xl: 'xl:block hidden',
  };

  return <div className={at ? atClasses[at] : 'block'}>{children}</div>;
}
