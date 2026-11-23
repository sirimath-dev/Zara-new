'use strict';

const express = require('express');
const http = require('http');

const app = express();
const PORT = Number(process.env.PORT) || 8000;

// Reverse-proxy platforms such as Railway/Render run behind a proxy.
app.set('trust proxy', 1);
app.disable('x-powered-by');

// Main WhatsApp bot router. pair.js exports an Express Router.
// Keep this mount path as /code because the bot's admin routes refer to /code/active.
const pairRouter = require('./pair');
app.use('/code', pairRouter);

// Basic service health endpoint.
app.get('/', (_req, res) => {
    res.status(200).json({
        status: 'online',
        service: 'Queen Zara WhatsApp Bot',
        health: '/code/ping'
    });
});

app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Unknown routes.
app.use((req, res) => {
    res.status(404).json({
        status: 'not_found',
        message: 'Route not found',
        path: req.originalUrl
    });
});

// Central error handler.
app.use((err, _req, res, _next) => {
    console.error('Express error:', err);
    if (res.headersSent) return;
    res.status(500).json({
        status: 'error',
        message: 'Internal server error'
    });
});

const server = http.createServer(app);
server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n╭──────────────────────────────────────╮`);
    console.log(`│       QUEEN ZARA BOT IS ONLINE        │`);
    console.log(`╰──────────────────────────────────────╯`);
    console.log(`🌐 Port: ${PORT}`);
    console.log(`🔗 Health: /code/ping`);
    console.log(`⚙️  Admin/API: /code/`);
});

let shuttingDown = false;
async function shutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`\n${signal} received. Shutting down...`);

    server.close(async () => {
        try {
            if (typeof pairRouter.shutdown === 'function') {
                await pairRouter.shutdown();
            }
        } catch (err) {
            console.error('Bot shutdown error:', err);
        }
        process.exit(0);
    });

    // Avoid hanging forever during platform shutdown.
    setTimeout(() => process.exit(1), 10000).unref();
}

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));

module.exports = app;
