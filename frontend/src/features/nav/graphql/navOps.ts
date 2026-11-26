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

// ─── Nav Item Mutations ───────────────────────────────────────────────────────

export const CREATE_NAV_ITEM = gql`
  mutation CreateNavItem($label: String!, $url: String!, $sortOrder: Int!) {
    createNavItem(label: $label, url: $url, sortOrder: $sortOrder) {
      success
      message
    }
  }
`;

export const UPDATE_NAV_ITEM = gql`
  mutation UpdateNavItem($id: Int!, $label: String!, $url: String!, $sortOrder: Int!, $isVisible: Boolean!) {
    updateNavItem(id: $id, label: $label, url: $url, sortOrder: $sortOrder, isVisible: $isVisible) {
      success
      message
    }
  }
`;

export const DELETE_NAV_ITEM = gql`
  mutation DeleteNavItem($id: Int!) {
    deleteNavItem(id: $id) {
      success
      message
    }
  }
`;

// ─── Nav Subitem Mutations ────────────────────────────────────────────────────

export const CREATE_NAV_SUBITEM = gql`
  mutation CreateNavSubitem($navItemId: Int!, $label: String!, $url: String!, $sortOrder: Int!) {
    createNavSubitem(navItemId: $navItemId, label: $label, url: $url, sortOrder: $sortOrder) {
      success
      message
    }
  }
`;

export const UPDATE_NAV_SUBITEM = gql`
  mutation UpdateNavSubitem($id: Int!, $label: String!, $url: String!, $sortOrder: Int!, $isVisible: Boolean!) {
    updateNavSubitem(id: $id, label: $label, url: $url, sortOrder: $sortOrder, isVisible: $isVisible) {
      success
      message
    }
  }
`;

export const DELETE_NAV_SUBITEM = gql`
  mutation DeleteNavSubitem($id: Int!) {
    deleteNavSubitem(id: $id) {
      success
      message
    }
  }
`;
