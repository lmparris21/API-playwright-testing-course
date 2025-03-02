import { test, expect } from '@playwright/test';

test('get test tags', async ({ request }) => {
  const tagsResponse = await request.get('https://conduit-api.bondaracademy.com/api/tags')
  const tagsResponseJson = await tagsResponse.json()

  expect(tagsResponse.status()).toEqual(200)
  expect(tagsResponseJson.tags[0]).toEqual('Test')
  expect(tagsResponseJson.tags.length).toBeLessThanOrEqual(10)
});

test('Get All Articles', async ({ request }) => {
  const articlesResponse = await request.get('https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0')
  const articlesResponseJson = await articlesResponse.json()

  expect(articlesResponse.status()).toEqual(200)
  expect(articlesResponseJson.articles.length).toBeLessThanOrEqual(10)
  expect(articlesResponseJson.articlesCount).toEqual(10)
});

test('Create Article', async ({ request }) => {
  const tokenResponse = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
    data: {
      "user": {
          "email": "lmparris21@gmail.com",
          "password": "apitesting123!"
      }
  }
  })
  const tokenResponseJson = await tokenResponse.json()
  const authToken = tokenResponseJson.user.token
  console.log(authToken)

  const createArticleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles', {
    headers: {
      'Authorization': `Token ${authToken}`
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
  console.log(createArticleResponseJson)
});
