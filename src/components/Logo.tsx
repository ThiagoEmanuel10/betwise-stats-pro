
import { FC } from "react";

interface LogoProps {
  className?: string;
}

export const Logo: FC<LogoProps> = ({ className = "" }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-lg transform rotate-45"></div>
        <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl">P</div>
      </div>
      <span className="text-xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
        Pitakko
      </span>
    </div>
  );
};
