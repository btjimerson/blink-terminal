// Imports
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const pty = require('node-pty');
const os = require('os');

// Set up http server
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

// Static files directory = public
app.use(express.static('public'));

// Handle request
io.on('connection', (socket) => {

    // Get the shell based on OS
    const shell = os.platform() === 'win32' ? 'powershell.exe' : '/bin/bash';

    // Get the Pod name from the OS hostname and send it and the shell name to the frontend
    const podName = process.env.HOSTNAME || 'local-session';
    socket.emit('metadata', {
        podName: podName,
        shell: shell
    });

    // Start the pty process
    const ptyProcess = pty.spawn(shell, [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: process.cwd(),
        env: process.env
    });

    // Flag to indicate if socket is opened or not
    let isOpened = true;

    // Send output to client
    ptyProcess.onData((data) => {
        if (isOpened) socket.emit('output', data);
    });

    // Receive input from client
    socket.on('input', (data) => {
        // Only write if the process is still alive
        if (isOpened) {
            try {
                ptyProcess.write(data);
            } catch (err) {
                console.error('PTY write error suppressed:', err.message);
            }
        }
    });

    // Handle client disconnect
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        isOpened = false;
        
        // Give it a small delay before killing to avoid race conditions
        setTimeout(() => {
            try {
                ptyProcess.kill();
            } catch (e) {
                // Process might already be dead
            }
        }, 100);
    });
});

// Start server
server.listen(PORT, () => console.log('Terminal running on http://localhost:' + PORT));