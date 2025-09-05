// Vercel Edge Function untuk proxy HLS segment files (.ts)
export default async function handler(req, res) {
  const { filename } = req.query;

  if (!filename) {
    return res.status(400).json({ error: "Filename parameter required" });
  }

  // Validate filename to prevent path traversal
  if (!filename.match(/^[A-Za-z0-9_-]+\.ts$/)) {
    return res.status(400).json({ error: "Invalid filename format" });
  }

  // Construct segment URL
  const segmentUrl = `http://103.248.199.102/camera/${filename}`;

  try {
    console.log(`Proxying segment: ${filename} from ${segmentUrl}`);

    const response = await fetch(segmentUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Vercel-Proxy/1.0)",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get the video data as buffer
    const buffer = await response.arrayBuffer();

    // Set appropriate headers for TS segments
    res.setHeader("Content-Type", "video/mp2t");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Cache-Control", "public, max-age=60"); // Cache segments for 1 minute

    return res.status(200).send(Buffer.from(buffer));
  } catch (error) {
    console.error(`Segment proxy error for ${filename}:`, error);
    return res.status(500).json({
      error: "Segment unavailable",
      details: error.message,
      filename: filename,
    });
  }
}
