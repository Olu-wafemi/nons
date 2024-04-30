/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createContent = /* GraphQL */ `
  mutation CreateContent(
    $input: CreateContentInput!
    $condition: ModelContentConditionInput
  ) {
    createContent(input: $input, condition: $condition) {
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
export const updateContent = /* GraphQL */ `
  mutation UpdateContent(
    $input: UpdateContentInput!
    $condition: ModelContentConditionInput
  ) {
    updateContent(input: $input, condition: $condition) {
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
export const deleteContent = /* GraphQL */ `
  mutation DeleteContent(
    $input: DeleteContentInput!
    $condition: ModelContentConditionInput
  ) {
    deleteContent(input: $input, condition: $condition) {
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
