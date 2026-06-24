import axios from 'axios';

let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Auto-correct missing '/api' suffix in base URL configurations
if (API_BASE_URL && !API_BASE_URL.endsWith('/api') && !API_BASE_URL.endsWith('/api/')) {
  const cleanedBase = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  if (!cleanedBase.includes('/api/')) {
    API_BASE_URL = `${cleanedBase}/api`;
  }
}

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {

    const token =
      localStorage.getItem(
        "access_token"
      );

    if (token) {

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) => Promise.reject(error)
);

api.interceptors.response.use(

  (response) => response,

  async (error) => {

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/refresh') && !originalRequest.url.includes('/auth/login')){

      originalRequest._retry = true;

      try {

        const refreshToken =
          localStorage.getItem(
            'refresh_token'
          );

        const response =
          await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            {
              refresh_token:
                refreshToken
            }
          );

        const newAccessToken = response.data.access_token;

        localStorage.setItem(
          'access_token',
          newAccessToken
        );

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return api(
          originalRequest
        );

      } catch {

        localStorage.removeItem(
          'access_token'
        );

        localStorage.removeItem(
          'refresh_token'
        );

        localStorage.removeItem(
          'auth_user'
        );

        window.location.href =
          '/login';

        return Promise.reject(
          error
        );
      } 
    }

    return Promise.reject(
      error
    );
  }
);



export const getCategories = async () => {
  const { data } = await api.get('/categories');
  return data;
};

export const getSubcategories = async () => {
  const { data } = await api.get('/subcategories');
  return data;
};

export const getBusinesses = async () => {
  const { data } = await api.get('/businesses');
  return data;
};

export const getFeaturedBusinesses = async () => {
  const { data } = await api.get('/businesses/featured');
  return data;
};

export const getBusinessById = async (id) => {
  const { data } = await api.get(`/businesses/${id}`);
  return data;
}; 

export const getMyBusinesses = async () => {
  const { data } = await api.get("/my-businesses");
  return data;
};

export const searchBusinesses = async ({
  query = "",
  city = "",
  pincode = "",
  categoryId = "",
  subcategoryId = "",
  brand = "",
  page = 1,
  limit = 6,
} = {}) => {

  const { data } = await api.get("/search", {
    params: {
      query,
      city,
      pincode,
      categoryId,
      subcategoryId,
      brand,
      page,
      limit,
    },
  });

  return data;
};

export const createLead = async (leadData) => {
  const { data } = await api.post(
    "/leads",
    leadData
  );

  return data;
};

export const createReview = async (reviewData) => {
  const { data } = await api.post(
    "/reviews",
    reviewData
  );

  return data;
};

export const getReviews = async (businessId) => {
  const { data } = await api.get(
    `/reviews/${businessId}`
  );

  return data;
};

export const registerUser = async (userData) => {
  const { data } = await api.post(
    "/auth/register",
    userData
  );
  return data;
};

export const getUserLeads = async (
  email
) => {

  const { data } = await api.get(
    `/leads/user/${email}`
  );

  return data;
};

export const loginUserApi = async (email, password) => {
  const { data } = await api.post(
    "/auth/login",
    { email, password }
  );
  return data;
};

export const updateProfile = async (
  userId,
  profileData
) => {

  const { data } = await api.put(
    `/users/${userId}`,
    profileData
  );

  return data;
};

export const addBookmark = async (
  userId,
  businessId
) => {

  const { data } = await api.post(
    "/bookmarks",
    {
      userId,
      businessId
    }
  );

  return data;
};

export const getBookmarks = async (
  userId
) => {

  const { data } = await api.get(
    `/bookmarks/${userId}`
  );

  return data;
};

export const removeBookmark = async (
  userId,
  businessId
) => {

  const { data } = await api.delete(
    `/bookmarks/${userId}/${businessId}`
  );

  return data;
};


export const submitBusiness = async (
  businessData
) => {

  const { data } = await api.post(
    "/business/apply",
    businessData
  );

  return data;
};

export const updateBusiness = async (id, businessData) => {

  const { data } = await api.put(
    `/business/${id}`,
    businessData
  );

  return data;
};

export const getUserApplications = async (
  email
) => {

  const { data } = await api.get(
    `/applications/user/${email}`
  );

  return data;
};

export const getApplications = async () => {
  const { data } = await api.get(
    '/admin/applications'
  );

  return data;
};

export const approveApplication = async (id) => {
  const { data } = await api.put(
    `/admin/applications/${id}/approve`
  );

  return data;
};

export const rejectApplication = async (
  id,
  reason
) => {

  const { data } =
    await api.put(
      `/admin/applications/${id}/reject`,
      { reason }
    );

  return data;
};

export const deleteApplication = async (
  id
) => {

  const { data } =
    await api.delete(
      `/admin/applications/${id}`
    );

  return data;
};

export const createCategory = async (
  category
) => {

  const { data } = await api.post(
    "/categories",
    category
  );

  return data;
};

export const deleteCategory = async (
  id
) => {

  const { data } = await api.delete(
    `/categories/${id}`
  );

  return data;
};

export const createSubcategory = async (
  sub
) => {

  const { data } = await api.post(
    "/subcategories",
    sub
  );

  return data;
};

export const deleteSubcategory = async (
  id
) => {

  const { data } = await api.delete(
    `/subcategories/${id}`
  );

  return data;
};

export const updateCategory = async (
  id,
  category
) => {

  const { data } = await api.put(
    `/categories/${id}`,
    category
  );

  return data;
};

export const getLeads = async () => {
  const { data } = await api.get('/leads');
  return data;
};

export const deleteLead = async (id) => {
  const { data } = await api.delete(
    `/leads/${id}`
  );

  return data;
};

export const deleteBusiness = async (id) => {
  const { data } = await api.delete(
    `/admin/businesses/${id}`
  );
  return data;
};

export const toggleBusinessVerified = async (id) => {
  const { data } = await api.put(
    `/admin/businesses/${id}/verify`
  );
  return data;
};

export const toggleBusinessFeatured = async (id) => {
  const { data } = await api.put(
    `/admin/businesses/${id}/feature`
  );
  return data;
};

export const getMyBusinessLeads = async (
  email
) => {

  const { data } =
    await api.get(
      `/my-business-leads/${email}`
    );

  return data;
};

export const adminLogin = async (
  email,
  password
) => {

  const { data } =
    await api.post(
      "/auth/login",
      {
        email,
        password
      }
    );

  return data;
}; 

export const getBanners = async () => {
  const { data } = await api.get('/banners');
  return data;
};

export const getQuickServices = async () => {
  const { data } = await api.get('/quick-services');
  return data;
};

export const getPublicStats = async () => {
  const { data } = await api.get('/public-stats');
  return data;
};

export const uploadImage = async (file, onProgress) => {

  const formData = new FormData();

  formData.append("file", file);

  const { data } = await api.post(
    "/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },

      onUploadProgress: (event) => {

        if (!event.total) return;

        const percent = Math.round(
          (event.loaded * 100) / event.total
        );

        if (onProgress) {
          onProgress(percent);
        }
      },
    }
  );

  return data;
};