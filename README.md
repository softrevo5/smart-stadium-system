# FIFA World Cup 2026: Smart Stadiums & Tournament Operations

A Generative AI-enabled stadium operations and tournament spectator companion built for the FIFA World Cup 2026. This application leverages Next.js (App Router, TypeScript), Vanilla CSS, and the Google Gemini AI Model to enhance event management, accessibility, crowd control, and environmental sustainability.

---

## 🏟️ Chosen Vertical & Persona Design
The solution is designed around **Smart Stadiums & Tournament Operations** for the FIFA World Cup 2026. It features a dynamic context-aware interface that changes based on four user personas:

1. **Spectator Companion (Fan Mode)**
   * **Goal:** Improve navigation, crowd management, accessibility, and environmental sustainability.
   * **Features:** Live interactive gate queue tracking, step-free accessibility path finding, carbon-offset travel planner, and water-refill locator.

2. **Operations Director (Organizer Mode)**
   * **Goal:** Operations intelligence and real-time decision support.
   * **Features:** Live event dispatcher with Gemini AI. Organizers can select any ongoing incident (e.g., medical alert, network failure) and command the Gemini model to automatically draft step-by-step dispatch logs.

3. **Volunteer Advisor (Volunteer Mode)**
   * **Goal:** Direct support and incident reporting assistance.
   * **Features:** Guided safety protocols, ticket scanning troubleshooting, and recycling compliance tips.

4. **Venue Crew Dispatch (Staff Mode)**
   * **Goal:** Maintenance and facility-level action items.
   * **Features:** Maintenance tickets, Turnstile hardware setup assistance, and cleanup logs.

---

## 🧠 Approach & Logic

### 1. Context-Aware Generative AI Grounding
Instead of a generic chat, the GenAI assistant uses **contextual grounding** to answer queries:
* **Prompt Injection:** When a query is made, the app fetches the active stadium state (current gates wait times, carbon savings, incident logs, solar panel output).
* **System Prompting:** Tailors responses depending on the active role (`fan`, `organizer`, `volunteer`, `staff`).
* **AI Action Plans:** In the Incident Command dashboard, organizers can command the AI to instantly analyze an incident and draft a protocol-compliant response team dispatch plan.

### 2. Live Simulation Engine
To demonstrate real-world usability, the application runs a local tick simulator:
* Every 10 seconds, gate wait times, concession queue lines, and solar grid outputs fluctuate realistically.
* Fans can instantly see queue lengths shift on the SVG map and adapt their pathing in real-time.

---

## 🛠️ Technical Stack & Architecture

* **Framework:** Next.js (App Router, strict TypeScript)
* **Styling:** Vanilla CSS (Tailwind avoided to preserve a custom high-end glassmorphic theme)
* **Generative AI:** Google Gemini SDK (`@google/generative-ai`)
* **Icons:** `lucide-react`
* **Testing:** Jest & React Testing Library (with polyfilled JSDOM Web APIs for node execution)
* **CI/CD Quality Control:** Strictly configured ESLint rules

---

## 🔒 Focus Areas & Alignment

### 1. Code Quality
* Strictly typed parameters avoiding `any` keywords.
* Modular components following React best practices.
* 100% clean linting (`npm run lint` yields zero errors/warnings).

### 2. Security
* **Safe Keys:** The Gemini API key is loaded server-side only via environment variables (`process.env.GEMINI_API_KEY`). It is never exposed to the client.
* **Offline Demo Mode:** If no API key is provided, the application runs on a pre-grounded local rules engine rather than crashing, ensuring safe runtime stability.

### 3. Efficiency
* Light and optimized SVGs for the interactive map instead of resource-heavy images.
* Responsive Next.js server-side dynamic routing.
* Fast page load speeds complying with Vercel deployment standards.

### 4. Testing
* Unit and integration testing verify the correctness of mock states, SVG map interactions, and the Gemini API fallback responses.
* Test suite configured using Node 22 native globals polyfilled for JSDOM.

### 5. Accessibility (A11y)
* Inclusive layout supporting semantic HTML (`<main>`, `<header>`, `<h1>`).
* Accessible ARIA tags (`aria-pressed`, `aria-label`, `role="heading"`).
* **Voice Screen Reader:** Embedded Text-to-Speech (TTS) speaker widget allowing users (especially fans with visual impairments) to hear AI instructions spoken aloud.
* **Accessibility Map Toggle:** Highlights step-free entry routes (ramps/elevators) and warns users about stairs-only entrances (like Gate C).

---

## 📋 Assumptions Made
1. **API Keys:** It is assumed the user has a Google Gemini API Key configured in their `.env` or Vercel environment as `GEMINI_API_KEY`. If absent, the app falls back gracefully to a simulation response.
2. **Device Support:** Works on standard web browsers. Responsive CSS media queries are used to adjust the layout between desktop monitors and mobile devices.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root of the project:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 4. Run Unit Tests
```bash
npm run test
```

### 5. Run Lint Check
```bash
npm run lint
```
