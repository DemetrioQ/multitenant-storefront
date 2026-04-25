export function FieldError({ message }: { message?: string | null }) {
  if (!message) return null;
  return <p className="text-xs text-red-600 dark:text-red-400 mt-1">{message}</p>;
}
