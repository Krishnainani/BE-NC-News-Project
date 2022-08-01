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
    test("status:200, Should have an key of topics", () => {
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
  test("status 404: when route does not exist", () => {
    return request(app)
      .get("/api/not_a_route")
      .expect(404)
      .then(({ body }) => {
        expect(body).toHaveProperty("msg");
        expect(body.msg).toBe("Not Found");
      });
  });
});
