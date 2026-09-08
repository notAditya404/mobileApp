// client.js ek plain module hai (React ke bahar), lekin logout AuthContext
// (React) mein hota hai. Yeh chhota sa "registry" dono ko jodta hai:
// AuthContext apna logout() function yahan register karta hai, aur
// client.js sirf notifyUnauthorized() call karta hai jab 401 aaye -
// isse client.js ko seedha React context import nahi karna padta.
let onUnauthorized = null;

export function registerUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

export function notifyUnauthorized() {
  onUnauthorized?.();
}
