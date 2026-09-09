// ---- Backend connection settings ----
// Jab Spring Boot backend ready ho jaye, sirf yeh 2 lines change karni hain
// baaki poore app mein kahin kuch change nahi karna padega.

// Backend ka base URL. Local testing ke waqt apne computer ka IP address
// use karna (localhost mobile phone se kaam nahi karega), e.g:
// export const BASE_URL = "http://192.168.1.5:8080/api";
export const BASE_URL = "http://localhost:8080/api";

// Jab tak yeh true hai, app real backend ko call nahi karega -
// har screen apna mock (fake) data dikhayega. Jab backend ready ho,
// isko false kar dena.
export const USE_MOCK_DATA = true;
