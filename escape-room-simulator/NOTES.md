# Notes

## 2026-05-21
Normalized the project documentation into a consistent convention by consolidating the useful content from `DESIGN_GUIDE.md` and `PROJECT_RESUME.md` into the newer `README.md` and `STATE.md` files. The project is still the same lightweight Vite + React + TypeScript escape-room prototype, but the docs now have a clearer division: `README.md` for overview, `STATE.md` for durable implementation decisions, and this file for the running log.

Open questions:
- Should the legacy planning files be kept for reference, or eventually removed after confirming nothing unique remains in them?
- Should the first follow-up focus on fixing the current puzzle/content logic before adding any more rooms?
- Would it be better to introduce a clearer action model now rather than layering more button handlers onto the prototype?

Next step:
- Fix the sample content so the initial locked-object flow is internally consistent and demonstrates the intended progression.
