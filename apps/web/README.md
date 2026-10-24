# TRAINEX Web Workspace

Browser-based website for the TRAINEX modular railway training platform.

Run from the monorepo root:

```sh
npm install --include=optional
npm run dev --workspace=./apps/web
npm run build --workspace=./apps/web
node --test ./apps/web/tests/modularity.test.mjs
```

Routes: `/`, `/simulators`, `/simulators/2d`, `/simulators/3d`, `/learn`, `/train`, `/glossary`, `/hardware`, `/about`, `/about/guide` plus lesson/component/guide details.

## CSS ownership

`src/assets/styles/tokens.css` is the only source of global theme colors. `index.css` brings in the global and generic shared CSS. Page-level CSS is imported by individual route components; navbar and footer CSS are imported by their own components. For the list of files and responsibilities, see the archive's `README-RESTORE-APPS.md`.

The browser app connects to the preexisting `@trainex/*` workspace packages. It does not implement a second Simulation Engine.
