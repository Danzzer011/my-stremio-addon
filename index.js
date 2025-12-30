const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const axios = require("axios");

const manifest = {
    id: "community.mycustomsource",
    name: "My Video Source",
    version: "1.0.0",
    description: "Plays videos from a.asd.homes",
    resources: ["stream"],
    types: ["movie", "series"],
    idPrefixes: ["tt"]
};

const builder = new addonBuilder(manifest);

builder.defineStreamHandler(async (args) => {
    try {
        const meta = await axios.get(`https://v3-cinemeta.strem.io/meta/${args.type}/${args.id}.json`);
        const movieName = meta.data.meta.name.toLowerCase();

        const siteUrl = "https://a.asd.homes/main4/";
        const response = await axios.get(siteUrl);
        const html = response.data;

        const streams = [];
        // This looks for any link containing words from the movie title
        const words = movieName.split(" ");
        const regex = new RegExp(`href="([^"]*${words[0]}[^"]*)"`, "gi");
        
        let match;
        while ((match = regex.exec(html)) !== null) {
            const fileName = match[1];
            if (fileName.endsWith(".mp4") || fileName.endsWith(".mkv") || fileName.endsWith(".avi")) {
                streams.push({
                    name: "My Source",
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

serveHTTP(builder.getInterface(), { port: process.env.PORT || 7000 });
