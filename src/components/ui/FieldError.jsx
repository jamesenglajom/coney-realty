export default function FieldError({ children }) {
	if (!children) return null;

	return <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">{children}</p>;
}
