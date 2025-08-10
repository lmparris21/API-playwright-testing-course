/**
 * Data Generator Utility for API Testing
 * 
 * This module provides utilities for generating random test data using the Faker.js library.
 * It's designed to create realistic, randomized data for API testing scenarios,
 * particularly for testing CRUD operations and ensuring tests don't interfere with each other.
 */

import { faker } from '@faker-js/faker'
import articleRequestPayload from '../request-objects/articles/POST-article.json'

/**
 * Generates a new article object with randomized content for API testing
 * 
 * This function creates a fresh article request payload by:
 * 1. Cloning the base article template from JSON
 * 2. Replacing static content with randomly generated data
 * 3. Ensuring each test run uses unique data to avoid conflicts
 * 
 * @returns {Object} A complete article request object with randomized content
 * 
 * Generated fields:
 * - title: A random sentence with 5 words
 * - description: A random sentence with 3 words  
 * - body: A random paragraph with 8 sentences
 * 
 * Usage example:
 * const newArticle = getNewRandomArticle()
 * // Use newArticle in POST requests for creating test articles
 */
export function getNewRandomArticle() {
    /** Create a deep copy of the template to avoid mutating the original */
    const articleRequest = structuredClone(articleRequestPayload)
    
    /** Generate realistic random content using Faker.js */
    articleRequest.article.title = faker.lorem.sentence(5)        // e.g., "Lorem ipsum dolor sit amet"
    articleRequest.article.description = faker.lorem.sentence(3)  // e.g., "Consectetur adipiscing elit"
    articleRequest.article.body = faker.lorem.paragraph(8)        // A full paragraph of Lorem ipsum text
    
    return articleRequest
}