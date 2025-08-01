import { test } from '../utils/fixtures';
import { expect } from '../utils/custom-expect';
import { createToken } from '../helpers/createToken';
import { APILogger } from '../utils/logger';

/*
* This is needed if you want to use a different user than the default user.
* The default user is the user in the api-test.config.ts file.
*/
// let authToken: string

// test.beforeAll(async ({ api }) => {
//     authToken = await createToken('pwapiuser@test.com', 'Welcome')
// })

test('Get Articles', async ({ api }) => {
    const articlesResponse = await api
        .path('/articles')
        //.headers({ 'Authorization': authToken }) //uncomment this to add the Authorization header other than the defaultAuthToken
        .params({ limit: 10, offset: 0 })
        //.clearAuth() //uncomment this to clear the default Authorization header
        .getRequest(200)
    await expect(articlesResponse).shouldMatchSchema('articles', 'GET_articles')
    expect(articlesResponse.articles.length).shouldBeLessThanOrEqual(10)
    expect(articlesResponse.articlesCount).shouldEqual(10)
})

test('Get Test Tags', async ({ api }) => {
    const tagsResponse = await api
        .path('/tags')
        .getRequest(200)
    await expect(tagsResponse).shouldMatchSchema('tags', 'GET_tags')
    expect(tagsResponse.tags[0]).shouldEqual('Test')
    expect(tagsResponse.tags.length).shouldBeLessThanOrEqual(10)
})

test('Create and Delete Article', async ({ api }) => {
    const createArticleResponse = await api
        .path('/articles')
        .body({ "article": { "title": "Hello World", "description": "Hello World", "body": "HELLO", "tagList": [] } })
        .postRequest(201)
    await expect(createArticleResponse).shouldMatchSchema('articles', 'POST_articles')
    expect(createArticleResponse.article.title).shouldEqual('Hello World')
    const slugId = createArticleResponse.article.slug

    const articlesResponse = await api
        .path('/articles')
        .params({ limit: 10, offset: 0 })
        .getRequest(200)
    await expect(articlesResponse).shouldMatchSchema('articles', 'GET_articles')
    expect(articlesResponse.articles[0].title).shouldEqual('Hello World')

    const updateArticleResponse = await api
        .path(`/articles/${slugId}`)
        .body({ "article": { "title": "Hello World Updated", "description": "Hello World Updated", "body": "HELLO", "tagList": [] } })
        .putRequest(200)
    await expect(updateArticleResponse).shouldMatchSchema('articles', 'PUT_articles')
    expect(updateArticleResponse.article.title).shouldEqual('Hello World Updated')
    const slugIdUpdated = updateArticleResponse.article.slug

    const articlesResponseUpdated = await api
        .path('/articles')
        .params({ limit: 10, offset: 0 })
        .getRequest(200)
    await expect(articlesResponseUpdated).shouldMatchSchema('articles', 'GET_articles')
    expect(articlesResponseUpdated.articles[0].title).shouldEqual('Hello World Updated')

    await api
        .path(`/articles/${slugIdUpdated}`)
        .deleteRequest(204)

    const articlesResponseTwo = await api
        .path('/articles')
        .params({ limit: 10, offset: 0 })
        .getRequest(200)
    await expect(articlesResponseTwo).shouldMatchSchema('articles', 'GET_articles')
    expect(articlesResponseTwo.articles[0].title).not.shouldEqual('Hello World Updated')
})

/*
* This test is used to test the logger.
* It creates two logger instances and logs two requests.
* It then gets the recent logs from each logger and prints them to the console. 
* This is used to test the logger and ensure it is working as expected.
* It is not used in the other tests.
*/
test('logger', async () => {
    const logger = new APILogger()
    const logger2 = new APILogger()
    logger.logRequest('POST', 'https://api.realworld.io/api/articles', { 'Authorization': 'Bearer 1234567890' }, {foo: 'bar'})
    logger.logResponse(200, {foo: 'bar'})
    logger2.logRequest('GET', 'https://api.realworld.io/api/articles123', { 'Authorization': 'Bearer 1234567890' }, {foo: 'bar'})
    logger2.logResponse(200, {foo: 'bar'})
    const recentLogs = logger.getRecentLogs()
    const recentLogs2 = logger2.getRecentLogs()
    console.log(recentLogs)
    console.log(recentLogs2)
})

