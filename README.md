# 🧮 Automatic HPP Calculator: Solusi Biar Gak Boncos!

> *"Capek itung HPP manual sampe tipes? Tenang, masbro. Aplikasi ini hadir biar idup lu agak ringan dikit, gak pusing tujuh keliling cuma gara-gara salah naruh koma di Excel."*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/dzakiudins-projects/v0-automatic-hpp-calculator)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/sSdTh694sId)
---

## 📸 Penampakan App (Biar Percaya)
<div align="center">
  <img src="docs/Screenshot%202026-03-17%20175222.png" width="350px" />
  <img src="docs/Screenshot%202026-03-17%20175243.png" width="350px" />
  <img src="docs/Screenshot%202026-03-17%20175252.png" width="350px" />
  <img src="docs/Screenshot%202026-03-17%20175313.png" width="350px" />
</div>

---

## 🧐 Apaan nih?
Ini adalah **Automatic HPP (Harga Pokok Penjualan) Calculator**. Dibikin khusus buat lu para pejuang cuan yang pengen serius bisnis tapi males berurusan sama rumus Excel yang ribetnya minta ampun. 

Intinya: tinggal masukin bahan, sat-set-sat-set, keluar harganya. Biar lu bisa fokus cari *customer*, bukan fokus liatin kalkulator sampe mata juling.

## ✨ Fitur-Fitur "Sakti"
*   **AI-Powered Magic**: Pake Gemini AI biar lu ngerasa punya asisten pribadi yang pinter (walaupun asistennya cuma barisan kode, tapi ya lumayanlah daripada gak ada yang bantuin).
*   **Derived Product Calculator**: Buat lu yang jualan barang turunan (misal: jualan sambel tapi modalnya dari cabe yang harganya naik turun kayak mood mantan), kita udah mikirin sampe situ.
*   **Mobile Ready**: Berkat **Capacitor**, aplikasi ini bisa lu bawa-bawa di kantong. Cocok buat ngecek harga pas lagi nongkrong di warkop atau lagi nego sama suplier.
*   **UI/UX Glowing**: Pake Shadcn/UI biar tampilannya mewah, gak malu-maluin pas dipamerin ke investor (atau ke temen tongkrongan).
*   **Settings Modal**: Bisa ganti-ganti config tanpa perlu bongkar kode. Lu bukan hacker, kan? Pake UI aja udah cukup.

## 🛠️ Jeroannya (Tech Stack)
Gak cuma modal casing cakep, jeroannya pake teknologi yang gak kaleng-kaleng:
*   **Framework**: [Next.js 15+](https://nextjs.org/) (Biar performanya kenceng, gak pake buffering-buffering club).
*   **Otak AI**: [Google Gemini Pro](https://deepmind.google/technologies/gemini/) (Otomatis pinter tanpa perlu ikut bimbel).
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn/UI](https://ui.shadcn.com/) (Biar tampilan rapih tanpa harus kursus desain interior).
*   **Mobile Bridge**: [Capacitor](https://capacitorjs.com/) (Biar bisa jadi APK, bukan cuma jadi impian).
*   **State Management**: React Hooks & Store custom (Biar gak amnesia pas lu pindah-pindah tab).

## 🚀 Cara Pake (Gak Pake Iklan)

Kalo lu pengen oprek sendiri di lokal:

1.  **Clone dulu repository-nya:**
    ```bash
    git clone https://github.com/Dzakiudin/Automatic-HPP-Calculator.git
    cd Automatic-HPP-Calculator
    ```

2.  **Install segala rupa bumbunya:**
    ```bash
    npm install
    # atau kalo lu tim pnpm biar lebih 'lite'
    pnpm install
    ```

3.  **Setup ENV (Penting banget, jangan dilewati!):**
    Bikin file `.env.local` di root folder, terus isi API Key Gemini lu. Jangan dipajang di status WhatsApp, ntar dikerjain orang.
    ```env
    NEXT_PUBLIC_GEMINI_API_KEY=your_key_here
    ```

4.  **Nyalain mesinnya:**
    ```bash
    npm run dev
    ```
    Terus buka `http://localhost:3000` di browser kesayangan lu.

## 📱 Mau dibungkus jadi APK?
Udah disediain Capacitor-nya, tinggal jalanin ritual:
```bash
npx cap add android
npx cap copy
npx cap open android
```
Ntar langsung kebuka di Android Studio. Lu tinggal klik 'Run', terus jadi deh aplikasinya. Mantap kan?

---

## 🤝 Kontribusi
Punya ide gila biar aplikasi ini makin sakti? Atau nemu bug yang bikin emosi? Silakan buka *Pull Request*. Kita terima dengan tangan terbuka, asal jangan naruh script buat nambang crypto aja di dalemnya ya.

## 🛡️ License
Suka-suka lu dah, yang penting berkah buat semua. 

---
*Dibuat dengan ❤️, ☕, dan sedikit rasa takut pas denger harga bahan baku naik lagi.*