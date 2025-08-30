// server.js - Our powerful Node.js TCP Scanner Backend

const express = require('express');
const cors = require('cors');
const net = require('net'); // Node.js's built-in TCP socket library

const app = express();
const PORT = 3000; // The port our backend server will run on

// --- Middleware ---
app.use(cors()); // Allows our frontend to communicate with this backend
app.use(express.json()); // Allows the server to understand JSON requests

/**
 * The core TCP scanning function.
 * @param {string} host - The IP address or hostname to scan.
 * @param {number} port - The port to scan.
 * @param {number} timeout - Connection timeout in milliseconds.
 * @returns {Promise<{port: number, status: 'open' | 'closed'}>}
 */
function scanPort(host, port, timeout = 1000) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(timeout);

        socket.on('connect', () => {
            socket.destroy();
            resolve({ port, status: 'open' });
        });

        socket.on('error', (err) => {
            socket.destroy();
            resolve({ port, status: 'closed' });
        });

        socket.on('timeout', () => {
            socket.destroy();
            resolve({ port, status: 'closed' });
        });

        socket.connect(port, host);
    });
}

// --- API Endpoint ---
app.post('/scan-port', async (req, res) => {
    const { host, port } = req.body;

    if (!host || !port) {
        return res.status(400).json({ error: 'Host and port are required.' });
    }

    const result = await scanPort(host, port);
    
    res.json(result);
});

// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`TCP Scanner backend is running on http://localhost:${PORT}`);
});