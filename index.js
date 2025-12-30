const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const axios = require("axios");

const manifest = {
    id: "community.railway.source",
    name: "Railway Video Source",
    version: "1.0.3",
    description: "Videos from a.asd.homes",
    resources: ["stream"],
    types: ["movie", "series"],
    idPrefixes: ["tt"],
    catalogs: [] // THIS FIXES THE CRASH
};

const builder = new addonBuilder(manifest);

builder.defineStreamHandler(async (args) => {
    try {
        const meta = await axios.get(`https://v3-cinemeta.strem.io/meta/${args.type}/${args.id.split(':')[0]}.json`);
        const movieName = meta.data.meta.name.toLowerCase();
        const firstWord = movieName.split(" ")[0];

        const siteUrl = "https://a.asd.homes/main4/";
        const response = await axios.get(siteUrl, { timeout: 4000 });
        const html = response.data;

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

// Railway specific port binding
const port = process.env.PORT || 7000;
serveHTTP(builder.getInterface(), { port, host: "0.0.0.0" });
