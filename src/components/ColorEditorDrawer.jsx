import React, { useEffect, useMemo, useState } from "react";
import chroma from "chroma-js";
import { HexColorInput, HexColorPicker } from "react-colorful";
import "../styles/colorEditor.css";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const safeHex = (value, fallback = "#7b5bff") => {
  try {
    if (!value) return fallback;
    return chroma(value).hex();
  } catch (err) {
    return fallback;
  }
};

const Field = ({ label, hint, value, onSubmit }) => {
  const [draft, setDraft] = useState(value);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const handleCommit = () => {
    if (onSubmit) onSubmit(draft);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard?.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 900);
    } catch (err) {
      // keep silent on copy failure
    }
  };

  return (
    <label className="color-editor-field">
      <div className="color-editor-field-label">
        <div className="label-stack">
          <span>{label}</span>
          {hint ? <small>{hint}</small> : null}
        </div>
        <button
          type="button"
          className={`ghost-icon-btn ${copied ? "is-copied" : ""}`}
          aria-label={` ${label}`}
          onClick={handleCopy}
        >
          <i className="bi bi-clipboard" />
          {copied ? "" : ""}
        </button>
      </div>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleCommit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleCommit();
            e.currentTarget.blur();
          }
        }}
      />
    </label>
  );
};

const buildDisplayValues = (color) => {
  const parsed = chroma(color);
  const rgb = parsed.rgb().map((v) => Math.round(v));
  const hsl = parsed.hsl();
  const hsv = parsed.hsv();
  const cmyk = parsed.cmyk().map((v) => Math.round(v * 100));
  const lab = parsed.lab();
  const lch = parsed.lch();
  const oklch = parsed.oklch();

  return {
    hex: parsed.hex().toUpperCase(),
    rgb: `${rgb[0]}, ${rgb[1]}, ${rgb[2]}`,
    hsl: `${Math.round(hsl[0] || 0)}°, ${Math.round(
      (hsl[1] || 0) * 100
    )}%, ${Math.round((hsl[2] || 0) * 100)}%`,
    hsv: `${Math.round(hsv[0] || 0)}°, ${Math.round(
      (hsv[1] || 0) * 100
    )}%, ${Math.round((hsv[2] || 0) * 100)}%`,
    cmyk: `${cmyk[0]}%, ${cmyk[1]}%, ${cmyk[2]}%, ${cmyk[3]}%`,
    lab: `${lab[0].toFixed(1)}, ${lab[1].toFixed(2)}, ${lab[2].toFixed(2)}`,
    lch: `${lch[0].toFixed(1)}, ${lch[1].toFixed(2)}, ${Math.round(
      (lch[2] || 0) % 360
    )}°`,
    oklch: `${(oklch[0] * 100).toFixed(1)}%, ${oklch[1].toFixed(
      3
    )}, ${Math.round((oklch[2] || 0) % 360)}°`,
    ramps: {
      light: parsed.brighten(1.4).hex(),
      dark: parsed.darken(1.1).hex(),
    },
  };
};

const ColorEditorDrawer = ({ color, show, onClose, onChange }) => {
  if (!show) return null;

  const workingHex = safeHex(color);
  const display = useMemo(() => buildDisplayValues(workingHex), [workingHex]);

  const commit = (next) => {
    const normalized = safeHex(next, null);
    if (normalized && onChange) {
      onChange(normalized);
    }
  };

  const parseRgb = (value) => {
    const parts = value
      .replace(/[^\d.,\s-]/g, " ")
      .split(/[\s,]+/)
      .filter(Boolean)
      .map((n) => Number(n));
    if (parts.length === 3 && parts.every((n) => Number.isFinite(n))) {
      const [r, g, b] = parts.map((n) => clamp(Math.round(n), 0, 255));
      commit(chroma.rgb(r, g, b).hex());
    }
  };

  const parseHsl = (value) => {
    const parts = value
      .replace(/[^\d.,\s-]/g, " ")
      .split(/[\s,]+/)
      .filter(Boolean)
      .map((n) => Number(n));
    if (parts.length === 3 && parts.every((n) => Number.isFinite(n))) {
      const [h, s, l] = parts;
      const hue = ((h % 360) + 360) % 360;
      const sat = clamp(s > 1 ? s / 100 : s, 0, 1);
      const light = clamp(l > 1 ? l / 100 : l, 0, 1);
      commit(chroma.hsl(hue, sat, light).hex());
    }
  };

  const parseHsv = (value) => {
    const parts = value
      .replace(/[^\d.,\s-]/g, " ")
      .split(/[\s,]+/)
      .filter(Boolean)
      .map((n) => Number(n));
    if (parts.length === 3 && parts.every((n) => Number.isFinite(n))) {
      const [h, s, v] = parts;
      const hue = ((h % 360) + 360) % 360;
      const sat = clamp(s > 1 ? s / 100 : s, 0, 1);
      const val = clamp(v > 1 ? v / 100 : v, 0, 1);
      commit(chroma.hsv(hue, sat, val).hex());
    }
  };

  const parseCmyk = (value) => {
    const parts = value
      .replace(/[^\d.,\s-]/g, " ")
      .split(/[\s,]+/)
      .filter(Boolean)
      .map((n) => Number(n));
    if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
      const [c, m, y, k] = parts.map((n) => clamp(n, 0, 100) / 100);
      commit(chroma.cmyk(c, m, y, k).hex());
    }
  };

  const parseLab = (value) => {
    const parts = value
      .replace(/[^\d.,\s-]/g, " ")
      .split(/[\s,]+/)
      .filter(Boolean)
      .map((n) => Number(n));
    if (parts.length === 3 && parts.every((n) => Number.isFinite(n))) {
      const [l, a, b] = parts;
      commit(chroma.lab(clamp(l, 0, 100), a, b).hex());
    }
  };

  const parseLch = (value) => {
    const parts = value
      .replace(/[^\d.,\s-]/g, " ")
      .split(/[\s,]+/)
      .filter(Boolean)
      .map((n) => Number(n));
    if (parts.length === 3 && parts.every((n) => Number.isFinite(n))) {
      const [l, c, h] = parts;
      const hue = ((h % 360) + 360) % 360;
      commit(chroma.lch(clamp(l, 0, 100), Math.max(0, c), hue).hex());
    }
  };

  const parseOklch = (value) => {
    const parts = value
      .replace(/[^\d.,\s-]/g, " ")
      .split(/[\s,]+/)
      .filter(Boolean)
      .map((n) => Number(n));
    if (parts.length === 3 && parts.every((n) => Number.isFinite(n))) {
      const [l, c, h] = parts;
      const light = clamp(l, 0, 100) / 100;
      const chromaValue = clamp(c, 0, 1.2);
      const hue = ((h % 360) + 360) % 360;
      commit(chroma.oklch(light, chromaValue, hue).hex());
    }
  };

  const nudge = (delta) => {
    const adjusted =
      delta >= 0
        ? chroma(workingHex).brighten(delta).hex()
        : chroma(workingHex).darken(Math.abs(delta)).hex();
    commit(adjusted);
  };

  return (
    <div className={`color-editor-shell ${show ? "is-open" : ""}`}>
      <div className="color-editor-overlay" onClick={onClose} />
      <div className="color-editor-panel">
        <div className="color-editor-header">
          <div className="color-editor-title">
            <div
              className="color-editor-dot"
              style={{ background: workingHex }}
            />
            <div>
              <p className="eyebrow">Swatch studio</p>
              <h4>Edit & copy values</h4>
            </div>
          </div>
          <button
            className="icon-btn"
            onClick={onClose}
            aria-label="Close color editor"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="color-editor-grid">
          <div className="picker-stack">
            <div className="color-picker-card">
              <HexColorPicker color={workingHex} onChange={commit} />
              <div className="color-picker-inputs">
                <div className="input-with-chip">
                  <span>#</span>
                  <HexColorInput
                    color={workingHex}
                    onChange={(val) =>
                      commit(val.startsWith("#") ? val : `#${val}`)
                    }
                    prefixed
                  />
                </div>
                <div className="nudge-row">
                  {[
                    { label: "-8", delta: -0.8 },
                    { label: "-4", delta: -0.35 },
                    { label: "+4", delta: 0.35 },
                    { label: "+8", delta: 0.8 },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => nudge(item.delta)}
                      className="pill-btn"
                      type="button"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="color-ramps">
              <div className="ramp">
                <span>Lift</span>
                <div
                  className="ramp-bar"
                  style={{
                    background: `linear-gradient(90deg, ${display.ramps.light}, ${workingHex})`,
                  }}
                />
                <code>{display.ramps.light}</code>
              </div>
              <div className="ramp">
                <span>Depth</span>
                <div
                  className="ramp-bar"
                  style={{
                    background: `linear-gradient(90deg, ${workingHex}, ${display.ramps.dark})`,
                  }}
                />
                <code>{display.ramps.dark}</code>
              </div>
            </div>
          </div>

          <div className="models-stack">
            <div className="models-grid">
              <Field
                label="HEX"
                hint="Hex code"
                value={display.hex}
                onSubmit={commit}
              />
              <Field
                label="RGB"
                hint="0-255"
                value={display.rgb}
                onSubmit={parseRgb}
              />
              <Field
                label="HSL"
                hint="deg, %, %"
                value={display.hsl}
                onSubmit={parseHsl}
              />
              <Field
                label="HSV"
                hint="deg, %, %"
                value={display.hsv}
                onSubmit={parseHsv}
              />
              <Field
                label="CMYK"
                hint="%, %, %, %"
                value={display.cmyk}
                onSubmit={parseCmyk}
              />
              <Field
                label="LAB"
                hint="L, a, b"
                value={display.lab}
                onSubmit={parseLab}
              />
              <Field
                label="LCH"
                hint="L, C, h°"
                value={display.lch}
                onSubmit={parseLch}
              />
              <Field
                label="OKLCH"
                hint="L%, C, h°"
                value={display.oklch}
                onSubmit={parseOklch}
              />
            </div>
            <div className="model-footnote">
              Press Enter or blur to commit. Use Copy on any row to grab the
              current value.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorEditorDrawer;
