import type { PreviewPostSummaryArtifact } from "../../contracts/src/index.ts";

export function deriveRelatedPostIds(
  posts: readonly PreviewPostSummaryArtifact[],
  manualRelatedSlugs: Readonly<Record<string, readonly string[]>>,
  maxItems: number,
): Readonly<Record<string, readonly string[]>> {
  const related: Record<string, readonly string[]> = {};
  const groups = new Map<string, PreviewPostSummaryArtifact[]>();
  for (const post of posts) {
    const current = groups.get(post.translationKey) ?? [];
    current.push(post);
    groups.set(post.translationKey, current);
  }

  for (const post of posts) {
    const selected: string[] = [];
    const seenGroups = new Set<string>([post.translationKey]);
    for (const slug of manualRelatedSlugs[post.id] ?? []) {
      const group = [...groups.values()].find((variants) =>
        variants.some((variant) => variant.slug === slug),
      );
      const target = pickVariant(post.language, group ?? []);
      if (target && !seenGroups.has(target.translationKey)) {
        selected.push(target.id);
        seenGroups.add(target.translationKey);
      }
    }

    const automatic = [...groups.values()]
      .map((variants) => pickVariant(post.language, variants))
      .filter((candidate): candidate is PreviewPostSummaryArtifact => candidate !== null)
      .map((candidate) => ({
        candidate,
        score: scoreRelation(post, candidate),
      }))
      .filter(
        (entry) =>
          entry.score > 0 &&
          !seenGroups.has(entry.candidate.translationKey) &&
          entry.candidate.id !== post.id,
      )
      .sort((left, right) => {
        if (right.score !== left.score) return right.score - left.score;
        const created = Date.parse(right.candidate.createdAt) - Date.parse(left.candidate.createdAt);
        if (created !== 0) return created;
        return left.candidate.slug.localeCompare(right.candidate.slug, "en");
      });

    for (const entry of automatic) {
      if (selected.length >= maxItems) break;
      selected.push(entry.candidate.id);
      seenGroups.add(entry.candidate.translationKey);
    }
    related[post.id] = selected.slice(0, maxItems);
  }
  return related;
}

function pickVariant(
  language: PreviewPostSummaryArtifact["language"],
  variants: readonly PreviewPostSummaryArtifact[],
): PreviewPostSummaryArtifact | null {
  return (
    variants.find((variant) => variant.language === language) ??
    variants.find((variant) => variant.language === "en") ??
    variants.find((variant) => variant.language === "ko") ??
    null
  );
}

function scoreRelation(
  post: PreviewPostSummaryArtifact,
  candidate: PreviewPostSummaryArtifact,
): number {
  if (post.translationKey === candidate.translationKey) {
    return 0;
  }
  const sharedTags = post.tags.filter((tag) => candidate.tags.includes(tag)).length;
  const sameCategory = post.category === candidate.category ? 2 : 0;
  return sharedTags * 3 + sameCategory;
}
