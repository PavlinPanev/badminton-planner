import { describe, expect, it } from "vitest";

import { paginationMeta } from "./pagination";

describe("paginationMeta", () => {
  it("reports first page state with more pages", () => {
    expect(paginationMeta(1, 10, 25)).toEqual({
      page: 1,
      pageSize: 10,
      total: 25,
      totalCount: 25,
      totalPages: 3,
      hasMore: true,
      hasNextPage: true,
      hasPreviousPage: false,
    });
  });

  it("keeps empty result sets at one total page", () => {
    expect(paginationMeta(1, 20, 0)).toMatchObject({
      total: 0,
      totalCount: 0,
      totalPages: 1,
      hasMore: false,
      hasNextPage: false,
      hasPreviousPage: false,
    });
  });

  it("reports final page state", () => {
    expect(paginationMeta(3, 10, 25)).toMatchObject({
      totalPages: 3,
      hasMore: false,
      hasNextPage: false,
      hasPreviousPage: true,
    });
  });
});
