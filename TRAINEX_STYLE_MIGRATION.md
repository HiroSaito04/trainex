# TRAINEX website CSS consolidation

This change keeps **every website source CSS file** under `apps/web/src/assets/styles/`. It does not modify the 2D SVG artwork, the 3D model, the train simulation engine, or other packages.

## Installation (Windows / PowerShell)

1. Make a backup or commit your current changes.
2. Extract `TRAINEX_styles_patch.zip` **at the TRAINEX repository root** (the folder that contains `apps`, `packages`, and the root `package.json`). Let it overwrite matching source files.
3. Run the included `remove-obsolete-web-styles.ps1` file from that repository root, OR manually delete the seven obsolete CSS files listed below.
4. Rebuild and test:

```powershell
node --test apps/web/tests/*.test.mjs
npm.cmd run build --workspace=./apps/web
npm.cmd run dev --workspace=./apps/web
```

On PowerShell versions where `*.test.mjs` is not expanded to multiple filenames, use `node --test apps/web/tests` instead.

## Old files to delete

These have been moved, and the JSX import paths have already been updated:

- `apps/web/src/components/common/BrandWordmark.css`
- `apps/web/src/components/common/Footer.css`
- `apps/web/src/components/common/NavBar.css`
- `apps/web/src/components/common/navigation/header.css`
- `apps/web/src/components/common/navigation/desktop.css`
- `apps/web/src/components/common/navigation/mobile.css`
- `apps/web/src/components/simulation/Trainex2DConnected.css`

The new CSS files are under `apps/web/src/assets/styles/components/`, including `components/navigation/`.

## What changes

- Relocated the seven website component CSS files.
- Fixed the corresponding `.jsx` import paths and the navigation CSS sub-imports.
- Removed the one inline style in `TrainingPage.jsx`; its progress indicator now uses native `<progress>` styled in `styles/pages/education.css`.
- Updated source tests and added a rule that detects CSS accidentally placed outside `src/assets/styles`.
- Preserved the previous offline 2D service-worker fix (the optional full source ZIP includes it, but the style-only patch does not alter it).

## Important

`apps/web/dist/` contains **generated build output**, including bundled CSS in `dist/assets/`. Do not manually edit or move anything there: rebuild to regenerate it. `node_modules/` is dependency cache, not source.

Separate `packages/simulator-2d/` and `packages/simulator-3d/` keep their package-specific styles because this is a **website-only** reorganization.
