/* Smoke test suite for the Conduit API using the request handler class */
import { expect } from "@playwright/test";
import { test } from "../utils/fixtures";

/* Store authentication token for use across test cases */
let authToken: string;

/**
 * Setup: Authenticate user before running tests
 * Stores the auth token for subsequent authenticated requests
 */
test.beforeAll('Get auth token', async ({ api }) => {
  const loginResponse = await api
    .path("/users/login")
    .body({"user": {"email": "lmparris21@test.com","password": "apitesting123!"}})
    .postRequest(200);
  authToken = 'Token ' + loginResponse.user.token;
});

/**
 * Test: Get articles with pagination
 * Verifies:
 * - Successful retrieval of articles
 * - Correct pagination implementation
 */
test("get articles", async ({ api }) => {
  /* Send GET request with pagination parameters */
  const response = await api
    .path("/articles")
    .params({ limit: 10, offset: 0 })
    .getRequest(200);
  
  /* Verify pagination and response structure */
  expect(response.articles.length).toBeLessThanOrEqual(10);
  expect(response.articlesCount).toEqual(10);
});

/**
 * Test: Get available tags
 * Verifies:
 * - Successful retrieval of tags
 * - Presence of expected tag
 * - Correct response structure
 */
test("get test tags", async ({ api }) => {
  const response = await api
    .path("/tags")
    .getRequest(200);
  
  /* Verify tag list contents */
  expect(response.tags[0]).toEqual("Test");
  expect(response.tags.length).toBeLessThanOrEqual(10);
});

/**
 * Test: Article CRUD operations - Create and Delete
 * Demonstrates:
 * - Article creation with authentication
 * - Verification of created article
 * - Article deletion
 * - Verification of deletion
 */
test("create and delete article", async ({ api }) => {
  /* Create new article with auth token */
  const createArticleResponse = await api
    .path("/articles")
    .headers({ Authorization: authToken })
    .body({"article": {"title": "Test Article","description": "Test Description","body": "Test Body","tagList": ["Test"]}})
    .postRequest(201);
  
  /* Verify creation and store slug for later use */
  expect(createArticleResponse.article.title).toEqual('Test Article');
  const articleSlug = createArticleResponse.article.slug;

  /* Verify article appears in article list */
  const getArticlesResponse = await api
    .path("/articles")
    .headers({ Authorization: authToken })
    .params({ limit: 10, offset: 0 })
    .getRequest(200);
  expect(getArticlesResponse.articles[0].title).toEqual('Test Article');

  /* Clean up: Delete article */
  await api
    .path(`/articles/${articleSlug}`)
    .headers({ Authorization: authToken })
    .deleteRequest(204);

  /* Verify deletion */
  const getArticlesResponseAfterDelete = await api
    .path("/articles")
    .headers({ Authorization: authToken })
    .params({ limit: 10, offset: 0 })
    .getRequest(200);
  expect(getArticlesResponseAfterDelete.articles[0].title).not.toEqual('Test Article');
});

/**
 * Test: Article CRUD operations - Create, Update, and Delete
 * Demonstrates:
 * - Article creation
 * - Article update
 * - Verification of updates
 * - Article deletion
 * - Complete CRUD cycle verification
 */
test("create, update and delete article", async ({ api }) => {
  /* Create initial article */
  const createArticleResponse = await api
    .path("/articles")
    .headers({ Authorization: authToken })
    .body({"article": {"title": "Test Article 2","description": "Test Description","body": "Test Body","tagList": ["Test"]}})
    .postRequest(201);
  expect(createArticleResponse.article.title).toEqual('Test Article 2');
  const articleSlug = createArticleResponse.article.slug;

  /* Update the article */
  const updateArticleResponse = await api
    .path(`/articles/${articleSlug}`)
    .headers({ Authorization: authToken })
    .body({"article": {"title": "Updated Test Article 2","description": "Test Description","body": "Test Body","tagList": ["Test"]}})
    .putRequest(200);
  expect(updateArticleResponse.article.title).toEqual('Updated Test Article 2');
  const updatedArticleSlug = updateArticleResponse.article.slug;

  /* Verify update in article list */
  const getArticlesResponse = await api
    .path("/articles")
    .headers({ Authorization: authToken })
    .params({ limit: 10, offset: 0 })
    .getRequest(200);
  expect(getArticlesResponse.articles[0].title).toEqual('Updated Test Article 2');

  /* Clean up: Delete article */
  await api
    .path(`/articles/${updatedArticleSlug}`)
    .headers({ Authorization: authToken })
    .deleteRequest(204);

  /* Verify deletion */
  const getArticlesResponseAfterDelete = await api
    .path("/articles")
    .headers({ Authorization: authToken })
    .params({ limit: 10, offset: 0 })
    .getRequest(200);
  expect(getArticlesResponseAfterDelete.articles[0].title).not.toEqual('Updated Test Article 2');
});
