"use client";

import React, { useEffect, useState } from "react";
import { BASE_URL } from "@/api/api_url";
import Pagination from "@/components/Pagination";

// Redux Hooks & Actions
import { useAppDispatch, useAppSelector } from "@/app/redux/hooks";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  Product,
} from "@/app/redux/slices/productSlice";

// Helper to construct complete image URLs
const getImageUrl = (imagePath?: string) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  const cleanPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
  if (cleanPath.startsWith("uploads/")) {
    return `${BASE_URL}/${cleanPath}`;
  }
  return `${BASE_URL}/uploads/product/${cleanPath}`;
};

export default function ProductPage() {
  const dispatch = useAppDispatch();

  // Read State from Redux Store
  const productState = useAppSelector((state) => state.product);

  // Safely extract products array (supports raw array or wrapped objects)
  const products: Product[] = React.useMemo(() => {
    const raw = productState.products as any;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.products)) return raw.products;
    if (Array.isArray(raw?.result)) return raw.result;
    return [];
  }, [productState.products]);

  const loading = productState.loading;
  const error = productState.error;

  // Search & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const perPage = 6;

  // Filter products based on search term
  const filteredProducts = React.useMemo(() => {
    if (!searchTerm.trim()) return products;
    const query = searchTerm.toLowerCase();

    return products.filter((product) => {
      const rawProduct = product as any;
      const title = (
        product.title ||
        rawProduct.product_name ||
        rawProduct.name ||
        ""
      ).toLowerCase();
      const description = (product.description || "").toLowerCase();

      return title.includes(query) || description.includes(query);
    });
  }, [products, searchTerm]);

  // Compute total pages
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / perPage));

  // Local UI state toggles
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Failed image tracking
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  // Initial fetch
  useEffect(() => {
    dispatch(getProducts());
  }, []);

  // Guard page boundaries
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Close details modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedProduct(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleOpenCreateForm = () => {
    setEditingProduct(null);
    setFormData({ title: "", description: "", price: "" });
    setSelectedImage(null);
    setSelectedProduct(null);
    setShowForm(true);
  };

  const handleOpenEditForm = (product: Product) => {
    const rawProduct = product as any;
    setEditingProduct(product);
    setFormData({
      title: product.title || rawProduct.product_name || rawProduct.name || "",
      description: product.description || "",
      price: product.price ? String(product.price) : "",
    });
    setSelectedImage(null);
    setSelectedProduct(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData({ title: "", description: "", price: "" });
    setSelectedImage(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("description", formData.description);
      payload.append("price", formData.price);

      if (selectedImage) {
        payload.append("image", selectedImage);
      }

      if (editingProduct) {
        const rawProduct = editingProduct as any;
        const productId = (editingProduct.id || rawProduct._id) as string | number;
        payload.append("id", String(productId));

        await dispatch(
          updateProduct({ id: productId, data: payload })
        ).unwrap();

        handleCloseForm();
        dispatch(getProducts());
      } else {
        await dispatch(createProduct(payload)).unwrap();
        handleCloseForm();

        const freshDataAction = await dispatch(getProducts()).unwrap();
        const raw = freshDataAction as any;
        const freshList: Product[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw?.products)
          ? raw.products
          : [];

        if (freshList.length > 0) {
          const newTotalPages = Math.ceil(freshList.length / perPage);
          setCurrentPage(newTotalPages);
        }
      }
    } catch (err: any) {
      alert(err || "Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await dispatch(deleteProduct(id)).unwrap();

      if (
        selectedProduct &&
        (selectedProduct.id === id || (selectedProduct as any)._id === id)
      ) {
        setSelectedProduct(null);
      }

      dispatch(getProducts());
    } catch (err: any) {
      alert(err || "Failed to delete product");
    }
  };

  const handleImageError = (id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-slate-400 mt-1">
              Manage and inspect your product catalog
            </p>
          </div>

          <button
            onClick={() => (showForm ? handleCloseForm() : handleOpenCreateForm())}
            className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-lg font-semibold transition"
          >
            {showForm ? "Close Form" : "+ Add Product"}
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              🔍
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search products by title or description..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-10 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
            {typeof error === "string" ? error : "An error occurred"}
          </div>
        )}

        {/* Create / Edit Form */}
        {showForm && (
          <div className="mb-8 bg-slate-800 border border-slate-700 p-6 rounded-2xl max-w-xl mx-auto shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-blue-400">
              {editingProduct ? "Update Product" : "Create New Product"}
            </h2>
            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Blazer Coat"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Price</label>
                <input
                  type="number"
                  name="price"
                  required
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. 2999"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                  placeholder="Full product description..."
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">
                  Image {editingProduct ? "(Leave blank to keep existing)" : ""}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-300"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-green-600 hover:bg-green-700 font-semibold py-3 rounded-lg transition disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Submitting..."
                    : editingProduct
                    ? "Update Product"
                    : "Save Product"}
                </button>
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="bg-slate-700 hover:bg-slate-600 px-5 py-3 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* DETAILS MODAL OVERLAY */}
        {selectedProduct && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedProduct(null)}
          >
            <div
              className="bg-slate-800 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-3 right-3 z-10 bg-slate-900/80 hover:bg-slate-900 text-slate-300 hover:text-white w-9 h-9 rounded-full flex items-center justify-center transition"
              >
                ✕
              </button>

              {/* Scrollable Container */}
              <div className="overflow-y-auto w-full">
                {/* Uncropped Responsive Image Box */}
                <div className="w-full bg-slate-950 flex items-center justify-center p-4">
                  {getImageUrl(selectedProduct.image) &&
                  !failedImages[
                    String(selectedProduct.id || (selectedProduct as any)._id)
                  ] ? (
                    <img
                      src={getImageUrl(selectedProduct.image)!}
                      alt={
                        selectedProduct.title ||
                        (selectedProduct as any).product_name ||
                        (selectedProduct as any).name ||
                        "Product Image"
                      }
                      className="w-full h-auto max-h-[55vh] object-contain rounded-lg"
                      onError={() =>
                        handleImageError(
                          String(
                            selectedProduct.id || (selectedProduct as any)._id
                          )
                        )
                      }
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                      <span className="text-5xl mb-2">📦</span>
                      <span className="text-sm">No Image Available</span>
                    </div>
                  )}
                </div>

                {/* Details Content */}
                <div className="p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700 pb-4">
                    <h2 className="text-2xl font-bold text-white">
                      {selectedProduct.title ||
                        (selectedProduct as any).product_name ||
                        (selectedProduct as any).name ||
                        "Unnamed Product"}
                    </h2>
                    {selectedProduct.price !== undefined &&
                      selectedProduct.price !== null && (
                        <span className="text-xl font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-3.5 py-1 rounded-xl w-fit">
                          ₹{selectedProduct.price}
                        </span>
                      )}
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Description
                    </h3>
                    <p className="text-slate-300 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                      {selectedProduct.description ||
                        "No detailed description provided for this product."}
                    </p>
                  </div>

                  {/* Modal Footer Actions */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-700">
                    <button
                      onClick={() => {
                        const prod = selectedProduct;
                        setSelectedProduct(null);
                        handleOpenEditForm(prod);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                    >
                      Edit Product
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteProduct(
                          (selectedProduct.id ||
                            (selectedProduct as any)._id) as string | number
                        )
                      }
                      className="bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                    >
                      Delete Product
                    </button>
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="ml-auto bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mb-4" />
            <p className="text-slate-400">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Empty State */
          !showForm && (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-12 text-center">
              <div className="text-5xl mb-4">📦</div>
              <h2 className="text-xl font-semibold mb-2">
                {searchTerm ? "No Products Found" : "No Products Available"}
              </h2>
              <p className="text-slate-400 mb-6">
                {searchTerm
                  ? `No items match "${searchTerm}".`
                  : "There are currently no products available."}
              </p>
              {searchTerm ? (
                <button
                  onClick={() => setSearchTerm("")}
                  className="bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-lg font-semibold transition"
                >
                  Clear Search
                </button>
              ) : (
                <button
                  onClick={handleOpenCreateForm}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition"
                >
                  Create Product
                </button>
              )}
            </div>
          )
        ) : (
          <>
            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts
                .slice((currentPage - 1) * perPage, currentPage * perPage)
                .map((product: Product, index: number) => {
                  const rawProduct = product as any;
                  const productId = String(
                    product.id || rawProduct._id || `product-idx-${index}`
                  );
                  const imageUrl = getImageUrl(product.image);
                  const isImageBroken = failedImages[productId];

                  return (
                    <div
                      key={productId}
                      className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-blue-500 transition flex flex-col justify-between"
                    >
                      {/* Card Image */}
                      {imageUrl && !isImageBroken ? (
                        <img
                          src={imageUrl}
                          alt={
                            product.title ||
                            rawProduct.product_name ||
                            rawProduct.name ||
                            "Product"
                          }
                          className="w-full h-48 object-cover bg-slate-700 cursor-pointer"
                          onClick={() => setSelectedProduct(product)}
                          onError={() => handleImageError(productId)}
                        />
                      ) : (
                        <div
                          onClick={() => setSelectedProduct(product)}
                          className="w-full h-48 bg-slate-700/50 flex flex-col items-center justify-center text-slate-400 cursor-pointer"
                        >
                          <span className="text-4xl mb-1">📦</span>
                          <span className="text-xs">No Image Available</span>
                        </div>
                      )}

                      {/* Card Content */}
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-xl font-bold mb-2">
                            {product.title ||
                              rawProduct.product_name ||
                              rawProduct.name ||
                              "Unnamed Product"}
                          </h3>
                          <p className="text-slate-400 text-sm mb-4 line-clamp-3">
                            {product.description || "No description available."}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-700/50 gap-2">
                          {product.price !== undefined &&
                            product.price !== null && (
                              <p className="text-lg font-bold text-blue-400">
                                ₹{product.price}
                              </p>
                            )}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleOpenEditForm(product)}
                              className="text-xs font-semibold bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setSelectedProduct(product)}
                              className="text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-lg transition"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Pagination Controls */}
            <div className="mt-10">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}