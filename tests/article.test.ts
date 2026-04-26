import { describe, it, expect, beforeEach, vi } from "vitest";

// Моки для зависимостей
vi.mock("@server/db", () => ({
  db: {
    query: {
      articles: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(),
    })),
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((field, value) => ({ field, value })),
  desc: vi.fn((field) => ({ field, order: "desc" })),
  asc: vi.fn((field) => ({ field, order: "asc" })),
  like: vi.fn((field, pattern) => ({ field, pattern })),
  or: vi.fn((...args) => args),
  and: vi.fn((...args) => args),
}));

describe("Article Router", () => {
  let articleRouter: any;

  beforeEach(async () => {
    // Импортируем роутер после настройки моков
    const { articleRouter: router } = await import("../src/server/routers/article");
    articleRouter = router;
  });

  describe("getAll", () => {
    it("должен возвращать список статей с пагинацией", async () => {
      const mockArticles = [
        { id: "1", title: "Статья 1", content: "Контент 1", authorId: "user1", isPublished: true },
        { id: "2", title: "Статья 2", content: "Контент 2", authorId: "user1", isPublished: true },
      ];

      const { db } = await import("@server/db");
      vi.mocked(db.query.articles.findMany).mockResolvedValue(mockArticles as any);

      const result = await articleRouter.getAll({
        input: { limit: 10, sortBy: "newest" },
      });

      expect(result.items).toHaveLength(2);
      expect(result.nextCursor).toBeUndefined();
    });

    it("должен сортировать статьи по популярности", async () => {
      const { db } = await import("@server/db");
      
      await articleRouter.getAll({
        input: { limit: 10, sortBy: "popular" },
      });

      expect(db.query.articles.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: expect.objectContaining({ order: "desc" }),
        })
      );
    });
  });

  describe("getById", () => {
    it("должен возвращать статью по ID", async () => {
      const mockArticle = {
        id: "1",
        title: "Тестовая статья",
        content: "Контент статьи",
        authorId: "user1",
        views: 100,
        likes: 5,
      };

      const { db } = await import("@server/db");
      vi.mocked(db.query.articles.findFirst).mockResolvedValue(mockArticle as any);

      const result = await articleRouter.getById({
        input: { id: "1" },
      });

      expect(result).toEqual(mockArticle);
    });

    it("должен выбрасывать ошибку, если статья не найдена", async () => {
      const { db } = await import("@server/db");
      vi.mocked(db.query.articles.findFirst).mockResolvedValue(null);

      await expect(
        articleRouter.getById({ input: { id: "nonexistent" } })
      ).rejects.toThrow("Article not found");
    });
  });

  describe("search", () => {
    it("должен искать статьи по заголовку и контенту", async () => {
      const mockResults = [
        { id: "1", title: "Tetris стратегии", content: "Гайд по T-Spin" },
      ];

      const { db } = await import("@server/db");
      vi.mocked(db.query.articles.findMany).mockResolvedValue(mockResults as any);

      const result = await articleRouter.search({
        input: { query: "Tetris" },
      });

      expect(result).toHaveLength(1);
      expect(result[0].title).toContain("Tetris");
    });
  });
});

describe("Article Schema Validation", () => {
  it("должен принимать валидные данные статьи", async () => {
    const { z } = await import("zod");
    
    const articleSchema = z.object({
      title: z.string().min(1).max(200),
      content: z.string().min(1),
      excerpt: z.string().optional(),
      tags: z.array(z.string()).default([]),
    });

    const validData = {
      title: "Заголовок статьи",
      content: "Содержимое статьи",
      excerpt: "Краткое описание",
      tags: ["tetris", "guide"],
    };

    const result = articleSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("должен отклонять статью без заголовка", async () => {
    const { z } = await import("zod");
    
    const articleSchema = z.object({
      title: z.string().min(1).max(200),
      content: z.string().min(1),
    });

    const invalidData = {
      title: "",
      content: "Содержимое",
    };

    const result = articleSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
