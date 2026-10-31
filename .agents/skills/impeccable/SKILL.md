---
name: impeccable
description: Use when designing, redesigning, critiquing, auditing, polishing, or refining frontend interfaces (web, UI components, layouts, responsive design, typography, spacing, colors). Prevents generic AI design slop and enforces production-grade craft.
---

# Impeccable Design Skill

System to craft frontend interfaces with high visual and UX standards. Ban generic "AI slop" (forced Inter font, purple-to-blue gradients, nested card spam).

## Commands

### Planning & Setup
- `/impeccable init` - Inspect project context; create or update `PRODUCT.md` and `DESIGN.md`.
- `/impeccable shape [target]` - Define layout structure and UX flows before coding.
- `/impeccable document` - Extract and document design tokens and styles in `DESIGN.md`.

### Evaluation & Auditing
- `/impeccable audit [target]` - Check accessibility (a11y), responsive behavior, performance, layout robustness.
- `/impeccable critique [target]` - UX heuristics, visual hierarchy, clarity review.
- `/impeccable detect` - Scan for anti-patterns (nested cards, low contrast, clashing palettes).

### Refinement & Craft
- `/impeccable polish [target]` - Tune spacing, micro-interactions, alignments before shipping.
- `/impeccable bolder [target]` - Make timid, bland UI distinctive and intentional.
- `/impeccable quieter [target]` - Tone down overly noisy, busy UI elements.
- `/impeccable typeset [target]` - Fix font scale, rhythm, line-lengths, heading hierarchy.
- `/impeccable layout [target]` - Optimize grid, flex, alignment, negative space.

## Core Anti-Patterns (BANNED)
1. **Generic Palettes:** Never default to purple/blue gradients or gray-on-saturated color.
2. **Card Recursion:** No cards inside cards inside cards. Use subtle separators or spacing.
3. **Typography Blindness:** Do not force generic Inter on everything. Match typography to project character.
4. **Low Contrast / Bad Hierarchy:** Ensure clear contrast ratios and strict type scale.

