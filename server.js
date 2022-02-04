const { randomFillSync } = require("crypto");
const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");

const busboy = require("busboy");

const random = (() => {
  const buf = Buffer.alloc(16);
  return () => randomFillSync(buf).toString("hex");
})();

http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET");
  res.setHeader("Access-Control-Max-Age", 2592000); // 30 days

  if (req.method === "POST") {
    const bb = busboy({ headers: req.headers });
    bb.on("file", (name, file, info) => {
      const { filename, encoding, mimeType } = info;
      console.log(
        `File [${name}]: filename: %j, encoding: %j, mimeType: %j`,
        filename,
        encoding,
        mimeType
      );
      let chunks = [];
      let merged = Buffer.from("");
      let finalData,
        decodedData = Buffer.from("");
      file.on("data", (data) => {
        chunks.push(data);
        console.log(
          `File [${name}] got ${data.length} bytes, chunk : ${chunks.length}`
        );
      }).on("close", () => {
        console.log(`File [${name}] done`);
        for (chunk of chunks) {
          merged = Buffer.concat([merged, chunk]);
        }
        finalData = JSON.parse(merged.toString());
        let corrected;
        for (let part of finalData) {
          corrected = part.split(",")[1];
          partBuffer = Buffer.from(corrected, "base64");
          console.log("Part Buffer : ", partBuffer.length);
          decodedData = Buffer.concat([decodedData, partBuffer]);
        }
        console.log(decodedData.length, decodedData);
        fs.writeFile("./uploads/" + filename, decodedData, (err) => {
          if (err) throw err;
        });
      });
    });
    bb.on("close", () => {
      res.writeHead(200, { Connection: "close" });
      res.end(`That's all folks!`);
    });
    req.pipe(bb);
    return;
  }
  res.writeHead(404);
  res.end();
}).listen(5000, () => {
  console.log("Listening for requests on 5000");
});
