# Specification

## Summary
**Goal:** Fix the production deployment so the React app reliably loads (no blank page), and add a minimal user-visible fallback message if boot fails.

**Planned changes:**
- Identify and fix the remaining root cause of the production blank page so the deployed site serves the built app correctly in a fresh browser session and after a hard refresh.
- Harden deployment/static hosting configuration so production serves only `dist/` build outputs (including ICP asset canister settings) and cannot regress to serving the Vite dev `frontend/index.html` or referencing `/src/main.tsx`.
- Add a minimal English error fallback that renders when the app fails to mount (e.g., script load failure), providing basic refresh guidance without relying on backend connectivity.

**User-visible outcome:** Visiting the production URL shows the app (Auth when signed out, Discover when signed in) instead of a blank page; if a catastrophic boot failure occurs, users see a simple English “failed to load” message with refresh guidance rather than an empty screen.
