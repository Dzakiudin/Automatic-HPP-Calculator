import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
  type PriceRecommendation, 
  type BundleRecommendation,
  type VariableCost,
  type FixedCost,
  type ProcessingCost,
  type DerivedProduct
} from "./types";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function getGenAIClient(): GoogleGenerativeAI {
  if (typeof window === 'undefined') {
    throw new Error("Cannot instantiate GenAI from server");
  }
  
  // Try localStorage first (user-provided key)
  let apiKey = localStorage.getItem("GEMINI_API_KEY");
  
  // Fallback to environment variable if not in localStorage
  if (!apiKey || apiKey.trim() === "") {
    apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || null;
  }

  if (!apiKey) {
    throw new Error("MISSING_API_KEY");
  }
  return new GoogleGenerativeAI(apiKey);
}

export async function getPriceRecommendationsClient(
  productName: string,
  category: string,
  hpp: number,
  targetSales: number | undefined
): Promise<PriceRecommendation> {
  const prompt = `
  Anda adalah konsultan harga ahli untuk UMKM di Indonesia.
  Berdasarkan data produk berikut:
  - Nama Produk: ${productName}
  - Kategori: ${category}
  - Harga Pokok Produksi (HPP): Rp ${hpp}
  - Target Penjualan: ${targetSales ? `${targetSales} unit/bulan` : "Tidak ditentukan"}

  Berikan rekomendasi harga jual dalam 3 kategori:
  1. "competitive" (Agresif/Margin kecil)
  2. "standard" (Moderat/Margin menengah)
  3. "premium" (Premium/Margin tinggi)

  Format response harus STRICTLY JSON object dengan format berikut:
  {
    "competitive": { "price": number, "profit": number, "margin": number, "description": string },
    "standard": { "price": number, "profit": number, "margin": number, "description": string },
    "premium": { "price": number, "profit": number, "margin": number, "description": string }
  }
  
  Setiap objek harus berisi:
  - price: harga jual bulat (contoh: 15000)
  - profit: nilai keuntungan per produk (price - HPP)
  - margin: persentase margin laba dari harga jual
  - description: alasan singkat harga ini dan target pasarnya
  
  Return HANYA JSON object, tanpa markdown block (\`\`\`json) atau teks lain.
  `;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const genAI = getGenAIClient();
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Bersihkan response dari markdown wrap ```json dan whitespace
      const cleanedJson = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(cleanedJson) as PriceRecommendation;
    } catch (error: any) {
      if (error?.message === "MISSING_API_KEY") {
        throw error;
      }

      console.error(`Attempt ${attempt} failed:`, error);
      if (error?.status === 429) {
        if (attempt === MAX_RETRIES) throw new Error("QUOTA_EXCEEDED");
        await delay(RETRY_DELAY * attempt);
        continue;
      }
      if (attempt === MAX_RETRIES) throw new Error("Gagal mendapatkan saran dari AI. Periksa koneksi atau API Key Anda.");
      await delay(RETRY_DELAY * attempt);
    }
  }

  throw new Error("Gagal memproses rekomendasi.");
}

export async function getBundleRecommendationsClient(
  productName: string,
  category: string,
  hpp: number
): Promise<BundleRecommendation> {
  const prompt = `
  Sebagai konsultan bisnis F&B dan retail, berikan 3 ide paket bundling yang menarik
  untuk meningkatkan nilai transaksi (Average Order Value) untuk produk ini:
  
  Produk Utama: ${productName}
  Kategori: ${category}
  HPP Produk Utama: Rp ${hpp}

  Berikan 3 jenis paket bundling:
  1. "economyPack" (Paket Ekonomis)
  2. "balancedPack" (Paket Populer)
  3. "profitMaxPack" (Paket Premium)

  Format response harus STRICTLY JSON object dengan format berikut:
  {
    "economyPack": { "price": number, "discount": number, "profit": number, "margin": number, "description": string },
    "balancedPack": { "price": number, "discount": number, "profit": number, "margin": number, "description": string },
    "profitMaxPack": { "price": number, "discount": number, "profit": number, "margin": number, "description": string }
  }

  Setiap objek harus berisi:
  - price: harga jual paket yang sudah didiskon
  - discount: nominal potongan harga dari total harga normal
  - profit: keuntungan bersih dari paket (price - estimasi total HPP)
  - margin: persentase margin dari harga jual paket
  - description: ide nama paket kreatif dan penjelasan isinya

  Return HANYA JSON object, tanpa markdown block.
  `;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const genAI = getGenAIClient();
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      const cleanedJson = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(cleanedJson) as BundleRecommendation;
    } catch (error: any) {
      if (error?.message === "MISSING_API_KEY") {
        throw error;
      }

      console.error(`Attempt ${attempt} failed:`, error);
      if (error?.status === 429) {
        if (attempt === MAX_RETRIES) throw new Error("QUOTA_EXCEEDED");
        await delay(RETRY_DELAY * attempt);
        continue;
      }
      if (attempt === MAX_RETRIES) throw new Error("Gagal mendapatkan saran bundling dari AI.");
      await delay(RETRY_DELAY * attempt);
    }
  }

  throw new Error("Gagal mensimulasikan bundling.");
}

export async function getCostSuggestionsClient(
  productName: string,
  category: string
): Promise<{ variableCosts: VariableCost[]; fixedCosts: FixedCost[] }> {
  const prompt = `
  Sebagai konsultan bisnis UMKM di Indonesia, berikan estimasi komponen biaya untuk memproduksi:
  - Nama Produk: ${productName}
  - Kategori: ${category}

  Berikan daftar bahan baku utama (variable costs) dan biaya operasional bulanan (fixed costs).
  Gunakan angka estimasi yang realistis untuk pasar Indonesia saat ini.

  Format response harus STRICTLY JSON array dengan format berikut:
  {
    "variableCosts": [
      { "id": "1", "name": "Bahan A", "amount": 5000 },
      { "id": "2", "name": "Bahan B", "amount": 2000 }
    ],
    "fixedCosts": [
      { "id": "1", "name": "Listrik & Air", "monthlyAmount": 200000, "allocationPerProduct": 0 },
      { "id": "2", "name": "Sewa Tempat", "monthlyAmount": 500000, "allocationPerProduct": 0 }
    ]
  }
  Kosongkan markdown block \`\`\`json dan return HANYA JSON object murni.
  `;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const genAI = getGenAIClient();
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      const cleanedJson = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(cleanedJson);
    } catch (error: any) {
      if (error?.message === "MISSING_API_KEY") throw error;
      console.error("AI Cost Suggestion failed:", error);
      if (attempt === MAX_RETRIES) throw new Error("Gagal mendapatkan saran biaya.");
      await delay(RETRY_DELAY * attempt);
    }
  }
  throw new Error("Gagal memproses rekomendasi biaya.");
}

export async function getDerivedProductSuggestionsClient(
  rawMaterial: string
): Promise<{ processingCosts: ProcessingCost[]; products: DerivedProduct[] }> {
  const prompt = `
  Sebagai ahli industri pengolahan, berikan ide produk turunan dari bahan baku utama:
  - Bahan Baku: ${rawMaterial}

  Berikan estimasi biaya pengolahan dan daftar produk turunan (minimal 2, maksimal 4 produk) yang bisa dihasilkan dari bahan baku tersebut secara bersamaan (joint costs).
  Contoh: Singkong -> Keripik Singkong, Tapioka, Ampas Tape.

  Format response harus STRICTLY JSON object:
  {
    "processingCosts": [
      { "id": "1", "name": "Tenaga Kerja", "amount": 50000, "period": "per-batch" },
      { "id": "2", "name": "Listrik Mesin", "amount": 20000, "period": "per-batch" }
    ],
    "products": [
      { "id": "1", "name": "Produk Utama", "quantity": 100, "unit": "kg", "sellingPrice": 25000 },
      { "id": "2", "name": "Produk Sampingan", "quantity": 10, "unit": "kg", "sellingPrice": 5000 }
    ]
  }
  Return HANYA JSON object.
  `;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const genAI = getGenAIClient();
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      const cleanedJson = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(cleanedJson);
    } catch (error: any) {
      if (error?.message === "MISSING_API_KEY") throw error;
      console.error("AI Derived Suggestion failed:", error);
      if (attempt === MAX_RETRIES) throw new Error("Gagal mendapatkan saran turunan.");
      await delay(RETRY_DELAY * attempt);
    }
  }
  throw new Error("Gagal memproses rekomendasi turunan.");
}
