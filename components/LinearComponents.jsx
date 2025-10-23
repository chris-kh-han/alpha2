// Linear.app 스타일 컴포넌트 예시
import React from 'react';

// 버튼 컴포넌트
export const LinearButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-normal rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-background-primary';
  
  const variants = {
    primary: 'bg-accent-500 text-white hover:bg-accent-400 shadow-md',
    secondary: 'bg-white/5 text-text-primary hover:bg-white/10 border border-border-primary',
    ghost: 'text-text-secondary hover:text-text-primary hover:bg-white/5'
  };
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// 카드 컴포넌트
export const LinearCard = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`bg-background-tertiary border border-border-primary rounded-lg p-6 shadow-lg ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// 입력 필드 컴포넌트
export const LinearInput = ({ 
  label, 
  error, 
  className = '',
  ...props 
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 bg-background-quaternary border border-border-secondary rounded-md text-text-primary placeholder-text-quaternary focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors ${error ? 'border-error' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
    </div>
  );
};

// 네비게이션 바 컴포넌트
export const LinearNavbar = ({ children }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background-primary/80 backdrop-blur-header border-b border-white/8 h-16">
      <div className="max-w-container mx-auto px-6 h-full flex items-center justify-between">
        {children}
      </div>
    </nav>
  );
};

// 그리드 레이아웃 컴포넌트
export const LinearGrid = ({ 
  children, 
  cols = 3, 
  gap = 6, 
  className = '' 
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    6: 'grid-cols-6',
    12: 'grid-cols-12'
  };
  
  const gridGaps = {
    2: 'gap-2',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8'
  };
  
  return (
    <div className={`grid ${gridCols[cols]} ${gridGaps[gap]} ${className}`}>
      {children}
    </div>
  );
};

// 타이포그래피 컴포넌트
export const LinearHeading = ({ 
  level = 1, 
  children, 
  className = '',
  ...props 
}) => {
  const Tag = `h${level}`;
  
  const styles = {
    1: 'text-5xl font-semibold leading-tight tracking-tighter text-text-primary',
    2: 'text-3xl font-semibold leading-snug tracking-normal text-text-primary',
    3: 'text-2xl font-semibold leading-snug tracking-normal text-text-primary',
    4: 'text-xl font-medium leading-normal text-text-primary',
    5: 'text-lg font-medium leading-normal text-text-secondary',
    6: 'text-base font-medium leading-normal text-text-secondary'
  };
  
  return (
    <Tag className={`${styles[level]} ${className}`} {...props}>
      {children}
    </Tag>
  );
};

// 글래스모피즘 컨테이너
export const GlassContainer = ({ children, className = '' }) => {
  return (
    <div className={`bg-white/5 backdrop-blur-md border border-white/10 rounded-lg ${className}`}>
      {children}
    </div>
  );
};

// 스테이터스 배지
export const StatusBadge = ({ 
  status, 
  children, 
  className = '' 
}) => {
  const statusStyles = {
    success: 'bg-success/20 text-success border-success/30',
    warning: 'bg-warning/20 text-warning border-warning/30',
    error: 'bg-error/20 text-error border-error/30',
    info: 'bg-info/20 text-info border-info/30',
    neutral: 'bg-text-quaternary/20 text-text-secondary border-text-quaternary/30'
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyles[status]} ${className}`}>
      {children}
    </span>
  );
};