import { useState, useEffect, useRef } from "react";

// Parse number from string like "50,000+", "4.8/5", "500+"
const parseNum = (str) => {
  const match = str.replace(/,/g, "").match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
};

// Format back with suffix intact
const formatNum = (num, original) => {
  const isDecimal = original.includes(".");
  const suffix = original.replace(/[\d,]+/g, "").replace(/^\./, "");
  
  if (isDecimal) {
    const decimalSuffix = original.replace(/^[\d.]+/, "");
    return num.toFixed(1) + decimalSuffix;
  }
  return Math.floor(num).toLocaleString("en-IN") + suffix;
};

export const useCountUp = (target, duration = 2000, start = false) => {
  const [display, setDisplay] = useState("0");
  const frameRef = useRef();
  const startTimeRef = useRef();

  useEffect(() => {
    if (!start) return;
    const targetNum = parseNum(String(target));
    if (targetNum === 0) { setDisplay(String(target)); return; }

    startTimeRef.current = null;

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic for satisfying deceleration
      const eased = 1 - Math.pow(1 - progress, 3);

      setDisplay(formatNum(eased * targetNum, String(target)));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplay(String(target));
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [start, target, duration]);

  return display;
};

// Intersection Observer hook — triggers once when element enters viewport
export const useInView = (threshold = 0.2) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, inView];
};
