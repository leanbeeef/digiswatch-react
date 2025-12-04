import { collectionGroup, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export const fetchPublicPalettes = async () => {
  try {
    // Use a collection group query so we don't need to list /users (which is blocked by rules)
    const createdPalettesGroup = collectionGroup(db, "createdPalettes");
    const snapshot = await getDocs(createdPalettesGroup);

    const publicPalettes = [];
    snapshot.forEach((paletteDoc) => {
      const data = paletteDoc.data();
      // Treat missing visibility as public; exclude explicit private
      if (data.visibility && data.visibility === "private") return;
      publicPalettes.push({
        id: paletteDoc.id,
        ...data,
      });
    });

    return publicPalettes;
  } catch (error) {
    console.error("Error fetching public palettes:", error);
    throw new Error("Failed to fetch public palettes.");
  }
};
