import { eq, asc } from "drizzle-orm";
import { db } from "../config.ts";
import { nav_items, nav_subitems } from "../databases/schema.ts";

// ─── READ ────────────────────────────────────────────────────────────────────

// Fetch all nav items + their sub-items, ordered by sort_order.
// Used by the public navbar on every page load.
export async function getNavItems() {
  const items = await db
    .select()
    .from(nav_items)
    .orderBy(asc(nav_items.sort_order));

  const subitems = await db
    .select()
    .from(nav_subitems)
    .orderBy(asc(nav_subitems.sort_order));

  // Attach sub-items to their parent item
  return items.map((item) => ({
    ...item,
    subitems: subitems.filter((s) => s.nav_item_id === item.id),
  }));
}

// ─── NAV ITEM MUTATIONS ──────────────────────────────────────────────────────

export async function createNavItem(
  label: string,
  url: string,
  sort_order: number,
) {
  await db.insert(nav_items).values({ label, url, sort_order });
  return true;
}

export async function updateNavItem(
  id: number,
  label: string,
  url: string,
  sort_order: number,
  is_visible: boolean,
) {
  await db
    .update(nav_items)
    .set({ label, url, sort_order, is_visible })
    .where(eq(nav_items.id, id));
  return true;
}

export async function deleteNavItem(id: number) {
  // Cascade delete in DB handles subitems automatically
  await db.delete(nav_items).where(eq(nav_items.id, id));
  return true;
}

// ─── NAV SUBITEM MUTATIONS ───────────────────────────────────────────────────

export async function createNavSubitem(
  nav_item_id: number,
  label: string,
  url: string,
  sort_order: number,
) {
  await db.insert(nav_subitems).values({ nav_item_id, label, url, sort_order });
  return true;
}

export async function updateNavSubitem(
  id: number,
  label: string,
  url: string,
  sort_order: number,
  is_visible: boolean,
) {
  await db
    .update(nav_subitems)
    .set({ label, url, sort_order, is_visible })
    .where(eq(nav_subitems.id, id));
  return true;
}

export async function deleteNavSubitem(id: number) {
  await db.delete(nav_subitems).where(eq(nav_subitems.id, id));
  return true;
}
