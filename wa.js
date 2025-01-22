const express = require('express');  
const { Client, LocalAuth } = require('whatsapp-web.js');  
const http = require('http');  
const socketIo = require('socket.io');  
const path = require('path');  // Untuk mengatur path ke views

const app = express();  
const server = http.createServer(app);  
const io = socketIo(server);  // Setup socket.io

// Set EJS sebagai templating engine
app.set('view engine', 'ejs');  
app.set('views', path.join(__dirname, 'views'));  // Folder untuk views

app.use(express.json());  // Middleware untuk parsing JSON  

let client;  

function initializeClient() {  
    client = new Client({  
        authStrategy: new LocalAuth()  
    });  

    client.on('qr', (qr) => {  
        // Emit QR code ke frontend via socket.io
        io.emit('qr', qr);  
    });  

    client.on('ready', () => {  
        console.log('Client is ready!');  
    });  

    client.on('auth_failure', () => {  
        console.log('Authentication failed, reinitializing client...');  
        client.destroy(); // Menghancurkan sesi yang ada  
        initializeClient();  // Inisialisasi ulang client  
    });  

    client.initialize();  
}  

// Inisialisasi client pertama kali  
initializeClient();  

app.post('/send-message', (req, res) => {  
    let { number, message } = req.body;  
    number = `${number}@s.whatsapp.net`;
    client.sendMessage(number, message).then(response => {  
        res.send('Message sent successfully!');  
    }).catch(err => {  
        res.status(500).send('Error sending message: ' + err);  
    });  
});  

// Endpoint untuk menampilkan QR code
app.get('/', (req, res) => {
    res.render('index'); // Render view EJS
});

// Set server untuk menjalankan aplikasi
server.listen(3000, () => {  
    console.log('Server is running on http://localhost:3000');  
});  
