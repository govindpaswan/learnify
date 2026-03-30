export default function Spinner({ size = "md", className = "" }) {
  const sizes = { sm: "w-5 h-5 border-2", md: "w-8 h-8 border-2", lg: "w-12 h-12 border-3" };
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className={`${sizes[size]} rounded-full border-primary-200 dark:border-primary-900 border-t-primary-600 dark:border-t-primary-400 animate-spin`} />
    </div>
  );
}
