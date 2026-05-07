interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color?: "blue" | "green" | "amber" | "red" | "purple";
  trend?: { value: string; up: boolean };
}

const colorMap = {
  blue:   { bg: "bg-blue-50",   icon: "bg-blue-600",   text: "text-blue-600"   },
  green:  { bg: "bg-emerald-50",icon: "bg-emerald-600", text: "text-emerald-600"},
  amber:  { bg: "bg-amber-50",  icon: "bg-amber-500",   text: "text-amber-600"  },
  red:    { bg: "bg-red-50",    icon: "bg-red-500",     text: "text-red-600"    },
  purple: { bg: "bg-purple-50", icon: "bg-purple-600",  text: "text-purple-600" },
};

export default function KpiCard({
  title,
  value,
  subtitle,
  icon,
  color = "blue",
  trend,
}: KpiCardProps) {
  const c = colorMap[color];
  return (
    <div className={`card flex items-start gap-4 ${c.bg} border-0`}>
      <div
        className={`w-12 h-12 rounded-xl ${c.icon} flex items-center justify-center text-white text-2xl shadow-md shrink-0`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          {title}
        </p>
        <p className="text-2xl font-bold text-gray-900 truncate">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        )}
        {trend && (
          <p
            className={`text-xs font-medium mt-1 ${
              trend.up ? "text-emerald-600" : "text-red-500"
            }`}
          >
            {trend.up ? "▲" : "▼"} {trend.value}
          </p>
        )}
      </div>
    </div>
  );
}
