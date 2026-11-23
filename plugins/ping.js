const config = require('../config');

/* Small caps helper */
const SC = {
    a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ',
    n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ', s: 's', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ'
};
const sc = (str) => String(str).toLowerCase().replace(/[a-z]/g, (ch) => SC[ch]);

// 🟢 Dynamic Title Generator (Bot Name eka config eken gannawa)
const getTitle = (cmd) => `${sc(config.BOT_NAME)}  ${sc(cmd)}`;

function buildPing(latency, prefix) {
    return [
        '╭─〔 *ʙᴏᴛ ꜱᴘᴇᴇᴅ* 〕─┈⊷',
        `│ 🏓 *ᴘɪɴɢ:* ${latency} ᴍꜱ`,
        `│ ⚡ *ꜱᴛᴀᴛᴜꜱ:* ꜰᴀꜱᴛ & ʀᴇᴀᴅʏ`,
        `│ 🔣 *ᴘʀᴇꜰɪx:* ${prefix}`,
        '╰─────────────┈⊷'
    ].join('\n');
}

function forwardContext() {
    const contextInfo = { forwardingScore: 999, isForwarded: true };
    if (config.NEWSLETTER_ID) {
        contextInfo.forwardedNewsletterMessageInfo = {
            newsletterJid: config.NEWSLETTER_ID,
            newsletterName: config.BOT_NAME,
            serverMessageId: 1
        };
    }
    return contextInfo;
}

module.exports = {
    name: 'ping',
    description: 'Check bot speed',
    category: 'general',
    alias: ['speed', 'latency', 'p'],

    async execute(sock, msg, args, text, ctx = {}) {
        const jid = msg.key.remoteJid;
        const prefix = ctx.prefix || config.PREFIX || '.';
        const timestamp = msg.messageTimestamp ? msg.messageTimestamp * 1000 : Date.now();
        const latency = Math.max(0, Date.now() - timestamp);

        try { await sock.sendMessage(jid, { react: { text: '🏓', key: msg.key } }); } catch (e) {}

        const infoText = buildPing(latency, prefix);
        
        // 🟢 Title eka methana enne dynamic widihata
        const textCaption = `┌─ム ${getTitle('ping')}\n\n${infoText}\n\n> ${config.BOT_FOOTER}`;
        const contextInfo = forwardContext();

       
        try {
            await sock.sendMessage(jid, { text: textCaption, contextInfo });
        } catch (e) {}
    }
};