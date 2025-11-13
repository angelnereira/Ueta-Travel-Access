interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export default function Card({
  children,
  className = '',
  onClick,
  hover = false,
}: CardProps) {
  const hoverClass = hover
    ? 'hover:shadow-lg hover:scale-[1.02] transition-all duration-200'
    : '';

  const clickableClass = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`
        bg-card-light dark:bg-card-dark
        border border-border-light dark:border-border-dark
        rounded-lg shadow-sm
        ${hoverClass}
        ${clickableClass}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
