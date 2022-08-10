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
            expect(topic).toHaveProperty("slug");
            expect(topic).toHaveProperty("description");
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
          body.comments.forEach((comment) => {
            expect(comment).toBeInstanceOf(Object);
          });
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
          expect(body.msg).toBe("User for article_id: 999999 not found");
        });
    });
    test("status:400, should respond with bad request message when given an invalid id", () => {
      return request(app)
        .get("/api/articles/not_an_id")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad request");
        });
    });
  });
  describe("POST", () => {
    test("Status:201, should only be applied for the requested article_id", () => {
      const postComment = {
        username: "butter_bridge",
        body: "Every point of our life is filled with tresures",
      };
      return request(app)
        .post("/api/articles/1/comments")
        .expect(201)
        .send(postComment)
        .then(({ body }) => {
          const { comment } = body;
          expect(comment.article_id).toEqual(1);
        });
    });
    test("Status:201, should repond with a comment_id with given username and body", () => {
      const postComment = {
        username: "butter_bridge",
        body: "Every point of our life is filled with tresures",
      };
      return request(app)
        .post("/api/articles/1/comments")
        .expect(201)
        .send(postComment)
        .then(({ body }) => {
          const { comment } = body;
          expect(comment.comment_id).toEqual(19),
            expect(comment.author).toEqual("butter_bridge");
        });
    });
    test("status:404, should respond with not found message when given an valid but out of range id", () => {
      const postComment = {
        username: "butter_bridge",
        body: "Every point of our life is filled with tresures",
      };
      return request(app)
        .post("/api/articles/999999/comments")
        .expect(404)
        .send(postComment)
        .then(({ body }) => {
          expect(body.msg).toBe("User for article_id: 999999 not found");
        });
    });
    test("status:400, should respond with bad request message when given an invalid id", () => {
      const postComment = {
        username: "butter_bridge",
        body: "Every point of our life is filled with tresures",
      };
      return request(app)
        .post("/api/articles/not_an_id/comments")
        .expect(400)
        .send(postComment)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad request");
        });
    });
    test("status:400, should respond with not found message when the username is given something out of users database", () => {
      const postComment = {
        username: "api",
        body: "Every point of our life is filled with tresures",
      };
      return request(app)
        .post("/api/articles/1/comments")
        .expect(400)
        .send(postComment)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad request");
        });
    });
    test("status:400, should respond with bad request message when the username is not given", () => {
      const postComment = {
        body: "Every point of our life is filled with tresures",
      };
      return request(app)
        .post("/api/articles/1/comments")
        .expect(400)
        .send(postComment)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad request");
        });
    });
    test("status:400, should respond with bad request message when the body is not given", () => {
      const postComment = {
        username: "butter_bridge",
      };
      return request(app)
        .post("/api/articles/1/comments")
        .expect(400)
        .send(postComment)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad request");
        });
    });
    test("status:400, should respond with bad request message when the username is spelled wrong", () => {
      const postComment = {
        usernae: "butter_bridge",
        body: "Every point of our life is filled with tresures",
      };
      return request(app)
        .post("/api/articles/1/comments")
        .expect(400)
        .send(postComment)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad request");
        });
    });
    test("status:400, should respond with bad request message when the body is spelled wrong", () => {
      const postComment = {
        username: "butter_bridge",
        bod: "Every point of our life is filled with tresures",
      };
      return request(app)
        .post("/api/articles/1/comments")
        .expect(400)
        .send(postComment)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad request");
        });
    });
  });
});

describe("GET with sort", () => {
  test("status 200: should default sort by date, order by desc", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("status 200: should sort by any valid coloumn when queried", () => {
    return request(app)
      .get("/api/articles?sort_by=votes")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("votes", { descending: true });
      });
  });
  test("status 200: should order by asc when queried", () => {
    return request(app)
      .get("/api/articles?order=asc")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("created_at", { descending: false });
      });
  });
  test("status 200: should filters the articles by the topic value specified in the query", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then(({ body }) => {
        body.articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });
  });
  test("status 200: should allow the user to do multiple queries", () => {
    return request(app)
      .get("/api/articles?sort_by=votes&order=desc&topic=mitch")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("votes", { descending: true });
        body.articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });
  });
  test("status 400: rejects unapproved sort queries ", () => {
    return request(app)
      .get("/api/articles?sort_by=not_a_sort_option")
      .expect(400)
      .then(({ body }) => {
        expect(body).toHaveProperty("msg");
        expect(body.msg).toBe("Invalid sort query");
      });
  });
  test("status 400: rejects unapproved order directions ", () => {
    return request(app)
      .get("/api/articles?order=not_a_direction")
      .expect(400)
      .then(({ body }) => {
        expect(body).toHaveProperty("msg");
        expect(body.msg).toBe("Invalid order query");
      });
  });
  test("status 400: rejects unapproved topic queries ", () => {
    return request(app)
      .get(`/api/articles?topic=not_an_approved_topic`)
      .expect(400)
      .then(({ body }) => {
        expect(body).toHaveProperty("msg");
        expect(body.msg).toBe("Invalid topic query");
      });
  });
  test("status 400: should return invalid query when there is topic is empty", () => {
    return request(app)
      .get(`/api/articles?topic=`)
      .expect(400)
      .then(({ body }) => {
        expect(body).toHaveProperty("msg");
        expect(body.msg).toBe("Invalid topic query");
      });
  });
  test("status 200: should return with default values when order or sort is empty", () => {
    return request(app)
      .get(`/api/articles?sort_by=&order=`)
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("status 200: should return with default values for the one empty and the other is mentioned", () => {
    return request(app)
      .get(`/api/articles?sort_by=&order=asc`)
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("created_at", { descending: false });
      });
  });
});
