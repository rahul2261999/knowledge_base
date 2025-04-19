# Knowledge Base API Documentation

Base URL: `/rag/api/v1`

## Content Types
- For POST and PATCH requests with JSON body: `Content-Type: application/json`
- For file uploads: `Content-Type: multipart/form-data`
- For responses: `Content-Type: application/json`

## Table of Contents
1. [Health Check](#1-health-check)
2. [Knowledgebase](#2-knowledgebase)
   2.1. [Create Knowledgebase](#21-create-knowledgebase)
   2.2. [List Knowledgebases](#22-list-knowledgebases)
   2.3. [Get Knowledgebase](#23-get-knowledgebase)
   2.4. [Delete Knowledgebase](#24-delete-knowledgebase)
   2.5. [Query Knowledgebase](#25-query-knowledgebase)
3. [Documents](#3-documents)
   3.1. [Upload Document](#31-upload-document)
   3.2. [List Documents](#32-list-documents)
   3.3. [Get Document](#33-get-document)
   3.4. [Delete Document](#34-delete-document)
4. [Websites](#4-websites)
   4.1. [Add Website](#41-add-website)
   4.2. [List Websites](#42-list-websites)
   4.3. [Get Website](#43-get-website)
   4.4. [Update Website](#44-update-website)
   4.5. [Delete Website](#45-delete-website)
5. [Crawler](#5-crawler)
   5.1. [Start Crawling](#51-start-crawling)

## 1. Health Check

### 1.1. GET /health
Check the health status of the API.

**Headers**
- Accept: `application/json`

**Response**
- Content-Type: `application/json`
```json
{
    "status": "UP"
}
```

## 2. Knowledgebase

### 2.1. Create Knowledgebase
**POST** `/knowledgebases`

Create a new knowledgebase.

**Headers**
- Content-Type: `application/json`
- Accept: `application/json`

**Parameters**
- `tenantId` (path): Tenant identifier

**Request Body**
```json
{
    "name": "string"
}
```

**Response**
```json
{
    "message": "Knowledgebase created successfully",
    "statusCode": 200,
    "data": {
        "id": "string",
        "tenantId": "string",
        "name": "string",
        "status": "string",
        "createdBy": "string",
        "updatedBy": "string",
        "createdAt": "string",
        "updatedAt": "string"
    }
}
```

### 2.2. List Knowledgebases
**GET** `/knowledgebases`

Get all knowledgebases for a tenant.

**Headers**
- Accept: `application/json`

**Parameters**
- `tenantId` (path): Tenant identifier

**Response**
```json
{
    "message": "Knowledgebase fetched successfully",
    "statusCode": 200,
    "data": [
        {
            "id": "string",
            "tenantId": "string",
            "name": "string",
            "status": "string",
            "createdBy": "string",
            "updatedBy": "string",
            "createdAt": "string",
            "updatedAt": "string"
        }
    ]
}
```

### 2.3. Get Knowledgebase
**GET** `/knowledgebases/{knowledgebaseId}`

Get a specific knowledgebase.

**Headers**
- Accept: `application/json`

**Parameters**
- `tenantId` (path): Tenant identifier
- `knowledgebaseId` (path): Knowledgebase identifier

**Response**
```json
{
    "message": "Knowledgebase find successfully",
    "statusCode": 200,
    "data": {
        "id": "string",
        "tenantId": "string",
        "name": "string",
        "status": "string",
        "createdBy": "string",
        "updatedBy": "string",
        "createdAt": "string",
        "updatedAt": "string"
    }
}
```

### 2.4. Delete Knowledgebase
**DELETE** `/knowledgebases/{knowledgebaseId}`

Delete a knowledgebase.

**Headers**
- Accept: `application/json`

**Parameters**
- `knowledgebaseId` (path): Knowledgebase identifier

**Response**
```json
{
    "message": "Knowledgebase deleted successfully",
    "statusCode": 200
}
```

### 2.5. Query Knowledgebase
**POST** `/knowledgebases/{knowledgebaseId}/query`

Query a knowledgebase for information.

**Headers**
- Content-Type: `application/json`
- Accept: `application/json`

**Parameters**
- `knowledgebaseId` (path): Knowledgebase identifier

**Request Body**
```json
{
    "bucketName": "string",
    "conversationId": "string" (optional),
    "query": "string" (3-1000 characters)
}
```

**Response**
```json
{
    "message": "Knowledgebase query executed successfully",
    "statusCode": 200,
    "data": {
        "id": "string",
        "text": "string",
        "bucketName": "string",
        "source": "string",
        "relevanceScore": "number"
    }
}
```

## 3. Documents

### 3.1. Upload Document
**POST** `/knowledgebases/{knowledgebaseId}/document`

Upload a document to a knowledgebase.

**Headers**
- Content-Type: `multipart/form-data`
- Accept: `application/json`

**Parameters**
- `tenantId` (path): Tenant identifier
- `knowledgebaseId` (path): Knowledgebase identifier

**Request Body**
- `file` (form-data): Document file (max size: 50MB)
- Additional document metadata

**Response**
```json
{
    "message": "Document uploaded successfully",
    "statusCode": 200,
    "data": {
        "id": "string",
        "tenantId": "string",
        "knowledgebaseId": "string",
        "name": "string",
        "size": "number",
        "bucketName": "string",
        "processingStatus": "string",
        "status": "string",
        "createdAt": "string",
        "updatedAt": "string",
        "createdBy": "string",
        "updatedBy": "string"
    }
}
```

### 3.2. List Documents
**GET** `/knowledgebases/{knowledgebaseId}/document`

Get all documents in a knowledgebase.

**Headers**
- Accept: `application/json`

**Parameters**
- `knowledgebaseId` (path): Knowledgebase identifier

**Response**
```json
{
    "message": "Documents fetched successfully",
    "statusCode": 200,
    "data": [
        {
            "id": "string",
            "tenantId": "string",
            "knowledgebaseId": "string",
            "name": "string",
            "size": "number",
            "bucketName": "string",
            "processingStatus": "string",
            "status": "string",
            "createdAt": "string",
            "updatedAt": "string",
            "createdBy": "string",
            "updatedBy": "string"
        }
    ]
}
```

### 3.3. Get Document
**GET** `/knowledgebases/{knowledgebaseId}/document/{documentId}`

Get a specific document.

**Headers**
- Accept: `application/json`

**Parameters**
- `knowledgebaseId` (path): Knowledgebase identifier
- `documentId` (path): Document identifier

**Response**
```json
{
    "message": "Document fetched successfully",
    "statusCode": 200,
    "data": {
        "id": "string",
        "tenantId": "string",
        "knowledgebaseId": "string",
        "name": "string",
        "size": "number",
        "bucketName": "string",
        "processingStatus": "string",
        "status": "string",
        "createdAt": "string",
        "updatedAt": "string",
        "createdBy": "string",
        "updatedBy": "string"
    }
}
```

### 3.4. Delete Document
**DELETE** `/knowledgebases/{knowledgebaseId}/document/{documentId}`

Delete a document.

**Headers**
- Accept: `application/json`

**Parameters**
- `knowledgebaseId` (path): Knowledgebase identifier
- `documentId` (path): Document identifier

**Response**
```json
{
    "message": "Document deleted successfully",
    "statusCode": 200
}
```

## 4. Websites

### 4.1. Add Website
**POST** `/knowledgebases/{knowledgebaseId}/website`

Add a website to crawl.

**Headers**
- Content-Type: `application/json`
- Accept: `application/json`

**Parameters**
- `tenantId` (path): Tenant identifier
- `knowledgebaseId` (path): Knowledgebase identifier

**Request Body**
```json
{
    "url": "string",
    "depth": "number" (1-5)
}
```

**Response**
```json
{
    "message": "Website uploaded successfully",
    "statusCode": 200,
    "data": {
        "id": "string",
        "tenantId": "string",
        "knowledgebaseId": "string",
        "url": "string",
        "depth": "number",
        "processingStatus": "string",
        "status": "string",
        "createdBy": "string",
        "updatedBy": "string",
        "createdAt": "string",
        "updatedAt": "string"
    }
}
```

### 4.2. List Websites
**GET** `/knowledgebases/{knowledgebaseId}/website`

Get all websites in a knowledgebase.

**Headers**
- Accept: `application/json`

**Parameters**
- `knowledgebaseId` (path): Knowledgebase identifier

**Response**
```json
{
    "message": "Websites fetched successfully",
    "statusCode": 200,
    "data": [
        {
            "id": "string",
            "tenantId": "string",
            "knowledgebaseId": "string",
            "url": "string",
            "depth": "number",
            "processingStatus": "string",
            "status": "string",
            "createdBy": "string",
            "updatedBy": "string",
            "createdAt": "string",
            "updatedAt": "string"
        }
    ]
}
```

### 4.3. Get Website
**GET** `/knowledgebases/{knowledgebaseId}/website/{websiteId}`

Get a specific website.

**Headers**
- Accept: `application/json`

**Parameters**
- `knowledgebaseId` (path): Knowledgebase identifier
- `websiteId` (path): Website identifier

**Response**
```json
{
    "message": "Website fetched successfully",
    "statusCode": 200,
    "data": {
        "id": "string",
        "tenantId": "string",
        "knowledgebaseId": "string",
        "url": "string",
        "depth": "number",
        "processingStatus": "string",
        "status": "string",
        "createdBy": "string",
        "updatedBy": "string",
        "createdAt": "string",
        "updatedAt": "string"
    }
}
```

### 4.4. Update Website
**PATCH** `/knowledgebases/{knowledgebaseId}/website/{websiteId}`

Update a website configuration.

**Headers**
- Content-Type: `application/json`
- Accept: `application/json`

**Parameters**
- `knowledgebaseId` (path): Knowledgebase identifier
- `websiteId` (path): Website identifier

**Request Body**
```json
{
    "url": "string",
    "depth": "number" (1-5),
    "forceRefresh": "boolean"
}
```

**Response**
```json
{
    "message": "Website updated successfully",
    "statusCode": 200
}
```

### 4.5. Delete Website
**DELETE** `/knowledgebases/{knowledgebaseId}/website/{websiteId}`

Delete a website.

**Headers**
- Accept: `application/json`

**Parameters**
- `knowledgebaseId` (path): Knowledgebase identifier
- `websiteId` (path): Website identifier

**Response**
```json
{
    "message": "Document deleted successfully",
    "statusCode": 200
}
```

## 5. Crawler

### 5.1. Start Crawling
**POST** `/crawler/crawl`

Start crawling a website.

**Headers**
- Content-Type: `application/json`
- Accept: `application/json`

**Request Body**
```json
{
    "websiteId": "string",
    "knowledgebaseId": "string",
    "url": "string",
    "depth": "number" (1-5),
    "forceRefresh": "boolean" (optional)
}
```

**Response**
```json
{
    "message": "Crawling started successfully"
}
``` 