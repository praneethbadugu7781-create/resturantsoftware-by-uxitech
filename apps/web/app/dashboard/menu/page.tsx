"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { RoleGuard } from "@/components/dashboard/role-guard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Search,
  Sparkles,
  Utensils,
  PlusCircle,
  FolderPlus,
  CheckCircle,
  Eye,
  EyeOff,
  AlertTriangle,
  Folder,
} from "lucide-react";
import { toast } from "sonner";

type Category = {
  id: string;
  name: string;
  sortOrder: number;
};

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  categoryId?: string;
  image?: string;
  isVeg: boolean;
  isAvailable: boolean;
  preparationTime: number;
};

export default function MenuManagementPage() {
  return (
    <RoleGuard allowedRoles={["OWNER", "MANAGER"]}>
      <MenuManager />
    </RoleGuard>
  );
}

function MenuManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryName, setSelectedCategoryName] = useState("All");
  const [vegFilter, setVegFilter] = useState<"ALL" | "VEG" | "NON_VEG">("ALL");

  // Modals state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categorySortOrder, setCategorySortOrder] = useState(1);

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemForm, setItemForm] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    isVeg: true,
    image: "",
    preparationTime: "15",
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  // Load Data
  const loadData = async () => {
    try {
      setLoading(true);
      const [catsRes, itemsRes] = await Promise.all([
        api.get("/menu/categories"),
        api.get("/menu"),
      ]);
      setCategories(catsRes.data);
      setMenuItems(itemsRes.data);
    } catch (err) {
      toast.error("Failed to load menu details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Category CRUD Handlers
  const handleOpenCategoryModal = (cat: Category | null = null) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryName(cat.name);
      setCategorySortOrder(cat.sortOrder);
    } else {
      setEditingCategory(null);
      setCategoryName("");
      setCategorySortOrder(categories.length + 1);
    }
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      if (editingCategory) {
        // Update
        const res = await api.patch(`/menu/categories/${editingCategory.id}`, {
          name: categoryName,
          sortOrder: categorySortOrder,
        });
        setCategories((prev) =>
          prev.map((c) => (c.id === editingCategory.id ? res.data : c))
        );
        toast.success("Category updated successfully");
      } else {
        // Create
        const res = await api.post("/menu/categories", {
          name: categoryName,
          sortOrder: categorySortOrder,
        });
        setCategories((prev) => [...prev, res.data]);
        toast.success("Category created successfully");
      }
      setIsCategoryModalOpen(false);
      loadData(); // reload to keep menu item texts synchronized if name changed
    } catch (err) {
      toast.error("Failed to save category");
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this category? Associated menu items will become uncategorized."
      )
    )
      return;

    try {
      await api.delete(`/menu/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Category deleted");
      loadData();
    } catch (err) {
      toast.error("Failed to delete category");
      console.error(err);
    }
  };

  // Menu Item CRUD Handlers
  const handleOpenItemModal = (item: MenuItem | null = null) => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        name: item.name,
        description: item.description,
        price: item.price.toString(),
        categoryId: item.categoryId || "",
        isVeg: item.isVeg,
        image: item.image || "",
        preparationTime: item.preparationTime.toString(),
      });
    } else {
      setEditingItem(null);
      setItemForm({
        name: "",
        description: "",
        price: "",
        categoryId: categories[0]?.id || "",
        isVeg: true,
        image: "",
        preparationTime: "15",
      });
    }
    setIsItemModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append("image", file);

      const res = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setItemForm((prev) => ({ ...prev, image: res.data.url }));
      toast.success("Image uploaded successfully");
    } catch (err) {
      toast.error("Failed to upload image");
      console.error(err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.name.trim() || !itemForm.price) {
      toast.error("Name and price are required");
      return;
    }

    const priceNum = parseFloat(itemForm.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error("Price must be a positive number");
      return;
    }

    const selectedCategoryObj = categories.find((c) => c.id === itemForm.categoryId);
    const categoryNameStr = selectedCategoryObj?.name || "Uncategorized";

    const payload = {
      name: itemForm.name,
      description: itemForm.description,
      price: priceNum,
      categoryId: itemForm.categoryId || undefined,
      category: categoryNameStr,
      isVeg: itemForm.isVeg,
      image: itemForm.image || undefined,
      preparationTime: parseInt(itemForm.preparationTime) || 15,
    };

    try {
      if (editingItem) {
        // Update
        const res = await api.patch(`/menu/items/${editingItem.id}`, payload);
        setMenuItems((prev) =>
          prev.map((item) => (item.id === editingItem.id ? res.data : item))
        );
        toast.success("Menu item updated");
      } else {
        // Create
        const res = await api.post("/menu/items", payload);
        setMenuItems((prev) => [...prev, res.data]);
        toast.success("Menu item added successfully");
      }
      setIsItemModalOpen(false);
    } catch (err) {
      toast.error("Failed to save menu item");
      console.error(err);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;

    try {
      await api.delete(`/menu/items/${id}`);
      setMenuItems((prev) => prev.filter((item) => item.id !== id));
      toast.success("Menu item deleted");
    } catch (err) {
      toast.error("Failed to delete item");
      console.error(err);
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      const res = await api.patch(`/menu/items/${item.id}/toggle-availability`);
      setMenuItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isAvailable: res.data.isAvailable } : i))
      );
      toast.success(`${item.name} is now ${res.data.isAvailable ? "Available" : "Unavailable"}`);
    } catch (err) {
      toast.error("Failed to toggle availability");
      console.error(err);
    }
  };

  // Stats calculation
  const totalItemsCount = menuItems.length;
  const vegCount = menuItems.filter((i) => i.isVeg).length;
  const nonVegCount = totalItemsCount - vegCount;
  const categoriesCount = categories.length;

  // Filtered List
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategoryName === "All" || item.category === selectedCategoryName;

    const matchesVeg =
      vegFilter === "ALL" ||
      (vegFilter === "VEG" && item.isVeg) ||
      (vegFilter === "NON_VEG" && !item.isVeg);

    return matchesSearch && matchesCategory && matchesVeg;
  });

  return (
    <main className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-clay">Menu Customizer</p>
          <h1 className="text-3xl font-black text-ink">Menu Book Directory</h1>
        </div>
        <div className="flex gap-2.5">
          <Button
            onClick={() => handleOpenCategoryModal()}
            className="bg-transparent border border-black/10 text-ink hover:bg-mist/30 flex items-center gap-1.5 font-bold shadow-sm"
          >
            <FolderPlus className="h-4 w-4 text-leaf" /> Add Category
          </Button>
          <Button
            onClick={() => handleOpenItemModal()}
            className="bg-leaf hover:bg-leaf/90 text-white flex items-center gap-1.5 font-bold shadow-sm"
          >
            <Plus className="h-4 w-4" /> Add Menu Item
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Categories", value: categoriesCount, icon: Folder, color: "text-leaf" },
          { label: "Total Menu Items", value: totalItemsCount, icon: Utensils, color: "text-clay" },
          { label: "Vegetarian", value: vegCount, icon: CheckCircle, color: "text-green-600" },
          { label: "Non-Vegetarian", value: nonVegCount, icon: Sparkles, color: "text-red-500" },
        ].map((stat, idx) => (
          <Card key={idx} className="p-4 border border-black/5 shadow-sm bg-white hover-premium">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink/45 uppercase tracking-wide">{stat.label}</span>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <p className="text-2xl font-black text-ink mt-2">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Main Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Categories Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-4 border border-black/5 bg-white shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-extrabold text-sm text-ink uppercase tracking-wider">Categories</h2>
              <span className="text-[10px] bg-mist text-leaf px-2 py-0.5 rounded-full font-bold">
                {categories.length} Total
              </span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-ink/40">Loading Categories...</div>
            ) : categories.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-black/5 rounded-xl">
                <p className="text-xs text-ink/40">No categories added.</p>
                <button
                  onClick={() => handleOpenCategoryModal()}
                  className="text-xs text-leaf font-bold mt-2 hover:underline"
                >
                  Create your first category
                </button>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                <button
                  onClick={() => setSelectedCategoryName("All")}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                    selectedCategoryName === "All"
                      ? "bg-leaf text-white shadow-sm"
                      : "bg-mist/35 text-ink/75 hover:bg-mist/60"
                  }`}
                >
                  <span>All Dishes</span>
                  <span className={selectedCategoryName === "All" ? "text-white/80" : "text-ink/40"}>
                    {menuItems.length}
                  </span>
                </button>
                {categories
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((cat) => {
                    const itemSum = menuItems.filter((i) => i.category === cat.name).length;
                    const isSelected = selectedCategoryName === cat.name;
                    return (
                      <div
                        key={cat.id}
                        className={`group relative flex items-center rounded-xl transition-all ${
                          isSelected
                            ? "bg-leaf text-white shadow-sm"
                            : "bg-white border border-black/5 text-ink/75 hover:bg-mist/20"
                        }`}
                      >
                        <button
                          onClick={() => setSelectedCategoryName(cat.name)}
                          className="flex-1 text-left px-3.5 py-2.5 text-xs font-bold flex items-center justify-between"
                        >
                          <span>{cat.name}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                              isSelected ? "bg-white/20 text-white" : "bg-mist text-ink/45"
                            }`}
                          >
                            {itemSum}
                          </span>
                        </button>
                        <div className="absolute right-9 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-l from-white via-white to-transparent pl-4 pr-1.5 py-1 rounded-r-xl">
                          <button
                            title="Edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenCategoryModal(cat);
                            }}
                            className={`p-1 rounded hover:bg-black/5 ${
                              isSelected ? "text-white hover:text-white" : "text-ink/50"
                            }`}
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            title="Delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCategory(cat.id);
                            }}
                            className="p-1 rounded hover:bg-red-500/10 text-red-500"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </Card>
        </div>

        {/* Menu Items Area */}
        <div className="lg:col-span-8 space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row gap-3 bg-white p-3 border border-black/5 shadow-sm rounded-2xl">
            <div className="flex-1 relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-ink/40" />
              <input
                type="text"
                placeholder="Search dish name or details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-black/10 py-2.5 pl-9 pr-4 text-xs outline-none focus:border-leaf focus:ring-1 focus:ring-leaf bg-white text-ink"
              />
            </div>
            <div className="flex gap-2">
              {/* Veg / Non-Veg filter toggle buttons */}
              {[
                { label: "All Types", value: "ALL" },
                { label: "Veg Only", value: "VEG" },
                { label: "Non-Veg", value: "NON_VEG" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setVegFilter(option.value as any)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                    vegFilter === option.value
                      ? "bg-leaf/10 border-leaf/25 text-leaf shadow-sm scale-102"
                      : "bg-white border-black/5 text-ink/65 hover:bg-mist/30"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dishes Grid */}
          {loading ? (
            <div className="py-24 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-leaf border-t-transparent"></div>
              <p className="text-xs text-ink/50 mt-4 font-bold uppercase tracking-wider">
                Loading Custom Menu Book...
              </p>
            </div>
          ) : filteredMenuItems.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-black/5 rounded-3xl bg-white">
              <Utensils className="h-12 w-12 text-ink/20 mx-auto animate-pulse" />
              <h3 className="mt-4 font-bold text-ink">No menu items found</h3>
              <p className="text-xs text-ink/50 mt-1 max-w-sm mx-auto">
                {searchQuery || selectedCategoryName !== "All"
                  ? "Try loosening your search terms or selecting another category."
                  : "Start creating your own delicious menu. Click the Add Menu Item button to begin."}
              </p>
              {!searchQuery && selectedCategoryName === "All" && (
                <Button onClick={() => handleOpenItemModal()} className="mt-6">
                  Add Your First Dish
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMenuItems.map((item) => (
                <Card
                  key={item.id}
                  className={`p-4 border border-black/5 bg-white shadow-sm flex flex-col justify-between hover-premium transition-all ${
                    !item.isAvailable ? "opacity-65" : ""
                  }`}
                >
                  <div className="flex gap-4">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-16 rounded-xl object-cover border border-black/5 flex-shrink-0"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-xl bg-mist/50 border border-black/5 flex items-center justify-center flex-shrink-0">
                        <Utensils className="h-6 w-6 text-leaf/40" />
                      </div>
                    )}
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`h-2.5 w-2.5 rounded-full border flex-shrink-0 ${
                            item.isVeg ? "bg-green-500 border-green-600" : "bg-red-500 border-red-600"
                          }`}
                          title={item.isVeg ? "Veg" : "Non-Veg"}
                        ></span>
                        <h3 className="font-extrabold text-sm text-ink truncate leading-snug">
                          {item.name}
                        </h3>
                      </div>
                      <p className="text-[11px] text-ink/45 line-clamp-2 leading-relaxed">
                        {item.description || "No description provided."}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[9px] font-bold bg-mist text-leaf px-2 py-0.5 rounded uppercase">
                          {item.category}
                        </span>
                        <span className="text-[9px] font-bold text-ink/40">
                          {item.preparationTime} mins prep
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-black/5 pt-3 mt-4">
                    <span className="text-sm font-black text-ink">Rs. {item.price}</span>
                    <div className="flex items-center gap-1">
                      {/* Availability Toggle */}
                      <button
                        title={item.isAvailable ? "Set Unavailable" : "Set Available"}
                        onClick={() => handleToggleAvailability(item)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          item.isAvailable
                            ? "bg-leaf/10 border-leaf/10 text-leaf hover:bg-leaf/20"
                            : "bg-clay/10 border-clay/10 text-clay hover:bg-clay/20"
                        }`}
                      >
                        {item.isAvailable ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </button>

                      {/* Edit Button */}
                      <button
                        title="Edit Item"
                        onClick={() => handleOpenItemModal(item)}
                        className="p-1.5 rounded-lg border border-black/5 bg-white text-ink/65 hover:bg-mist/35 transition-all"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        title="Delete Item"
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 rounded-lg border border-red-200 bg-white text-red-500 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category Creation/Edit Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-black/5 bg-white p-6 shadow-soft space-y-4 animate-scale-up">
            <div>
              <h3 className="text-base font-extrabold text-ink">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h3>
              <p className="text-xs text-ink/50 mt-0.5">
                Categories group dishes on your digital menu boards.
              </p>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-ink/50 uppercase">Category Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Starters, Dessert, Drinks"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full rounded-xl border border-black/10 py-3.5 px-4 text-sm outline-none focus:border-leaf focus:ring-1 focus:ring-leaf bg-white text-ink"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-ink/50 uppercase">Display order index</label>
                <input
                  type="number"
                  placeholder="e.g. 1"
                  value={categorySortOrder}
                  onChange={(e) => setCategorySortOrder(parseInt(e.target.value) || 1)}
                  className="w-full rounded-xl border border-black/10 py-3.5 px-4 text-sm outline-none focus:border-leaf focus:ring-1 focus:ring-leaf bg-white text-ink"
                  min="1"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-black/5">
                <Button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="bg-transparent border border-black/10 text-ink hover:bg-mist py-3 text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-leaf hover:bg-leaf/90 py-3 text-xs shadow-md">
                  {editingCategory ? "Update Category" : "Create Category"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Menu Item Creation/Edit Modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-black/5 bg-white p-6 shadow-soft space-y-4 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div>
              <h3 className="text-base font-extrabold text-ink">
                {editingItem ? "Edit Menu Dish" : "Add Dish to Menu"}
              </h3>
              <p className="text-xs text-ink/50 mt-0.5">
                Provide details for your customers to see when they scan table QRs.
              </p>
            </div>

            {categories.length === 0 ? (
              <div className="py-6 text-center border border-red-100 rounded-xl bg-red-500/5 text-red-500 flex flex-col items-center gap-2">
                <AlertTriangle className="h-6 w-6" />
                <p className="text-xs font-bold">Please create at least one category first.</p>
                <Button
                  onClick={() => {
                    setIsItemModalOpen(false);
                    handleOpenCategoryModal();
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white mt-2 py-2"
                >
                  Add Category
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSaveItem} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-ink/50 uppercase">Dish Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Garlic Naan"
                      value={itemForm.name}
                      onChange={(e) => setItemForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full rounded-xl border border-black/10 py-3 px-4 text-xs outline-none focus:border-leaf focus:ring-1 focus:ring-leaf bg-white text-ink"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-ink/50 uppercase">Category *</label>
                    <select
                      value={itemForm.categoryId}
                      onChange={(e) => setItemForm((prev) => ({ ...prev, categoryId: e.target.value }))}
                      className="w-full rounded-xl border border-black/10 py-3 px-4 text-xs outline-none focus:border-leaf focus:ring-1 focus:ring-leaf bg-white text-ink cursor-pointer"
                      required
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-ink/50 uppercase">Price (Rs.) *</label>
                    <input
                      type="number"
                      placeholder="e.g. 240"
                      value={itemForm.price}
                      onChange={(e) => setItemForm((prev) => ({ ...prev, price: e.target.value }))}
                      className="w-full rounded-xl border border-black/10 py-3 px-4 text-xs outline-none focus:border-leaf focus:ring-1 focus:ring-leaf bg-white text-ink"
                      min="1"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-ink/50 uppercase">Prep Time (minutes)</label>
                    <input
                      type="number"
                      placeholder="e.g. 15"
                      value={itemForm.preparationTime}
                      onChange={(e) => setItemForm((prev) => ({ ...prev, preparationTime: e.target.value }))}
                      className="w-full rounded-xl border border-black/10 py-3 px-4 text-xs outline-none focus:border-leaf focus:ring-1 focus:ring-leaf bg-white text-ink"
                      min="1"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-ink/50 uppercase">Description</label>
                  <textarea
                    placeholder="Short description of ingredients or taste..."
                    value={itemForm.description}
                    onChange={(e) => setItemForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full rounded-xl border border-black/10 py-2.5 px-4 text-xs outline-none focus:border-leaf focus:ring-1 focus:ring-leaf bg-white text-ink min-h-[70px] resize-y"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-ink/50 uppercase">Dish Image</label>
                  <div className="flex items-center gap-4 p-3 border border-black/10 rounded-xl bg-[#fdfdfd]">
                    {itemForm.image ? (
                      <div className="relative h-16 w-16 rounded-lg overflow-hidden border border-black/5 flex-shrink-0 group">
                        <img
                          src={itemForm.image}
                          alt="Dish Preview"
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setItemForm((prev) => ({ ...prev, image: "" }))}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-bold rounded-lg"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="h-16 w-16 rounded-lg bg-mist/35 border border-black/5 flex items-center justify-center flex-shrink-0 text-leaf/40">
                        <Utensils className="h-6 w-6" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <label className="inline-flex items-center justify-center px-4 py-2 border border-black/10 hover:bg-mist/30 text-ink text-xs font-bold rounded-lg cursor-pointer transition-all shadow-sm active:scale-98">
                        {uploadingImage ? "Uploading..." : itemForm.image ? "Change Image" : "Upload Image"}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[10px] text-ink/40 mt-1">PNG, JPG, WebP up to 5MB</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-mist/30 p-3 rounded-xl border border-black/5">
                  <input
                    type="checkbox"
                    id="isVegCheckbox"
                    checked={itemForm.isVeg}
                    onChange={(e) => setItemForm((prev) => ({ ...prev, isVeg: e.target.checked }))}
                    className="h-4 w-4 rounded border-black/10 text-leaf focus:ring-leaf cursor-pointer"
                  />
                  <label htmlFor="isVegCheckbox" className="text-xs font-bold text-ink cursor-pointer select-none">
                    This dish is Vegetarian (Green indicator dot)
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-black/5">
                  <Button
                    type="button"
                    onClick={() => setIsItemModalOpen(false)}
                    className="bg-transparent border border-black/10 text-ink hover:bg-mist py-3 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-leaf hover:bg-leaf/90 py-3 text-xs shadow-md">
                    {editingItem ? "Update Dish" : "Add Dish"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
