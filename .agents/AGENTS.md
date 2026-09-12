# Strudel + Vite Development Rules

## Audio and Strudel Instantiation
When working with Strudel in this project, there is a known critical bug where Vite's dependency optimizer will duplicate the `superdough` (sound map) internal registry if Strudel is imported from pre-bundled `dist` files and unbundled files simultaneously. This leads to the "sound not found" error because the `<strudel-editor>` component reads from a completely different registry than the one modified by custom JavaScript code.

To prevent this:
1. **Never** import `@strudel/web`. It causes module duplication when used alongside `@strudel/repl`.
2. **Always** import `@strudel/repl/index.mjs` directly (forcing compilation from source, bypassing the pre-bundled `dist`).
3. **Always** import audio utilities (`registerSound`, `samples`, `getAudioContext`) exclusively from `@strudel/webaudio`.
4. **Encapsulate** all Strudel initialization and audio calls inside `audioSystem.js`. Do not pollute `main.js` or UI components with Strudel configuration imports.

By following this exact pattern, Vite can successfully deduplicate the dependency graph so that all audio registers globally for the `<strudel-editor>`.
