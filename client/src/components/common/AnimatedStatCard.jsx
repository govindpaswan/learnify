import { useCountUp, useInView } from "../../hooks/useCountUp";

export default function AnimatedStatCard({ icon: Icon, label, value, delay = 0 }) {
  const [ref, inView] = useInView(0.2);
  const count = useCountUp(value, 2000 + delay, inView);

  return (
    <div
      ref={ref}
      className="card p-6 text-center hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group overflow-hidden relative"
    >
      {/* Subtle glow effect when in view */}
      <div className={`absolute inset-0 bg-gradient-to-br from-primary-500/5 to-violet-500/5 transition-opacity duration-700 ${inView ? "opacity-100" : "opacity-0"}`} />
      
      <div className="relative">
        <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
          <Icon className="text-primary-600 dark:text-primary-400" size={24} />
        </div>

        <div
          className={`font-display font-bold text-3xl md:text-4xl text-slate-900 dark:text-white transition-all duration-500 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: `${delay}ms` }}
        >
          {count}
        </div>

        <div
          className={`text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-medium transition-all duration-500 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: `${delay + 100}ms` }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}
