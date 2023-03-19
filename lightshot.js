import { JSDOM } from "jsdom";
import axios from "axios";
import { addLightshot, checkLightshotUnique } from "./database.js";
import { createHash } from "crypto";

// Get a random Lightshot URL (validated and unique)
export async function getRandomLightshot() {
    let checks = 1;

    // Generate a random URL, if invalid, repeat until valid and unique
    let lightshot = generateUrl();
    while (!(await checkLightshot(lightshot))) {
        lightshot = generateUrl();
        checks++;
    }

    // Add the Lightshot to the database
    await addLightshot(lightshot.id, lightshot.hash, checks);

    return { ...lightshot, checks };
}

// Generate a random Lightshot URL (potentially invalid)
function generateUrl() {
    const base = "https://prnt.sc/";

    const possible = "abcdefghijklmnopqrstuvwxyz0123456789";
    const id = new Array(6).fill().map(() => possible.charAt(Math.floor(Math.random() * possible.length))).join("");

    const url = base + id;

    return { url, id };
}

// Check if a Lightshot URL is valid
async function checkLightshot(lightshot) {
    // Get the image element from the page
    let dom = await JSDOM.fromURL(lightshot.url);
    let img = dom.window.document.getElementById("screenshot-image");

    if (!img)
        return false;

    let src = img.getAttribute("src");

    try {
        // Query the image URL to see if it's valid
        new URL(src);

        let resp = await axios.get(src, { responseType: "arraybuffer" });
        if (resp.status !== 200)
            return false;

        // Check if the image is unique
        const hash = createHash('sha256');
        hash.update(resp.data);
        lightshot.hash = hash.digest('hex');

        return await checkLightshotUnique(lightshot.hash);
    } catch (e) {
        return false;
    }
}