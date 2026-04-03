const https = require("https");
const fs = require("fs");
const path = require("path");

const video = process.argv[2];

let videoId = "";

if (video.includes("/video/")) {
  videoId = video.split("/video/")[1].split("?")[0];
} else {
  console.log("ERROR");
  process.exit();
}

// API
const api = `https://tikwm.com/api/?url=${encodeURIComponent(video)}&_=${Date.now()}`;

https.get(api, {
  headers: {
    "User-Agent": "Mozilla/5.0"
  }
}, (res) => {

  let data = "";

  res.on("data", chunk => data += chunk);

  res.on("end", () => {
    try {
      const json = JSON.parse(data);

      if (!json.data || !json.data.play) {
        console.log("ERROR");
        return;
      }

      const videoUrl = json.data.play;

      // tạo folder
      const folderPath = path.join(__dirname, "Video_downloader");
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
      }

     // tạo file path không bị trùng
let fileName = `${videoId}.mp4`;
let filePath = path.join(folderPath, fileName);

let count = 1;

while (fs.existsSync(filePath)) {
  fileName = `${videoId}_${count}.mp4`;
  filePath = path.join(folderPath, fileName);
  count++;
}

const file = fs.createWriteStream(filePath);

      https.get(videoUrl, (videoRes) => {
        videoRes.pipe(file);

        file.on("finish", () => {
          file.close();
          console.log(`DONE: downloaded video ${videoId}`);
        });
      });

    } catch (err) {
      console.log("ERROR");
    }
  });
});