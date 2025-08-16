// routes/products.js
const express = require("express");
const router = express.Router();
const { getTenantDb } = require("../db");
const ProductModelFactory = require("../models/Product");

const TOP_UNCATEGORIZED = [
  "Semaver|325",
  "Kuruyemiş|150",
  "Çekirdek|75",
];

// 1) Kategori sırası (AYNEN senin verdiğin gibi)
const CATEGORY_ORDER = [
  "Genel",
  "TÜRK KAHVESİ",
  "ESPRESSO",
  "FİLTRE KAHVELER",
  "SOĞUK KAHVELER",
  "SICAK İÇECEKLER",
  "MOCHA’S",
  "FRAPPE",
  "LİMONATALAR",
  "MİLKSHAKE’S",
  "SMOOTHİE",
  "FROZEN",
  "COCKTAİL’S",
  "BİTKİ ÇAYLARI",
  "KUTU İÇECEKLER",
  "TOSTLAR",
  "PASTA VE TATLILAR",
];


// 2) Her kategoride ürün sırası (isim|fiyat). Sıra bire bir korunur.
const ORDER_ITEMS = {
  "Genel": [
    "Semaver|325",
    "Kuruyemiş|150",
    "Çekirdek|75",
    ],
    
  "TÜRK KAHVESİ": [
    "TÜRK KAHVESİ|100",
    "DİBEK KAHVESİ|110",
    "MENENGİÇ KAHVESİ|110",
    "DAMLA SAKIZLI TÜRK KAHVESİ|110",
    "OSMANLI TÜRK KAHVESİ|110",
    "SÜTLÜ TÜRK KAHVESİ|140",
    "DUBLE TÜRK KAHVESİ|140",
  ],
  "ESPRESSO": [
    "SİNGLE ESPRESSO|110",
    "DOUBLE ESPRESSO|120",
    "CORTADO|130",
    "AMERİCANO|130",
    "CAPPUCİNO|170",
    "FLAT WHİTE|170",
    "RED EYE|140",
    "CAFE LATTE|160",
    "CARAMEL LATTE|170",
    "VANİLYA LATTE|170",
    "WHİTE BERRY LATTE|170",
    "CARAMEL MACCHİATO|180",
    "ESPRESSO MACHİATO|180",
    "CHOCOLATE MACHİATO|180",
    "AFFAGATO|180",
  ],
  "FİLTRE KAHVELER": [
    "FİLTRE KAHVE|130",
    "VANİLYALI FİLTRE KAHVE|140",
    "CARAMEL FİLTRE KAHVE|140",
  ],
  "SOĞUK KAHVELER": [
    "ICE LATTE|170",
    "ICE CARAMEL LATTE|180",
    "ICE CHAİ TEA LATTE|180",
    "ICE FİLTRE KAHVE|180",
    "ICE CARAMEL MACCHİATO|180",
    "ICE AMERİCANO|150",
    "ICE CAPPUCİNO|180",
    "ICE MOCHA|180",
    "ICE FLAT WHİTE|180",
    "ICE MOCHA|200",                     // aynı isim farklı fiyat: ayrı sırada
    "ICE WHİTE MOCHA|200",
    "ICE BERY WHİTE MOCHA|200",         // “BERY” senin listendeki gibi bırakıldı
    "ICE WHİTE CHOCOLATE MOCHA|200",
    "ICE ZEBRA MOCHA MOCHA|200",        // listendeki şekilde
  ],
  "SICAK İÇECEKLER": [
    "SEMAVER|325",
    "Nescafe|100",
    "SAHLEP|150",
    "DAMLA SAKIZLI SAHLEP|160",
    "ÇİLEKLİ SAHLEP|160",
    "FINDIKLI SAHLEP|160",
    "SICAK ÇİKOLATA|150",
    "ÇİLEKLİ SICAK ÇİKOLATA|160",
    "MUZLU SICAK ÇİKOLATA|160",
    "BEYAZ ÇİKOLATA|160",
    "CHAİ TEA LATTE|160",
  ],
  "MOCHA’S": [
    "CAFE MOCHA|170",
    "WHİTE MOCHA|170",
    "WHİTE CHOCOLATE MOCHA|170",
    "BERY WHİTE MOCHA|170",
    "ZEBRA MOCHA|170",
  ],
  "FRAPPE": [
    "CARAMEL FRAPPE|220",
    "COCO FRAPPE|220",
    "HAZELNUT FRAPPE|220",
    "MOCHA FRAPPE|220",
    "WHİTE CHOCOLATE FRAPPE|220",
    "CARAMEL FRAPPE|220",                // (aynı isim-fiyat tekrar)
  ],
  "LİMONATALAR": [
    "LİMONATA|90",
    "ÇİLEKLİ LİMONATA|115",
    "ORMAN MEYVELİ LİMONATA|115",
    "MANGOLU LİMONATA|115",
    "ANANASLI LİMONATA|115",
    "ELMALI LİMONATA|115",
    "FRAMBUAZLI LİMONATA|115",
    "BÖĞÜRTLENLİ LİMONATA|115",
    "NANELİ LİMONATA|115",
    "KARPUZLU LİMONATA|115",
    "KAVUNLU LİMONATA|115",
    "NARLI LİMONATA|115",
  ],
  "MİLKSHAKE’S": [
    "ÇİLEKLİ MİLKSHAKE|150",
    "KARAMELLİ MİLKSHAKE|150",
    "ÇİKOLATALI MİLKSHAKE|150",
    "VANİLYALI MİLKSHAKE|150",
    "KAVUNLU MİLKSHAKE|150",
    "ORMAN MEYVELİ MİLKSHAKE|150",
    "HAZELNUT MİLKSHAKE|150",
    "BAL BADEMLİ MİLKSHAKE|150",
    "KARADUTLU MİLKSHAKE|150",
    "ANANASLI MİLKSHAKE|150",
    "MANGOLU MİLKSHAKE|150",
    "ŞEFTALİLİ MİLKSHAKE|150",
    "BÖĞÜRTLENLİ MİLKSHAKE|150",
    "ACIBADEM MİLKSHAKE|150",
    "KİVİLİ MİLKSHAKE|150",
    "NARLI MİLKSHAKE|150",
    "DAMLA SAKIZLI MİLKSHAKE|150",
    "KARPUZLU MİLKSHAKE|150",
    "FRAMBUAZLI MİLKSHAKE|150",
    "HİNDİSTAN CEVİZLİ MİLKSHAKE|150",
    "OREOLU MİLKSHAKE|150",
    "GÖKYÜZÜ MİLKSHAKE|150",
    "KARADUTLU MİLKSHAKE|150",           // tekrar
    "MUZLU MİLKSHAKE|150",
    "ANTEP FISTIKLI MİLKSHAKE|150",
  ],
  "SMOOTHİE": [
    "ORMAN MEYVELİ SMOOTHİE|150",
    "ÇİLEKLİ SMOOTHİE|150",
    "ÇİKOLATALI SMOOTHİE|150",
    "MUZLU SMOOTHİE|150",
    "BÖĞÜRTLENLİ SMOOTHİE|150",
    "KARADUTLU SMOOTHİE|150",
    "MANGOLU SMOOTHİE|150",
    "HAZELNUT SMOOTHİE|150",
    "BÖĞÜRTLENLİ SMOOTHİE|150",          // tekrar
    "ANTEP FISTIKLI SMOOTHİE|150",
  ],
  "FROZEN": [
    "ORMAN MEYVELİ FROZEN|170",
    "ÇİLEKLİ FROZEN|170",
    "ŞEFTALİ FROZEN|170",
    "BÖĞÜRTLEN FROZEN|170",
    "MANGO FROZEN|170",
    "ANANAS FROZEN FROZEN|170",
    "KARPUZ FROZEN|170",
    "NAR FROZEN|170",
  ],
  "COCKTAİL’S": [
    "Berry Hibiscus|170",
    "Cool Lime|170",
    "Orange - Mango|170",
    "BlueBerry|170",
    "BlackBerry|170",
    "Sweet Redbull Mix|250",
    "Fresh Redbull Mix|250",
    "Margarita|250",
    "Mojito|250",
  ],
  "BİTKİ ÇAYLARI": [
    "ADA ÇAYI|140",
    "ELMA-TARÇIN ÇAYI|140",
    "HİBİSKUS ÇAYI|140",
    "IHLAMUR|140",
    "KIŞ ÇAYI|140",
    "MELİSA ÇAYI|140",
    "NANE LİMON|140",
    "YEŞİL ÇAY|140",
    "YASEMİNLİ YEŞİL ÇAY|140",
    "BÖĞÜRTLEN ÇAYI|140",
    "KUŞBURNU ÇAYI|140",
    "MAVİ KELEBEK ÇAYI|140",
  ],
  "KUTU İÇECEKLER": [
    "PEPSİ|80",
    "YEDİGÜN|80",
    "MEYVE SUYU|80",
    "İCE TEA ŞEFTALİ|80",
    "İCE TEA MANGO|80",
    "İCE TEA KARPUZ NANE|80",
    "İCE TEA MANGO ANANAS|80",
    "İCE TEA KAVUN ÇİLEK|80",
    "İCE TEA FRAMBUAZ BÖĞÜRTLEN|80",
    "REDBULL CLASSİC|120",
    "REDBULL SUGAR FREE|120",
    "REDBULL WHİTE EDİTİON|120",
    "REDBULL BLUE EDİTİON|120",
    "REDBULL PİNK EDİTİON|120",
    "REDBULL PEACH EDİTİON|120",
    "REDBULL SUMMER EDİTİON|120",
    "REDBULL YELLOW EDİTİON|120",
    "REDBULL PİNK EDİTİON|120",          // tekrar
    "SADE SODA|50",
    "LİMONLU SODA|50",
    "CHURCİLL|80",
    "SÜTAŞ AYRAN|70",
    "SU|15",
  ],
  "TOSTLAR": [
    "KAŞARLI TOST|150",
    "KARIŞIK TOST|150",
    "GÖZLEME|150",
    "PATATES KIZARTMASI|125",
  ],
  "PASTA VE TATLILAR": [
    "MAGNOLİA|200",
    "SPONFULL|200",
    "BROWNİE|200",
    "SAN SEBASTİAN CHEESCAKE|250",
    "ANTEP FISTIKLI SAN SEBASTİAN|225",
    "DONDURMALI WAFFLE|275",
    "SUFFLE|175",
    "ANTEP KATMERİ|150",
    "MOZAİK|150",
    "RED VELVET|150",
    "LATTE MONO|150",
    "ORMAN MEYVELİ PASTA|150",
    "N’FISTIKLIM|150",
    "FISTIK DÜNYASI|150",
    "TİRAMİSU|150",
    "N’AŞKIM|150",
    "HAMSİ KÖY SÜTLAÇI|150",
  ],
};

// Yardımcılar
const norm = (s) => String(s).replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim();

// Kategori → sıra index’i
const categoryOrderMap = new Map(CATEGORY_ORDER.map((c, i) => [c, i]));

// Kategori içi ürün → sıra index’i
const itemOrderMap = {};
for (const [cat, arr] of Object.entries(ORDER_ITEMS)) {
  itemOrderMap[cat] = new Map(arr.map((k, i) => [k, i]));
}

// ✅ Tüm ürünleri getir (kategori + kategori içi sabit sıraya göre)
router.get("/", async (req, res) => {
  try {
    const connection = await getTenantDb(req);
    const Product = ProductModelFactory(connection);

    // hepsini çek, RAM’de sıralıyoruz (şema değiştirmeden tam kontrol)
    const products = await Product.find().lean();

    products.sort((a, b) => {
      // 1) Kategori sırası
      const aCat = norm(a.category || "");
      const bCat = norm(b.category || "");
      const ao = categoryOrderMap.get(aCat) ?? 9999;
      const bo = categoryOrderMap.get(bCat) ?? 9999;
      if (ao !== bo) return ao - bo;

      // 2) Kategori içi ürün sırası (isim|fiyat)
      const aKey = `${norm(a.name)}|${Number(a.price)}`;
      const bKey = `${norm(b.name)}|${Number(b.price)}`;
      const aIo = itemOrderMap[aCat]?.get(aKey) ?? 9999;
      const bIo = itemOrderMap[bCat]?.get(bKey) ?? 9999;
      if (aIo !== bIo) return aIo - bIo;

      // 3) Eşitse son çare: TR + sayısal isim sırası (stabilite için)
      return norm(a.name).localeCompare(norm(b.name), "tr", { numeric: true });
    });

    res.json(products);
  } catch (err) {
    console.error("Ürün listeleme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// ✅ Yeni ürün ekle (varsayılan olarak listenin sonuna düşer)
router.post("/", async (req, res) => {
  try {
    const { name, price, category, image } = req.body || {};
    if (!name || price === undefined) {
      return res.status(400).json({ message: "name ve price zorunludur" });
    }
    const connection = await getTenantDb(req);
    const Product = ProductModelFactory(connection);

    const newProduct = await Product.create({
      name: String(name).trim(),
      price: Number(price),
      category: category || "Genel",
      image: image || "",
    });

    res.status(201).json(newProduct);
  } catch (err) {
    console.error("Ürün ekleme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// ✅ Ürün sil
router.delete("/:id", async (req, res) => {
  try {
    const connection = await getTenantDb(req);
    const Product = ProductModelFactory(connection);
    await Product.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error("Ürün silme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// ✅ Ürün güncelle
router.put("/:id", async (req, res) => {
  try {
    const connection = await getTenantDb(req);
    const Product = ProductModelFactory(connection);

    const updateData = {};
    if (req.body.name !== undefined) updateData.name = String(req.body.name).trim();
    if (req.body.price !== undefined) updateData.price = Number(req.body.price);
    if (req.body.category !== undefined) updateData.category = req.body.category || "Genel";
    if (req.body.image !== undefined) updateData.image = req.body.image;

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Ürün bulunamadı" });
    res.json(updated);
  } catch (err) {
    console.error("Ürün güncelleme hatası:", err);
    res.status(500).json({ message: "Güncelleme hatası" });
  }
});

module.exports = router;
