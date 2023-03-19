import * as dotenv from 'dotenv';

dotenv.config();

import { Client, GatewayIntentBits } from 'discord.js';
import { getRandomLightshot } from "./lightshot.js";
import { getTotalStats, initDB } from "./database.js";

const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]});

async function updateStatus() {
    let {lightshots, checks} = getTotalStats();
    await client.user.setPresence({activities: [{name: `${ lightshots }/${ checks } (${ (lightshots / checks * 100).toFixed(1) }%)`}]});
}

client.on("ready", async () => {
    console.log(`Logged in as ${ client.user.tag }!`);
    await updateStatus();
});

client.on("messageCreate", async (msg) => {
    if (msg.author.bot)
        return;

    if (msg.channelId !== process.env.DISCORD_CHANNEL)
        return;

    let lightshot = await getRandomLightshot();
    await msg.reply(`Checked ${ lightshot.checks } URLs, found: ${ lightshot.url }`);
    await updateStatus();
});

(async () => {
    await initDB();
    await client.login(process.env.DISCORD_TOKEN);
})();