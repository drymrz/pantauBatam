// Vercel Edge Function untuk proxy HLS stream
export default async function handler(req, res) {
  const { camera } = req.query;

  if (!camera) {
    return res.status(400).json({ error: "Camera parameter required" });
  }

  // Construct stream URL dinamis berdasarkan camera name
  const streamUrl = `http://103.248.199.102/camera/${camera}.m3u8`;

  try {
    console.log(`Proxying stream for camera: ${camera} from ${streamUrl}`);

    const response = await fetch(streamUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Vercel-Proxy/1.0)",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.text();

    // Rewrite M3U8 content to proxy .ts segments through our Edge Function
    const modifiedData = data.replace(
      /http:\/\/103\.248\.199\.102\/camera\/([^.\s]+\.ts)/g,
      (match, filename) => {
        return `https://${req.headers.host}/api/segment/${filename}`;
      }
    );

    // Set appropriate headers for HLS
    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    return res.status(200).send(modifiedData);
  } catch (error) {
    console.error(`Stream proxy error for camera ${camera}:`, error);
    return res.status(500).json({
      error: "Stream unavailable",
      details: error.message,
      camera: camera,
    });
  }
}
