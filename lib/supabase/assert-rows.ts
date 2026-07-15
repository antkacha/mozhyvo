export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Throws ApiError if the Supabase mutation (update/delete with .select("id"))
 * returned a DB error or touched 0 rows.
 *
 * Usage:
 *   assertAffected(
 *     await admin.from("table").update(data).eq("id", id).select("id"),
 *     "Project"
 *   );
 */
export function assertAffected(
  result: { data: unknown; error: { message: string } | null },
  label = "Record",
): void {
  if (result.error) throw new ApiError(result.error.message, 500);
  const rows = Array.isArray(result.data) ? result.data : null;
  if (!rows?.length) throw new ApiError(`${label} not found`, 404);
}
