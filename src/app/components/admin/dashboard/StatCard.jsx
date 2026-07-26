const StatCard = ({ title, value, trend }) => (
  <div className="p-6 bg-white dark:bg-[#1a1a1a] border border-[#f4f2eb] dark:border-[#333] rounded-xl shadow-sm">
    <p className="text-sm font-medium text-txt-secondary dark:text-txt-secondary-dark">
      {title}
    </p>
    <div className="flex items-end justify-between mt-2">
      <h3 className="text-2xl font-bold text-theme-blue dark:text-white">
        {value}
      </h3>
      <span
        className={`text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
      >
        {trend > 0 ? "+" : ""}
        {trend}%
      </span>
    </div>
  </div>
);

export default StatCard;
