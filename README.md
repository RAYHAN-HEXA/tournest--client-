# TourNest — Client

**TourNest** is a local travel guide booking platform that connects travelers with trusted local guides across Bangladesh — mangrove cruises in the Sundarbans, street-food crawls in Old Dhaka, hill treks in Bandarban and more.

> 🌐 **Live site:** https://tournest-client.vercel.app
> 🔌 **Server repo:** https://github.com/RAYHAN-HEXA/tournest-server

## ✨ Features

- 🎠 **Interactive hero slider** — typewriter-animated headlines, auto-advancing destination slides and CTAs for travelers *and* aspiring guides
- 🔍 **Explore Tours with live filtering** — search by destination/tour/guide, category chips, price ceiling, 4 sort orders, pagination and skeleton loaders
- 🧭 **Tour discovery** — rich detail pages with image gallery, meeting point, seats-left counter, guide card and traveler reviews
- ⚡ **Instant booking** — modal form with live total (price × travelers), server-recomputed pricing and **overbooking protection** (group-size validation against remaining seats)
- 🔐 **Role-based dashboards** — traveler bookings table with cancel + PDF report (jsPDF), guide dashboard with earnings stats and booking requests, and a full admin panel (users, guide applications, tours, bookings)
- 🌗 **Dark/light mode** — system-aware, persisted across sessions
- 📱 **Fully responsive** — mobile hamburger nav, tablet grids, desktop layouts verified at 375/768/1280 px

## 🛠 Tech Stack

React 18 · Vite · React Router 7 · Tailwind CSS 4 · Firebase Auth (email/password + Google) · JWT-secured REST API · Axios interceptors · React Hook Form · SweetAlert-style toasts (react-hot-toast) · jsPDF + AutoTable · Lottie-free animations via react-awesome-reveal & react-simple-typewriter · Headless UI

## 🚀 Run locally

```bash
git clone https://github.com/RAYHAN-HEXA/tournest-client.git
cd tournest-client
npm install
cp .env.example .env   # fill in Firebase + API URL values
npm run dev
```

## 🔑 Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@tournest.dev` | `Admin@123456` |
| Guide | `tanvir.guide@tournest.dev` | `Guide@123456` |
| Traveler | register any new account |

> The admin/guide demo users exist in the backend database; register fresh accounts to try the traveler flow end-to-end.

## 🔒 Security notes

- Identity is established by a **Firebase ID token** verified server-side; all API calls then use a short-lived server-issued **JWT**
- Roles, ownership and prices are **never trusted from the client** — the server recalculates booking totals and checks tour ownership on every mutation
