import { JSDOM } from "jsdom";
import axios from "axios";

// Get a random Lightshot URL (validated)
export async function getRandomLightshot() {
    let checks = 1;

    // Generate a random URL, if invalid, repeat until valid
    let url = generateUrl();
    while (!(await checkLightshot(url))) {
        url = generateUrl();
        checks++;
    }

    return {url, checks};
}

// Generate a random Lightshot URL (potentially invalid)
function generateUrl() {
    // Append 6 random characters (lower + num) to the base URL
    let url = "https://prnt.sc/";
    const possible = "abcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < 6; i++)
        url += possible.charAt(Math.floor(Math.random() * possible.length));

    return url;
}

// Check if a Lightshot URL is valid
async function checkLightshot(url) {
    // Get the image element from the page
    let dom = await JSDOM.fromURL(url);
    let img = dom.window.document.getElementById("screenshot-image");

    if (!img)
        return false;

    let src = img.getAttribute("src");

    // Query the image URL to see if it's valid
    try {
        new URL(src);

        let resp = await axios.get(src);
        return resp.status === 200;
    } catch (e) {
        return false;
    }
}