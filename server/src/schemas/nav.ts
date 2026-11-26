import { builder, GQLResponse } from "../libraries/builder.ts";
import {
  getNavItems,
  createNavItem,
  updateNavItem,
  deleteNavItem,
  createNavSubitem,
  updateNavSubitem,
  deleteNavSubitem,
} from "../resolvers/nav.ts";

// ─── TYPES ───────────────────────────────────────────────────────────────────

// Represents one sub-item (e.g. "Courses" under "Services")
const NavSubitemObject = builder
  .objectRef<{
    id: number;
    nav_item_id: number;
    label: string;
    url: string;
    sort_order: number;
    is_visible: boolean;
  }>("NavSubitem")
  .implement({
    fields: (t) => ({
      id: t.exposeInt("id"),
      navItemId: t.exposeInt("nav_item_id"),
      label: t.exposeString("label"),
      url: t.exposeString("url"),
      sortOrder: t.exposeInt("sort_order"),
      isVisible: t.exposeBoolean("is_visible"),
    }),
  });

// Represents one top-level menu item (e.g. "Services"), with its sub-items
const NavItemObject = builder
  .objectRef<{
    id: number;
    label: string;
    url: string;
    sort_order: number;
    is_visible: boolean;
    subitems: {
      id: number;
      nav_item_id: number;
      label: string;
      url: string;
      sort_order: number;
      is_visible: boolean;
    }[];
  }>("NavItem")
  .implement({
    fields: (t) => ({
      id: t.exposeInt("id"),
      label: t.exposeString("label"),
      url: t.exposeString("url"),
      sortOrder: t.exposeInt("sort_order"),
      isVisible: t.exposeBoolean("is_visible"),
      subitems: t.expose("subitems", { type: [NavSubitemObject] }),
    }),
  });

// ─── QUERY (public — no login required) ──────────────────────────────────────

builder.queryField("getNavItems", (t) =>
  t.field({
    type: [NavItemObject],
    args: {},
    resolve: async () => {
      return await getNavItems();
    },
  }),
);

// ─── NAV ITEM MUTATIONS (admin only) ─────────────────────────────────────────

builder.mutationField("createNavItem", (t) =>
  t.field({
    authScopes: { isValidSession: true },
    type: GQLResponse,
    args: {
      label: t.arg.string({ required: true }),
      url: t.arg.string({ required: true }),
      sortOrder: t.arg.int({ required: true }),
    },
    resolve: async (_parent, args) => {
      const result = await createNavItem(args.label, args.url, args.sortOrder);
      return result
        ? { success: true, message: "Nav item created" }
        : { success: false, message: "Failed to create nav item" };
    },
  }),
);

builder.mutationField("updateNavItem", (t) =>
  t.field({
    authScopes: { isValidSession: true },
    type: GQLResponse,
    args: {
      id: t.arg.int({ required: true }),
      label: t.arg.string({ required: true }),
      url: t.arg.string({ required: true }),
      sortOrder: t.arg.int({ required: true }),
      isVisible: t.arg.boolean({ required: true }),
    },
    resolve: async (_parent, args) => {
      const result = await updateNavItem(
        args.id,
        args.label,
        args.url,
        args.sortOrder,
        args.isVisible,
      );
      return result
        ? { success: true, message: "Nav item updated" }
        : { success: false, message: "Failed to update nav item" };
    },
  }),
);

builder.mutationField("deleteNavItem", (t) =>
  t.field({
    authScopes: { isValidSession: true },
    type: GQLResponse,
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: async (_parent, args) => {
      const result = await deleteNavItem(args.id);
      return result
        ? { success: true, message: "Nav item deleted" }
        : { success: false, message: "Failed to delete nav item" };
    },
  }),
);

// ─── NAV SUBITEM MUTATIONS (admin only) ──────────────────────────────────────

builder.mutationField("createNavSubitem", (t) =>
  t.field({
    authScopes: { isValidSession: true },
    type: GQLResponse,
    args: {
      navItemId: t.arg.int({ required: true }),
      label: t.arg.string({ required: true }),
      url: t.arg.string({ required: true }),
      sortOrder: t.arg.int({ required: true }),
    },
    resolve: async (_parent, args) => {
      const result = await createNavSubitem(
        args.navItemId,
        args.label,
        args.url,
        args.sortOrder,
      );
      return result
        ? { success: true, message: "Sub-item created" }
        : { success: false, message: "Failed to create sub-item" };
    },
  }),
);

builder.mutationField("updateNavSubitem", (t) =>
  t.field({
    authScopes: { isValidSession: true },
    type: GQLResponse,
    args: {
      id: t.arg.int({ required: true }),
      label: t.arg.string({ required: true }),
      url: t.arg.string({ required: true }),
      sortOrder: t.arg.int({ required: true }),
      isVisible: t.arg.boolean({ required: true }),
    },
    resolve: async (_parent, args) => {
      const result = await updateNavSubitem(
        args.id,
        args.label,
        args.url,
        args.sortOrder,
        args.isVisible,
      );
      return result
        ? { success: true, message: "Sub-item updated" }
        : { success: false, message: "Failed to update sub-item" };
    },
  }),
);

builder.mutationField("deleteNavSubitem", (t) =>
  t.field({
    authScopes: { isValidSession: true },
    type: GQLResponse,
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: async (_parent, args) => {
      const result = await deleteNavSubitem(args.id);
      return result
        ? { success: true, message: "Sub-item deleted" }
        : { success: false, message: "Failed to delete sub-item" };
    },
  }),
);
