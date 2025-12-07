import { useEffect } from "react";

const letters = "DIGISWATCH".split("");

const PwaSplash = ({ show, onDone }) => {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => {
      onDone?.();
    }, 2200);
    return () => clearTimeout(timer);
  }, [show, onDone]);

  if (!show) return null;

  return (
    <div className="pwa-splash">
      <div className="pwa-splash-inner">
        <div className="pwa-wordmark">
          {letters.map((char, idx) => (
            <span
              key={`${char}-${idx}`}
              className="pwa-letter"
              style={{ animationDelay: `${0.08 * idx}s` }}
            >
              {char}
            </span>
          ))}
        </div>
        <img
          src="/favicon.svg"
          alt="DigiSwatch"
          className="pwa-icon-blast"
        />
      </div>
    </div>
  );
};

export default PwaSplash;
