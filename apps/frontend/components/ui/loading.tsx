import { cn } from '@/lib/utils';

interface LoadingProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const Loading = ({ className, size = 'md', text }: LoadingProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="flex flex-col items-center space-y-2">
        <div
          className={cn(
            'animate-spin rounded-full border-2 border-primary border-t-transparent',
            sizeClasses[size],
          )}
        />
        {text && <p className="text-sm text-muted-foreground animate-pulse">{text}</p>}
      </div>
    </div>
  );
};

export default Loading;
