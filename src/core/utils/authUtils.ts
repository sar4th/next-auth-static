import { AuthError, DecodedToken } from "../contexts/AuthContext";
import { jwtDecode } from "jwt-decode";
export const setToken = (token: string, tokenKey: string) => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const expiryDate = new Date(decoded.exp * 1000);
    const cookieValue = encodeURIComponent(token);
    const cookieString = `${tokenKey}=${cookieValue}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict${
      location.protocol === "https:" ? "; Secure" : ""
    }`;
    document.cookie = cookieString;
  } catch (error) {
    throw new AuthError("Invalid token format");
  }
};

export const getToken = (tokenKey: string): string | null => {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === tokenKey) {
      return decodeURIComponent(value);
    }
  }
  return null;
};

export const removeToken = (tokenKey: string) => {
  document.cookie = `${tokenKey}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Strict${
    location.protocol === "https:" ? "; Secure" : ""
  }`;
};
