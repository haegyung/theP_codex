import * as React from "react";
import * as ReactDOM from "react-dom/client";

import {
	MsDialog,
	MsFluentTheme,
	MsButton,
	MsInput,
	MsCard,
} from "./fluent-wrappers";
import "./fluent-theme.css";

/*
Rendered at runtime example:
<div class="ms-fluent-root" data-ms-theme="light">
  <main>
    <section class="ms-fluent-card">...</section>
    <button class="ms-fluent-button">Open Fluent dialog</button>
    <input class="ms-fluent-input" />
    <div class="ms-fluent-dialog-backdrop">
      <div class="ms-fluent-dialog">...</div>
    </div>
  </main>
</div>
React renderer: ReactDOM.createRoot(...).render(<FluentReactDemoApp />)
*/

type ThemeMode = "light" | "dark" | "highContrast";

function ThemeButtons({
	theme,
	onChange,
}: {
	theme: ThemeMode;
	onChange: (nextTheme: ThemeMode) => void;
}) {
	return (
		<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
			<MsButton onClick={() => onChange("light")}>Light</MsButton>
			<MsButton onClick={() => onChange("dark")}>Dark</MsButton>
			<MsButton onClick={() => onChange("highContrast")}>
				High Contrast
			</MsButton>
			<span
				aria-live="polite"
				style={{ display: "inline-block", marginTop: 9, fontSize: "12px" }}
			>
				Current theme: {theme}
			</span>
		</div>
	);
}

function StateBadges() {
	const [motionReduced, setMotionReduced] = React.useState(
		window.matchMedia("(prefers-reduced-motion: reduce)").matches,
	);
	const [forcedColors, setForcedColors] = React.useState(
		window.matchMedia("(forced-colors: active)").matches,
	);

	React.useEffect(() => {
		const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
		const forcedColorsMq = window.matchMedia("(forced-colors: active)");
		const update = () => {
			setMotionReduced(motionMq.matches);
			setForcedColors(forcedColorsMq.matches);
		};
		update();

		motionMq.addEventListener("change", update);
		forcedColorsMq.addEventListener("change", update);
		return () => {
			motionMq.removeEventListener("change", update);
			forcedColorsMq.removeEventListener("change", update);
		};
	}, []);

	return (
		<div>
			<MsCard title="Accessibility State">
				<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
					<span
						style={{
							border: "1px solid var(--ms-color-surface-border)",
							padding: "4px 8px",
							borderRadius: 999,
						}}
					>
						Reduced motion: {motionReduced ? "on" : "off"}
					</span>
					<span
						style={{
							border: "1px solid var(--ms-color-surface-border)",
							padding: "4px 8px",
							borderRadius: 999,
						}}
					>
						Forced colors: {forcedColors ? "on" : "off"}
					</span>
				</div>
			</MsCard>
		</div>
	);
}

export function FluentReactDemoApp() {
	const [open, setOpen] = React.useState(false);
	const [theme, setTheme] = React.useState<ThemeMode>("light");

	return (
		<MsFluentTheme theme={theme}>
			<main
				style={{
					maxWidth: 920,
					margin: "0 auto",
					padding: "var(--ms-spacing-24)",
				}}
			>
				<h1 style={{ marginTop: 0 }}>Fluent React Demo (Ms wrappers)</h1>
				<p style={{ color: "var(--ms-color-foreground-muted)" }}>
					This file is a React rendering example where MsButton/MsInput/MsDialog
					are real React components and apply <code>fluent-theme.css</code>{" "}
					token styles at runtime.
				</p>

				<MsCard title="Theme Control + Token Smoke">
					<ThemeButtons theme={theme} onChange={setTheme} />
					<MsButton style={{ marginTop: 12 }} onClick={() => setOpen(true)}>
						Open Fluent dialog
					</MsButton>
				</MsCard>

				<MsCard title="Form controls">
					<div style={{ display: "grid", gap: 12 }}>
						<MsInput
							label="Email"
							placeholder="you@example.com"
							helperText="tokenized spacing/font/foreground are applied via CSS vars"
						/>
						<MsInput
							label="Search"
							placeholder="search query"
							disabled
							defaultValue="disabled state sample"
							helperText="disabled state follows --ms-input-*/disabled related token behavior"
						/>
						<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
							<MsButton>Primary</MsButton>
							<MsButton disabled>Disabled</MsButton>
						</div>
					</div>
				</MsCard>

				<StateBadges />

				<MsDialog
					open={open}
					title="Fluent Dialog"
					onClose={() => setOpen(false)}
				>
					<p>
						Dialog is mounted/unmounted by React state and inherits dialog/card
						token styles.
					</p>
				</MsDialog>
			</main>
		</MsFluentTheme>
	);
}

export function mountFluentReactDemo(rootId = "fluent-react-demo-root") {
	if (typeof document === "undefined") {
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
	typeof document !== "undefined" &&
	document.getElementById("fluent-react-demo-root")
) {
	mountFluentReactDemo("fluent-react-demo-root");
}
