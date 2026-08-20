import { Link } from "react-router-dom";

interface LogoProps {
  to?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { height: 22, text: "text-lg" },
  md: { height: 28, text: "text-xl" },
  lg: { height: 36, text: "text-2xl" },
};

/**
 * Inline geometric "V" made of colorful triangles — matches the SyncVision brand.
 * Rendered inline at text-metric height so it sits naturally between "Sync" and "ision".
 */
const TriangleV = ({ height = 28 }: { height?: number }) => {
  const w = height * 0.9;
  return (
    <svg
      width={w}
      height={height}
      viewBox="0 0 50 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block align-middle"
      style={{ marginBottom: 2 }}
    >
      {/* Top-left triangle — cyan */}
      <polygon points="5,4 25,4 15,28" fill="#00bcd4" />
      {/* Top-right triangle — magenta */}
      <polygon points="25,4 45,4 35,28" fill="#e91e90" />
      {/* Center-left triangle — blue */}
      <polygon points="10,16 25,16 17.5,38" fill="#2979ff" />
      {/* Center-right triangle — pink */}
      <polygon points="25,16 40,16 32.5,38" fill="#f06292" />
      {/* Bottom center triangle — yellow/amber */}
      <polygon points="17,30 33,30 25,52" fill="#fdd835" />
    </svg>
  );
};

/** Standalone icon for favicon / small contexts */
const SyncVisionIcon = ({ size = 36 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="flex-shrink-0"
  >
    <rect width="100" height="100" rx="20" fill="url(#svBg)" />
    <polygon points="22,18 50,18 36,54" fill="#00bcd4" opacity="0.95" />
    <polygon points="50,18 78,18 64,54" fill="#e91e90" opacity="0.95" />
    <polygon points="30,34 50,34 40,64" fill="#2979ff" opacity="0.95" />
    <polygon points="50,34 70,34 60,64" fill="#f06292" opacity="0.95" />
    <polygon points="36,50 64,50 50,84" fill="#fdd835" opacity="0.9" />
    <defs>
      <linearGradient id="svBg" x1="0" y1="0" x2="100" y2="100">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
  </svg>
);

const Logo = ({ to = "/", size = "md", showText = true, className = "" }: LogoProps) => {
  const s = sizeMap[size];

  const content = (
    <div className={`flex items-center group ${className}`}>
      {showText ? (
        <span className={`${s.text} font-extrabold tracking-tight leading-none select-none`}>
          <span className="text-pink-600 dark:text-pink-400">Sync</span>
          <TriangleV height={s.height} />
          <span className="text-pink-600 dark:text-pink-400">ision</span>
        </span>
      ) : (
        <div className="group-hover:scale-110 transition-transform">
          <SyncVisionIcon size={s.height * 1.4} />
        </div>
      )}
    </div>
  );

  return (
    <Link to={to} className="no-underline">
      {content}
    </Link>
  );
};

export { SyncVisionIcon, TriangleV };
export default Logo;
