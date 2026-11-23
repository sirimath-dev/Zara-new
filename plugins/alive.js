const config = require('../config');
const { generateWAMessageFromContent, prepareWAMessageMedia } = require('@whiskeysockets/baileys');

const ALIVE_TITLE = 'ɴᴏᴍᴏ ᴍᴅ </> ᴀʟɪᴠᴇ';

/* Small caps helper */
const SC = {
    a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ',
    n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ', s: 's', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ'
};
const sc = (str) => String(str).toLowerCase().replace(/[a-z]/g, (ch) => SC[ch]);

function fmtUptime(sec) {
    const d = Math.floor(sec / 86400);
    const h = Math.floor((sec % 86400) / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    const parts = [];
    if (d) parts.push(`${d}ᴅ`);
    parts.push(`${String(h).padStart(2, '0')}ʜ`);
    parts.push(`${String(m).padStart(2, '0')}ᴍ`);
    parts.push(`${String(s).padStart(2, '0')}s`);
    return parts.join(' ');
}

function buildAlive(user, prefix) {
    const ram = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
    return [
        '╭─〔 *ʙᴏᴛ ꜱᴛᴀᴛᴜꜱ* 〕─┈⊷',
        `│ 👋 *ʜɪ:* ${user}`,
        `│ ⚡ *ʙᴏᴛ:* ${config.BOT_NAME}`,
        `│ 👑 *ᴏᴡɴᴇʀ:* +${config.OWNER_NUMBER}`,
        `│ 🔣 *ᴘʀᴇꜰɪx:* ${prefix}`,
        `│ 💻 *ʀᴀᴍ:* ${ram} ᴍʙ`,
        `│ ⏱️ *ᴜᴘᴛɪᴍᴇ:* ${fmtUptime(process.uptime())}`,
        `│ ✅ *ꜱᴛᴀᴛᴜꜱ:* ᴀᴄᴛɪᴠᴇ & ʀᴇᴀᴅʏ`,
        '╰─────────────┈⊷'
    ].join('\n');
}

/* Forward context (Newsletter eken awa wage) */
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

/* Personal accounts walata interactive message render wenna me node eka ona (menu.js eken) */
const BIZ_NODE = {
    tag: 'biz',
    attrs: {},
    content: [{
        tag: 'interactive',
        attrs: { type: 'native_flow', v: '1' },
        content: [{ tag: 'native_flow', attrs: { v: '9', name: 'mixed' } }]
    }]
};

/* ------------------------------------------------------------------ */
/*  Plugin                                                             */
/* ------------------------------------------------------------------ */
module.exports = {
    name: 'alive',
    description: 'Check bot status',
    category: 'general',
    alias: ['status', 'online', 'bot'],

    async execute(sock, msg, args, text, ctx = {}) {
        const jid = msg.key.remoteJid;
        const prefix = ctx.prefix || config.PREFIX || '.';
        const user = msg.pushName || (msg.key.participant || jid).split('@')[0] || 'User';
        const ownerNum = String(config.OWNER_NUMBER).replace(/\D/g, '');

        try { await sock.sendMessage(jid, { react: { text: '⚡', key: msg.key } }); } catch (e) {}

        const infoText = buildAlive(user, prefix);
        const contextInfo = forwardContext();

        try {
            // 1. Media eka prepare karanawa (menu.js eke wage)
            const media = await prepareWAMessageMedia(
                { image: { url: config.RCD_IMAGE_PATH } },
                { upload: sock.waUploadToServer }
            );

            // 2. Contact Owner Button eka hadanawa (wa.me link eken chat eka open wenawa)
            const buttons = [{
                name: 'cta_url',
                buttonParamsJson: JSON.stringify({
                    display_text: '🐉 ᴏᴡɴᴇʀ',
                    url: `https://wa.me/${ownerNum}`,
                    merchant_url: `https://wa.me/${ownerNum}`
                })
            }];

            // 3. Interactive Message eka construct karanawa
            const content = generateWAMessageFromContent(
                jid,
                {
                    viewOnceMessage: {
                        message: {
                            messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                            interactiveMessage: {
                                header: {
                                    title: ALIVE_TITLE,
                                    hasMediaAttachment: true,
                                    imageMessage: media.imageMessage
                                },
                                body: { text: infoText },
                                footer: { text: config.BOT_FOOTER || '© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɴᴏᴍᴏ ᴍɪɴɪ' },
                                nativeFlowMessage: { buttons }
                            }
                        }
                    }
                },
                { userJid: sock.user.id }
            );

            // 4. Send via Relay Message
            await sock.relayMessage(jid, content.message, {
                messageId: content.key.id,
                additionalNodes: [BIZ_NODE]
            });

        } catch (err) {
            console.error('Interactive alive failed, sending fallback:', err.message);
            
            // Fallback: Interactive fail unoth normal text + vCard yawanawa
            const caption = `┌─ム ${ALIVE_TITLE}\n\n${infoText}\n\n> ${config.BOT_FOOTER}`;
            try {
                await sock.sendMessage(jid, { image: { url: config.RCD_IMAGE_PATH }, caption, contextInfo }, { quoted: msg });
            } catch (e) {
                await sock.sendMessage(jid, { text: caption, contextInfo }, { quoted: msg });
            }

            // Fallback VCard
            const vcard = 'BEGIN:VCARD\n'
                + 'VERSION:3.0\n'
                + `FN:${config.BOT_NAME} Owner\n`
                + `ORG:${config.BOT_NAME};\n`
                + `TEL;type=CELL;type=VOICE;waid=${ownerNum}:+${ownerNum}\n`
                + 'END:VCARD';
            await sock.sendMessage(jid, { contacts: { displayName: `${config.BOT_NAME} Owner`, contacts: [{ vcard }] } }, { quoted: msg });
        }
    }
};
