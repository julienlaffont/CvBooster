import { useEffect, useMemo, useRef, useState } from "react";

type TypewriterProps = {
  words: string[];
  typingSpeedMs?: number;
  deletingSpeedMs?: number;
  pauseBeforeDeleteMs?: number;
  pauseBeforeTypeMs?: number;
  className?: string;
  ariaLabelPrefix?: string;
};

export function Typewriter({
  words,
  typingSpeedMs = 60,
  deletingSpeedMs = 40,
  pauseBeforeDeleteMs = 900,
  pauseBeforeTypeMs = 300,
  className,
  ariaLabelPrefix = "texte animé",
}: TypewriterProps) {
  const safeWords = useMemo(() => (Array.isArray(words) && words.length > 0 ? words : [""]), [words]);
  const [wordIndex, setWordIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const rafRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const lastTsRef = useRef<number>(0);

  useEffect(() => {
    const current = safeWords[wordIndex % safeWords.length];

    function step(ts: number) {
      const last = lastTsRef.current;
      const delta = ts - last;
      const interval = isDeleting ? deletingSpeedMs : typingSpeedMs;

      if (last === 0 || delta >= interval) {
        lastTsRef.current = ts;

        if (!isDeleting) {
          // typing forward
          const next = current.slice(0, displayed.length + 1);
          setDisplayed(next);
          if (next === current) {
            // reached full word -> pause then start deleting
            if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
            if (timeoutRef.current != null) clearTimeout(timeoutRef.current);
            timeoutRef.current = window.setTimeout(() => {
              setIsDeleting(true);
              lastTsRef.current = 0;
              rafRef.current = requestAnimationFrame(step);
            }, pauseBeforeDeleteMs) as unknown as number;
            return;
          }
        } else {
          // deleting backward
          const next = current.slice(0, Math.max(0, displayed.length - 1));
          setDisplayed(next);
          if (next.length === 0) {
            // finished deleting -> move to next word, pause, then type
            if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
            if (timeoutRef.current != null) clearTimeout(timeoutRef.current);
            timeoutRef.current = window.setTimeout(() => {
              setIsDeleting(false);
              setWordIndex((i) => (i + 1) % safeWords.length);
              lastTsRef.current = 0;
              rafRef.current = requestAnimationFrame(step);
            }, pauseBeforeTypeMs) as unknown as number;
            return;
          }
        }
      }
      rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      if (timeoutRef.current != null) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordIndex, isDeleting, deletingSpeedMs, typingSpeedMs, pauseBeforeDeleteMs, pauseBeforeTypeMs, safeWords]);

  return (
    <span className={className} aria-live="polite" aria-label={`${ariaLabelPrefix}: ${safeWords[wordIndex]}`}>\
      {displayed}
      <span className="inline-block w-[2px] md:w-[3px] h-[1em] align-[-0.15em] bg-primary ml-0.5 animate-pulse" />
    </span>
  );
}


