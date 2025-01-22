const express = require('express');  
const { Client, LocalAuth } = require('whatsapp-web.js');  
const qrcode = require('qrcode-terminal');  
  
const app = express();  
app.use(express.json()); // Middleware untuk parsing JSON  
  
let client;  
  
function initializeClient() {  
    client = new Client({  
        authStrategy: new LocalAuth()  
    });  
  
    client.on('qr', (qr) => {  
        // Tampilkan QR code di terminal  
        qrcode.generate(qr, { small: true });  
    });  
  
    client.on('ready', () => {  
        console.log('Client is ready!');  
    });  
  
    client.on('auth_failure', () => {  
        console.log('Authentication failed, reinitializing client...');  
        initializeClient(); // Inisialisasi ulang client  
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
  
app.listen(3000, () => {  
    console.log('Server is running on http://localhost:3000');  
});  
