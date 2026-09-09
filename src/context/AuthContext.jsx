import { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { registerUnauthorizedHandler } from "@/api/authEvents";

const AuthContext = createContext(null);

// Poori app mein login state yahin se aata hai. Login/signup/logout
// yahin se guzarte hain taaki root layout ke Stack.Protected guards
// turant reactive ho jayein - koi manual router.replace() nahi chahiye,
// jab isLoggedIn badalta hai, Expo Router khud navigation history
// reset karke sahi screen dikha deta hai (isliye login ke baad
// "back" dabane se Welcome/Login wapas nahi aata).
export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    SecureStore.getItemAsync("authToken").then((token) => {
      setIsLoggedIn(!!token);
      setIsLoading(false);
    });
  }, []);

  async function login(token) {
    await SecureStore.setItemAsync("authToken", token);
    setIsLoggedIn(true);
  }

  async function logout() {
    await SecureStore.deleteItemAsync("authToken");
    setIsLoggedIn(false);
  }

  // apiRequest() 401 milne par isi logout() ko trigger karega
  useEffect(() => {
    registerUnauthorizedHandler(logout);
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
