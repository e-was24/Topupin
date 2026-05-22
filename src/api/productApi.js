import localProducts from "../data/digiflazzProduct.json";

export const fetchProducts = async () => {
  try {
    return localProducts;
  } catch (error) {
    console.error("Error loading local products:", error);
    throw error;
  }
};
