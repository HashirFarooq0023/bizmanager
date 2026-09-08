---
name: leon-taste
description: Frontend design taste and aesthetic review rails created by Leon Lin (taste-skill). Use whenever designing, building, or styling web interfaces, components, landing pages, or dashboards to avoid generic AI-slop and ensure Linear/Stripe/Apple-level aesthetic polish, typography hierarchy, refined color palettes, and deliberate density.
---

# Leon's Taste Skill (Frontend Aesthetic Review Rails)

This skill provides non-negotiable frontend design principles to prevent generic "AI-generated" aesthetics (AI-slop) and guide the creation of interfaces with the taste and polish of top-tier product engineering teams (Linear, Stripe, Apple, Raycast).

## Core Philosophy: The "Would They Ship This?" Rule
Before finalizing any UI component, ask: *"Would a senior design engineer at Linear, Stripe, or Vercel ship this component exactly as written?"* If it looks like a generic Tailwind component library template, refine it.

---

## 1. Anti-AI-Slop Guardrails (What NOT to Do)

1. **NO Random Rainbow Gradients**: Never use multi-colored saturated gradients on text or card backgrounds (e.g. pink-to-purple-to-cyan). Use single-hue luminous glow, subtle radial spotlights, or monochromatic depth.
2. **NO Box-in-a-Box Nesting Syndrome**: Avoid wrapping cards inside cards with double borders and nested heavy padding. Use subtle horizontal dividers (`border-t border-slate-200/60 dark:border-white/[0.06]`), whitespace, or surface tonal shifts instead.
3. **NO Oversized Clunky Controls**: Avoid massive rounded-full pill buttons with giant icons unless specifically designing for mobile touch targets. Default to crisp, modern control heights (`h-8` to `h-10`, `rounded-lg`).
4. **NO Pure Flat Black/White**: In dark mode, avoid `#000000` background with `#ffffff` text. Use deep rich slates or zincs (`#09090b`, `#0f172a`, `#18181b`) with layered opacity (`text-slate-900 dark:text-slate-100`).
5. **NO Unstyled Native Elements**: Never render default unstyled browser scrollbars, focus rings, date pickers, or file uploaders.

---

## 2. Typography Precision & Hierarchy

- **Optical Heading Tightening**: Any heading `text-xl` or larger MUST have tightened letter-spacing:
  ```html
  <h1 class="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
  ```
- **Monospaced Numerics (Tabular Figures)**:
  Any table, price, timestamp, inventory quantity, or metric MUST use tabular monospaced numbers to prevent visual jitter and alignment shift:
  ```html
  <span class="font-mono tabular-nums tracking-tight font-semibold">$1,249.00</span>
  ```
- **Two-Tone Text Contrast**:
  Always clearly separate primary data labels from secondary contextual metadata:
  ```html
  <div class="flex flex-col">
    <span class="text-sm font-medium text-slate-900 dark:text-slate-100">Total Revenue</span>
    <span class="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Compared to previous 30 days</span>
  </div>
  ```

---

## 3. Surface Depth, Hairline Borders & Shadows

Modern high-end interfaces use subtle surface elevation and hairline borders rather than heavy drop shadows:

- **Hairline Border Rule**:
  Use semi-transparent borders so the background tone peeks through:
  - Light mode: `border border-slate-200/80` or `border-slate-900/[0.08]`
  - Dark mode: `border border-white/[0.08]` or `border-zinc-800/80`
- **Layered Dual Shadow**:
  Instead of a single harsh shadow, combine a sharp 1px contact shadow with an ambient soft blur:
  ```css
  shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]
  ```
- **Frosted Glass (Backdrop Blur)**:
  For floating headers, command bars, dropdowns, and modals:
  ```html
  <div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/60 dark:border-white/10 shadow-lg">
  ```

---

## 4. Visual Density Tiers

1. **Compact Density** (Financial tables, POS checkout lines, ledger, inventory grids):
   - Row height: `py-2` to `py-2.5`
   - Text size: `text-xs` to `text-sm`
   - Padding: `px-3`
   - High information bandwidth without feeling cluttered.
2. **Balanced Density** (Forms, settings cards, modal dialogs):
   - Row spacing: `space-y-4`
   - Control heights: `h-9` to `h-10`
   - Padding: `p-5` to `p-6`
3. **Spacious Density** (Auth pages, empty states, hero sections):
   - Generous breathing room: `py-12` to `py-20`
   - Clear focal anchor.

---

## 5. Micro-Polish for Interactive Elements

- **Buttons**:
  Include a subtle top inset border highlight (light source simulation) and active micro-scale:
  ```html
  <button class="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg text-sm font-medium text-white bg-violet-600 hover:bg-violet-500 active:scale-[0.98] shadow-sm shadow-violet-600/20 border border-violet-500/30 transition-all duration-150">
    Save Changes
  </button>
  ```
- **Badges / Status Tags**:
  Avoid harsh saturated backgrounds. Use soft tinted backgrounds with solid dots:
  ```html
  <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
    Paid
  </span>
  ```
