/**
 * Jest cannot parse the Tailwind/Uniwind CSS entry point that App.tsx imports
 * for its side effects. Styling is verified by the token guard and the
 * global.css contract test, which read the stylesheet as text, so stubbing it
 * here costs no coverage.
 */
module.exports = {};
