import React, { memo, useMemo } from 'react';

interface QuickActionButtonProps {
  label: string;
  icon: React.ReactNode;
  color: 'blue' | 'red' | 'purple';
  onClick: () => void;
  disabled?: boolean;
  ariaLabel?: string;
}

const colorStyles = {
  blue: {
    bg: 'bg-blue-600 hover:bg-blue-700',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    focus: 'focus:ring-blue-500',
  },
  red: {
    bg: 'bg-red-600 hover:bg-red-700',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    focus: 'focus:ring-red-500',
  },
  purple: {
    bg: 'bg-purple-600 hover:bg-purple-700',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    focus: 'focus:ring-purple-500',
  },
};

export const QuickActionButton: React.FC<QuickActionButtonProps> = memo(({
  label,
  icon,
  color,
  onClick,
  disabled = false,
  ariaLabel,
}) => {
  const styles = useMemo(() => colorStyles[color], [color]);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || label}
      className={`
        ${styles.bg}
        ${styles.focus}
        text-white rounded-lg p-6 
        transition-all duration-200 
        flex flex-col items-center justify-center gap-3
        min-h-[120px] w-full
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        shadow-md hover:shadow-lg
      `}
      style={{ minWidth: '44px', minHeight: '44px' }}
    >
      <div className={`${styles.iconBg} ${styles.iconColor} p-3 rounded-full`}>
        {icon}
      </div>
      <span className="font-semibold text-base text-center">{label}</span>
    </button>
  );
});
