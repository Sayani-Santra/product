import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/api/axiosInstance';
import { ENDPOINTS } from '@/api/api_url';

/* =========================
   PRODUCT TYPE
========================= */

export interface Product {
  _id?: string;
  id?: string;
  title?: string;
  product_name?: string;
  top_category?: string;
  category?: string;
  sub_category?: string;
  description: string;
  quantity?: number;
  price?: number;
  status?: string;
  image?: string;
  file?: string;
}

interface ProductState {
  products: Product[];
  product: Product | null;
  loading: boolean;
  error: string | null;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
  success: boolean;
  message: string | null;
}

const initialState: ProductState = {
  products: [],
  product: null,
  loading: false,
  error: null,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  success: false,
  message: null,
};

/* =========================
   CREATE PRODUCT
========================= */

export const createProduct = createAsyncThunk(
  'product/createProduct',
  async (data: FormData | Omit<Product, '_id' | 'id'>, { rejectWithValue }) => {
    try {
      const config =
        data instanceof FormData
          ? { headers: { 'Content-Type': 'multipart/form-data' } }
          : {};

      const response = await axiosInstance.post(
        ENDPOINTS.PRODUCT.CREATE,
        data,
        config
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create product'
      );
    }
  }
);

/* =========================
   GET PRODUCT LIST
========================= */

export const getProducts = createAsyncThunk(
  'product/getProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.PRODUCT.LIST, {
        page: 1,
        perpage: 10,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch products'
      );
    }
  }
);

/* =========================
   GET PRODUCT DETAILS
========================= */

export const getProductDetails = createAsyncThunk(
  'product/getProductDetails',
  async (id: string | number, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.PRODUCT.DETAIL(id));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch product details'
      );
    }
  }
);

/* =========================
   UPDATE PRODUCT
========================= */

export const updateProduct = createAsyncThunk(
  'product/updateProduct',
  async (
    { id, data }: { id: string | number; data: FormData | Partial<Product> },
    { rejectWithValue }
  ) => {
    try {
      const config =
        data instanceof FormData
          ? { headers: { 'Content-Type': 'multipart/form-data' } }
          : {};

      const response = await axiosInstance.post(
        ENDPOINTS.PRODUCT.UPDATE,
        data,
        config
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update product'
      );
    }
  }
);

/* =========================
   DELETE PRODUCT
========================= */

export const deleteProduct = createAsyncThunk(
  'product/deleteProduct',
  async (id: string | number, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.PRODUCT.REMOVE, { id });
      return {
        id,
        ...response.data,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete product'
      );
    }
  }
);

/* =========================
   PRODUCT SLICE
========================= */

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    clearProduct: (state) => {
      state.product = null;
    },
    clearProductError: (state) => {
      state.error = null;
    },
    clearProductMessage: (state) => {
      state.message = null;
    },
    resetProductState: (state) => {
      state.loading = false;
      state.createLoading = false;
      state.updateLoading = false;
      state.deleteLoading = false;
      state.error = null;
      state.success = false;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    /* CREATE */
    builder
      .addCase(createProduct.pending, (state) => {
        state.createLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.createLoading = false;
        state.success = true;
        state.message =
          action.payload?.message || 'Product created successfully';
        
        // Optional: Only push if your backend returns the newly created item 
        // and you do NOT call getProducts() immediately after creation.
        const createdProduct = action.payload?.data;
        if (createdProduct) {
          state.products.push(createdProduct);
        }
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.createLoading = false;
        state.success = false;
        state.error = (action.payload as string) || 'Failed to create product';
      });

    /* LIST */
    builder
      .addCase(getProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload?.data || action.payload || [];
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch products';
      });

    /* DETAILS */
    builder
      .addCase(getProductDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.product = null;
      })
      .addCase(getProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload?.data || action.payload || null;
      })
      .addCase(getProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || 'Failed to fetch product details';
      });

    /* UPDATE */
    builder
      .addCase(updateProduct.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.success = true;
        state.message =
          action.payload?.message || 'Product updated successfully';
        const updatedProduct = action.payload?.data || action.payload;

        if (updatedProduct) {
          const id = updatedProduct._id || updatedProduct.id;
          const index = state.products.findIndex(
            (product) => product._id === id || product.id === id
          );
          if (index !== -1) {
            state.products[index] = updatedProduct;
          }
          state.product = updatedProduct;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.updateLoading = false;
        state.success = false;
        state.error = (action.payload as string) || 'Failed to update product';
      });

    /* DELETE */
    builder
      .addCase(deleteProduct.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.success = true;
        state.message =
          action.payload?.message || 'Product deleted successfully';
        const deletedId = action.payload.id;

        state.products = state.products.filter(
          (product) => product._id !== deletedId && product.id !== deletedId
        );

        if (
          state.product?._id === deletedId ||
          state.product?.id === deletedId
        ) {
          state.product = null;
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.deleteLoading = false;
        state.success = false;
        state.error = (action.payload as string) || 'Failed to delete product';
      });
  },
});

export const {
  clearProduct,
  clearProductError,
  clearProductMessage,
  resetProductState,
} = productSlice.actions;

export default productSlice.reducer;