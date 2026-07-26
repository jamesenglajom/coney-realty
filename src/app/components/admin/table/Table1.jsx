const DataTable = ({ data, columns }) => (
  <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-border-subtle overflow-hidden">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-gray-50 dark:bg-white/5 border-b border-border-subtle">
          {columns.map(col => (
            <th key={col} className="p-4 text-xs uppercase tracking-wider text-tx-muted dark:text-tx-dark-muted font-bold">{col}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-border-subtle">
        {data.map((row, idx) => (
          <tr key={idx} className="hover:bg-gold-light/30 dark:hover:bg-white/5 transition-colors">
            <td className="p-4 text-tx-primary dark:text-tx-dark-primary font-medium">{row.name}</td>
            <td className="p-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 uppercase">Active</span>
            </td>
            <td className="p-4 text-tx-secondary dark:text-tx-dark-secondary">{row.role}</td>
            <td className="p-4 text-right">
              <button className="text-theme-gold hover:underline font-semibold">Edit</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default DataTable;