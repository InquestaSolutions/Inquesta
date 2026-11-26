import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import toast from "react-hot-toast";
import {
  GET_NAV_ITEMS,
  CREATE_NAV_ITEM,
  UPDATE_NAV_ITEM,
  DELETE_NAV_ITEM,
  CREATE_NAV_SUBITEM,
  UPDATE_NAV_SUBITEM,
  DELETE_NAV_SUBITEM,
} from "../../../../features/nav/graphql/navOps";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavSubitem {
  id: number;
  label: string;
  url: string;
  sortOrder: number;
  isVisible: boolean;
}

interface NavItem {
  id: number;
  label: string;
  url: string;
  sortOrder: number;
  isVisible: boolean;
  subitems: NavSubitem[];
}

type ModalMode = "add-item" | "edit-item" | "add-subitem" | "edit-subitem";

interface ModalState {
  mode: ModalMode;
  item?: NavItem;
  subitem?: NavSubitem;
  parentId?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function NavigationPage() {
  const [modal, setModal] = useState<ModalState | null>(null);
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  // Form state
  const [formLabel, setFormLabel] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formSortOrder, setFormSortOrder] = useState(0);
  const [formIsVisible, setFormIsVisible] = useState(true);

  // ── GraphQL ──
  const { data, refetch } = useQuery<{ getNavItems: NavItem[] }>(GET_NAV_ITEMS, {
    fetchPolicy: "network-only",
  });
  const navItems = data?.getNavItems ?? [];

  const refetchOpts = { onCompleted: () => refetch() };

  const [createNavItem] = useMutation(CREATE_NAV_ITEM, refetchOpts);
  const [updateNavItem] = useMutation(UPDATE_NAV_ITEM, refetchOpts);
  const [deleteNavItem] = useMutation(DELETE_NAV_ITEM, refetchOpts);
  const [createNavSubitem] = useMutation(CREATE_NAV_SUBITEM, refetchOpts);
  const [updateNavSubitem] = useMutation(UPDATE_NAV_SUBITEM, refetchOpts);
  const [deleteNavSubitem] = useMutation(DELETE_NAV_SUBITEM, refetchOpts);

  // ── Open modal helpers ──
  const openAddItem = () => {
    setFormLabel(""); setFormUrl(""); setFormSortOrder(navItems.length + 1); setFormIsVisible(true);
    setModal({ mode: "add-item" });
  };

  const openEditItem = (item: NavItem) => {
    setFormLabel(item.label); setFormUrl(item.url); setFormSortOrder(item.sortOrder); setFormIsVisible(item.isVisible);
    setModal({ mode: "edit-item", item });
  };

  const openAddSubitem = (parentId: number, parentSubitemsCount: number) => {
    setFormLabel(""); setFormUrl(""); setFormSortOrder(parentSubitemsCount + 1); setFormIsVisible(true);
    setModal({ mode: "add-subitem", parentId });
  };

  const openEditSubitem = (sub: NavSubitem, parentId: number) => {
    setFormLabel(sub.label); setFormUrl(sub.url); setFormSortOrder(sub.sortOrder); setFormIsVisible(sub.isVisible);
    setModal({ mode: "edit-subitem", subitem: sub, parentId });
  };

  // ── Submit handler ──
  const handleSubmit = async () => {
    if (!formLabel.trim()) { toast.error("Label is required"); return; }
    try {
      if (modal?.mode === "add-item") {
        await createNavItem({ variables: { label: formLabel, url: formUrl, sortOrder: formSortOrder } });
        toast.success("Menu item added");
      } else if (modal?.mode === "edit-item" && modal.item) {
        await updateNavItem({ variables: { id: modal.item.id, label: formLabel, url: formUrl, sortOrder: formSortOrder, isVisible: formIsVisible } });
        toast.success("Menu item updated");
      } else if (modal?.mode === "add-subitem" && modal.parentId) {
        await createNavSubitem({ variables: { navItemId: modal.parentId, label: formLabel, url: formUrl, sortOrder: formSortOrder } });
        toast.success("Sub-item added");
      } else if (modal?.mode === "edit-subitem" && modal.subitem) {
        await updateNavSubitem({ variables: { id: modal.subitem.id, label: formLabel, url: formUrl, sortOrder: formSortOrder, isVisible: formIsVisible } });
        toast.success("Sub-item updated");
      }
      setModal(null);
    } catch {
      toast.error("Something went wrong");
    }
  };

  // ── Delete handlers ──
  const handleDeleteItem = async (id: number) => {
    if (!confirm("Delete this menu item and all its sub-items?")) return;
    try {
      await deleteNavItem({ variables: { id } });
      toast.success("Deleted");
    } catch { toast.error("Failed to delete"); }
  };

  const handleDeleteSubitem = async (id: number) => {
    if (!confirm("Delete this sub-item?")) return;
    try {
      await deleteNavSubitem({ variables: { id } });
      toast.success("Deleted");
    } catch { toast.error("Failed to delete"); }
  };

  const toggleExpand = (id: number) =>
    setExpandedItems((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  // ── Modal title ──
  const modalTitle = modal?.mode === "add-item" ? "Add Menu Item"
    : modal?.mode === "edit-item" ? "Edit Menu Item"
    : modal?.mode === "add-subitem" ? "Add Sub-Item"
    : "Edit Sub-Item";

  const showVisibilityToggle = modal?.mode === "edit-item" || modal?.mode === "edit-subitem";

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#dfe2eb]">Navigation Manager</h1>
          <p className="text-[#84948e] text-sm mt-1">Manage the top navigation menu of the website</p>
        </div>
        <button
          onClick={openAddItem}
          className="flex items-center gap-2 bg-[#6fffd9] text-[#10141a] px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#5cebc5] transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Menu Item
        </button>
      </div>

      {/* Nav Items List */}
      <div className="space-y-3">
        {navItems
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((item) => (
            <div key={item.id} className="bg-[#1c2026] border border-[#3b4a44] rounded-xl overflow-hidden">
              {/* Item Row */}
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleExpand(item.id)} className="text-[#84948e] hover:text-[#dfe2eb] transition-colors">
                    <span className="material-symbols-outlined text-[20px]">
                      {expandedItems.includes(item.id) ? "expand_less" : "expand_more"}
                    </span>
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#dfe2eb] font-semibold">{item.label}</span>
                      {!item.isVisible && (
                        <span className="text-xs bg-[#2a0d10] text-[#ffb4ab] px-2 py-0.5 rounded-full">Hidden</span>
                      )}
                      {item.subitems.length > 0 && (
                        <span className="text-xs bg-[#262a31] text-[#84948e] px-2 py-0.5 rounded-full">
                          {item.subitems.length} sub-items
                        </span>
                      )}
                    </div>
                    <span className="text-[#84948e] text-xs">{item.url || "No direct link (has dropdown)"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#84948e] text-xs">Order: {item.sortOrder}</span>
                  <button onClick={() => openEditItem(item)} className="p-2 text-[#84948e] hover:text-[#6fffd9] hover:bg-[#262a31] rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button onClick={() => handleDeleteItem(item.id)} className="p-2 text-[#84948e] hover:text-[#ffb4ab] hover:bg-[#2a0d10] rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>

              {/* Sub-items (expanded) */}
              {expandedItems.includes(item.id) && (
                <div className="border-t border-[#3b4a44] bg-[#10141a] px-5 py-3 space-y-2">
                  {item.subitems
                    .slice()
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[#1c2026] transition-colors">
                        <div className="flex items-center gap-3 pl-4">
                          <span className="text-[#84948e] text-lg">↳</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[#dfe2eb] text-sm">{sub.label}</span>
                              {!sub.isVisible && (
                                <span className="text-xs bg-[#2a0d10] text-[#ffb4ab] px-2 py-0.5 rounded-full">Hidden</span>
                              )}
                            </div>
                            <span className="text-[#84948e] text-xs">{sub.url}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[#84948e] text-xs">Order: {sub.sortOrder}</span>
                          <button onClick={() => openEditSubitem(sub, item.id)} className="p-1.5 text-[#84948e] hover:text-[#6fffd9] hover:bg-[#262a31] rounded-lg transition-colors">
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                          <button onClick={() => handleDeleteSubitem(sub.id)} className="p-1.5 text-[#84948e] hover:text-[#ffb4ab] hover:bg-[#2a0d10] rounded-lg transition-colors">
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  <button
                    onClick={() => openAddSubitem(item.id, item.subitems.length)}
                    className="flex items-center gap-1 text-[#84948e] hover:text-[#6fffd9] text-sm pl-7 py-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Add sub-item
                  </button>
                </div>
              )}
            </div>
          ))}

        {navItems.length === 0 && (
          <div className="text-center py-16 text-[#84948e]">
            <span className="material-symbols-outlined text-5xl mb-3 block">menu</span>
            No menu items yet. Click "Add Menu Item" to get started.
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1c2026] border border-[#3b4a44] rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#3b4a44]">
              <h2 className="text-[#dfe2eb] font-bold text-lg">{modalTitle}</h2>
              <button onClick={() => setModal(null)} className="text-[#84948e] hover:text-[#dfe2eb] transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-[#84948e] text-sm mb-1">Label *</label>
                <input
                  value={formLabel}
                  onChange={(e) => setFormLabel(e.target.value)}
                  placeholder="e.g. Services"
                  className="w-full bg-[#10141a] border border-[#3b4a44] rounded-lg px-4 py-2.5 text-[#dfe2eb] text-sm focus:outline-none focus:border-[#6fffd9] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[#84948e] text-sm mb-1">URL</label>
                <input
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="e.g. /about (leave blank if has dropdown)"
                  className="w-full bg-[#10141a] border border-[#3b4a44] rounded-lg px-4 py-2.5 text-[#dfe2eb] text-sm focus:outline-none focus:border-[#6fffd9] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[#84948e] text-sm mb-1">Sort Order</label>
                <input
                  type="number"
                  value={formSortOrder}
                  onChange={(e) => setFormSortOrder(Number(e.target.value))}
                  className="w-full bg-[#10141a] border border-[#3b4a44] rounded-lg px-4 py-2.5 text-[#dfe2eb] text-sm focus:outline-none focus:border-[#6fffd9] transition-colors"
                />
              </div>
              {showVisibilityToggle && (
                <div className="flex items-center justify-between">
                  <label className="text-[#84948e] text-sm">Visible in navbar</label>
                  <button
                    onClick={() => setFormIsVisible(!formIsVisible)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${formIsVisible ? "bg-[#6fffd9]" : "bg-[#3b4a44]"}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${formIsVisible ? "translate-x-7" : "translate-x-1"}`} />
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-[#3b4a44]">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-lg border border-[#3b4a44] text-[#84948e] hover:text-[#dfe2eb] text-sm font-medium transition-colors">
                Cancel
              </button>
              <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-lg bg-[#6fffd9] text-[#10141a] text-sm font-bold hover:bg-[#5cebc5] transition-colors">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
