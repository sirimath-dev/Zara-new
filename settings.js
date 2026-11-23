'use strict';

/*
 * Queen Zara per-account default settings.
 * These are safe defaults; individual account settings can be stored in Firebase.
 */
module.exports = Object.freeze({
    BOT_NAME: 'QUEEN ZARA',
    BOT_FOOTER: '© Sirimath',
    PREFIX: '.',
    RCD_IMAGE_PATH: '',
    GROUP_INVITE_LINK: '',
    NEWSLETTER_JID: '',
    CHANNEL_REACT_EMOJIS: '🩵,🤍,🩷,💛',

    AUTO_STATUS_SEEN: false,
    AUTO_STATUS_REACT: false,
    AUTO_READ: false,
    ALWAYS_ONLINE: false,
    AUTO_TYPING: false,
    AUTO_RECORDING: false,
    ANTI_DELETE: false,
    ANTI_EDIT: false,
    ANTI_VIEWONCE: false,
    ANTI_CALL: false,
    AUTO_LIKE: false,
    VV_EMOJI_REPLY: false,
    AWAY_MODE: false,
    FORWARD_TAG: false,
    STATUS_FORWARD: false,
    STATUS_SAVE_EMOJI: false,

    STATUS_EMOJIS: '🩵,🤍',
    LIKE_EMOJIS: '🩵,🤍',
    VV_EMOJIS: '👀',
    STATUS_SAVE_EMOJIS: '📥',
    AWAY_MSG: 'I am currently away. I will reply when I am back.',
    ANTI_DEST: '',
    ANTI_DELETE_SCOPE: 'private',
    ANTI_EDIT_SCOPE: 'private',
    mode: 'public'
});
