const {
 default: makeWASocket,
 useMultiFileAuthState
} = require("@whiskeysockets/baileys")

const Pino = require("pino")
const readline = require("readline")

const rl = readline.createInterface({
 input: process.stdin,
 output: process.stdout
})

async function startTermux() {
 const { state, saveCreds } = await useMultiFileAuthState("./session")

 const sock = makeWASocket({
   logger: Pino({ level: "silent" }),
   auth: state,
   printQRInTerminal: false
 })

 // SE NÃO ESTIVER LOGADO, PEDE O NÚMERO
 if (!state.creds.registered) {
   rl.question("📱 Digite seu número com DDI (ex: 5532998665591): ", async (numero) => {
     const code = await sock.requestPairingCode(numero)
     console.log(`\n🔢 CÓDIGO PARA CONECTAR: ${code}\n`)
     console.log("👉 WhatsApp > Aparelhos conectados")
     console.log("👉 Conectar com número de telefone")
     console.log("👉 Inserir código\n")
     rl.close()
   })
 }

 sock.ev.on("creds.update", saveCreds)

 sock.ev.on("connection.update", (update) => {
   const { connection } = update
   if (connection === "open") {
     console.log("✅ BOT CONECTADO COM SUCESSO!")
   }
 })
}

startTermux()
