/* @ds-bundle: {"format":3,"namespace":"MimariKursDesignSystem_cc68b6","components":[{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"PageIndicator","sourcePath":"components/core/PageIndicator.jsx"},{"name":"Pill","sourcePath":"components/core/Pill.jsx"},{"name":"StatNumber","sourcePath":"components/core/StatNumber.jsx"}],"sourceHashes":{"components/core/Button.jsx":"c985c47dff4b","components/core/PageIndicator.jsx":"37b89ea2d3c6","components/core/Pill.jsx":"b96b284a240e","components/core/StatNumber.jsx":"7f29f159a011"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.MimariKursDesignSystem_cc68b6 = window.MimariKursDesignSystem_cc68b6 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Button — primary terracotta CTA and supporting variants.
 * Oswald-free; uses Geist for clear, tappable labels.
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  full = false,
  icon = null,
  disabled = false,
  style = {},
  ...rest
}) {
  const sizes = {
    sm: {
      padding: '10px 18px',
      fontSize: 14
    },
    md: {
      padding: '15px 26px',
      fontSize: 16
    },
    lg: {
      padding: '19px 34px',
      fontSize: 18
    }
  };
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    fontFamily: "'Geist', sans-serif",
    fontWeight: 600,
    letterSpacing: '0.01em',
    lineHeight: 1,
    border: '1.5px solid transparent',
    borderRadius: 'var(--mk-radius-pill)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    width: full ? '100%' : 'auto',
    transition: 'background .18s var(--mk-ease), border-color .18s var(--mk-ease), transform .12s var(--mk-ease)',
    ...sizes[size]
  };
  const variants = {
    primary: {
      background: 'var(--mk-accent-500)',
      color: '#fff',
      boxShadow: 'var(--mk-glow-accent)'
    },
    secondary: {
      background: 'var(--mk-bg-elev-1)',
      color: 'var(--mk-ink-primary)',
      borderColor: 'var(--mk-border-medium)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--mk-ink-secondary)',
      borderColor: 'var(--mk-border-subtle)'
    },
    whatsapp: {
      background: 'var(--mk-wa-green)',
      color: '#06310F'
    }
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    disabled: disabled,
    style: {
      ...base,
      ...variants[variant],
      ...style
    }
  }, rest), icon, children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/PageIndicator.jsx
try { (() => {
/**
 * PageIndicator — the "01 / 09" mono progress counter and the
 * segmented Instagram-story progress bar. Two display modes.
 */
function PageIndicator({
  current,
  total,
  mode = 'counter',
  style = {}
}) {
  if (mode === 'bar') {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        width: '100%',
        ...style
      }
    }, Array.from({
      length: total
    }).map((_, i) => /*#__PURE__*/React.createElement("span", {
      key: i,
      style: {
        flex: 1,
        height: 3,
        borderRadius: 999,
        background: i < current ? 'var(--mk-accent-500)' : 'rgba(255,255,255,0.18)',
        boxShadow: i < current ? 'var(--mk-glow-dot)' : 'none'
      }
    })));
  }
  const pad = n => String(n).padStart(2, '0');
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "'Geist Mono', monospace",
      fontSize: 13,
      letterSpacing: '0.12em',
      color: 'var(--mk-ink-quaternary)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--mk-accent-500)'
    }
  }, pad(current)), ' / ', pad(total));
}
Object.assign(__ds_scope, { PageIndicator });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/PageIndicator.jsx", error: String((e && e.message) || e) }); }

// components/core/Pill.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Pill — mono-label capsule eyebrow. The brand's signature
 * outlined tag used above headings ("ATC", "120 SAAT", etc).
 */
function Pill({
  children,
  accent = false,
  dot = false,
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      border: `1.5px solid ${accent ? 'var(--mk-accent-500)' : 'var(--mk-border-medium)'}`,
      color: accent ? 'var(--mk-accent-500)' : 'var(--mk-ink-tertiary)',
      borderRadius: 'var(--mk-radius-pill)',
      padding: '10px 20px',
      fontFamily: "'Geist Mono', monospace",
      fontSize: 11,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      boxShadow: accent ? 'var(--mk-glow-accent)' : 'none',
      ...style
    }
  }, rest), dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: '50%',
      background: 'var(--mk-accent-500)',
      boxShadow: 'var(--mk-glow-dot)'
    }
  }), children);
}
Object.assign(__ds_scope, { Pill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Pill.jsx", error: String((e && e.message) || e) }); }

// components/core/StatNumber.jsx
try { (() => {
/**
 * StatNumber — the hero metric. Big Oswald numeral in terracotta
 * with an optional small label. Used for 120 SAAT, %100, 2TB, 1000+.
 */
function StatNumber({
  value,
  label = '',
  size = 'lg',
  align = 'left',
  style = {}
}) {
  const sizes = {
    sm: 56,
    md: 96,
    lg: 160,
    xl: 220
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: align,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Oswald', sans-serif",
      fontWeight: 700,
      fontSize: sizes[size],
      lineHeight: 0.92,
      letterSpacing: '-0.01em',
      color: 'var(--mk-accent-500)',
      textShadow: 'var(--mk-glow-accent)'
    }
  }, value), label && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Geist Mono', monospace",
      fontSize: 12,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: 'var(--mk-ink-quaternary)',
      marginTop: 10
    }
  }, label));
}
Object.assign(__ds_scope, { StatNumber });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/StatNumber.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.PageIndicator = __ds_scope.PageIndicator;

__ds_ns.Pill = __ds_scope.Pill;

__ds_ns.StatNumber = __ds_scope.StatNumber;

})();
