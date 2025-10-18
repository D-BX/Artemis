import { Button } from "./button"

export function ThemedButton({ children, className }: { children?: React.ReactNode, className?: string }) {
  return (
    <Button
      className={`
        bg-gray-300 text-black font-bold border-2 border-black hover:bg-[#500000] 
        hover:text-white transition-colors duration-200 rounded-sm
        ${className}
      `}
    >
      {children}
    </Button>
  );
};
