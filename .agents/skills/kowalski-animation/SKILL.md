---
name: kowalski-animation
description: Motion design and UI animation principles based on Emil Kowalski (Animations on the Web). Use whenever adding transitions, animations, hover effects, modal entrances, list reordering, expanding panels, or interactive motion to ensure 60fps GPU acceleration, physics-based spring easings, zero layout shift, and accessibility.
---

# Emil Kowalski's Animation System (Physics-Based UI Motion)

This skill guides the implementation of natural, fluid, and high-performance animations based on the standards of Emil Kowalski (*Animations on the Web*).

## Non-Negotiable Core Principles

1. **Purpose Over Decoration**:
   Animation must inform the user about spatial changes, provide feedback, or guide focus. Never animate an element just to make it move.
2. **Strict GPU Acceleration (Zero Layout Shift)**:
   - **DO ANIMATE**: `transform` (`translateX`, `translateY`, `scale`, `rotate`) and `opacity`.
   - **NEVER ANIMATE**: `width`, `height`, `top`, `left`, `right`, `bottom`, `margin`, `padding`, or `border-width` directly (these trigger CPU layout recalculation and cause 30fps jank).
3. **Natural Physics Easing**:
   Throw away CSS default `linear` and `ease-in-out`. Real objects accelerate instantly and decelerate smoothly with friction.
4. **Reduced Motion Accessibility**:
   Always respect user accessibility preferences.

---

## 1. Golden Easing Curves & Durations

### Tailwind CSS Custom Easing Extensions
```javascript
// Add to tailwind.config.js or css variables
transitionTimingFunction: {
  'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',   // Primary UI entrance (snappy, smooth landing)
  'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',  // Subtle hover & focus
  'in-quart': 'cubic-bezier(0.7, 0, 0.84, 0)',   // Dismiss / exit
}
```

### Motion Durations
- **Micro-interactions (Hover, Click, Toggle)**: `100ms` to `150ms`
- **State Changes (Dropdowns, Tooltips, Accordions)**: `200ms` to `250ms`
- **Large Context Shifts (Modals, Slide-over Sheets, Page Transitions)**: `300ms` to `350ms`
- *Rule*: Anything longer than `400ms` feels sluggish and frustrates users.

---

## 2. Kowalski's Interactive Motion Patterns

### A. The Tactile Button Press
Buttons should feel physically responsive under the finger or cursor:
```html
<button class="transition-all duration-150 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]">
  Click Me
</button>
```

### B. Modal Dialog Smooth Entrance & Exit
- Backdrop: Fade `opacity-0` to `opacity-100` (`duration-200`)
- Dialog Box: Scale from `scale-95` to `scale-100` and translate `translate-y-2` to `translate-y-0` with `ease-[cubic-bezier(0.16,1,0.3,1)]`:
```html
<!-- Dialog Container -->
<div class="transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform opacity-100 scale-100 translate-y-0">
  ...
</div>
```

### C. The CSS Grid Height Collapse (Without Layout Jank)
To animate an accordion or expanding dropdown without animating `height`:
```html
<div class="grid transition-[grid-template-rows] duration-200 ease-out" 
     style="grid-template-rows: var(--expanded, 0fr);">
  <div class="overflow-hidden">
    <!-- Expanding content goes here -->
  </div>
</div>
```
Toggle `--expanded: 1fr` to expand smoothly!

### D. Framer Motion Spring Configuration
When using `framer-motion`:
```javascript
// Premium snappy spring without bounce
export const springTransition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
  mass: 0.8,
};

// Fluid drawer / sheet spring
export const sheetSpring = {
  type: "spring",
  stiffness: 300,
  damping: 32,
};
```

---

## 3. Accessibility Requirement (`prefers-reduced-motion`)

Always ensure transitions gracefully degrade for users with motion sensitivity:
```html
<div class="motion-safe:transition-transform motion-safe:duration-200 motion-reduce:transition-none">
```
Or in CSS:
```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
