export function paginate<T>(items: readonly T[], pageSize: number): readonly (readonly T[])[] {
  if (items.length === 0) {
    return [[]];
  }
  const pages: T[][] = [];
  for (let index = 0; index < items.length; index += pageSize) {
    pages.push(items.slice(index, index + pageSize));
  }
  return pages;
}

export function pageRoute(collectionRoute: string, pageNumber: number, segment: string): string {
  if (pageNumber <= 1) {
    return collectionRoute;
  }
  return `${collectionRoute}${segment}/${pageNumber}/`;
}
