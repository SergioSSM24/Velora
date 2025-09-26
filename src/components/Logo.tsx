import { FileText, FolderOpen } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: {
      container: 'flex items-center space-x-2',
      iconContainer: 'w-8 h-8',
      icon: 'w-4 h-4',
      text: 'text-lg font-semibold',
      subtitle: 'text-xs'
    },
    md: {
      container: 'flex items-center space-x-3',
      iconContainer: 'w-10 h-10',
      icon: 'w-5 h-5',
      text: 'text-xl font-bold',
      subtitle: 'text-sm'
    },
    lg: {
      container: 'flex items-center space-x-4',
      iconContainer: 'w-16 h-16',
      icon: 'w-8 h-8',
      text: 'text-3xl font-bold',
      subtitle: 'text-base'
    }
  };

  const sizes = sizeClasses[size];

  return (
    <div className={`${sizes.container} ${className}`}>
      <div className="relative">
        {/* Fondo con gradiente y sombra */}
        <div className={`${sizes.iconContainer} relative`}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-lg"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
          <div className="relative flex items-center justify-center h-full text-white">
            <div className="relative">
              <FileText className={`${sizes.icon} relative z-10`} />
              <FolderOpen className={`${sizes.icon} absolute top-0 left-0 opacity-30 transform translate-x-0.5 translate-y-0.5`} />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <span className={`${sizes.text} text-primary leading-none tracking-tight`}>
          Velora
        </span>
        <span className={`${sizes.subtitle} text-muted-foreground leading-none`}>
          Sistema de Gestión
        </span>
      </div>
    </div>
  );
}