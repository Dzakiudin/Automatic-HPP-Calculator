import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

function parseJsonFromAI(text: string): unknown | null {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key belum dikonfigurasi. Tambahkan GOOGLE_AI_API_KEY di file .env.local" },
        { status: 503 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const { action, data } = await request.json();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    if (action === "price-recommendations") {
      const { productName, category, hpp, businessMode } = data;
      
      const prompt = `Kamu adalah konsultan bisnis Indonesia yang ahli dalam strategi pricing.

Berikan rekomendasi harga jual untuk produk berikut:
- Nama Produk: ${productName}
- Kategori: ${category}
- HPP (Harga Pokok Produksi): Rp ${hpp.toLocaleString('id-ID')}
- Mode Bisnis: ${businessMode}

Berikan 3 tingkatan harga dalam format JSON (tanpa markdown code block):
{
  "competitive": {
    "price": [angka harga kompetitif, margin sekitar 30-40%],
    "profit": [angka profit per unit],
    "margin": [persentase margin],
    "description": "[deskripsi singkat strategi harga kompetitif dalam Bahasa Indonesia, max 100 karakter]"
  },
  "standard": {
    "price": [angka harga standar, margin sekitar 50-70%],
    "profit": [angka profit per unit],
    "margin": [persentase margin],
    "description": "[deskripsi singkat strategi harga standar dalam Bahasa Indonesia, max 100 karakter]"
  },
  "premium": {
    "price": [angka harga premium, margin sekitar 80-100%+],
    "profit": [angka profit per unit],
    "margin": [persentase margin],
    "description": "[deskripsi singkat strategi harga premium dalam Bahasa Indonesia, max 100 karakter]"
  }
}

Pastikan harga dibulatkan ke ratusan atau ribuan terdekat yang masuk akal untuk produk Indonesia.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const recommendations = parseJsonFromAI(text);
      if (recommendations) {
        return NextResponse.json(recommendations);
      }
      return NextResponse.json({ error: "Gagal memproses respons AI" }, { status: 500 });
    }

    if (action === "bundle-recommendations") {
      const { products, totalHPP, totalNormalPrice } = data;
      
      const productList = products.map((p: { name: string; normalPrice: number; hpp: number }) => 
        `- ${p.name}: Harga Normal Rp ${p.normalPrice.toLocaleString('id-ID')}, HPP Rp ${p.hpp.toLocaleString('id-ID')}`
      ).join('\n');

      const prompt = `Kamu adalah konsultan bisnis Indonesia yang ahli dalam strategi bundling.

Berikan rekomendasi harga bundling untuk produk-produk berikut:
${productList}

Total HPP Gabungan: Rp ${totalHPP.toLocaleString('id-ID')}
Total Harga Jual Normal: Rp ${totalNormalPrice.toLocaleString('id-ID')}

Berikan 3 opsi paket bundling dalam format JSON (tanpa markdown code block):
{
  "economyPack": {
    "price": [angka harga ekonomis, diskon besar sekitar 15-25%],
    "discount": [angka diskon dalam rupiah],
    "profit": [angka profit],
    "margin": [persentase margin],
    "description": "[deskripsi singkat strategi paket hemat dalam Bahasa Indonesia, max 100 karakter]"
  },
  "balancedPack": {
    "price": [angka harga seimbang, diskon sedang sekitar 10-15%],
    "discount": [angka diskon dalam rupiah],
    "profit": [angka profit],
    "margin": [persentase margin],
    "description": "[deskripsi singkat strategi paket seimbang dalam Bahasa Indonesia, max 100 karakter]"
  },
  "profitMaxPack": {
    "price": [angka harga maksimal profit, diskon kecil sekitar 5-10%],
    "discount": [angka diskon dalam rupiah],
    "profit": [angka profit],
    "margin": [persentase margin],
    "description": "[deskripsi singkat strategi maksimal profit dalam Bahasa Indonesia, max 100 karakter]"
  }
}

Pastikan semua harga bundling lebih rendah dari total harga normal dan profit tetap positif.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const recommendations = parseJsonFromAI(text);
      if (recommendations) {
        return NextResponse.json(recommendations);
      }
      return NextResponse.json({ error: "Gagal memproses respons AI" }, { status: 500 });
    }

    if (action === "derived-product-suggestions") {
      const { rawMaterial } = data;

      const prompt = `Kamu adalah konsultan bisnis Indonesia yang ahli dalam pengolahan bahan baku.

Berikan saran biaya pengolahan dan produk turunan untuk bahan baku: ${rawMaterial}

Berikan dalam format JSON (tanpa markdown code block):
{
  "processingCosts": [
    {"id": "[uuid]", "name": "[nama biaya pengolahan]", "amount": [estimasi biaya dalam rupiah], "period": "per-batch"},
    ... (3-5 item biaya pengolahan yang relevan)
  ],
  "products": [
    {"id": "[uuid]", "name": "[nama produk turunan]", "quantity": [estimasi qty dari 1000kg bahan baku], "unit": "kg", "sellingPrice": [estimasi harga jual per unit]},
    ... (3-5 produk turunan yang bisa dihasilkan)
  ]
}

Gunakan data realistis untuk industri pengolahan di Indonesia.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const suggestions = parseJsonFromAI(text) as { processingCosts?: { name: string; amount: number; period: string }[]; products?: { name: string; quantity: number; unit: string; sellingPrice: number }[] } | null;
      if (suggestions?.processingCosts && suggestions?.products) {
        suggestions.processingCosts = suggestions.processingCosts.map((cost) => ({
          ...cost,
          id: crypto.randomUUID(),
        }));
        suggestions.products = suggestions.products.map((product) => ({
          ...product,
          id: crypto.randomUUID(),
        }));
        return NextResponse.json(suggestions);
      }
      return NextResponse.json({ error: "Gagal memproses respons AI" }, { status: 500 });
    }

    if (action === "ai-assist-input") {
      const { productName, category, businessMode } = data;

      const prompt = `Kamu adalah konsultan bisnis Indonesia yang ahli dalam kalkulasi HPP.

Berikan saran komponen biaya untuk produk berikut:
- Nama Produk: ${productName}
- Kategori: ${category}
- Mode Bisnis: ${businessMode}

Berikan dalam format JSON (tanpa markdown code block):
{
  "variableCosts": [
    {"id": "[uuid]", "name": "[nama bahan/komponen]", "amount": [estimasi harga dalam rupiah]},
    ... (4-6 komponen biaya variabel yang relevan)
  ],
  "fixedCosts": [
    {"id": "[uuid]", "name": "[nama biaya tetap]", "monthlyAmount": [estimasi biaya bulanan], "allocationPerProduct": 0},
    ... (3-5 komponen biaya tetap yang relevan)
  ],
  "suggestedTargetSales": [estimasi target penjualan per bulan yang realistis]
}

Gunakan data realistis untuk bisnis kecil-menengah di Indonesia.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const suggestions = parseJsonFromAI(text) as { variableCosts?: { name: string; amount: number }[]; fixedCosts?: { name: string; monthlyAmount: number; allocationPerProduct: number }[]; suggestedTargetSales?: number } | null;
      if (suggestions?.variableCosts && suggestions?.fixedCosts) {
        suggestions.variableCosts = suggestions.variableCosts.map((cost) => ({
          ...cost,
          id: crypto.randomUUID(),
        }));
        suggestions.fixedCosts = suggestions.fixedCosts.map((cost) => ({
          ...cost,
          id: crypto.randomUUID(),
        }));
        return NextResponse.json(suggestions);
      }
      return NextResponse.json({ error: "Gagal memproses respons AI" }, { status: 500 });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("AI API Error:", error);
    const errMsg = error instanceof Error ? error.message : String(error);
    if (errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("Too Many Requests")) {
      return NextResponse.json(
        { error: "Quota API habis. Coba lagi dalam beberapa menit." },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: "Terjadi kesalahan pada layanan AI. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
