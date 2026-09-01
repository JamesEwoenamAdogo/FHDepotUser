import axios from "axios";

const api = axios.create({
  baseURL: "https://fhdepotserver.onrender.com/api/v1",
});

export const signUp = async (payload: any) => {
  try {
    const response = await api.post("/register-business", payload);
    return response;
  } catch (error: any) {
    if (error.response) {
      return error.response;
    }
    throw error;
  }
};

export const login = async (payload: any) => {
  try {
    const response = await api.post("/login", payload);
    return response;
  } catch (error: any) {
    if (error.response) {
      return error.response;
    }
    throw error;
  }
};

export const forgotPassword = async (payload: { phone: string }) => {
  try {
    const response = await api.post("/send-password-reset-otp", payload);
    return response;
  } catch (error: any) {
    if (error.response) {
      return error.response;
    }
    throw error;
  }
};

export const verifyPasswordResetOtp = async (payload: {
  id: string;
  otp: string;
}) => {
  try {
    const response = await api.post("/verify-password-reset-otp", payload);
    return response;
  } catch (error: any) {
    if (error.response) {
      return error.response;
    }
    throw error;
  }
};

export const resetPassword = async (payload: any) => {
  try {
    const response = await api.post("/reset-password", payload);
    return response;
  } catch (error: any) {
    if (error.response) {
      return error.response;
    }
    throw error;
  }
};

export const verifyBusinessOtp = async (payload: {
  id: string;
  otp: string;
}) => {
  try {
    const response = await api.post("/verify-business-otp", payload);
    return response;
  } catch (error: any) {
    if (error.response) {
      return error.response;
    }
    throw error;
  }
};

export const shopperSignUp = async (payload: any) => {
  try {
    const response = await api.post("/shopper-sign-up", payload);
    return response;
  } catch (error: any) {
    if (error.response) {
      return error.response;
    }
    throw error;
  }
};

export const shopperLogin = async (payload: any) => {
  try {
    const response = await api.post("/shopper-login", payload);
    return response;
  } catch (error: any) {
    if (error.response) {
      return error.response;
    }
    throw error;
  }
};

export const shopperVerifyOtp = async (payload: {
  id: string;
  otp: string;
}) => {
  try {
    const response = await api.post("/shopper-verify-otp", payload);
    return response;
  } catch (error: any) {
    if (error.response) {
      return error.response;
    }
    throw error;
  }
};

export const verifyCustomerOtp = async (payload: {
  id: string;
  otp: string;
}) => {
  try {
    const response = await api.post("/verify-customer-otp", payload);
    return response;
  } catch (error: any) {
    if (error.response) {
      return error.response;
    }
    throw error;
  }
};

export const initiatePayment = async (payload: any) => {
  try {
    const response = await api.post("/initiate-payment", payload);
    return response;
  } catch (error: any) {
    if (error.response) {
      return error.response;
    }
    throw error;
  }
};

export const verifyPayment = async (reference: string) => {
  try {
    const response = await api.get(`/verify-wholesale-payment/${reference}`);
    return response;
  } catch (error: any) {
    if (error.response) {
      return error.response;
    }
    throw error;
  }
};
export const getAllProducts = async (page: number = 1) => {
  try {
    const response = await api.get(`/all-products?page=${page}`);
    return response;
  } catch (error: any) {
    if (error.response) {
      return error.response;
    }
    throw error;
  }
};

export const searchProducts = async (query: string, page: number = 1) => {
  try {
    const response = await api.get(
      `/search-products?q=${encodeURIComponent(query)}&page=${page}`,
    );
    return response;
  } catch (error: any) {
    if (error.response) {
      return error.response;
    }
    throw error;
  }
};

export const getAllOrders = async (id: string) => {
  try {
    const response = await api.get(`/all-orders/${id}`);
    return response;
  } catch (error: any) {
    if (error.response) {
      return error.response;
    }
    throw error;
  }
};

export const getBusinessStats = async (payload: {
  id: string;
  month: number;
  year: number;
}) => {
  try {
    const response = await api.post("/all-business-stats", payload);
    return response;
  } catch (error: any) {
    if (error.response) {
      return error.response;
    }
    throw error;
  }
};

export const applyVoucher = async (payload: {
  name: string;
  phone: string;
}) => {
  try {
    const response = await api.post("/voucher", payload);
    return response;
  } catch (error: any) {
    if (error.response) {
      return error.response;
    }
    throw error;
  }
};

export const verifyVoucherOtp = async (payload: {
  id: string;
  otp: string;
}) => {
  try {
    const response = await api.post("/verify-voucher-otp", payload);
    return response;
  } catch (error: any) {
    if (error.response) {
      return error.response;
    }
    throw error;
  }
};

export const confirmOrderApproved = async (payload: { orderId: string }) => {
  try {
    const response = await api.post("/confirm-order-approved", payload);
    return response;
  } catch (error: any) {
    if (error.response) {
      return error.response;
    }
    throw error;
  }
};

export default api;
