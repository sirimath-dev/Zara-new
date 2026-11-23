const fs = require('fs');
const path = require('path');
const { generateWAMessageFromContent, prepareWAMessageMedia } = require('@whiskeysockets/baileys');
const config = require('../config');

const MENU_TITLE = 'ɴᴏᴍᴏ ᴍᴅ </> ᴍᴜʟᴛɪᴅᴇᴠɪᴄᴇ';

/* ------------------------------------------------------------------ */
/*  MENU CATEGORIES (4 k witarai) - number eka = reply karana number    */
/* ------------------------------------------------------------------ */
const MAIN = [
    { key: 'general', title: 'ɢᴇɴᴇʀᴀʟ', emoji: '⚙️' },
    { key: 'download', title: 'ᴅᴏᴡɴʟᴏᴀᴅ', emoji: '📥' },
    { key: 'tools', title: 'ᴛᴏᴏʟs', emoji: '🛠️' },
    { key: 'group', title: 'ɢʀᴏᴜᴘ', emoji: '👥' }
];

/* ------------------------------------------------------------------ */
/*  COMMAND CATALOG                                                    */
/*  [name, description, [aliases]]                                     */
/*  `key` eka kohe hari thibunath, passe MERGE eken main 4 ekata yanawa */
/*  plugins/ eke same `name` ekak thiyenawa nam "ready",               */
/*  nathnam menu eke ⏳ (coming soon) kiyala pennanawa.                */
/* ------------------------------------------------------------------ */
const CATALOG = [
    { key: 'general', cmds: [
        ['alive', 'Check bot status'],
        ['ping', 'Check bot speed'],
        ['uptime', 'Bot running time'],
        ['owner', 'Owner contact'],
        ['guide', 'How to use the bot'],
        ['menu2', 'Alternative menu']
    ] },
    { key: 'downloaders', cmds: [
        ['tiktok', 'TikTok downloader', ['tt']],
        ['ytmp3', 'YouTube to MP3'],
        ['ytmp4', 'YouTube video downloader'],
        ['ig', 'Instagram downloader'],
        ['spotify', 'Spotify downloader'],
        ['song', 'Song downloader'],
        ['xdl', 'Twitter downloader'],
        ['fb', 'Facebook downloader']
    ] },
    { key: 'tools', cmds: [
        ['sticker', 'Create a sticker'],
        ['toimg', 'Sticker to image'],
        ['tourl', 'Upload media to a link'],
        ['ocr', 'Read text from an image'],
        ['tts', 'Text to speech'],
        ['poll', 'Create a poll'],
        ['shazam', 'Identify a song'],
        ['textpro', 'Text logo maker'],
        ['chid', 'Get chat / channel ID']
    ] },
    { key: 'ai', cmds: [
        ['ai', 'Chat with AI'],
        ['ai-search', 'AI web search'],
        ['aiv', 'AI voice search with audio response']
    ] },
    { key: 'fun', cmds: [
        ['blue', ''],
        ['flag', '']
    ] },
    { key: 'new', cmds: [
        ['hide', 'Create WhatsApp read more messages'],
        ['guessgender', 'Guess gender from a name'],
        ['agecalculator', 'Calculate age'],
        ['style', 'Fancy text styles']
    ] },
    { key: 'search', cmds: [
        ['weather', 'Weather info'],
        ['movie', 'Search a movie']
    ] },
    { key: 'anime', cmds: [
        ['waifu', 'Random waifu image'],
        ['neko', 'Random neko image'],
        ['kitsune', 'Random kitsune image'],
        ['husbando', 'Random husbando image']
    ] },
    { key: 'group', cmds: [
        ['tagall', 'Mention all members'],
        ['tagall1', 'Mention all (style 2)'],
        ['tagme', 'Mention yourself'],
        ['couplepp', 'Couple profile pictures'],
        ['group', 'Open / close group'],
        ['ginfo', 'Group info'],
        ['antigst', ''],
        ['link', 'Get group invite link'],
        ['mute', 'Close the group'],
        ['unmute', 'Open the group'],
        ['welcome', 'Welcome message on/off'],
        ['antilink', 'Anti link on/off']
    ] },
    { key: 'status', cmds: [
        ['gstatus', 'Group status']
    ] },
    { key: 'channel', cmds: [
        ['channelid', 'Get channel ID']
    ] },
    { key: 'admin', cmds: [
        ['kick', 'Remove a member'],
        ['add', 'Add a member'],
        ['promote', 'Make admin'],
        ['demote', 'Remove admin'],
        ['warn', 'Warn a member'],
        ['del', 'Delete a message']
    ] },
    { key: 'settings', cmds: [
        ['settings', 'View bot settings'],
        ['setprefix', 'Change the prefix'],
        ['antidelete', 'Anti-delete on/off'],
        ['autoread', 'Auto read messages'],
        ['autoreact', 'Auto react to messages'],
        ['mode', 'Public / private mode']
    ] }
];

// Aluth category okkoma methana idan main 4 ekakata merge wenawa
const MERGE = {
    general: 'general', settings: 'general', channel: 'general',
    download: 'download', downloader: 'download', downloaders: 'download',
    tools: 'tools', media: 'tools', ai: 'tools', fun: 'tools', new: 'tools',
    search: 'tools', movie: 'tools', anime: 'tools',
    group: 'group', admin: 'group', status: 'group'
};

const mainKey = (raw) => MERGE[String(raw || 'general').toLowerCase()] || 'general';

// ".menu 2" / ".menu download" / ".menu downloaders" widiyata category eka hoyanna
function lookupCategory(cats, raw) {
    const a = String(raw || '').toLowerCase();
    if (/^[1-9]\d*$/.test(a)) return cats[Number(a) - 1] || null;
    if (!MERGE[a]) return null;
    return cats.find((c) => c.key === MERGE[a]) || null;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const SC = {
    a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ',
    n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ', s: 's', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ'
};
const sc = (str) => String(str).toLowerCase().replace(/[a-z]/g, (ch) => SC[ch]);

// Menu eka ayeth ayeth call karaddi plugins folder eka scan karanawa
function scanPlugins() {
    const found = new Map(); // name/alias -> plugin
    for (const file of fs.readdirSync(__dirname)) {
        if (!file.endsWith('.js')) continue;
        try {
            const p = require(path.join(__dirname, file));
            if (!p || !p.name || !p.execute) continue;
            const names = [p.name, ...[].concat(p.alias || [], p.aliases || [])];
            for (const n of names) found.set(String(n).toLowerCase(), p);
        } catch (e) {}
    }
    return found;
}

function buildCategories() {
    const found = scanPlugins();
    const cats = MAIN.map((m) => ({ key: m.key, title: m.title, emoji: m.emoji, cmds: [] }));
    const byKey = (k) => cats.find((c) => c.key === k);

    // Catalog eka main 4 ekata danawa
    for (const c of CATALOG) {
        const target = byKey(mainKey(c.key));
        for (const [name, desc, alias] of c.cmds) {
            target.cmds.push({ name, desc: desc || '', alias: alias || [], ready: found.has(name) });
        }
    }

    // Catalog eke nathi, eth plugins/ eke thiyena commands auto add wenawa
    const known = new Set();
    cats.forEach((c) => c.cmds.forEach((cmd) => { known.add(cmd.name); cmd.alias.forEach((a) => known.add(a)); }));

    for (const p of new Set(found.values())) {
        const name = String(p.name).toLowerCase();
        const alias = [].concat(p.alias || [], p.aliases || []).map((a) => String(a).toLowerCase());
        if (name === 'menu' || known.has(name) || alias.some((a) => known.has(a))) continue;
        byKey(mainKey(p.category)).cmds.push({ name, desc: p.description || '', alias, ready: true });
    }

    return cats;
}

const fmtUptime = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${String(h).padStart(2, '0')}ʜ ${String(m).padStart(2, '0')}ᴍ`;
};

function buildInfo(user, prefix, cats) {
    const ram = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
    const all = cats.reduce((n, c) => n + c.cmds.length, 0);
    const ready = cats.reduce((n, c) => n + c.cmds.filter((x) => x.ready).length, 0);
    return [
        '╭─〔 *ꜱʏꜱᴛᴇᴍ ɪɴꜰᴏ* 〕─┈⊷',
        `│ 👋 *ʜɪ:* ${user}`,
        `│ ⚡ *ʙᴏᴛ:* ${config.BOT_NAME}`,
        `│ 👑 *ᴏᴡɴᴇʀ:* +${config.OWNER_NUMBER}`,
        `│ 🔣 *ᴘʀᴇꜰɪx:* ${prefix}`,
        `│ 📦 *ᴄᴏᴍᴍᴀɴᴅꜱ:* ${ready}/${all} ʀᴇᴀᴅʏ`,
        `│ 💻 *ʀᴀᴍ:* ${ram} ᴍʙ`,
        `│ ⏱️ *ᴜᴘᴛɪᴍᴇ:* ${fmtUptime(process.uptime())}`,
        '╰─────────────┈⊷'
    ].join('\n');
}

// Numbered category list (number reply walata)
function buildSummary(cats) {
    const lines = cats.map((c, i) => `├─ム ${i + 1}. ${c.emoji} ${c.title} (${c.cmds.length})`);
    return `┌─ム ᴄᴀᴛᴇɢᴏʀɪᴇs\n│\n${lines.join('\n')}\n│\n│ 💬 ʀᴇᴘʟʏ ᴛʜɪs ᴍᴇssᴀɢᴇ ᴡɪᴛʜ 1 - ${cats.length}\n╰─────────◆────────╯`;
}

// ".menu all" - okkoma commands tree eka
function buildTree(cats, prefix) {
    const lines = ['┌─ム ᴀᴠᴀɪʟᴀʙʟᴇ ᴄᴏᴍᴍᴀɴᴅs', '│'];
    for (const c of cats) {
        lines.push(`├─ム ${c.emoji} ${c.title}`);
        for (const cmd of c.cmds) {
            const al = cmd.alias.length ? ' / ' + cmd.alias.map((a) => prefix + sc(a)).join(' / ') : '';
            lines.push(`│ ᪣ ${prefix}${sc(cmd.name)}${al}${cmd.ready ? '' : ' ⏳'}`);
        }
        lines.push('│');
    }
    lines.push('╰─────────◆────────╯');
    return lines.join('\n');
}

// Select menu eke categories witarai. Row ekak tap kalama ".menu <category>" run wenawa
function buildSections(cats, prefix) {
    return [{
        title: 'ᴄᴀᴛᴇɢᴏʀɪᴇs',
        rows: cats.map((c, i) => ({
            title: `${c.emoji} ${c.title}`.slice(0, 24),
            description: `${i + 1} • ${c.cmds.length} commands`,
            id: `${prefix}menu ${c.key}`
        }))
    }];
}

// Category ekak tap / reply kalama yawana commands list eka
function buildCategoryText(cat, prefix) {
    const lines = [`┌─ム ${cat.emoji} ${cat.title}`, '│'];
    for (const cmd of cat.cmds) {
        const al = cmd.alias.length ? ' / ' + cmd.alias.map((a) => prefix + sc(a)).join(' / ') : '';
        const desc = cmd.ready && cmd.desc ? ` — ${cmd.desc}` : '';
        lines.push(`│ ᪣ ${prefix}${sc(cmd.name)}${al}${cmd.ready ? desc : ' ⏳'}`);
    }
    lines.push('│', `│ ᴛʏᴘᴇ ${prefix}ᴍᴇɴᴜ ᴛᴏ ɢᴏ ʙᴀᴄᴋ`, '╰─────────◆────────╯');
    return lines.join('\n');
}

async function sendCategory(sock, jid, msg, cat, prefix) {
    const caption = `${buildCategoryText(cat, prefix)}\n\n> ${config.BOT_FOOTER}`;
    try {
        await sock.sendMessage(jid, { image: { url: config.RCD_IMAGE_PATH }, caption }, { quoted: msg });
    } catch (e) {
        await sock.sendMessage(jid, { text: caption }, { quoted: msg });
    }
}

/* ------------------------------------------------------------------ */
/*  NUMBER REPLY SYSTEM                                                */
/*  Menu message eka reply karala 1-4 dammama category eka yanawa      */
/* ------------------------------------------------------------------ */
const PENDING_TTL = 10 * 60 * 1000; // minutes 10k witarai reply karanna puluwan
const pending = new Map(); // menu message id -> { jid, prefix, exp }
const hooked = new WeakSet(); // listener eka sock ekakata ekak witarai

function remember(id, jid, prefix) {
    if (!id) return;
    const now = Date.now();
    for (const [k, v] of pending) if (v.exp < now) pending.delete(k);
    pending.set(id, { jid, prefix, exp: now + PENDING_TTL });
}

function hookReplies(sock) {
    if (hooked.has(sock)) return;
    hooked.add(sock);

    sock.ev.on('messages.upsert', async ({ messages }) => {
        for (const m of messages || []) {
            try {
                if (!m.message || !m.key) continue;
                const inner = m.message.ephemeralMessage?.message || m.message;
                const body = (inner.conversation || inner.extendedTextMessage?.text || '').trim();
                if (!/^[1-9]$/.test(body)) continue;

                const quotedId = inner.extendedTextMessage?.contextInfo?.stanzaId;
                const entry = quotedId && pending.get(quotedId);
                if (!entry || entry.exp < Date.now() || entry.jid !== m.key.remoteJid) continue;

                const cat = buildCategories()[Number(body) - 1];
                if (!cat) {
                    await sock.sendMessage(entry.jid, { text: `❌ Invalid number. Reply with 1 - ${MAIN.length}` }, { quoted: m });
                    continue;
                }
                try { await sock.sendMessage(entry.jid, { react: { text: cat.emoji, key: m.key } }); } catch (e) {}
                await sendCategory(sock, entry.jid, m, cat, entry.prefix);
            } catch (e) {
                console.error('Menu number reply error:', e.message);
            }
        }
    });
}

/* ------------------------------------------------------------------ */
/*  Senders                                                            */
/* ------------------------------------------------------------------ */
// Personal accounts walata interactive message render wenna me node eka ona
const BIZ_NODE = {
    tag: 'biz',
    attrs: {},
    content: [{
        tag: 'interactive',
        attrs: { type: 'native_flow', v: '1' },
        content: [{ tag: 'native_flow', attrs: { v: '9', name: 'mixed' } }]
    }]
};

// Image + numbered categories ekama message ekak widiyata (reply karanna ewa)
async function sendTextMenu(sock, jid, msg, head, prefix) {
    const caption = `${head}\n\n> ${config.BOT_FOOTER}`;
    let sent;
    try {
        sent = await sock.sendMessage(jid, { image: { url: config.RCD_IMAGE_PATH }, caption }, { quoted: msg });
    } catch (e) {
        sent = await sock.sendMessage(jid, { text: caption }, { quoted: msg });
    }
    remember(sent?.key?.id, jid, prefix);
}

async function sendInteractiveMenu(sock, jid, info, cats, prefix) {
    const media = await prepareWAMessageMedia(
        { image: { url: config.RCD_IMAGE_PATH } },
        { upload: sock.waUploadToServer }
    );

    const buttons = [{
        name: 'single_select',
        buttonParamsJson: JSON.stringify({ title: '📂 ꜱᴇʟᴇᴄᴛ ᴍᴇɴᴜ', sections: buildSections(cats, prefix) })
    }];

    if (config.GROUP_INVITE_LINK) {
        buttons.push({
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
                display_text: '👥 ᴊᴏɪɴ ɢʀᴏᴜᴘ',
                url: config.GROUP_INVITE_LINK,
                merchant_url: config.GROUP_INVITE_LINK
            })
        });
    }

    const content = generateWAMessageFromContent(
        jid,
        {
            viewOnceMessage: {
                message: {
                    messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                    interactiveMessage: {
                        header: {
                            title: MENU_TITLE,
                            hasMediaAttachment: true,
                            imageMessage: media.imageMessage
                        },
                        body: { text: `${info}\n\n${buildSummary(cats)}` },
                        footer: { text: config.BOT_FOOTER },
                        nativeFlowMessage: { buttons }
                    }
                }
            }
        },
        { userJid: sock.user.id }
    );

    await sock.relayMessage(jid, content.message, {
        messageId: content.key.id,
        additionalNodes: [BIZ_NODE]
    });

    remember(content.key.id, jid, prefix);
}

/* ------------------------------------------------------------------ */
/*  Plugin                                                             */
/* ------------------------------------------------------------------ */
module.exports = {
    name: 'menu',
    description: 'Show available bot commands',
    category: 'general',
    alias: ['help', 'cmdlist', 'commands'],

    // ctx = { number, config, prefix, from, sender, isOwner, type } (pair.js eken enawa)
    async execute(sock, msg, args, text, ctx = {}) {
        const jid = msg.key.remoteJid;
        const prefix = ctx.prefix || config.PREFIX || '.';
        const isGroup = jid.endsWith('@g.us');
        const user = msg.pushName || (msg.key.participant || jid).split('@')[0] || 'User';

        hookReplies(sock);

        try { await sock.sendMessage(jid, { react: { text: '📜', key: msg.key } }); } catch (e) {}

        const cats = buildCategories();
        const info = buildInfo(user, prefix, cats);
        const arg = String(args[0] || '').toLowerCase();

        // ".menu all" - okkoma commands ekapara
        if (arg === 'all') {
            await sock.sendMessage(jid, { text: `${buildTree(cats, prefix)}\n\n> ${config.BOT_FOOTER}` }, { quoted: msg });
            return;
        }

        // ".menu <category>" / ".menu <number>" (select menu eken tap kalama enne mekai)
        if (arg && arg !== 'text') {
            const cat = lookupCategory(cats, arg);
            if (!cat) {
                const keys = cats.map((c, i) => `${i + 1}. ${c.key}`).join('\n');
                await sock.sendMessage(jid, { text: `❌ Category not found.\n\nAvailable:\n${keys}` }, { quoted: msg });
                return;
            }
            await sendCategory(sock, jid, msg, cat, prefix);
            return;
        }

        // Groups walata saha ".menu text" walata plain menu eka (interactive groups wala render wenne nåhå)
        const wantText = isGroup || arg === 'text';

        if (!wantText) {
            try {
                await sendInteractiveMenu(sock, jid, info, cats, prefix);
                return;
            } catch (err) {
                console.error('Interactive menu failed, sending text menu:', err.message);
            }
        }

        await sendTextMenu(sock, jid, msg, `┌─ム ${MENU_TITLE}\n\n${info}\n\n${buildSummary(cats)}`, prefix);
    }
};