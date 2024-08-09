import { AuthConfig } from "../types/types";
interface UserSessionInfo {
  accessToken: string;
  user?: any;
}

// Function to decode base64 encoded data
const decrypt = (data: string): string => {
  // Implement decryption or use a library. This is a placeholder.
  return atob(data); // Base64 decode as a simple example
};

// Function to get cookie value by name
const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
};
const encrypt = (data: string): string => {
  return btoa(data);
};
const setCookie = (
  name: string,
  value: string,
  expiryDate: Date,
  secure: boolean = location.protocol === "https:",
  sameSite: "Strict" | "Lax" | "None" = "Strict",
  httpOnly: boolean = false
) => {
  const cookieValue = encodeURIComponent(value);
  const cookieString = `${name}=${cookieValue}; expires=${expiryDate.toUTCString()}; path=/; SameSite=${sameSite}${
    secure ? "; Secure" : ""
  }${httpOnly ? "; HttpOnly" : ""}`;
  document.cookie = cookieString;
};
export const setSessionInCookie = (
  userSessionInfo: UserSessionInfo,
  config: AuthConfig
) => {
  try {
    const now = new Date();
    let expiryDate = new Date(now.getTime());
    const tokenExpiry = config.tokenExpiry ?? 1;
    switch (config.tokenExpiryUnit) {
      case "seconds":
        expiryDate = new Date(now.getTime() + tokenExpiry * 1000);
        break;
      case "minutes":
        expiryDate = new Date(now.getTime() + tokenExpiry * 60 * 1000);
        break;
      case "hours":
        expiryDate = new Date(now.getTime() + tokenExpiry * 60 * 60 * 1000);
        break;
      case "days":
        expiryDate = new Date(
          now.getTime() + tokenExpiry * 24 * 60 * 60 * 1000
        );
        break;
      default:
        throw new Error("Invalid token expiry unit");
    }

    console.log(`Expiration Date: ${expiryDate.toISOString()}`);

    if (config.tokenKeys?.accessToken) {
      setCookie(
        config.tokenKeys.accessToken,
        userSessionInfo.accessToken,
        expiryDate
      );
    }

    if (userSessionInfo.user) {
      const encryptedUser = encrypt(JSON.stringify(userSessionInfo.user));
      setCookie("user", encryptedUser, expiryDate);
    }

    if (config.tokenType) {
      setCookie("tokenType", config.tokenType, expiryDate);
    }
  } catch (error) {
    console.error("Error setting session in cookie:", error);
    throw new Error("Failed to set session in cookie");
  }
};
// Function to get session from cookies
export const getSession = (config: AuthConfig): UserSessionInfo | null => {
  try {
    const accessToken = getCookie(config.tokenKeys?.accessToken || "");
    const user = getCookie("user");

    if (accessToken) {
      // Decrypt user information
      const decryptedUser = user ? JSON.parse(decrypt(user)) : undefined;
      return {
        accessToken,
        user: decryptedUser,
      };
    }

    return null;
  } catch (error) {
    console.error("Error retrieving session from cookies:", error);
    return null;
  }
};
export const removeTokens = (tokenKey: { accessToken: string }) => {
  const removeCookie = (name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Strict${
      location.protocol === "https:" ? "; Secure" : ""
    }`;
  };

  removeCookie(tokenKey.accessToken);
};
