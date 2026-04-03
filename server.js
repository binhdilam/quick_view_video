const express = require("express");
const https = require("https");
const path = require("path");

const app = express();
const PORT = 3001;

// route trang chủ (đặt TRƯỚC)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index2.html"));
});

// serve file tĩnh (đặt SAU)
app.use(express.static(__dirname));

// API download TikTok
app.get("/download", (req, res) => {
  const video = req.query.url;

  if (!video) {
    return res.send("Missing URL");
  }

  let videoId = "";

  if (video.includes("/video/")) {
    videoId = video.split("/video/")[1].split("?")[0];
  } else {
    return res.send("Invalid URL");
  }

  const api = `https://tikwm.com/api/?url=${encodeURIComponent(video)}&_=${Date.now()}`;

  https.get(api, {
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  }, (apiRes) => {

    let data = "";

    apiRes.on("data", chunk => data += chunk);

    apiRes.on("end", () => {
      try {
        const json = JSON.parse(data);

        if (!json.data || !json.data.play) {
          return res.send("ERROR getting video");
        }

        const videoUrl = json.data.play;

        console.log("Download:", video);

        https.get(videoUrl, (videoRes) => {
          // ép download, không auto mở
          res.setHeader("Content-Type", "application/octet-stream");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${videoId}.mp4"`
          );
          res.setHeader("Content-Transfer-Encoding", "binary");
          res.setHeader("Cache-Control", "no-store");

          videoRes.pipe(res);
        }).on("error", () => {
          res.send("ERROR tải video");
        });

      } catch (err) {
        res.send("ERROR parsing");
      }
    });

  }).on("error", () => {
    res.send("API ERROR");
  });
});

// chạy server
app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại: http://localhost:${PORT}`);
});