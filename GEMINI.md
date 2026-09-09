# Antigravity Design & Animation Excellence Rules

When designing, building, or modifying user interfaces, components, pages, or styling across this project, adhere strictly to these non-negotiable principles:

## 1. Aesthetic & Taste Standards (Leon Lin's Taste Rails & high-end-visual-design)
- **Eliminate AI-Slop**: Avoid generic pastel gradients, rainbow text, and heavy box-in-a-box nested containers.
- **Double-Bezel Architecture (Doppelrand)**: For cards and elevated surfaces, use a subtle outer shell with concentric calculated inner border radius (`rounded-[calc(2rem-0.375rem)]`).
- **Button-in-Button Trailing Icons**: Interactive pills with trailing icons must nest the icon inside its own distinct circular wrapper (`w-7 h-7 rounded-full bg-white/10 flex items-center justify-center`).
- **Hairline Borders**: Use semi-transparent borders (`border-slate-200/80` in light mode, `border-white/[0.08]` in dark mode) instead of thick solid borders.
- **Tabular Numerics**: Always use `font-mono tabular-nums` for prices, timestamps, metrics, order totals, and table columns to ensure stable alignment.
- **Optical Tightening**: Headings `text-xl` and above must have tightened letter-spacing (`tracking-[-0.03em]` or `-0.02em`).
- **Dark Mode Depth**: Avoid flat `#000000`. Use deep slates and zincs (`#09090b`, `#07090f`, `#0f172a`) with layered surface opacity.

## 2. Physical & Natural Motion Standards (Emil Kowalski Animation & ui-motion)
- **Purpose Over Decoration**: Animate only for feedback (<150ms), state changes (150-250ms), and spatial continuity (250-350ms).
- **Zero Layout Jank**: ONLY animate GPU-accelerated properties (`transform` and `opacity`). Never animate `width`, `height`, `margin`, or `top` directly.
- **Physics Easing**: Use snappy decelerating curves (`cubic-bezier(0.16, 1, 0.3, 1)`) for UI entrances rather than CSS default `ease-in-out`.
- **Tactile Feedback**: Interactive buttons must provide tactile feedback (`active:scale-[0.98] transition-transform duration-100`).
- **Accessibility**: Always respect `@media (prefers-reduced-motion)` via `motion-safe:` / `motion-reduce:`.

## 3. High-Impact Visual Hierarchy (The Impactable UI & UI-UX Pro Max)
- **3-Second Focal Rule**: Every screen must have one undeniable visual anchor, an intuitive catalyst action, and supporting proof metrics.
- **Ambient Lighting**: Use subtle radial spotlights and backdrop blurs (`backdrop-blur-xl`) to give surfaces dimensional glassmorphic depth.
- **Active Skills Reference**: Use `@high-end-visual-design`, `@ui-ux-pro-max`, `@minimalist-ui`, `@magic-ui-generator`, `@landing-page-generator`, `@leon-taste`, and `@kowalski-animation` when crafting layouts.
