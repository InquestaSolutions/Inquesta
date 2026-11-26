import { gql } from "@apollo/client";

export const GET_NAV_ITEMS = gql`
  query GetNavItems {
    getNavItems {
      id
      label
      url
      sortOrder
      isVisible
      subitems {
        id
        label
        url
        sortOrder
        isVisible
      }
    }
  }
`;
