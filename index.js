const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const axios = require("axios");

const manifest = {
    id: "community.railway.source",
    name: "My Railway Source",
    version: "1.0.2",
    description: "Videos from a.asd.homes",
    resources: ["stream"],
    types: ["movie", "series"],
    idPrefixes: ["tt"]
};

const builder = new addonBuilder(manifest);

builder.defineStreamHandler(async (args) => {
    try {
        // 1. Get the movie name
        const meta = await axios.get(`https://v3-cinemeta.strem.io/meta/${args.type}/${args.id.split(':')[0]}.json`);
        const movieName = meta.data.meta.name.toLowerCase();
        const firstWord = movieName.split(" ")[0];

        // 2. Search your site
        const siteUrl = "https://a.asd.homes/main4/";
        const response = await axios.get(siteUrl, { timeout: 3000 });
        const html = response.data;

        // 3. Find links (Simplified Regex to prevent crashes)
        const streams = [];
        const regex = new RegExp(`href="([^"]*${firstWord}[^"]*)"`, "gi");
        
        let match;
        while ((match = regex.exec(html)) !== null && streams.length < 5) {
            const fileName = match[1];
            if (fileName.endsWith(".mp4") || fileName.endsWith(".mkv")) {
                streams.push({
                    name: "Railway Link",
                    title: fileName,
                    url: siteUrl + fileName
                });
            }
        }
        return { streams };
    } catch (e) {
        return { streams: [] };
    }
});

// IMPORTANT: Railway requires binding to 0.0.0.0 and using process.env.PORT
const port = process.env.PORT || 7000;
serveHTTP(builder.getInterface(), { port, host: "0.0.0.0" });

console.log(`Addon is live on port ${port}`);
