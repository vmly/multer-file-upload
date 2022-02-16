const fs = require("fs");
const http = require("http");
const busboy = require("busboy");

http.createServer((req, res) => {

    if (req.method === "POST") {
        const bb = busboy({ headers: req.headers });
        bb.on("file", (name, file, info) => {
            const { filename, encoding, mimeType } = info;
            let chunks = [];
            let merged = Buffer.from("");
            let finalData,
                decodedData = Buffer.from("");
            file.on("data", (data) => {
                chunks.push(data);
            }).on("close", () => {
                for (chunk of chunks) {
                    merged = Buffer.concat([merged, chunk]);
                }
                finalData = JSON.parse(merged.toString());
                let corrected;
                for (let part of finalData) {
                    corrected = part.split(",")[1];
                    partBuffer = Buffer.from(corrected, "base64");
                    decodedData = Buffer.concat([decodedData, partBuffer]);
                }
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
