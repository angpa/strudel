# Strudel + Vite Development Rules

## Audio and Strudel Instantiation
When working with Strudel in this project, there is a known critical bug where Vite's dependency optimizer will duplicate the `superdough` (sound map) internal registry if Strudel is imported from pre-bundled `dist` files and unbundled files simultaneously. This leads to the "sound not found" error because the `<strudel-editor>` component reads from a completely different registry than the one modified by custom JavaScript code.

To prevent this:
1. **Never** import `@strudel/web`. It causes module duplication when used alongside `@strudel/repl`.
2. **Always** import `@strudel/repl/index.mjs` directly (forcing compilation from source, bypassing the pre-bundled `dist`).
3. **Always** import audio utilities (`registerSound`, `samples`, `getAudioContext`) exclusively from `@strudel/webaudio`.
4. **Encapsulate** all Strudel initialization and audio calls inside `audioSystem.js`. Do not pollute `main.js` or UI components with Strudel configuration imports.

By following this exact pattern, Vite can successfully deduplicate the dependency graph so that all audio registers globally for the `<strudel-editor>`.

## AI Collaboration & Workflow Guidelines
When interacting with AI Copilots (including Antigravity) in this workspace, the following guidelines MUST be adhered to:
1. **Detailed Context**: Always provide the exact architecture, libraries, and software versions. Avoid empty or generic prompts.
2. **SOLID & Clean Code**: Explicitly ensure that generated code is modular, clean, and divides responsibilities into small, focused functions (e.g. isolating audio logic from UI logic).
3. **Test-Driven Development (TDD)**: Where applicable, write unit tests *before* implementation to provide a measurable goal. (Note: Generative audio might be tested manually, but UI components should strive for testability).
4. **Mandatory Human Review**: Never accept code blindly. The developer must audit every line to maintain technical control and prevent regressions. Use the Planning Mode (`implementation_plan.md`) for major changes.
5. **Avoid Complacency Bias**: The AI must not agree with the user by default if the user is wrong. The AI is expected to challenge assumptions, identify technical flaws in provided code, and explain the "why" before making fixes, in order to reduce hallucinations.
