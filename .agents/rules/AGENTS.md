# Global Frontend Design & Motion Excellence Rules

When designing, building, or modifying user interfaces, components, pages, or styling across any project, adhere strictly to these non-negotiable principles:

## 1. Aesthetic & Taste Standards (Leon Lin's Taste Rails)
- **Eliminate AI-Slop**: Avoid generic pastel gradients, rainbow text, and heavy box-in-a-box nested containers.
- **Hairline Borders**: Use semi-transparent borders (`border-slate-200/80` in light mode, `border-white/[0.08]` in dark mode) instead of thick solid borders.
- **Tabular Numerics**: Always use `font-mono tabular-nums` for prices, timestamps, metrics, order totals, and table columns to ensure stable alignment.
- **Optical Tightening**: Headings `text-xl` and above must have tightened letter-spacing (`tracking-tight` or `-0.02em`).
- **Dark Mode Depth**: Avoid flat `#000000`. Use deep slates and zincs (`#09090b`, `#0f172a`, `#18181b`) with layered surface opacity.

## 2. Physical & Natural Motion Standards (Emil Kowalski Animation System)
- **Purpose Over Decoration**: Animate only for feedback (<150ms), state changes (150-250ms), and spatial continuity (250-350ms).
- **Zero Layout Jank**: ONLY animate GPU-accelerated properties (`transform` and `opacity`). Never animate `width`, `height`, `margin`, or `top` directly.
- **Physics Easing**: Use snappy decelerating curves (`cubic-bezier(0.16, 1, 0.3, 1)`) for UI entrances rather than CSS default `ease-in-out`.
- **Tactile Feedback**: Interactive buttons must provide tactile feedback (`active:scale-[0.98] transition-transform duration-100`).
- **Accessibility**: Always respect `@media (prefers-reduced-motion)` via `motion-safe:` / `motion-reduce:`.

## 3. High-Impact Visual Hierarchy (The Impactable UI)
- **3-Second Focal Rule**: Every screen must have one undeniable visual anchor, an intuitive catalyst action, and supporting proof metrics.
- **Ambient Lighting**: Use subtle radial spotlights and backdrop blurs (`backdrop-blur-md` or `backdrop-blur-xl`) to give surfaces dimensional glassmorphic depth.
