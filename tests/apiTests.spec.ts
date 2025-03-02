import { test, expect } from '@playwright/test';

/**
 * Test suite for the Conduit API endpoints
 * Base URL: https://conduit-api.bondaracademy.com
 */

/**
 * Test to verify the tags endpoint
 * Checks if tags are returned correctly and validates the response structure
 */
test('get test tags', async ({ request }) => {
  // Send GET request to retrieve tags
  const getTagsResponse = await request.get('https://conduit-api.bondaracademy.com/api/tags')
  const getTagsResponseJson = await getTagsResponse.json()

  // Verify response status and data structure
  expect(getTagsResponse.status()).toEqual(200)
  expect(getTagsResponseJson.tags[0]).toEqual('Test')
  expect(getTagsResponseJson.tags.length).toBeLessThanOrEqual(10)
});

/**
 * Test to verify the articles endpoint with pagination
 * Checks if articles are returned with correct limit and offset
 */
test('Get All Articles', async ({ request }) => {
  // Send GET request to retrieve articles with pagination parameters
  const getArticlesResponse = await request.get('https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0')
  const getArticlesResponseJson = await getArticlesResponse.json()

  // Verify response status and pagination works correctly
  expect(getArticlesResponse.status()).toEqual(200)
  expect(getArticlesResponseJson.articles.length).toBeLessThanOrEqual(10)
  expect(getArticlesResponseJson.articlesCount).toEqual(10)
});

/**
 * Test to verify article creation and deletion functionality
 * 1. Authenticates user
 * 2. Creates a new article
 * 3. Verifies article creation
 * 4. Deletes the article
 */
test('Create and Delete Article', async ({ request }) => {
  // Authenticate user and get token
  const tokenResponse = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
    data: {
      "user": {
          "email": "lmparris21@gmail.com",
          "password": "apitesting123!"
      }
  }
  })
  const tokenResponseJson = await tokenResponse.json()
  const authToken = 'Token ' + tokenResponseJson.user.token

  // Create a new article
  const createArticleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles', {
    headers: {
      'Authorization': authToken  
    },
    data: {
      "article": {
        "title": "Test Article",
        "description": "Test Description",
        "body": "Test Body",
        "tagList": ["Test"]
      }
    }
  })
  const createArticleResponseJson = await createArticleResponse.json()
  
  // Verify article was created successfully
  expect(createArticleResponse.status()).toEqual(201)
  expect(createArticleResponseJson.article.title).toEqual('Test Article')
  const articleSlug = createArticleResponseJson.article.slug

  // Verify article appears in the articles list
  const getArticlesResponse = await request.get('https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0', {
    headers: {
      'Authorization': authToken
    }
  })
  const getArticlesResponseJson = await getArticlesResponse.json()
  expect(getArticlesResponse.status()).toEqual(200)
  expect(getArticlesResponseJson.articles[0].title).toEqual('Test Article')

  // Delete the created article
  const deleteArticleResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${articleSlug}`, {
    headers: {
      'Authorization': authToken
    }
  })
  expect(deleteArticleResponse.status()).toEqual(204)
  
  // Verify article is deleted
  const getArticlesResponseAfterDelete = await request.get('https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0', {
    headers: {
      'Authorization': authToken
    }
  })
  const getArticlesResponseAfterDeleteJson = await getArticlesResponseAfterDelete.json()
  expect(getArticlesResponseAfterDelete.status()).toEqual(200)
  expect(getArticlesResponseAfterDeleteJson.articles[0].title).not.toEqual('Test Article')
});

/**
 * Test to verify complete article lifecycle:
 * 1. Creation
 * 2. Update
 * 3. Deletion
 * This test ensures all CRUD operations work correctly
 */
test('Create, Update, and Delete Article', async ({ request }) => {
  // Authenticate user and get token
  const tokenResponse = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
    data: {
      "user": {
          "email": "lmparris21@gmail.com",
          "password": "apitesting123!"
      }
  }
  })
  const tokenResponseJson = await tokenResponse.json()
  const authToken = 'Token ' + tokenResponseJson.user.token

  // Create a new article
  const createArticleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles', {
    headers: {
      'Authorization': authToken  
    },
    data: {
      "article": {
        "title": "Test Article",
        "description": "Test Description",
        "body": "Test Body",
        "tagList": ["Test"]
      }
    }
  })
  const createArticleResponseJson = await createArticleResponse.json()
  
  // Verify article creation
  expect(createArticleResponse.status()).toEqual(201)
  expect(createArticleResponseJson.article.title).toEqual('Test Article')
  const articleSlug = createArticleResponseJson.article.slug

  // Verify article appears in the articles list
  const getArticlesResponse = await request.get('https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0', {
    headers: {
      'Authorization': authToken
    }
  })
  const getArticlesResponseJson = await getArticlesResponse.json()
  expect(getArticlesResponse.status()).toEqual(200)
  expect(getArticlesResponseJson.articles[0].title).toEqual('Test Article')

  // Update the article with new content
  const updateArticleResponse = await request.put(`https://conduit-api.bondaracademy.com/api/articles/${articleSlug}`, {
    headers: {
      'Authorization': authToken
    },
    data: {
      "article": {
        "title": "Updated Test Article",
        "description": "Test Description",
        "body": "Test Body",
        "tagList": ["Test"]
      }
    }
  })
  
  // Verify article update
  const updateArticleResponseJson = await updateArticleResponse.json()
  expect(updateArticleResponse.status()).toEqual(200)
  expect(updateArticleResponseJson.article.title).toEqual('Updated Test Article')

  // Verify article is updated in the articles list
  const getArticlesResponseAfterUpdate = await request.get('https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0', {
    headers: {
      'Authorization': authToken
    }
  })
  const getArticlesResponseAfterUpdateJson = await getArticlesResponseAfterUpdate.json()
  expect(getArticlesResponseAfterUpdate.status()).toEqual(200)
  expect(getArticlesResponseAfterUpdateJson.articles[0].title).toEqual('Updated Test Article')
  const updatedArticleSlug = getArticlesResponseAfterUpdateJson.articles[0].slug

  // Clean up by deleting the article
  const deleteArticleResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${updatedArticleSlug}`, {
    headers: {
      'Authorization': authToken
    }
  })
  expect(deleteArticleResponse.status()).toEqual(204)

  // Verify article is deleted
  const getArticlesResponseAfterDelete = await request.get('https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0', {
    headers: {
      'Authorization': authToken
    }
  })
  const getArticlesResponseAfterDeleteJson = await getArticlesResponseAfterDelete.json()
  expect(getArticlesResponseAfterDelete.status()).toEqual(200)
  expect(getArticlesResponseAfterDeleteJson.articles[0].title).not.toEqual('Updated Test Article')
});