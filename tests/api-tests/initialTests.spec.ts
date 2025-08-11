import { test, expect } from '@playwright/test'

let authToken: string

test.beforeAll('run before all', async ({ request }) => {
    const tokenResponse = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
        data: {
            user: {
                email: "lmparris21@test.com",
                password: "apitesting123!"
            }
        }
    })
    const tokenResponseBody = await tokenResponse.json()
    authToken = 'Token ' + tokenResponseBody.user.token
})

test('GET Test Tags', async ({ request }) => {
    const tagsResponse = await request.get('https://conduit-api.bondaracademy.com/api/tags')
    const tagsResponseBody = await tagsResponse.json()

    expect(tagsResponse.status()).toBe(200)
    expect(tagsResponseBody.tags[0]).toBe('Test')
    expect(tagsResponseBody.tags.length).toBeLessThanOrEqual(10)
})

test('GET Test Articles', async ({ request }) => {
    const articlesResponse = await request.get('https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0')
    const articlesResponseBody = await articlesResponse.json()

    expect(articlesResponse.status()).toBe(200)
    expect(articlesResponseBody.articles.length).toBeLessThanOrEqual(10)
    expect(articlesResponseBody.articlesCount).toBeLessThanOrEqual(10)
})

test('Create and delete article', async ({ request }) => {
    const newArticleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles', {
        data: {
            article: {
                title: 'Test Article',
                description: 'Test Description',
                body: 'Test Body',
                tagList: []
            }
        },
        headers: {
            'Authorization': authToken
        }
    })
    const newArticleResponseBody = await newArticleResponse.json()

    expect(newArticleResponse.status()).toBe(201)
    expect(newArticleResponseBody.article.title).toBe('Test Article')
    const articleSlugId = newArticleResponseBody.article.slug

    const articlesResponse = await request.get('https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0', {
        headers: {
            'Authorization': authToken
        }
    })
    const articlesResponseBody = await articlesResponse.json()

    expect(articlesResponse.status()).toBe(200)
    expect(articlesResponseBody.articles.length).toBeGreaterThan(0)
    expect(articlesResponseBody.articles[0].title).toBe('Test Article')

    const deleteArticleResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${articleSlugId}`, {
        headers: {
            'Authorization': authToken
        }
    })
    expect(deleteArticleResponse.status()).toBe(204)
})

test('Create, update and delete article', async ({ request }) => {
    const newArticleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles', {
        data: {
            article: {
                title: 'Test Article',
                description: 'Test Description',
                body: 'Test Body',
                tagList: []
            }
        },
        headers: {
            'Authorization': authToken
        }
    })
    const newArticleResponseBody = await newArticleResponse.json()

    expect(newArticleResponse.status()).toBe(201)
    expect(newArticleResponseBody.article.title).toBe('Test Article')
    const articleSlugId = newArticleResponseBody.article.slug

    const articlesResponse = await request.get('https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0', {
        headers: {
            'Authorization': authToken
        }
    })
    const articlesResponseBody = await articlesResponse.json()

    expect(articlesResponse.status()).toBe(200)
    expect(articlesResponseBody.articles.length).toBeGreaterThan(0)
    expect(articlesResponseBody.articles[0].title).toBe('Test Article')

    const updateArticleResponse = await request.put(`https://conduit-api.bondaracademy.com/api/articles/${articleSlugId}`, {
        data: {
            article: {
                title: 'Updated Test Article',
                description: 'Updated Test Description',
                body: 'Updated Test Body',
                tagList: []
            }
        },
        headers: {
            'Authorization': authToken
        }
    })
    const updateArticleResponseBody = await updateArticleResponse.json()

    expect(updateArticleResponse.status()).toBe(200)
    expect(updateArticleResponseBody.article.title).toBe('Updated Test Article')
    const updatedArticleSlugId = updateArticleResponseBody.article.slug

    const updatedArticlesResponse = await request.get('https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0', {
        headers: {
            'Authorization': authToken
        }
    })
    const updatedArticlesResponseBody = await updatedArticlesResponse.json()

    expect(updatedArticlesResponse.status()).toBe(200)
    expect(updatedArticlesResponseBody.articles.length).toBeGreaterThan(0)
    expect(updatedArticlesResponseBody.articles[0].title).toBe('Updated Test Article')

    const deleteArticleResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${updatedArticleSlugId}`, {
        headers: {
            'Authorization': authToken
        }
    })
    expect(deleteArticleResponse.status()).toBe(204)
})
