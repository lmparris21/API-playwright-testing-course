import { test } from '../../utils/fixtures';
import { expect } from '../../utils/custom-expect';
import { createToken } from '../../helpers/createToken';
import { APILogger } from '../../utils/logger';
import articleRequestPayload from '../../request-objects/articles/POST-article.json'
import { faker } from '@faker-js/faker'
import { getNewRandomArticle } from '../../utils/data-generator';

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
    // const articleRequest = JSON.parse(JSON.stringify(articleRequestPayload))  /* This is needed to avoid the reference issues if running tests in parallel */ 
    // articleRequest.article.title = 'This is an object'  /* uncomment if you want to override the title */
    const articleRequest = getNewRandomArticle()
    const createArticleResponse = await api
        .path('/articles')
        .body(articleRequest)
        .postRequest(201)
    await expect(createArticleResponse).shouldMatchSchema('articles', 'POST_articles')
    expect(createArticleResponse.article.title).shouldEqual(articleRequest.article.title)
    const slugId = createArticleResponse.article.slug

    const articlesResponse = await api
        .path('/articles')
        .params({ limit: 10, offset: 0 })
        .getRequest(200)
    await expect(articlesResponse).shouldMatchSchema('articles', 'GET_articles')
    expect(articlesResponse.articles[0].title).shouldEqual(articleRequest.article.title)

    await api
        .path(`/articles/${slugId}`)
        .deleteRequest(204)

    const articlesResponseTwo = await api
        .path('/articles')
        .params({ limit: 10, offset: 0 })
        .getRequest(200)
    await expect(articlesResponseTwo).shouldMatchSchema('articles', 'GET_articles')
    expect(articlesResponseTwo.articles[0].title).not.shouldEqual(articleRequest.article.title)
})

test('Create, Update and Delete Article', async ({ api }) => {
    const articleTitle = faker.lorem.sentence(5)
    const articleRequest = JSON.parse(JSON.stringify(articleRequestPayload))  /* This is needed to avoid the reference issues if running tests in parallel */ 
    articleRequest.article.title = articleTitle  /* This is overriding the title in the request payload */
    const createArticleResponse = await api
        .path('/articles')
        .body(articleRequest)
        .postRequest(201)
    await expect(createArticleResponse).shouldMatchSchema('articles', 'POST_articles')
    expect(createArticleResponse.article.title).shouldEqual(articleTitle)
    const slugId = createArticleResponse.article.slug

    const articlesResponse = await api
        .path('/articles')
        .params({ limit: 10, offset: 0 })
        .getRequest(200)
    await expect(articlesResponse).shouldMatchSchema('articles', 'GET_articles')
    expect(articlesResponse.articles[0].title).shouldEqual(articleTitle)

    const articleTitleModified = faker.lorem.sentence(5)
    articleRequest.article.title = articleTitleModified  /* This is overriding the title in the request payload */
    const updateArticleResponse = await api
        
        .path(`/articles/${slugId}`)
        .body(articleRequest)
        .putRequest(200)
    await expect(updateArticleResponse).shouldMatchSchema('articles', 'PUT_articles')
    expect(updateArticleResponse.article.title).shouldEqual(articleTitleModified)
    const slugIdUpdated = updateArticleResponse.article.slug

    const articlesResponseUpdated = await api
        .path('/articles')
        .params({ limit: 10, offset: 0 })
        .getRequest(200)
    await expect(articlesResponseUpdated).shouldMatchSchema('articles', 'GET_articles')
    expect(articlesResponseUpdated.articles[0].title).shouldEqual(articleTitleModified)

    await api
        .path(`/articles/${slugIdUpdated}`)
        .deleteRequest(204)

    const articlesResponseTwo = await api
        .path('/articles')
        .params({ limit: 10, offset: 0 })
        .getRequest(200)
    await expect(articlesResponseTwo).shouldMatchSchema('articles', 'GET_articles')
    expect(articlesResponseTwo.articles[0].title).not.shouldEqual(articleTitleModified)
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

