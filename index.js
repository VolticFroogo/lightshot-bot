import * as dotenv from 'dotenv';
dotenv.config();

import { Client, GatewayIntentBits } from 'discord.js';
import { getRandomLightshot } from "./lightshot.js";

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async (msg) => {
    if (msg.author.bot)
        return;

    if (msg.channelId !== process.env.DISCORD_CHANNEL)
        return;

    let lightshot = await getRandomLightshot();
    await msg.reply(`Checked ${lightshot.checks} URLs, found: ${lightshot.url}`);
});

client.login(process.env.DISCORD_TOKEN);