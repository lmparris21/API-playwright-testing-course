/* Smoke test for the Conduit API using the request handler class */
import { expect } from "@playwright/test";
import { test } from "../utils/fixtures";

/* Global variable to store the authentication token */
let authToken: string

/* Authenticate user and get token */
test.beforeAll('Get auth token', async ({ api }) => {
  const loginResponse = await api
    .path("/users/login")
    .body({"user": {"email": "lmparris21@test.com","password": "apitesting123!"}})
    .postRequest(200);
  authToken = 'Token ' + loginResponse.user.token
});

/**
 * Test for the articles endpoint
 * Demonstrates basic GET request functionality using the RequestHandler class
 */
test("get articles", async ({ api }) => {
  /* Send GET request to /articles endpoint with pagination */
  const response = await api
    .path("/articles")
    .params({ limit: 10, offset: 0 })
    .getRequest(200);  /* Expect 200 OK status */
  /* Verify response matches pagination parameters */
  expect(response.articles.length).toBeLessThanOrEqual(10);  /* Should not exceed requested limit */
  expect(response.articlesCount).toEqual(10);  /* Total count should match limit */
});

/**
 * Test for the tags endpoint
 * Demonstrates basic GET request functionality using the RequestHandler class
 */
test("get test tags", async ({ api }) => {
  /* Send GET request to /tags endpoint */
  const response = await api
    .path("/tags")
    .getRequest(200);  /* Expect 200 OK status */
  /* Verify response matches expected structure */
  expect(response.tags[0]).toEqual("Test");
  expect(response.tags.length).toBeLessThanOrEqual(10);
});

/**
 * Test for the articles endpoint
 * Demonstrates basic POST, GET and DELETE request functionality using the RequestHandler class
 */
test("create and delete article", async ({ api }) => {
  /* Create article */
  const createArticleResponse = await api
    .path("/articles")
    .headers({ Authorization: authToken })
    .body({"article": {"title": "Test Article","description": "Test Description","body": "Test Body","tagList": ["Test"]}})
    .postRequest(201);
  /* Verify article was created successfully */
  expect(createArticleResponse.article.title).toEqual('Test Article')
  const articleSlug = createArticleResponse.article.slug

  /* Get articles */
  const getArticlesResponse = await api
    .path("/articles")
    .headers({ Authorization: authToken })
    .params({ limit: 10, offset: 0 })
    .getRequest(200);
  /* Verify article appears in the articles list */
  expect(getArticlesResponse.articles[0].title).toEqual('Test Article')

  /* Delete article after verification */
  await api
    .path(`/articles/${articleSlug}`)
    .headers({ Authorization: authToken })
    .deleteRequest(204);

  /* Verify article is deleted */
  const getArticlesResponseAfterDelete = await api
    .path("/articles")
    .headers({ Authorization: authToken })
    .params({ limit: 10, offset: 0 })
    .getRequest(200);
  /* Verify article is not in the articles list */
  expect(getArticlesResponseAfterDelete.articles[0].title).not.toEqual('Test Article')
})

/**
 * Test for the articles endpoint
 * Demonstrates basic POST, PUT, GET and DELETE request functionality using the RequestHandler class
 */
test("create, update and delete article", async ({ api }) => {
  /* Create article */
  const createArticleResponse = await api
    .path("/articles")
    .headers({ Authorization: authToken })
    .body({"article": {"title": "Test Article 2","description": "Test Description","body": "Test Body","tagList": ["Test"]}})
    .postRequest(201);
  expect(createArticleResponse.article.title).toEqual('Test Article 2')
  const articleSlug = createArticleResponse.article.slug

  /* Update article */
  const updateArticleResponse = await api
    .path(`/articles/${articleSlug}`)
    .headers({ Authorization: authToken })
    .body({"article": {"title": "Updated Test Article 2","description": "Test Description","body": "Test Body","tagList": ["Test"]}})
    .putRequest(200);
  /* Verify article is updated */
  expect(updateArticleResponse.article.title).toEqual('Updated Test Article 2')
  const updatedArticleSlug = updateArticleResponse.article.slug

  /* Get articles */
  const getArticlesResponse = await api
    .path("/articles")
    .headers({ Authorization: authToken })
    .params({ limit: 10, offset: 0 })
    .getRequest(200);
  expect(getArticlesResponse.articles[0].title).toEqual('Updated Test Article 2')

  /* Delete article after verification */
  await api
    .path(`/articles/${updatedArticleSlug}`)
    .headers({ Authorization: authToken })
    .deleteRequest(204);

  /* Verify article is deleted */ 
  const getArticlesResponseAfterDelete = await api
    .path("/articles")
    .headers({ Authorization: authToken })
    .params({ limit: 10, offset: 0 })
    .getRequest(200);
  /* Verify article is not in the articles list */
  expect(getArticlesResponseAfterDelete.articles[0].title).not.toEqual('Updated Test Article 2')
})
