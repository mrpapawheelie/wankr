import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "xxl";
  showText?: boolean;
  className?: string;
}

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const sizeMap = {
    sm: { icon: 32, text: "text-2xl" },
    md: { icon: 48, text: "text-3xl" },
    lg: { icon: 64, text: "text-5xl" },
    xl: { icon: 80, text: "text-7xl" },
    xxl: { icon: 120, text: "text-9xl" },
  };

  const { icon, text } = sizeMap[size];

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      <Image
        src="/wankr-icon.svg"
        alt="Wankr Logo"
        width={icon}
        height={icon}
        className="drop-shadow-lg"
      />
      {showText && (
        <h1 className={`text-gradient-hero font-wankr font-bold ${text} leading-none`}>
          WANKR
        </h1>
      )}
    </div>
  );
}
