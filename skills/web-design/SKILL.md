---
name: web-design
description: Frontend design and development for gm-tc.tech website. Use when creating pages, components, styling, layouts, or any visual/UI work. Covers HTML, CSS, JavaScript, responsive design, and accessibility.
---

# Web Design

Frontend development patterns for gm-tc.tech.

## Design Principles

- **Mobile-first**: Start with mobile layouts, scale up
- **Performance**: Minimize dependencies, optimize assets
- **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation
- **Consistency**: Reusable components, CSS variables for theming

## File Structure

```
/var/www/virtual/<user>/html/
├── index.html
├── css/
│   ├── main.css          # Core styles
│   ├── components.css    # Reusable component styles
│   └── responsive.css    # Media queries
├── js/
│   ├── main.js           # Core functionality
│   └── components/       # Modular JS
├── assets/
│   ├── images/
│   └── fonts/
└── pages/                # Additional HTML pages
```

## CSS Architecture

Use CSS custom properties for theming:

```css
:root {
  --color-primary: #...;
  --color-secondary: #...;
  --color-text: #...;
  --color-bg: #...;
  --font-body: '...', sans-serif;
  --font-heading: '...', serif;
  --spacing-unit: 8px;
  --border-radius: 4px;
}
```

Component naming: BEM-inspired (`block__element--modifier`).

## Responsive Breakpoints

```css
/* Mobile first, then: */
@media (min-width: 640px)  { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1280px) { /* Large desktop */ }
```

## Performance Checklist

- [ ] Images: WebP format, lazy loading, srcset for responsive
- [ ] CSS: Critical CSS inline, defer non-critical
- [ ] JS: Defer/async loading, minimize bundle size
- [ ] Fonts: Font-display: swap, preload critical fonts
