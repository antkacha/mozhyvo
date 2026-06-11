const CYR: Record<string, string> = {
  а:"a", б:"b", в:"v", г:"h", ґ:"g", д:"d", е:"e", є:"ye", ж:"zh", з:"z",
  и:"y", і:"i", ї:"yi", й:"y", к:"k", л:"l", м:"m", н:"n", о:"o", п:"p",
  р:"r", с:"s", т:"t", у:"u", ф:"f", х:"kh", ц:"ts", ч:"ch", ш:"sh",
  щ:"shch", ь:"", ю:"yu", я:"ya",
};

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .split("")
    .map((c) => CYR[c] ?? c)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
