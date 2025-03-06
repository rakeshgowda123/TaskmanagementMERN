import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import toast from "react-hot-toast";

interface Category {
  id: string;
  name: string;
  created_at: string;
}

interface CategoryWithTaskCount extends Category {
  task_count: number;
}

const Categories: React.FC = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<CategoryWithTaskCount[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [user]);

  const fetchCategories = async () => {
    if (!user) return;

    try {
      // First get all categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.id)
        .order("name");

      if (categoriesError) throw categoriesError;

      // Then get task counts for each category
      const categoriesWithCount: CategoryWithTaskCount[] = [];

      for (const category of categoriesData || []) {
        const { count, error: countError } = await supabase
          .from("tasks")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("category", category.name);

        if (countError) throw countError;

        categoriesWithCount.push({
          ...category,
          task_count: count || 0,
        });
      }

      setCategories(categoriesWithCount);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async () => {
    if (!newCategory.trim() || !user) {
      toast.error("Category name cannot be empty");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("categories")
        .insert([{ name: newCategory.trim(), user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      setCategories([...categories, { ...data, task_count: 0 }]);
      setNewCategory("");
      setIsAdding(false);
      toast.success("Category added successfully");
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Failed to add category");
    }
  };

  const updateCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim() || !user) {
      toast.error("Category name cannot be empty");
      return;
    }

    try {
      const { error } = await supabase
        .from("categories")
        .update({ name: editingCategory.name.trim() })
        .eq("id", editingCategory.id)
        .eq("user_id", user.id);

      if (error) throw error;

      // Also update all tasks with this category
      const oldCategory = categories.find(
        (c) => c.id === editingCategory.id
      )?.name;
      if (oldCategory) {
        const { error: taskUpdateError } = await supabase
          .from("tasks")
          .update({ category: editingCategory.name.trim() })
          .eq("user_id", user.id)
          .eq("category", oldCategory);

        if (taskUpdateError) throw taskUpdateError;
      }

      setCategories(
        categories.map((category) =>
          category.id === editingCategory.id
            ? { ...category, name: editingCategory.name.trim() }
            : category
        )
      );
      setEditingCategory(null);
      toast.success("Category updated successfully");
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
    }
  };

  const deleteCategory = async (id: string, name: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the category "${name}"? This will remove the category from all associated tasks.`
      )
    ) {
      return;
    }

    if (!user) return;

    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      // Update tasks to remove this category
      const { error: taskUpdateError } = await supabase
        .from("tasks")
        .update({ category: null })
        .eq("user_id", user.id)
        .eq("category", name);

      if (taskUpdateError) throw taskUpdateError;

      setCategories(categories.filter((category) => category.id !== id));
      toast.success("Category deleted successfully");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isAdding && (
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New category name"
                className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                autoFocus
              />
              <div className="ml-3 flex space-x-2">
                <button
                  onClick={addCategory}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setNewCategory("");
                  }}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {categories.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {categories.map((category) => (
              <li key={category.id} className="p-4">
                {editingCategory && editingCategory.id === category.id ? (
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={editingCategory.name}
                      onChange={(e) =>
                        setEditingCategory({
                          ...editingCategory,
                          name: e.target.value,
                        })
                      }
                      className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      autoFocus
                    />
                    <div className="ml-3 flex space-x-2">
                      <button
                        onClick={updateCategory}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </button>
                      <button
                        onClick={() => setEditingCategory(null)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-gray-900 font-medium">
                        {category.name}
                      </span>
                      <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {category.task_count}{" "}
                        {category.task_count === 1 ? "task" : "tasks"}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() =>
                          setEditingCategory({
                            id: category.id,
                            name: category.name,
                          })
                        }
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() =>
                          deleteCategory(category.id, category.name)
                        }
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-6 text-center text-gray-500">
            <p>No categories yet. Create your first category!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
