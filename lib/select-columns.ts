/**
 * Explicit select() lists that TypeScript keeps honest.
 *
 *   const ORG_SELECT = selectColumns<SupabaseOrg>()(["id", "name", ...] as const);
 *
 * Compiles only if every field of Row is in the list — a component that starts
 * reading a column nobody selects fails typecheck (the error names it under
 * `__notSelected`) instead of silently getting undefined at runtime. Used
 * instead of select("*") so large columns (e.g. base64 org images) are only
 * fetched where they are actually rendered.
 */
export function selectColumns<Row>() {
  return <C extends readonly string[]>(
    cols: C & (Exclude<keyof Row, C[number]> extends never
      ? unknown
      : { __notSelected: Exclude<keyof Row, C[number]> }),
  ): string => cols.join(", ");
}
