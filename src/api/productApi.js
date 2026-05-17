import CryptoJS from "crypto-js";

const DIGIFLAZZ_USERNAME = import.meta.env.VITE_DIGIFLAZZ_USERNAME;
const DIGIFLAZZ_API_KEY = import.meta.env.VITE_DIGIFLAZZ_API_KEY;

export const fetchProducts = async () => {
  try {
    const stringToSign = DIGIFLAZZ_USERNAME + DIGIFLAZZ_API_KEY + "pricelist";
    const sign = CryptoJS.MD5(stringToSign).toString();

    const response = await fetch("/api/digiflazz/v1/price-list", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        cmd: "prepaid",
        username: DIGIFLAZZ_USERNAME,
        sign: sign,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      const errorMsg = (result && result.data && result.data.message) 
        ? result.data.message 
        : `HTTP error! status: ${response.status}`;
      throw new Error(errorMsg);
    }

    if (result.data) {
      if (typeof result.data === 'object' && !Array.isArray(result.data) && result.data.message) {
        throw new Error(result.data.message);
      }
      return result.data;
    } else {
      throw new Error(
        result.message || "Invalid response format from Digiflazz",
      );
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};
