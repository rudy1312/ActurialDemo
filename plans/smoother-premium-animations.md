# Smoother Premium Animations Plan

## Objective

Polish the existing landing-page motion so it feels smoother, calmer, and more premium without making the interface noticeably busier or changing the Figma-derived layout. Keep the implementation lightweight and dependency-free.

## Current-State Findings

- `src/App.tsx` contains a reusable `Reveal` component backed by one `IntersectionObserver` per instance. Each element becomes visible once at a fixed `0.12` threshold.
- Scroll reveals currently animate `opacity` and `translateY(18px)` for `700ms` with a strong ease-out curve.
- Service rows animate `padding-left`, which causes layout work and is the most likely source of visible roughness during hover.
- Buttons, arrows, navigation underlines, fields, form success feedback, and scroll reveals each use separate durations and easing choices, making the motion feel inconsistent.
- Reduced-motion support already exists and should remain intact.
- No animation library is installed. The requested polish does not require adding one.

## Implementation Plan

### 1. Establish a small shared motion system in `src/index.css`

- Add CSS custom properties for:
  - a soft premium easing curve for entrances and larger transitions;
  - a responsive interaction easing curve for hover/focus feedback;
  - short, medium, and long durations;
  - the standard reveal distance.
- Reuse these values across reveals, buttons, links, form fields, the success panel, and service interactions.
- Keep durations restrained so the site feels responsive rather than floaty.

### 2. Make scroll reveals start more naturally in `src/App.tsx`

- Keep the existing one-time reveal behavior and dependency-free `IntersectionObserver` approach.
- Refine the observer configuration with a small negative bottom `rootMargin` and a low threshold so elements begin easing in before they are deeply inside the viewport.
- Preserve stagger support through the existing `delay` prop.
- Avoid introducing scroll-linked/parallax effects, which would be excessive for the selected subtle-and-premium direction.

### 3. Improve reveal rendering and sequencing in `src/index.css`

- Reduce the vertical travel slightly and combine it with a very small starting scale so entrances settle softly without looking like elements are sliding up.
- Add `will-change` only to unrevealed elements, then reset it after they become visible so the browser can optimize the active transition without keeping unnecessary compositor layers.
- Use separate timing for opacity and transform if needed: opacity should resolve slightly earlier while position settles gently.
- Keep service-row delays modest so the list reads as a coordinated sequence rather than a slow cascade.
- Do not animate layout dimensions, typography, or section geometry.

### 4. Replace layout-affecting service hover motion

- Remove the `padding-left` transition from `.service-row`.
- Apply a small `translateX` to the row’s number/copy content, or to an inner transformable target, so hover movement is compositor-friendly and does not shift neighboring layout.
- Pair the movement with a restrained color treatment on the service title or divider rather than increasing travel.
- Keep the mobile override static, since touch devices should not retain desktop hover movement.

### 5. Harmonize micro-interactions

- Buttons and CTA links:
  - use the shared interaction curve;
  - reduce abrupt vertical lift;
  - smooth the shadow and background transition;
  - retain the arrow’s subtle horizontal movement.
- Navigation underline:
  - preserve the directional reveal but use the shared curve and a slightly softer duration.
- Form fields:
  - smooth border and focus-ring transitions;
  - avoid any transform that could make input text appear unstable.
- Form submission success panel:
  - align its entrance with the general reveal motion;
  - keep the state replacement immediate enough that submitting still feels responsive.
- Add active/pressed feedback for pointer interactions where appropriate, using a tiny transform and no layout movement.

### 6. Preserve accessibility and responsive behavior

- Retain and simplify the existing `prefers-reduced-motion: reduce` behavior so reveals are immediately visible and smooth scrolling/animated transforms are disabled.
- Ensure keyboard focus styles remain visible and are not dependent on hover.
- Avoid continuous motion, parallax, spring overshoot, or animations that replay while scrolling.
- Keep the desktop and mobile layout, content, fonts, local assets, and form behavior unchanged.

## Files Expected to Change

- `src/App.tsx`
  - refine `IntersectionObserver` trigger configuration;
  - only add minimal markup hooks if needed for transform-only service hover behavior.
- `src/index.css`
  - introduce shared motion tokens;
  - update reveal, CTA, navigation, service-row, field, and success-state transitions;
  - maintain reduced-motion and mobile-specific overrides.

No package or asset changes are expected.

## Verification

1. Run `pnpm exec oxfmt --check src/App.tsx src/index.css`.
2. Run `pnpm exec tsc --noEmit`.
3. Run `pnpm build`.
4. In the existing preview, inspect desktop and mobile widths:
   - initial and scroll-triggered reveals begin smoothly with no snapping;
   - service hover no longer causes reflow or neighboring movement;
   - CTA, arrow, navigation, and form focus transitions feel consistent;
   - touch/mobile presentation has no stuck hover offset;
   - success-state transition remains clear and responsive.
5. Emulate `prefers-reduced-motion: reduce` and confirm:
   - all content is visible immediately;
   - anchor scrolling is not animated;
   - hover/reveal transforms and success animation do not play.
6. Confirm the page layout and Figma-matched spacing remain unchanged at rest.

## Acceptance Criteria

- Motion feels visibly smoother but remains subtle and professional.
- Hover interactions use transform/opacity/color/shadow rather than layout-affecting properties.
- Reveal transitions trigger naturally and only once.
- Durations and easing feel coherent across the page.
- No new runtime dependency is added.
- No static layout, copy, asset, form-flow, or responsive behavior regresses.
- Reduced-motion users receive a stable, immediately readable interface.
