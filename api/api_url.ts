export const BASE_URL =
  "https://wtsacademy.dedicateddevelopers.us";

export const ENDPOINTS = {
  AUTH: {
    SIGN_IN: "/api/user/signin",
    SIGN_UP: "/api/user/signup",
    PROFILE_DETAILS: "/api/user/profile-details",
  },

  PRODUCT: {
    CREATE: "/api/product/create",
    LIST: "/api/product/list",
    DETAIL: (id: string | number) =>
      `/api/product/detail/${id}`,
    UPDATE: "/api/product/update", // 👈 CHANGED: Static route (send id in FormData)
    REMOVE: "/api/product/remove", // 👈 CHANGED: Static route (send id in body)
  },
};