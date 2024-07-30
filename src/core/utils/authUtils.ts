import { jwtDecode } from "jwt-decode";
import { AuthError, AuthTokens, DecodedToken } from "../types/types";

interface TokenKeys {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export const setTokens = (tokens: AuthTokens, tokenKeys: TokenKeys) => {
  try {
    const decoded = jwtDecode<DecodedToken>(tokens.accessToken);
    const expiryDate = new Date(decoded.exp * 1000);

    const setCookie = (name: string, value: string) => {
      const cookieValue = encodeURIComponent(value);
      const cookieString = `${name}=${cookieValue}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict${
        location.protocol === "https:" ? "; Secure" : ""
      }`;
      document.cookie = cookieString;
    };

    setCookie(tokenKeys.accessToken, tokens.accessToken);
    setCookie(tokenKeys.refreshToken, tokens.refreshToken);
    setCookie(tokenKeys.tokenType, tokens.tokenType);
  } catch (error) {
    throw new AuthError("Invalid token format");
  }
};

export const getTokens = (tokenKeys: TokenKeys): AuthTokens | null => {
  if (typeof document === "undefined") return null;

  const getCookie = (name: string): string | null => {
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split("=");
      if (cookieName === name) {
        return decodeURIComponent(cookieValue);
      }
    }
    return null;
  };

  const accessToken = getCookie(tokenKeys.accessToken);
  const refreshToken = getCookie(tokenKeys.refreshToken);
  const tokenType = getCookie(tokenKeys.tokenType);

  if (accessToken && refreshToken && tokenType) {
    return { accessToken, refreshToken, tokenType };
  }

  return null;
};

export const removeTokens = (tokenKeys: TokenKeys) => {
  const removeCookie = (name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Strict${
      location.protocol === "https:" ? "; Secure" : ""
    }`;
  };

  removeCookie(tokenKeys.accessToken);
  removeCookie(tokenKeys.refreshToken);
  removeCookie(tokenKeys.tokenType);
};
