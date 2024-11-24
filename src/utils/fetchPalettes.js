import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

export const fetchPublicPalettes = async () => {
  try {
    const usersCollection = collection(db, "users");
    const usersSnapshot = await getDocs(usersCollection);

    let publicPalettes = [];

    // Iterate through each user
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const createdPalettesCollection = collection(db, "users", userId, "createdPalettes");

      // Query palettes marked as public
      const publicPalettesQuery = query(
        createdPalettesCollection,
        where("visibility", "==", "public")
      );
      const palettesSnapshot = await getDocs(publicPalettesQuery);

      // Add public palettes to the result array
      palettesSnapshot.forEach((paletteDoc) => {
        publicPalettes.push({
          id: paletteDoc.id,
          ...paletteDoc.data(),
        });
      });
    }

    return publicPalettes;
  } catch (error) {
    console.error("Error fetching public palettes:", error);
    throw new Error("Failed to fetch public palettes.");
  }
};
