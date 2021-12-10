import express from 'express'
import 'dotenv/config'
//if (process.env.NODE_ENV !== 'production')
 //dotenv.config();
import discord from "discord.js"
import ytdl from "ytdl-core"
import path from "path"

const { url, channelId, token } = process.env
const client = new discord.Client();
let channel,
    broadcast = null,
    stream = ytdl(url),
    interval = null;

if (!token) {
    console.error("token invalido");
} else if (!channelId || !Number(channelId)) {
    console.log("id do canal inválido");
} else if (!ytdl.validateURL(url)) {
    console.log("link do vídeo inválido.");
}

client.on('ready', async() => {

    let status = [
        `❤️Rafaella Ballerini on Youtube!❤️`,
        `💜Rafaella Ballerini on Twitch!💜`,
        `🧡Rafaella Ballerini on Instagram!🧡`,
        `🎧Coding with Lo-fi!🎧`,
        `⭐Stream Lo-fi!⭐`,
        `👨‍💻Contact Tauz for questions about me😺`
    ];
    let i = 0;

    setInterval(() => client.user.setActivity(`${status[i++ %
    status.length]}`, {
        type: 'WATCHING'
    }), 5000);

    channel = client.channels.cache.get(channelId) || await client.channels.fetch(channelId);
    if (!channel) {
        console.error("canal não existe");

    } else if (channel.type !== "voice") {
        console.error("id não é de um canal de voz");

    }
    broadcast = client.voice.createBroadcast();
    stream.on('error', console.error);
    broadcast.play(stream);
    if (!interval) {
        interval = setInterval(async function() {
            try {
                channel.leave()
                stream = ytdl(url)
                broadcast = client.voice.createBroadcast();
                stream.on('error', console.error);
                broadcast.play(stream);

                const connection = await channel.join();
                connection.play(broadcast);
                console.log("broadcast conectado depois do maior intervalo")
            } catch (e) { return channel.leave() }
        }, 1200000)
    }
    try {
        const connection = await channel.join();
        connection.play(broadcast);
    } catch (error) {
        console.error(error);
        channel.leave()
    }
});

client.on('raw', async dados => {
    if (!dados.d) return
    if (!dados.d.user_id) return;
    if (dados.d.user_id !== client.user.id) return;
    if (dados.t !== 'VOICE_STATE_UPDATE') return;
    
    console.log(dados)
    if (dados.d.channel_id === null) {
       console.log("desconectado")
        if (!channel) return;
        try {
            stream = ytdl(url);
            broadcast = await client.voice.createBroadcast();
            stream.on('error', console.error);
            broadcast.play(stream);

            const connection = await channel.join();
            connection.play(broadcast);
            console.log("broadcast conectado pois foi forçado a parar")
        } catch (error) {
            console.error(error);
            channel.leave()
        }
        return
    }
});

client.login(token);
const app = express();
app.get("/", (req, res)=> {res.sendFile("index.html",{root:"."})
});
app.listen(3333);