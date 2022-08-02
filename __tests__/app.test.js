const { app } = require("../app");
const db = require("../db/connection");
const request = require("supertest");
const data = require("../db/data");
const seed = require("../db/seeds/seed");

afterAll(() => {
  return db.end();
});

beforeEach(() => {
  return seed(data);
});

describe("/api/topics", () => {
  describe("GET", () => {
    test("status:200, Should have a property of topics", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then(({ body }) => {
          expect(body).toHaveProperty("topics");
        });
    });
    test("status:200, should have properties slug and description inside an array", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then(({ body }) => {
          expect(Array.isArray(body.topics)).toBe(true);
          expect(body.topics[0]).toHaveProperty("slug");
          expect(body.topics[0]).toHaveProperty("description");
        });
    });
  });
});

describe("/*", () => {
  test("status:404, when route does not exist", () => {
    return request(app)
      .get("/api/not_a_route")
      .expect(404)
      .then(({ body }) => {
        expect(body).toHaveProperty("msg");
        expect(body.msg).toBe("Not Found");
      });
  });
});

describe("/api/articles/:article_id", () => {
  describe("GET", () => {
    test("status:200, should contain property of articles", () => {
      return request(app)
        .get("/api/articles/1")
        .expect(200)
        .then(({ body }) => {
          expect(body).toHaveProperty("articles");
        });
    });
    test("status:200, articles should have be an array", () => {
      return request(app)
        .get("/api/articles/1")
        .expect(200)
        .then(({ body }) => {
          expect(Array.isArray(body.articles)).toBe(true);
        });
    });
    test("status:200, articles array should contain properties of author, title, article_id, body, topic, created_at, votes", () => {
      return request(app)
        .get("/api/articles/1")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles[0]).toHaveProperty("author");
          expect(body.articles[0]).toHaveProperty("title");
          expect(body.articles[0]).toHaveProperty("article_id");
          expect(body.articles[0]).toHaveProperty("body");
          expect(body.articles[0]).toHaveProperty("topic");
          expect(body.articles[0]).toHaveProperty("created_at");
          expect(body.articles[0]).toHaveProperty("votes");
        });
    });
    test("status:200, the property of author should have a value which needs to be a string ", () => {
      return request(app)
        .get("/api/articles/1")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles[0]).toEqual(
            expect.objectContaining({ author: expect.any(String) })
          );
        });
    });
    test("status:200, the property of author should have same value as username in the users table", () => {
      return request(app)
        .get("/api/articles/1")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles[0].author).toEqual(body.users[0].username);
        });
    });
  });
});
