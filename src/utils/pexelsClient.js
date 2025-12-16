// Lightweight Pexels client for palette hero images

export const fetchPexelsImage = async (query) => {
  const key = import.meta?.env?.VITE_PEXELS_API_KEY;
  if (!key || !query) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(
        query
      )}&per_page=1`,
      {
        headers: {
          Authorization: key,
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`Pexels error: ${res.status}`);
    const data = await res.json();
    const photo = data?.photos?.[0];
    if (!photo) return null;
    return {
      url:
        photo?.src?.large2x ||
        photo?.src?.large ||
        photo?.src?.medium ||
        null,
      avgColor: photo?.avg_color || null,
      photographer: photo?.photographer || "",
    };
  } catch (err) {
    console.warn("Pexels fetch failed", err?.message || err);
    return null;
  }
};

export default fetchPexelsImage;
