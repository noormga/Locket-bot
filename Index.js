const Discord = require("discord.js")
const fetch = require("node-fetch")
const client = new Discord.Client()
const puppeteer = require("puppeteer")
const fs = require('fs')
const downloader = require('nodejs-file-downloader')

client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}`)
    client.user.setPresence({
        status: "online",  
        activity: {
            name: ".help",  // The message shown
            type: "PLAYING" // PLAYING, WATCHING, LISTENING, STREAMING,
        }
    });
})

client.on("message", async msg => {
    if (msg.content == ".ping"){
        msg.channel.send("pong")
    }
    else if (msg.content == ".help"){
        msg.channel.send("`.locket {text}` *upload image*")
    }
    else if (msg.content.startsWith('.locket')){
        let fullcmd = msg.content.split(' ')
        fullcmd = fullcmd.slice(1)
        const text = fullcmd.join(' ')
        if (text == undefined && text.trim() == ''){
            console.error('text is undefined')
            return
        }
        if (msg.attachments.size == 0)return

        const download = new downloader({
            url: msg.attachments.first().url.replace('https', 'http'),
            directory: "."
        })
        try {
            await download.download()
            console.log('download finished')
        } catch (error) {
            console.error(error)
        }

        const response = await scrapeProduct(msg.attachments.first().name, text)
        msg.channel.send(response)
        fs.unlink(msg.attachments.first().name, () => console.log('file deleted'))
    }
})

async function scrapeProduct(image, text){
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto('https://makesweet.com/my/heart-locket#')

    const selector = 'tbody > tr > td > input[type=file]'
    await page.waitForSelector('input[type=file]')
    const fileInput  = await page.$(selector)
    await fileInput.uploadFile(image)
    //await page.click(selector)
    await page.waitFor(2000)
    await page.click('#wb-add > a')
    await page.click('#add_text')
    await page.waitForSelector('#scroller > div.textbar.zapped > textarea')
    await page.type('#scroller > div.textbar.zapped > textarea', text)
    await page.click('#wb-animate > a')
    await page.click('#wb-make-gif > a')
    //await page.waitFor(60000)
    await page.waitForSelector('#wb-upload > a', {timeout: 0,visible: true})

    //fs.writeFile("test.gif")
    //await viewSource.buffer()
    await Promise.all([
        page.click('#wb-upload > a'),
        page.waitForNavigation({waitUntil: 'domcontentloaded'})
    ])
    const downloadgif = await page.$$eval('div.photo-canvas > a', giflink => giflink.map(gifurl => `https://makesweet.com${gifurl.getAttribute('href')}`))

    browser.close()
    return downloadgif[0]

}
  
    client.on('message', (message) => {
    if (message.author.bot) return;
  
    const args = message.content.split(/ +/);
    const mentionedUsers = message.mentions.users;
  
    const isBotMentioned = mentionedUsers.size
      ? mentionedUsers.first().id === client.user.id
      : false;
  });

client.login(TOKEN)
