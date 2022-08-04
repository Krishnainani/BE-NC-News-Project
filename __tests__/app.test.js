const { app } = require("../app");
const db = require("../db/connection");
const request = require("supertest");
const data = require("../db/data");
const seed = require("../db/seeds/seed");
const { convertTimestampToDate } = require("../db/seeds/utils");

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
        .then(({ body: { articles } }) => {
          articles.forEach((article) => {
            expect(article).toHaveProperty("author");
            expect(article).toHaveProperty("title");
            expect(article).toHaveProperty("article_id");
            expect(article).toHaveProperty("body");
            expect(article).toHaveProperty("topic");
            expect(article).toHaveProperty("created_at");
            expect(article).toHaveProperty("votes");
          });
        });
    });
    test("status:200, should return the requested object whose values are based on the given id ", () => {
      return request(app)
        .get("/api/articles/2")
        .expect(200)
        .then(({ body: { articles } }) => {
          articles.forEach((article) => {
            const date = convertTimestampToDate(article);
            expect(article).toEqual(expect.objectContaining({ article_id: 2 })),
              expect(article.article_id).toEqual(2),
              expect(article.author).toEqual(expect.any(String)),
              expect(article.title).toEqual(expect.any(String)),
              expect(article.body).toEqual(expect.any(String)),
              expect(article.topic).toEqual(expect.any(String)),
              expect(date.created_at).toEqual(expect.any(Date)),
              expect(article.votes).toEqual(expect.any(Number));
          });
        });
    });
    test("status:200, the property of author should have same value as username in the users table", () => {
      db.query("SELECT * FROM users").then(({ rows: users }) => {
        return request(app)
          .get("/api/articles/1")
          .expect(200)
          .then(({ body }) => {
            expect(body.articles[0].author).toEqual(users[0].username);
          });
      });
    });
    test("status:404, should respond with not found message when given an valid but out of range id", () => {
      return request(app)
        .get("/api/articles/999999")
        .expect(404)
        .then(({ body }) => {
          expect(body).toHaveProperty("msg");
          expect(body.msg).toBe("User for article_id: 999999 not found");
        });
    });
    test("status:400, should respond with bad request message when given an invalid id", () => {
      return request(app)
        .get("/api/articles/not_an_id")
        .expect(400)
        .then(({ body }) => {
          expect(body).toHaveProperty("msg");
          expect(body.msg).toBe("Bad request");
        });
    });
  });
  describe("PATCH", () => {
    test("Status:201, should update votes for the requested article_id", () => {
      const addVotes = { inc_votes: 100 };
      return request(app)
        .patch("/api/articles/1")
        .send(addVotes)
        .expect(201)
        .then(({ body: { articles } }) => {
          articles.forEach((article) => {
            expect(article).toEqual(expect.objectContaining({ article_id: 1 })),
              expect(article.article_id).toEqual(1);
          });
        });
    });
    test("Status:201, should add the votes when given positive number", () => {
      const addVotes = { inc_votes: 100 };
      return request(app)
        .patch("/api/articles/1")
        .send(addVotes)
        .expect(201)
        .then(({ body: { articles } }) => {
          expect(articles[0]).toHaveProperty("votes"),
            expect(articles[0].votes).toEqual(200);
        });
    });
    test("Status:201, should subtract the votes when given negitive number", () => {
      const addVotes = { inc_votes: -50 };
      return request(app)
        .patch("/api/articles/1")
        .send(addVotes)
        .expect(201)
        .then(({ body: { articles } }) => {
          articles.forEach((article) => {
            expect(articles[0].votes).toEqual(50);
          });
        });
    });
    test("Status:400, should respond with bad request when there is malformed body/missing required fields", () => {
      const addVotes = {};
      return request(app)
        .patch("/api/articles/1")
        .send(addVotes)
        .expect(400)
        .then(({ body }) => {
          expect(body).toHaveProperty("msg");
          expect(body.msg).toBe("Bad request");
        });
    });
    test("Status:400, should respond with bad request when there is incorrect type", () => {
      const addVotes = { inc_votes: "not_a_number" };
      return request(app)
        .patch("/api/articles/1")
        .send(addVotes)
        .expect(400)
        .then(({ body }) => {
          expect(body).toHaveProperty("msg");
          expect(body.msg).toBe("Bad request");
        });
    });
    test("status:404, should respond with not found message when given an valid but out of range id", () => {
      const addVotes = { inc_votes: 100 };
      return request(app)
        .patch("/api/articles/999999")
        .send(addVotes)
        .expect(404)
        .then(({ body }) => {
          expect(body).toHaveProperty("msg");
          expect(body.msg).toBe("Not found");
        });
    });
    test("status:400, should respond with bad request message when given an invalid id", () => {
      const addVotes = { inc_votes: 100 };
      return request(app)
        .patch("/api/articles/not_an_id")
        .send(addVotes)
        .expect(400)
        .then(({ body }) => {
          expect(body).toHaveProperty("msg");
          expect(body.msg).toBe("Bad request");
        });
    });
  });
});
