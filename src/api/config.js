// ---- Backend connection settings ----
// Backend (sih2026BackendNode - Express) ab ready hai, isliye USE_MOCK_DATA
// false hai aur BASE_URL usi ke routes se match karta hai (koi /api prefix
// nahi, port 3000 - dekho backend ka src/app.js aur .env.example).

// Backend ka base URL. Local testing ke waqt apne computer ka LAN IP
// address use karna (localhost mobile phone/emulator se kaam nahi karega
// kyunki wo apna hi "localhost" dhoondhta hai, tumhare computer ka nahi), e.g:
// export const BASE_URL = "http://192.168.1.5:3000";
export const BASE_URL = "http://localhost:3000";

// Jab tak yeh true hai, app real backend ko call nahi karega -
// har screen apna mock (fake) data dikhayega. Backend ready hai, isliye
// false rakha hai - agar backend down ho to test ke liye true kar sakte ho.
export const USE_MOCK_DATA = false;
