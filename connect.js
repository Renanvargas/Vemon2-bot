const {
 default: makeWASocket,
 useMultiFileAuthState,
 DisconnectReason
} = require('@whiskeysockets/baileys')

const Pino = require('pino')
const config = require('./config')

async function startBot() {
 const { state, saveCreds } = await useMultiFileAuthState('./session')

 const sock = makeWASocket({
   logger: Pino({ level: 'silent' }),
   auth: state,
   printQRInTerminal: false
 })

 sock.ev.on('connection.update', (update) => {
   const { connection, pairingCode } = update
   if (pairingCode) {
     console.log(`📲 Código para conectar: ${pairingCode}`)
   }
   if (connection === 'open') {
     console.log('✅ Vemon Bot conectado com sucesso!')
   }
 })

 sock.ev.on('creds.update', saveCreds)

 sock.ev.on('messages.upsert', async ({ messages }) => {
   const msg = messages[0]
   if (!msg.message) return

   const texto = msg.message.conversation || ""
   if (!texto.startsWith(config.prefixo)) return

   const comando = texto.slice(1).trim().split(" ")[0]

   if (comando === "menu") {
     await sock.sendMessage(msg.key.remoteJid, {
       image: { url: "https://t1.pixhost.to/thumbs/11485/682603157_whatsapp_image.jpg" },
       caption: require('./dono/menus/comandos')
     })
   }
 })
}

startBot()
