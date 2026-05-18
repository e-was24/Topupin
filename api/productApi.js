import localProducts from "./digiflazzProduct.json";

export const fetchProducts = async () => {
  try {
    // Memberikan delay palsu sangat kecil jika diperlukan untuk loading state, 
    // namun sekarang langsung dijawab 0ms menggunakan database lokal.
    return localProducts;
  } catch (error) {
    console.error("Error loading local products:", error);
    throw error;
  }
};
