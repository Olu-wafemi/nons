/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getContent = /* GraphQL */ `
  query GetContent($contentID: ID!) {
    getContent(contentID: $contentID) {
      contentID
      title
      description
      duration
      contentType
      tags
      publishedDate
      modifiedDate
      author
      activeStatus
      difficultyLevel
      thumbnailURL
      videoURL
      audioURL
      accessibilityFeatures
      userRating
      id
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listContents = /* GraphQL */ `
  query ListContents(
    $filter: ModelContentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listContents(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        contentID
        title
        description
        duration
        contentType
        tags
        publishedDate
        modifiedDate
        author
        activeStatus
        difficultyLevel
        thumbnailURL
        videoURL
        audioURL
        accessibilityFeatures
        userRating
        id
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
