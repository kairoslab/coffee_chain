/**
 * React Native + React 19 Type Compatibility
 *
 * KNOWN ISSUE: TypeScript shows JSX errors like:
 *   "'View' cannot be used as a JSX component"
 *
 * This is a known incompatibility between React 19 types and React Native's
 * class-based component types. Tracked at:
 * https://github.com/facebook/react-native/issues/43296
 *
 * IMPORTANT: These are TYPE-CHECKING warnings only. The app builds and runs
 * correctly because Metro uses Babel (not tsc) for transpilation.
 *
 * Versions:
 * - react: 19.1.0
 * - react-native: 0.81.5
 * - @types/react: ~19.1.10
 * - expo: ^54.0.31
 *
 * When React Native releases updated types compatible with React 19,
 * these errors will be resolved.
 */

export {};
