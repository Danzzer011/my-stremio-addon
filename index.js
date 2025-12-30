const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const axios = require("axios");
const cheerio = require("cheerio");

const manifest = {
    id: "community.mysource.railway",
    name: "Railway Video Source",
    version: "1.0.1",
    description: "Plays videos from a.asd.homes",
    resources: ["stream"],
    types: ["movie", "series"],
    idPrefixes: ["tt"]
};

const builder = new addonBuilder(manifest);

builder.defineStreamHandler(async (args) => {
    try {
        // Get movie name from Stremio
        const meta = await axios.get(`https://v3-cinemeta.strem.io/meta/${args.type}/${args.id.split(':')[0]}.json`);
        const movieName = meta.data.meta.name.toLowerCase();

        const siteUrl = "https://a.asd.homes/main4/";
        const response = await axios.get(siteUrl, { timeout: 5000 });
        const $ = cheerio.load(response.data);

        const streams = [];
        const firstWord = movieName.split(" ")[0];

        // Properly find all links on the page
        $("a").each((i, el) => {
            const href = $(el).attr("href");
            if (href && href.toLowerCase().includes(firstWord)) {
                if (href.endsWith(".mp4") || href.endsWith(".mkv")) {
                    streams.push({
                        name: "My Source",
                        title: href,
                        url: siteUrl + href
                    });
                }
            }
        });

        return { streams };
    } catch (e) {
        console.error("Error fetching streams:", e.message);
        return { streams: [] };
    }
});

// FIX: Railway assigns a dynamic port via process.env.PORT
const port = process.env.PORT || 7000;
serveHTTP(builder.getInterface(), { port });
