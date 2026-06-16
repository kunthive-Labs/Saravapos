/**
 * Frozen at `0.1` for the 0.1.0 stable release.
 *
 * Deprecation policy: schema_version follows semver applied to the *schema
 * shape*, not to the npm package. Breaking changes to existing field
 * semantics (type changes, removals, tightened constraints) require a major
 * bump (1.0 → 2.0). Additive, optional fields stay within 0.x. The previous
 * version is supported by the SDK for at least one minor cycle after a bump.
 */
export const SCHEMA_VERSION = '0.1';
