export function paginationMeta(page: number, pageSize: number, totalCount: number) {
  const totalPages = Math.max(Math.ceil(totalCount / pageSize), 1);

  return {
    page,
    pageSize,
    total: totalCount,
    totalCount,
    totalPages,
    hasMore: page < totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}
