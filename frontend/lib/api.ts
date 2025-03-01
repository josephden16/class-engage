import api from "./axios";

export const signUpUser = async (data: {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  faculty: string;
  department: string;
}) => {
  try {
    const requestData = {
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      faculty: data.faculty,
      department: data.department,
    };
    const response = await api.post("/auth/signup", requestData);
    return response?.data.data;
  } catch (error) {
    console.error("Sign-up failed:", error);
    throw error;
  }
};

export const loginUser = async (data: { email: string; password: string }) => {
  try {
    const requestData = {
      email: data.email,
      password: data.password,
    };
    const response = await api.post("/auth/login", requestData);
    return response?.data.data;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};
