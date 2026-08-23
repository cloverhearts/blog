import type {
  CuratedCollectionArtifact,
  CuratedCollectionItemArtifact,
  PreviewPostArtifact,
} from "../../contracts/src/index.ts";
import type { CuratedCollectionDefinition, ProjectConfig } from "../../project-config/src/index.ts";

interface EligibleGroup {
  readonly translationKey: string;
  readonly slug: string;
  readonly createdAt: string;
  readonly category: string;
  readonly tags: readonly string[];
  readonly workEvidence?: PreviewPostArtifact["workEvidence"];
}

export function deriveCuratedCollections(
  posts: readonly PreviewPostArtifact[],
  config: ProjectConfig,
  mode: "preview" | "production",
): readonly CuratedCollectionArtifact[] {
  const groups = new Map<string, EligibleGroup>();
  for (const post of posts) {
    if (mode === "production" && post.status !== "published") continue;
    const existing = groups.get(post.translationKey);
    if (existing) continue;
    groups.set(post.translationKey, {
      translationKey: post.translationKey,
      slug: post.slug,
      createdAt: post.createdAt,
      category: post.category,
      tags: post.tags,
      ...(post.workEvidence ? { workEvidence: post.workEvidence } : {}),
    });
  }

  return Object.entries(config.curatedCollections.collections)
    .sort(([left], [right]) => left.localeCompare(right, "en"))
    .map(([id, definition]) => {
      const route = config.routes.curated[definition.routeKey];
      if (!route) {
        throw new Error(`Curated collection ${id} has no registered route`);
      }
      const selected = [...groups.values()].filter((group) => matchesCollection(group, definition));
      const items = selected
        .map((group) => toCollectionItem(group, definition))
        .sort((left, right) => compareItems(left, right, groups, definition));
      return {
        id,
        routeKey: definition.routeKey,
        route,
        labels: definition.labels,
        descriptions: definition.descriptions,
        presentation: definition.presentation,
        robots: definition.robots,
        count: items.length,
        items,
      };
    });
}

function matchesCollection(group: EligibleGroup, definition: CuratedCollectionDefinition): boolean {
  if (definition.selector.excludeTranslationKeys.includes(group.translationKey)) {
    return false;
  }
  if (definition.selector.includeTranslationKeys.includes(group.translationKey)) {
    return true;
  }
  return (
    definition.selector.anyTags.some((tag) => group.tags.includes(tag)) ||
    definition.selector.anyCategories.includes(group.category)
  );
}

function toCollectionItem(
  group: EligibleGroup,
  definition: CuratedCollectionDefinition,
): CuratedCollectionItemArtifact {
  const useWorkDate = definition.order.primary === "work-evidence-date" && group.workEvidence;
  return {
    translationKey: group.translationKey,
    dateSource: useWorkDate ? "work-evidence" : "created-at",
    sortDate: useWorkDate && group.workEvidence ? group.workEvidence.sortDate : group.createdAt,
    ...(group.workEvidence?.period ? { period: group.workEvidence.period } : {}),
  };
}

function compareItems(
  left: CuratedCollectionItemArtifact,
  right: CuratedCollectionItemArtifact,
  groups: ReadonlyMap<string, EligibleGroup>,
  definition: CuratedCollectionDefinition,
): number {
  const leftTime = Date.parse(left.sortDate);
  const rightTime = Date.parse(right.sortDate);
  const byDate = definition.order.direction === "ascending" ? leftTime - rightTime : rightTime - leftTime;
  if (byDate !== 0) return byDate;
  const leftSlug = groups.get(left.translationKey)?.slug ?? left.translationKey;
  const rightSlug = groups.get(right.translationKey)?.slug ?? right.translationKey;
  return leftSlug.localeCompare(rightSlug, "en");
}
