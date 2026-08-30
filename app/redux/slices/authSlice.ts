import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '@/api/axiosInstance';
import { ENDPOINTS } from '@/api/api_url';
import Cookies from 'js-cookie';

interface AuthState {
  user: any | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: Cookies.get('token') || null,
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: Record<string, any>, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.AUTH.SIGN_IN, credentials);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (formData: Record<string, any>, { rejectWithValue }) => {
    try {
      const data = new FormData();
      data.append('first_name', formData.first_name);
      data.append('last_name', formData.last_name);
      data.append('email', formData.email);
      data.append('password', formData.password);
      data.append('mobile_no', formData.phone);

      const response = await axiosInstance.post(ENDPOINTS.AUTH.SIGN_UP, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      Cookies.remove('token');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.data || action.payload.user;
        if (action.payload.token) {
          Cookies.set('token', action.payload.token, { expires: 7 });
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;