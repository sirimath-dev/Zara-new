// ඔයාගේ ඇත්ත number එක (මේකෙන් වැඩ කරන්නේ නැත්නම්)
const OWNER = '94720689634'; 

// 🔥 ඔයාගේ @lid එක මෙතන දාන්න (Terminal එකේ log එකෙන් ගන්න)
const OWNER_LID = '123456789012345@lid'; // <--- මේක ඔයාගේ එකට වෙනස් කරන්න

const jidNum = (j) => String(j || '').split('@')[0].split(':')[0].replace(/\D/g, '');

const jidIsOwner = (j) => {
    if (!j) return false;
    // @lid එකෙන් හරි, ඇත්ත number එකෙන් හරි ආවම true වෙනවා
    if (String(j) === OWNER_LID || jidNum(j) === OWNER) return true;
    return false;
};

module.exports = {
    name: 'ownerreact',
    alias: [],
    
    execute: async (socket, msg, args, text, ctx) => {
        return; 
    },

    // මේක තමයි වැඩ කරන්නේ
    onMessage: async (socket, msg, number) => {
        try {
            if (!msg || !msg.key) return;

            const fromMe = !!msg.key.fromMe;
            const isStatus = msg.key.remoteJid === 'status@broadcast';

            // Owner කෙනෙක්ද කියලා බලනවා
            const fromOwner =
                jidIsOwner(msg.key.remoteJid) ||
                jidIsOwner(msg.key.participant) ||
                jidIsOwner(msg.key.remoteJidAlt) ||
                jidIsOwner(msg.key.participantAlt);

            // Owner ගේ මැසේජ් එකක් නම්, ඒක අපේ එකක් (fromMe) නැත්නම්, ස්ටේටස් එකක් නැත්නම්
            if (fromOwner && !fromMe && !isStatus) {
                await socket.sendMessage(msg.key.remoteJid, {
                    react: { text: '🐉', key: msg.key }
                });
                console.log(`🐉 Reacted to owner message in ${msg.key.remoteJid}`);
            }
        } catch (e) {
            console.error(`Owner react plugin error (${number}):`, e.message);
        }
    }
};