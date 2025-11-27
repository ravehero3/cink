import { useState } from 'react';

interface AnimatedButtonProps {
  text: string;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  style?: React.CSSProperties;
}

export default function AnimatedButton({ 
  text, 
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  style = {}
}: AnimatedButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`bg-black text-white uppercase font-bold border border-black relative overflow-hidden disabled:opacity-50 transition-all duration-300 ${className}`}
      style={{ borderRadius: '4px', padding: '8px 0', height: '32px', fontSize: '12px', textAlign: 'center', ...style }}
    >
      <span
        className="flex items-center justify-center transition-all duration-300"
        style={{
          transform: isHovered ? 'translateY(-150%)' : 'translateY(0)',
          opacity: isHovered ? 0 : 1,
          width: '100%',
          height: '100%'
        }}
      >
        {loading ? 'ZPRACOVÁNÍ...' : text}
      </span>
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-300"
        style={{
          transform: isHovered ? 'translateY(0)' : 'translateY(150%)',
          opacity: isHovered ? 1 : 0,
        }}
      >
        {text}
      </span>
    </button>
  );
}
