# TRAINEX website styles

All **website source CSS** is kept below `apps/web/src/assets/styles/`.

- `index.css` imports Tailwind and shared styles.
- `tokens.css`, `base.css`, `layout.css` define theme variables, elements, and layout.
- `components/` owns reusable web component styles (including `navigation/` partials).
- `pages/` owns page-level styling.

JSX components import their corresponding files from this folder. Do not create new `.css` files alongside `.jsx` files. Dynamic UI values, such as the training progress, should use semantic HTML rather than inline CSS when possible.

`dist/assets/*.css` is generated automatically by Vite and is not a source stylesheet. The separate simulator workspaces under `packages/` keep their own styles.
