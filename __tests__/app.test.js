const { app } = require("../app");
const db = require("../db/connection");
const request = require("supertest");
const data = require("../db/data");
const seed = require("../db/seeds/seed");
require("jest-sorted");
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
          body.topics.forEach((topic) => {
            expect(body.topics[0]).toHaveProperty("slug");
            expect(body.topics[0]).toHaveProperty("description");
          });
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
    test("status:200, should have article as a key and should return an object", () => {
      return request(app)
        .get("/api/articles/1")
        .expect(200)
        .then(({ body }) => {
          expect(body).toHaveProperty("article");
          expect(body.article).toBeInstanceOf(Object);
        });
    });
    test("status:200, article should contain properties of author, title, article_id, body, topic, created_at, votes", () => {
      return request(app)
        .get("/api/articles/1")
        .expect(200)
        .then(({ body }) => {
          const { article } = body;
          expect(article).toHaveProperty("author");
          expect(article).toHaveProperty("title");
          expect(article).toHaveProperty("article_id");
          expect(article).toHaveProperty("body");
          expect(article).toHaveProperty("topic");
          expect(article).toHaveProperty("created_at");
          expect(article).toHaveProperty("votes");
        });
    });
    test("status:200, should return the requested object whose values are based on the given id ", () => {
      return request(app)
        .get("/api/articles/2")
        .expect(200)
        .then(({ body }) => {
          const { article } = body;
          const date = convertTimestampToDate(article);
          expect(article.article_id).toEqual(2),
            expect(article.author).toEqual(expect.any(String)),
            expect(article.title).toEqual(expect.any(String)),
            expect(article.body).toEqual(expect.any(String)),
            expect(article.topic).toEqual(expect.any(String)),
            expect(date.created_at).toEqual(expect.any(Date)),
            expect(article.votes).toEqual(expect.any(Number));
        });
    });
    test("status:200, requested object should contain comment_count property", () => {
      return request(app)
        .get("/api/articles/2")
        .expect(200)
        .then(({ body: { article } }) => {
          expect(article).toHaveProperty("comment_count");
        });
    });
    test("status:200, comment_count should be the sum of comments objects whose article_id is same as given article_id", () => {
      return request(app)
        .get("/api/articles/1")
        .expect(200)
        .then(({ body }) => {
          const { article } = body;
          expect(article.comment_count).toEqual("11");
        });
    });
    test("status:200, comment_count should be zero if there are zero objects with that article id", () => {
      return request(app)
        .get("/api/articles/2")
        .expect(200)
        .then(({ body }) => {
          const { article } = body;
          expect(article.comment_count).toEqual("0");
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
    test("Status:201, should only be applied for the requested article_id", () => {
      const addVotes = { inc_votes: 100 };
      return request(app)
        .patch("/api/articles/1")
        .send(addVotes)
        .expect(201)
        .then(({ body }) => {
          const { article } = body;
          console.log(body);
          expect(article.article_id).toEqual(1);
        });
    });
    test("Status:201, should add the votes when given positive number", () => {
      const addVotes = { inc_votes: 100 };
      return request(app)
        .patch("/api/articles/1")
        .send(addVotes)
        .expect(201)
        .then(({ body: { article } }) => {
          expect(article).toHaveProperty("votes"),
            expect(article.votes).toEqual(200);
        });
    });
    test("Status:201, should subtract the votes when given negitive number", () => {
      const addVotes = { inc_votes: -50 };
      return request(app)
        .patch("/api/articles/1")
        .send(addVotes)
        .expect(201)
        .then(({ body: { article } }) => {
          expect(article.votes).toEqual(50);
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
    test("Status:400, should respond with bad request when the inc_votes is misspelled", () => {
      const addVotes = { inc_vtes: 100 };
      return request(app)
        .patch("/api/articles/1")
        .send(addVotes)
        .expect(400)
        .then(({ body }) => {
          expect(body).toHaveProperty("msg");
          expect(body.msg).toBe("Bad request");
        });
    });
  });
});

describe("/api/users", () => {
  describe("GET", () => {
    test("status:200, Should have a property of users", () => {
      return request(app)
        .get("/api/users")
        .expect(200)
        .then(({ body }) => {
          expect(body).toHaveProperty("users");
        });
    });
    test("status:200, users need to be an array of objects", () => {
      return request(app)
        .get("/api/users")
        .expect(200)
        .then(({ body }) => {
          expect(Array.isArray(body.users)).toBe(true);
          expect(body.users).toHaveLength(4);
          body.users.forEach((user) => {
            expect(typeof user).toEqual("object");
          });
        });
    });
    test("status:200, the object should have the propertes of username, name and avatar_url with their desired values ", () => {
      return request(app)
        .get("/api/users")
        .expect(200)
        .then(({ body }) => {
          body.users.forEach((user) => {
            expect(user).toHaveProperty("username");
            expect(user.username).toEqual(expect.any(String));
            expect(user).toHaveProperty("name");
            expect(user.name).toEqual(expect.any(String));
            expect(user).toHaveProperty("avatar_url");
            expect(user.avatar_url).toEqual(expect.any(String));
          });
        });
    });
  });
});

describe("/api/articles", () => {
  describe("GET", () => {
    test("status:200, Should have a property of articles", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          expect(body).toHaveProperty("articles");
        });
    });
    test("status:200, articles need to be an array of objects", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          expect(Array.isArray(body.articles)).toBe(true);
          expect(body.articles).toHaveLength(12);
          body.articles.forEach((article) => {
            expect(typeof article).toEqual("object");
          });
        });
    });
    test("status:200, the object should have the propertes of author, title, article_id, topic, created_at, votes and comment_count", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          body.articles.forEach((article) => {
            const date = convertTimestampToDate(article);
            expect(article).toHaveProperty("author");
            expect(article).toHaveProperty("title");
            expect(article).toHaveProperty("article_id");
            expect(article).toHaveProperty("topic");
            expect(article).toHaveProperty("created_at");
            expect(article).toHaveProperty("votes");
            expect(article).toHaveProperty("comment_count");
          });
        });
    });
    test("status:200, articles need to be sorted in descending order by date", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeSortedBy("created_at", {
            descending: true,
          });
        });
    });
  });
});

describe("/api/articles/:article_id/comments", () => {
  describe("GET", () => {
    test("status:200, should have comments as a key and should return an object inside the array", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body }) => {
          expect(body).toHaveProperty("comments");
          expect(Array.isArray(body.comments)).toBe(true);
          body.comments.forEach((comment) => {});
          expect(body.comments[0]).toBeInstanceOf(Object);
        });
    });
    test("status:200, the returned object should contain comment_id, votes, created_at, author, body", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          comments.forEach((comment) => {
            const date = convertTimestampToDate(comment);
            expect(comment.comment_id).toEqual(expect.any(Number)),
              expect(comment.author).toEqual(expect.any(String)),
              expect(comment.body).toEqual(expect.any(String)),
              expect(date.created_at).toEqual(expect.any(Date)),
              expect(comment.votes).toEqual(expect.any(Number));
          });
        });
    });
    test("status:200, should return all the objects from comments matching the article id", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          expect(comments.length).toEqual(11);
          comments.forEach((comment) => {
            expect(comment.article_id).toEqual(1);
          });
        });
    });
    test("status:200, should return length of comments array as zero if there no comments with the given article id", () => {
      return request(app)
        .get("/api/articles/2/comments")
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          expect(comments.length).toEqual(0);
        });
    });
    test("status:404, should respond with not found message when given an valid but out of range id", () => {
      return request(app)
        .get("/api/articles/999999/comments")
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
});
