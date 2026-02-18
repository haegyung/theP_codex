import * as React from 'react';
import * as ReactDOM from 'react-dom/client';

import {
  MsButton,
  MsCard,
  MsDialog,
  MsFluentTheme,
  MsInput,
} from './fluent-wrappers';
import './fluent-theme.css';

type ThemeMode = 'light' | 'dark' | 'highContrast';

const themeOptions: Array<{ key: ThemeMode; label: string }> = [
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
  { key: 'highContrast', label: 'High Contrast' },
];

function readMediaQuery(query: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia(query).matches;
}

function bindMediaQueryChange(query: MediaQueryList, callback: () => void) {
  if (typeof query.addEventListener === 'function') {
    query.addEventListener('change', callback);
    return () => query.removeEventListener('change', callback);
  }

  if (typeof query.addListener === 'function') {
    query.addListener(callback);
    return () => query.removeListener(callback);
  }

  return () => {};
}

function ThemeButtons({
  theme,
  onChange,
}: {
  theme: ThemeMode;
  onChange: (nextTheme: ThemeMode) => void;
}) {
  return (
    <div role="group" aria-label="Theme mode switch" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {themeOptions.map((option) => {
        const isSelected = theme === option.key;
        return (
          <MsButton
            key={option.key}
            variant="secondary"
            state={isSelected ? 'selected' : undefined}
            aria-pressed={isSelected}
            onClick={() => onChange(option.key)}
          >
            {option.label}
          </MsButton>
        );
      })}
      <span
        aria-live="polite"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          fontSize: 'var(--ms-font-size-caption)',
          color: 'var(--ms-color-foreground-muted)',
        }}
      >
        Current theme: {theme}
      </span>
    </div>
  );
}

function StateBadges() {
  const [motionReduced, setMotionReduced] = React.useState(() =>
    readMediaQuery('(prefers-reduced-motion: reduce)'),
  );
  const [forcedColors, setForcedColors] = React.useState(() =>
    readMediaQuery('(forced-colors: active)'),
  );

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const forcedColorsQuery = window.matchMedia('(forced-colors: active)');
    const update = () => {
      setMotionReduced(motionQuery.matches);
      setForcedColors(forcedColorsQuery.matches);
    };

    update();
    const cleanupMotion = bindMediaQueryChange(motionQuery, update);
    const cleanupForcedColors = bindMediaQueryChange(forcedColorsQuery, update);

    return () => {
      cleanupMotion();
      cleanupForcedColors();
    };
  }, []);

  return (
    <MsCard title="Accessibility Signals">
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <span
          style={{
            border: '1px solid var(--ms-color-surface-border)',
            background: 'var(--ms-color-background-subtle)',
            padding: '4px 10px',
            borderRadius: 999,
            fontSize: 'var(--ms-font-size-caption)',
          }}
        >
          Reduced motion: {motionReduced ? 'on' : 'off'}
        </span>
        <span
          style={{
            border: '1px solid var(--ms-color-surface-border)',
            background: 'var(--ms-color-background-subtle)',
            padding: '4px 10px',
            borderRadius: 999,
            fontSize: 'var(--ms-font-size-caption)',
          }}
        >
          Forced colors: {forcedColors ? 'on' : 'off'}
        </span>
      </div>
    </MsCard>
  );
}

function TokenSwatches() {
  const swatches = [
    ['brand-background', 'var(--ms-color-brand-background)'],
    ['brand-selected', 'var(--ms-color-brand-selected)'],
    ['surface-card', 'var(--ms-color-surface-card)'],
    ['focus-color', 'var(--ms-focus-color)'],
  ];

  return (
    <MsCard title="Token Quick View">
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        {swatches.map(([name, color]) => (
          <div
            key={name}
            style={{
              border: '1px solid var(--ms-color-surface-border)',
              borderRadius: 'var(--ms-radius-medium)',
              background: 'var(--ms-color-surface-card)',
              padding: 'var(--ms-spacing-12)',
            }}
          >
            <div
              style={{
                marginBottom: 'var(--ms-spacing-8)',
                fontWeight: 'var(--ms-font-weight-semibold)',
                fontSize: 'var(--ms-font-size-body)',
              }}
            >
              {name}
            </div>
            <div
              style={{
                height: 28,
                borderRadius: 'var(--ms-radius-small)',
                border: '1px solid var(--ms-color-surface-border)',
                background: color,
              }}
            />
          </div>
        ))}
      </div>
    </MsCard>
  );
}

export function FluentReactDemoApp() {
  const [open, setOpen] = React.useState(false);
  const [theme, setTheme] = React.useState<ThemeMode>('light');

  return (
    <MsFluentTheme theme={theme}>
      <main
        style={{
          maxWidth: 980,
          margin: '0 auto',
          padding: 'clamp(16px, 3vw, 32px)',
          display: 'grid',
          gap: 'var(--ms-spacing-16)',
        }}
      >
        <section
          style={{
            borderRadius: 16,
            padding: 'clamp(18px, 2.6vw, 28px)',
            color: 'var(--ms-color-text-onBrand)',
            background:
              'linear-gradient(135deg, var(--ms-color-brand-background) 0%, var(--ms-color-brand-hover) 48%, var(--ms-color-brand-focus) 100%)',
            boxShadow: '0 20px 40px rgba(0, 76, 138, 0.26)',
          }}
        >
          <h1 style={{ margin: 0, lineHeight: 1.12 }}>Fluent React Demo (Ms wrappers)</h1>
          <p style={{ margin: 'var(--ms-spacing-12) 0 0', color: 'rgba(255, 255, 255, 0.9)' }}>
            실제 React 렌더 환경에서 MsButton/MsInput/MsDialog 접근성과 상태 표현을 확인하는
            샘플입니다.
          </p>
        </section>

        <MsCard title="Theme Control + Dialog">
          <ThemeButtons theme={theme} onChange={setTheme} />
          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <MsButton onClick={() => setOpen(true)}>Open Fluent dialog</MsButton>
            <MsButton variant="secondary" onClick={() => setTheme('highContrast')}>
              Jump to HC mode
            </MsButton>
          </div>
        </MsCard>

        <MsCard title="Form Controls">
          <div style={{ display: 'grid', gap: 12 }}>
            <MsInput
              label="Email"
              placeholder="you@example.com"
              helperText="helper text는 aria-describedby와 연결됩니다."
            />
            <MsInput
              label="Search"
              defaultValue="invalid state sample"
              state="invalid"
              helperText="유효하지 않은 상태는 에러 토큰 색으로 표시됩니다."
            />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <MsButton>Primary</MsButton>
              <MsButton variant="secondary">Secondary</MsButton>
              <MsButton variant="secondary" state="selected">
                Selected
              </MsButton>
              <MsButton disabled>Disabled</MsButton>
            </div>
          </div>
        </MsCard>

        <TokenSwatches />
        <StateBadges />

        <MsDialog
          open={open}
          title="Fluent Dialog"
          onClose={() => setOpen(false)}
        >
          <p style={{ margin: 0 }}>
            Escape 키, 포커스 트랩, 백드롭 클릭 닫기 등 기본 접근성 동작을 포함합니다.
          </p>
          <div className="ms-fluent-dialog-actions">
            <MsButton variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </MsButton>
            <MsButton onClick={() => setOpen(false)}>Confirm</MsButton>
          </div>
        </MsDialog>
      </main>
    </MsFluentTheme>
  );
}

export function mountFluentReactDemo(rootId = 'fluent-react-demo-root') {
  if (typeof document === 'undefined') {
    return () => {};
  }

  const mountNode = document.getElementById(rootId);
  if (!mountNode) {
    return () => {};
  }

  const root = ReactDOM.createRoot(mountNode);
  root.render(<FluentReactDemoApp />);
  return () => root.unmount();
}

if (
  typeof document !== 'undefined' &&
  document.getElementById('fluent-react-demo-root')
) {
  mountFluentReactDemo('fluent-react-demo-root');
}
