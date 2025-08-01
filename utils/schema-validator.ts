/**
 * Schema Validator Module
 * 
 * This module provides comprehensive JSON schema validation for API responses using AJV.
 * Features include:
 * - Automatic schema generation from API responses
 * - Schema validation with detailed error reporting
 * - Smart format detection (dates, emails, URLs, UUIDs)
 * - File-based schema storage and management
 * 
 * Usage:
 * - validateSchema('articles', 'GET_articles', responseBody) - validate against existing schema
 * - validateSchema('articles', 'GET_articles', responseBody, true) - generate new schema if missing
 */

import fs from 'fs/promises'
import path from 'path'
import Ajv from "ajv"
import { createSchema } from 'genson-js';
import addFormats from "ajv-formats"

/* Base directory for storing JSON schema files */
const SCHEMA_BASE_PATH = './response-schemas'

/* Initialize AJV validator with all errors reporting and format support */
const ajv = new Ajv({ allErrors: true })
addFormats(ajv) /* Add format validators (email, date-time, uri, etc.) */

/**
 * Validates an API response against a JSON schema file.
 * Optionally generates a new schema if one doesn't exist or if explicitly requested.
 * 
 * @param dirName - Directory name under response-schemas (e.g., 'articles', 'tags')
 * @param fileName - Schema file name without extension (e.g., 'GET_articles', 'POST_users')
 * @param responseBody - The API response object to validate
 * @param createSchemaFlag - If true, generates a new schema from the response body
 * 
 * @throws Error - Throws detailed validation error with schema mismatches and actual response
 * 
 * Schema File Path: ./response-schemas/{dirName}/{fileName}_schema.json
 * 
 * Example Usage:
 * - await validateSchema('articles', 'GET_articles', response, false) // validate only
 * - await validateSchema('articles', 'POST_articles', response, true) // generate then validate
 */
export async function validateSchema(dirName: string, fileName: string, responseBody: object, createSchemaFlag: boolean = false) {
    /* Construct the full path to the schema file */
    const schemaPath = path.join(SCHEMA_BASE_PATH, dirName, `${fileName}_schema.json`)

    /* Generate new schema if requested (useful for first-time setup or schema updates) */
    if(createSchemaFlag) await generateNewSchema(responseBody, schemaPath)

    /* Load the schema from file system */
    const schema = await loadSchema(schemaPath)
    
    /* Compile the schema for validation (AJV optimization) */
    const validate = ajv.compile(schema)

    /* Perform validation against the response body */
    const valid = validate(responseBody)
    if (!valid) {
        /* Throw detailed error with validation failures and actual response for debugging */
        throw new Error(
            `Schema validation ${fileName}_schema.json failed:\n`+
            `${JSON.stringify(validate.errors, null, 4)}\n\n`+
            `Actual response body: \n`+
            `${JSON.stringify(responseBody, null, 4)}`
        )
    }
}

/**
 * Loads a JSON schema from the file system.
 * 
 * @param schemaPath - Full path to the schema file
 * @returns Promise<object> - The parsed JSON schema object
 * @throws Error - If schema file cannot be read or parsed
 */
async function loadSchema(schemaPath: string) {
    try {
        /* Read the schema file as UTF-8 text */
        const schemaContent = await fs.readFile(schemaPath, 'utf-8')
        
        /* Parse JSON content and return schema object */
        return JSON.parse(schemaContent)
    } catch (error) {
        throw new Error(`Failed to read the schema file: ${error.message}`)
    }
}

/**
 * Generates a new JSON schema from an API response body and saves it to file.
 * Uses genson-js library to automatically infer schema structure from data.
 * 
 * @param responseBody - The API response object to generate schema from
 * @param schemaPath - Full path where the schema file should be saved
 * @throws Error - If schema generation or file writing fails
 * 
 * Features:
 * - Automatically creates directory structure if it doesn't exist
 * - Infers data types, required fields, and structure
 * - Formats JSON with 4-space indentation for readability
 */
async function generateNewSchema(responseBody: object, schemaPath: string) {
    try {
        /* Generate schema using genson-js automatic inference */
        const generatedSchema = createSchema(responseBody)
        
        /* Create directory structure recursively if it doesn't exist */
        await fs.mkdir(path.dirname(schemaPath), {recursive: true})
        
        /* Write the formatted schema to file */
        await fs.writeFile(schemaPath, JSON.stringify(generatedSchema, null, 4))
    } catch (error) {
        throw new Error(`Failed to create schema file: ${error.message}`)
    }
}

/**
 * ADVANCED SCHEMA ENHANCEMENT FUNCTIONS
 * 
 * The functions below are not currently used in the main validation flow,
 * but provide advanced capabilities for enhancing schemas with format information.
 * They can be integrated to create more sophisticated schema validation that
 * automatically detects and validates specific formats like dates, emails, URLs, etc.
 * 
 * To use these functions:
 * 1. Call addFormatToSchema() on your generated schema
 * 2. The enhanced schema will include format validations
 * 3. AJV will then validate both structure AND format
 * 
 * Example Enhancement Flow:
 * const baseSchema = createSchema(responseBody)
 * const enhancedSchema = addFormatToSchema(baseSchema, responseBody)
 * // enhancedSchema now includes format: 'email', 'date-time', 'uri', etc.
 */

/**
 * Recursively adds format information to a JSON schema based on field names and values.
 * This creates more strict validation by detecting common patterns.
 * 
 * @param schema - The base JSON schema object
 * @param responseBody - The sample response data to analyze
 * @returns Enhanced schema with format information added
 * 
 * Supported Formats:
 * - date-time: ISO 8601 timestamps
 * - email: Email addresses
 * - uri: URLs and URIs
 * - uuid: UUID identifiers
 */
function addFormatToSchema(schema: any, responseBody: any): any {
    if (typeof schema !== 'object' || schema === null) {
        return schema
    }

    /* Handle array schemas by enhancing the items schema */
    if (schema.type === 'array' && schema.items) {
        return {
            ...schema,
            items: addFormatToSchema(schema.items, Array.isArray(responseBody) ? responseBody[0] : undefined)
        }
    }

    /* Handle object schemas by enhancing each property */
    if (schema.type === 'object' && schema.properties) {
        const enhancedProperties = {}
        
        /* Process each property in the schema */
        for (const [key, value] of Object.entries(schema.properties)) {
            const responseValue = responseBody?.[key]
            enhancedProperties[key] = addFormatToProperty(key, value as any, responseValue)
        }

        return {
            ...schema,
            properties: enhancedProperties
        }
    }

    return schema
}

/**
 * Adds format information to a single schema property based on field name and value analysis.
 * 
 * @param fieldName - The property name to analyze
 * @param property - The property schema object
 * @param value - The actual value from the response
 * @returns Enhanced property schema with format if detected
 * 
 * Detection Strategy:
 * 1. Field name pattern matching (e.g., 'email', 'createdAt', 'url')
 * 2. Value format analysis (e.g., email regex, ISO date format)
 * 3. Combined analysis for higher accuracy
 */
function addFormatToProperty(fieldName: string, property: any, value: any): any {
    /* Skip if not a string type or already has format defined */
    if (property.type !== 'string' || property.format) {
        return addFormatToSchema(property, value)
    }

    const lowerFieldName = fieldName.toLowerCase()
    
    /* Date/DateTime format detection */
    if (isDateField(lowerFieldName, value)) {
        return { ...property, format: 'date-time' }
    }

    /* Email format detection */
    if (isEmailField(lowerFieldName, value)) {
        return { ...property, format: 'email' }
    }

    /* URL/URI format detection */
    if (isUrlField(lowerFieldName, value)) {
        return { ...property, format: 'uri' }
    }

    /* UUID format detection */
    if (isUuidField(lowerFieldName, value)) {
        return { ...property, format: 'uuid' }
    }

    return property
}

/**
 * Detects if a field represents a date/datetime value.
 * Uses both field name patterns and value format analysis.
 * 
 * @param fieldName - Lowercase field name
 * @param value - The actual field value
 * @returns true if field appears to be a date/datetime
 */
function isDateField(fieldName: string, value: any): boolean {
    /* Common date field name patterns */
    const dateFieldPatterns = [
        'createdat', 'updatedat', 'deletedat', 'modifiedat',
        'date', 'time', 'timestamp', 'datetime',
        'expiry', 'expires', 'expiration'
    ]
    
    /* Check if field name contains date-related terms */
    const hasDateFieldName = dateFieldPatterns.some(pattern => 
        fieldName.includes(pattern)
    )

    /* Check if value matches ISO 8601 date-time format */
    const hasDateFormat = typeof value === 'string' && 
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/.test(value)

    return hasDateFieldName || hasDateFormat
}

/**
 * Detects if a field represents an email address.
 * 
 * @param fieldName - Lowercase field name
 * @param value - The actual field value
 * @returns true if field appears to be an email
 */
function isEmailField(fieldName: string, value: any): boolean {
    /* Common email field name patterns */
    const emailFieldPatterns = ['email', 'mail', 'emailaddress']
    
    const hasEmailFieldName = emailFieldPatterns.some(pattern => 
        fieldName.includes(pattern)
    )

    /* Basic email format validation */
    const hasEmailFormat = typeof value === 'string' && 
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

    return hasEmailFieldName || hasEmailFormat
}

/**
 * Detects if a field represents a URL or URI.
 * 
 * @param fieldName - Lowercase field name
 * @param value - The actual field value
 * @returns true if field appears to be a URL/URI
 */
function isUrlField(fieldName: string, value: any): boolean {
    /* Common URL field name patterns */
    const urlFieldPatterns = [
        'url', 'uri', 'link', 'href', 'image', 'avatar', 
        'picture', 'photo', 'thumbnail', 'website'
    ]
    
    const hasUrlFieldName = urlFieldPatterns.some(pattern => 
        fieldName.includes(pattern)
    )

    /* Basic URL format validation (http/https) */
    const hasUrlFormat = typeof value === 'string' && 
        /^https?:\/\/.+/.test(value)

    return hasUrlFieldName || hasUrlFormat
}

/**
 * Detects if a field represents a UUID identifier.
 * 
 * @param fieldName - Lowercase field name
 * @param value - The actual field value
 * @returns true if field appears to be a UUID
 */
function isUuidField(fieldName: string, value: any): boolean {
    /* Common UUID field name patterns */
    const uuidFieldPatterns = ['id', 'uuid', 'guid']
    
    const hasUuidFieldName = uuidFieldPatterns.some(pattern => 
        fieldName.includes(pattern)
    )

    /* UUID format validation (standard UUID v1-v5 format) */
    const hasUuidFormat = typeof value === 'string' && 
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)

    return hasUuidFieldName || hasUuidFormat
}