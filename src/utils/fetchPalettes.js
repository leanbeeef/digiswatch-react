import { collectionGroup, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

export const fetchPublicPalettes = async () => {
  try {
    // Only ask Firestore for public palettes to avoid rule failures on private docs
    const createdPalettesGroup = collectionGroup(db, "createdPalettes");
    const publicQuery = query(createdPalettesGroup, where("visibility", "==", "public"));
    const snapshot = await getDocs(publicQuery);

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
