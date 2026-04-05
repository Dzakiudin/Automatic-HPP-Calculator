# 🧮 Automatic HPP Calculator

A comprehensive, AI-powered solution to automate and simplify the calculation of Harga Pokok Penjualan (HPP) / Cost of Goods Sold (COGS).

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/dzakiudins-projects/v0-automatic-hpp-calculator)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/sSdTh694sId)
---

## 📸 Application Previews
<div align="center">
  <img src="docs/Gradient%20Mobile%20Application.jpg" width="350px" />
  <img src="docs/Screenshot%202026-03-17%20175222.png" width="350px" />
  <img src="docs/Screenshot%202026-03-17%20175243.png" width="350px" />
  <img src="docs/Screenshot%202026-03-17%20175252.png" width="350px" />
  <img src="docs/Screenshot%202026-03-17%20175313.png" width="350px" />
</div>

---

## 🧐 About the Project
**Automatic HPP Calculator** is an application specifically designed for business owners and entrepreneurs to streamline the process of calculating production costs. By automating complex calculations, this tool minimizes human error and saves valuable time, allowing you to focus on scaling and growing your business operations.

## ✨ Key Features
*   **AI-Powered Insights**: Integrates with Gemini AI to provide intelligent assistance and predictive insights regarding ingredient costs and pricing strategies.
*   **Derived Product Calculator**: Supports complex, multi-tiered calculations for derived products or sub-components, adapting to fluctuating raw material prices seamlessly.
*   **Mobile-Ready & Cross-Platform**: Built with **Capacitor**, enabling fluid usage across web, Android, and iOS devices. Check your HPP anytime, anywhere.
*   **Modern User Interface**: Designed with Shadcn/UI for a clean, intuitive, and professional enterprise-grade visual experience.
*   **Dynamic Settings Management**: Easily configure application preferences and AI models directly through the user interface without modifying the source code.

## 🛠️ Technology Stack
Built utilizing modern, high-performance technologies:
*   **Framework**: [Next.js 15+](https://nextjs.org/) for fast, optimized, and scalable web rendering.
*   **AI Integration**: [Google Gemini Pro](https://deepmind.google/technologies/gemini/) for advanced data processing and analysis.
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn/UI](https://ui.shadcn.com/) for a modular and responsive design system.
*   **Mobile Bridge**: [Capacitor](https://capacitorjs.com/) to compile the web application into native mobile builds.
*   **State Management**: React Hooks and custom stores to handle complex state management securely.

## 🚀 Getting Started

Follow the instructions below to run the project locally:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Dzakiudin/Automatic-HPP-Calculator.git
    cd Automatic-HPP-Calculator
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or using pnpm
    pnpm install
    ```

3.  **Environment Setup:**
    Create a `.env.local` file in the root directory and configure your Gemini API Key securely.
    ```env
    NEXT_PUBLIC_GEMINI_API_KEY=your_key_here
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open `http://localhost:3000` in your preferred web browser to view the application.

## 📱 Mobile Build (Android/iOS)
The application is pre-configured with Capacitor for native deployment. Run the following commands:
```bash
npx cap add android
npx cap sync
npx cap open android
```
This will open the project in your native IDE (e.g., Android Studio), where you can easily build and generate your APK/AAB files.

---

## 🤝 Contributing
We welcome contributions to improve the application. Please feel free to open a Pull Request or report bugs in the Issues section. Ensure your code adheres to standard styling and best practices.

## 🛡️ License
This project is open-source and available under the MIT License.

---
*Developed with dedication to simplify business operations and empower modern enterprises.*
