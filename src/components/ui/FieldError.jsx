export default function FieldError({ children }) {
	if (!children) return null;

	return <p className="mt-1.5 text-xs font-medium text-danger dark:text-danger-dark">{children}</p>;
}
