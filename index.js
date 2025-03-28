const {
  makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  Browsers,
  jidNormalizedUser,
  downloadMediaMessage,
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const readline = require("readline");
const fs = require("fs");
const path = require("path");
const colors = require("colors");
const moment = require("moment-timezone");

let useCode = true;
let loggedInNumber;

function logCuy(message, type = "green") {
  moment.locale("id");
  const now = moment().tz("Asia/Jakarta");
  console.log(
    `\n${now.format(" dddd ").bgRed}${
      now.format(" D MMMM YYYY ").bgYellow.black
    }${now.format(" HH:mm:ss ").bgWhite.black}\n`
  );
  console.log(`${message.bold[type]}`);
}

const configPath = path.join(__dirname, "config.json");
let config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

let {
  autoLikeStatus,
  downloadMediaStatus,
  sensorNomor,
  antiTelpon,
  autoKickStory,
  blackList,
  whiteList,
  emojis,
} = config;

const updateConfig = (key, value) => {
  config[key] = value;
  fs.writeFileSync(configPath, JSON.stringify(config, null, 4), "utf-8");
};

let welcomeMessage = false;

async function connectToWhatsApp() {
  const sessionPath = path.join(__dirname, "sessions");
  const sessionExists =
    fs.existsSync(sessionPath) && fs.readdirSync(sessionPath).length > 0;

  const { state, saveCreds } = await useMultiFileAuthState("sessions");

  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    auth: state,
    printQRInTerminal: !useCode,
    defaultQueryTimeoutMs: undefined,
    keepAliveIntervalMs: 30000,
    browser: Browsers.macOS("Chrome"),
    shouldSyncHistoryMessage: () => true,
    markOnlineOnConnect: true,
    syncFullHistory: true,
    generateHighQualityLinkPreview: true,
  });

  if (useCode && !sessionExists) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    logCuy(
      "Halo sepertinya kamu belum login, Mau login wangsaf pakai pairing code?\nSilahkan balas dengan (y/n)\nketik y untuk setuju atau ketik n untuk login menggunakan qrcode",
      "cyan"
    ); // pesan untuk yang menggunakan panel

    const askPairingCode = () => {
      rl.question(
        "\nApakah kamu ingin menggunakan pairing code untuk login ke wangsaf? (y/n): "
          .yellow.bold,
        async (answer) => {
          if (answer.toLowerCase() === "y" || answer.trim() === "") {
            logCuy(
              "Wokeh kalau gitu silahkan masukkan nomor wangsafmu!\ncatatan : awali dengan 62 contoh 628123456789",
              "cyan"
            ); // pesan untuk yang menggunakan panel
            const askWaNumber = () => {
              rl.question(
                "\nMasukkan nomor wangsaf Anda: ".yellow.bold,
                async (waNumber) => {
                  if (!/^\d+$/.test(waNumber)) {
                    logCuy(
                      "Nomor harus berupa angka!\nSilakan masukkan nomor wangsaf kembali!.",
                      "red"
                    );
                    askWaNumber();
                  } else if (!waNumber.startsWith("62")) {
                    logCuy(
                      "Nomor harus diawali dengan 62!\nContoh : 628123456789\nSilakan masukkan nomor wangsaf kembali!.",
                      "red"
                    );
                    askWaNumber();
                  } else {
                    const code = await sock.requestPairingCode(waNumber);
                    console.log(
                      "\nCek notifikasi wangsafmu dan masukin kode login wangsaf:"
                        .blue.bold,
                      code.bold.red
                    );
                    rl.close();
                  }
                }
              );
            };
            askWaNumber();
          } else if (answer.toLowerCase() === "n") {
            useCode = false;
            logCuy(
              "Buka wangsafmu lalu klik titik tiga di kanan atas kemudian klik perangkat tertaut setelah itu Silahkan scan QR code dibawah untuk login ke wangsaf",
              "cyan"
            );
            connectToWhatsApp();
            rl.close();
          } else {
            logCuy('Input tidak valid. Silakan masukkan "y" atau "n".', "red");
            askPairingCode();
          }
        }
      );
    };

    askPairingCode();
  }

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect.error?.output.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) {
        logCuy("Mencoba menghubungkan ke wangsaf...\n", "cyan");
        connectToWhatsApp();
      } else {
        logCuy(
          "Nampaknya kamu telah logout dari wangsaf, silahkan login ke wangsaf kembali!",
          "red"
        );
        fs.rmdirSync(sessionPath, { recursive: true, force: true });
        connectToWhatsApp();
      }
    } else if (connection === "open") {
      logCuy("Berhasil Terhubung ke wangsaf");
      loggedInNumber = sock.user.id.split("@")[0].split(":")[0];
      let displayedLoggedInNumber = loggedInNumber;
      if (sensorNomor) {
        displayedLoggedInNumber =
          displayedLoggedInNumber.slice(0, 3) +
          "****" +
          displayedLoggedInNumber.slice(-2);
      }
      let messageInfo = `Bot *AutoReadStoryWhatsApp* Aktif!
Kamu berhasil login dengan nomor: ${displayedLoggedInNumber}

info status fitur:
- Auto Like Status: ${autoLikeStatus ? "*Aktif*" : "*Nonaktif*"}
- Download Media Status: ${downloadMediaStatus ? "*Aktif*" : "*Nonaktif*"}
- Sensor Nomor: ${sensorNomor ? "*Aktif*" : "*Nonaktif*"}
- Anti Telpon: ${antiTelpon ? "*Aktif*" : "*Nonaktif*"}

Ketik *#menu* untuk melihat menu perintah yang tersedia.

SC : https://github.com/jauhariel/AutoReadStoryWhatsapp`;
      console.log(
        `kamu berhasil login dengan nomor:`.green.bold,
        displayedLoggedInNumber.yellow.bold
      );
      console.log(
        "Bot sudah aktif!\n\nSelamat menikmati fitur auto read story whatsapp by"
          .green.bold,
        "github.com/Jauhariel\n".red.bold
      );

      if (!welcomeMessage) {
        setTimeout(async () => {
          await sock.sendMessage(`${loggedInNumber}@s.whatsapp.net`, {
            text: messageInfo,
          });
          welcomeMessage = true;
        }, 5000);
      }
    }
  });
  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("call", (call) => {
    const { id, status, from } = call[0];
    if (status === "offer" && antiTelpon) return sock.rejectCall(id, from);
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    msg.type = msg.message.imageMessage
      ? "imageMessage"
      : msg.message.videoMessage
      ? "videoMessage"
      : msg.message.audioMessage
      ? "audioMessage"
      : msg.message.extendedTextMessage
      ? "extendedTextMessage"
      : Object.keys(msg.message)[0];

    msg.text =
      msg.type === "conversation"
        ? msg.message.conversation
        : msg.type === "extendedTextMessage"
        ? msg.message.extendedTextMessage.text
        : msg.message[msg.type]?.caption || "";

    const prefixes = [".", "#", "!", "/"];
    let prefix = prefixes.find((p) => msg.text.startsWith(p));

    if (prefix && msg.key.fromMe) {
      msg.cmd = msg.text.trim().split(" ")[0].replace(prefix, "").toLowerCase();

      // args
      msg.args = msg.text
        .replace(/^\S*\b/g, "")
        .trim()
        .split("|");

      async function validateNumber(commandname, type, sc, data) {
        if (!data) {
          await sock.sendMessage(
            `${loggedInNumber}@s.whatsapp.net`,
            {
              text: `Nomor harus diisi.\ncontoh ketik :\n\`${commandname} blacklist 628123456789\`\n\nArgumen yang tersedia:\n\n\`${commandname} blacklist nomornya\`\nuntuk ${type} nomor ${sc} blacklist\n\n\`${commandname} whitelist nomornya\`\nuntuk ${type} nomor ${sc} whitelist`,
            },
            { quoted: msg }
          );
          return false;
        }
        if (!/^\d+$/.test(data)) {
          await sock.sendMessage(
            `${loggedInNumber}@s.whatsapp.net`,
            {
              text: `Nomor harus berupa angka.\ncontoh ketik :\n\`${commandname} blacklist 628123456789\`\n\nArgumen yang tersedia:\n\n\`${commandname} blacklist nomornya\`\nuntuk ${type} nomor ${sc} blacklist\n\n\`${commandname} whitelist nomornya\`\nuntuk ${type} nomor ${sc} whitelist`,
            },
            { quoted: msg }
          );
          return false;
        }
        if (!data.startsWith("62")) {
          await sock.sendMessage(
            `${loggedInNumber}@s.whatsapp.net`,
            {
              text: `Nomor harus diawali dengan 62.\ncontoh ketik :\n\`${commandname} blacklist 628123456789\`\n\nArgumen yang tersedia:\n\n\`${commandname} blacklist nomornya\`\nuntuk ${type} nomor ${sc} blacklist\n\n\`${commandname} whitelist nomornya\`\nuntuk ${type} nomor ${sc} whitelist`,
            },
            { quoted: msg }
          );
          return false;
        }
        return true;
      }

      // command
      switch (msg.cmd) {
        case "on":
          msg.args[0].trim() === ""
            ? await sock.sendMessage(
                `${loggedInNumber}@s.whatsapp.net`,
                {
                  text: `mana argumennya ?\ncontoh ketik : \`#on autolike\`\n\nArgumen yang tersedia:\n\n\`#on autolike\`\nuntuk mengaktifkan fitur autolike\n\n\`#on dlmedia\`\nuntuk mengaktifkan fitur download media(foto,video, dan audio) dari story\n\n\`#on sensornomor\`\nuntuk mengaktifkan sensor nomor\n\n\`#on antitelpon\`\nuntuk mengaktifkan anti-telpon\n\n\`#on kickstory\`\nuntuk mengaktifkan auto kick story grup`,
                },
                { quoted: msg }
              )
            : msg.args.forEach(async (arg) => {
                switch (arg.trim().toLowerCase()) {
                  case "autolike":
                    autoLikeStatus = true;
                    updateConfig("autoLikeStatus", true);
                    logCuy("Kamu mengaktifkan fitur Auto Like Status", "blue");
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      { text: "Auto Like Status aktif" },
                      { quoted: msg }
                    );
                    break;
                  case "dlmedia":
                    downloadMediaStatus = true;
                    updateConfig("downloadMediaStatus", true);
                    logCuy(
                      "Kamu mengaktifkan fitur Download Media Status",
                      "blue"
                    );
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      { text: "Download Media Status aktif" },
                      { quoted: msg }
                    );
                    break;
                  case "sensornomor":
                    sensorNomor = true;
                    updateConfig("sensorNomor", true);
                    logCuy("Kamu mengaktifkan fitur sensorNomor", "blue");
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      { text: "Sensor Nomor aktif" },
                      { quoted: msg }
                    );
                    break;
                  case "antitelpon":
                    antiTelpon = true;
                    updateConfig("antiTelpon", true);
                    logCuy("Kamu mengaktifkan fitur Anti-telpon", "blue");
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      { text: "Anti-telpon aktif" },
                      { quoted: msg }
                    );
                    break;
                  case "kickstory":
                    autoKickStory = true;
                    updateConfig("autoKickStory", true);
                    logCuy(
                      "Kamu mengaktifkan fitur auto kick tag grup di story",
                      "blue"
                    );
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      { text: "Auto Kick Tag Grup di Story aktif" },
                      { quoted: msg }
                    );
                    break;
                  default:
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      {
                        text: `Argumen tidak valid: ${arg}. Pilihan yang tersedia: autolike, dlmedia, sensornomor, kickstory dan antitelpon`,
                      },
                      { quoted: msg }
                    );
                    break;
                }
              });
          break;
        case "off":
          msg.args[0].trim() === ""
            ? await sock.sendMessage(
                `${loggedInNumber}@s.whatsapp.net`,
                {
                  text: `mana argumennya ?\ncontoh ketik : \`#off autolike\`\n\nArgumen yang tersedia:\n\n\`#off autolike\`\nuntuk menonaktifkan fitur autolike\n\n\`#off dlmedia\`\nuntuk menonaktifkan fitur download media(foto,video, dan audio) dari story\n\n\`#off sensornomor\`\nuntuk menonaktifkan sensor nomor\n\n\`#off antitelpon\`\nuntuk menonaktifkan anti-telpon\n\n\`#off kickstory\`\nuntuk menonaktifkan auto kick story grup`,
                },
                { quoted: msg }
              )
            : msg.args.forEach(async (arg) => {
                switch (arg.trim().toLowerCase()) {
                  case "autolike":
                    autoLikeStatus = false;
                    updateConfig("autoLikeStatus", false);
                    logCuy("Kamu mematikan fitur Auto Like Status", "blue");
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      { text: "Auto Like Status nonaktif" },
                      { quoted: msg }
                    );
                    break;
                  case "dlmedia":
                    downloadMediaStatus = false;
                    updateConfig("downloadMediaStatus", false);
                    logCuy(
                      "Kamu mematikan fitur Download Media Status",
                      "blue"
                    );
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      { text: "Download Media Status nonaktif" },
                      { quoted: msg }
                    );
                    break;
                  case "sensornomor":
                    sensorNomor = false;
                    updateConfig("sensorNomor", false);
                    logCuy("Kamu mematikan fitur Sensor Nomor", "blue");
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      { text: "Sensor Nomor nonaktif" },
                      { quoted: msg }
                    );
                    break;
                  case "antitelpon":
                    antiTelpon = false;
                    updateConfig("antiTelpon", false);
                    logCuy("Kamu mematikan fitur Anti-telpon", "blue");
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      { text: "Anti-telpon nonaktif" },
                      { quoted: msg }
                    );
                    break;
                  case "kickstory":
                    autoKickStory = false;
                    updateConfig("autoKickStory", false);
                    logCuy(
                      "Kamu mematikan fitur auto kick tag grup di story",
                      "blue"
                    );
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      { text: "Auto Kick Tag Grup di Story nonaktif" },
                      { quoted: msg }
                    );
                    break;
                  default:
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      {
                        text: `Argumen tidak valid: ${arg}. Pilihan yang tersedia: autolike, dlmedia, sensornomor, kickstory dan antitelpon`,
                      },
                      { quoted: msg }
                    );
                    break;
                }
              });
          break;
        case "add":
          msg.args[0].trim() === ""
            ? await sock.sendMessage(
                `${loggedInNumber}@s.whatsapp.net`,
                {
                  text: `mana argumennya ?\ncontoh ketik :\n\`#add blacklist 628123456789\`\n\nArgumen yang tersedia:\n\n\`#add blacklist nomornya\`\nuntuk menambahkan nomor ke blacklist\n\n\`#add whitelist nomornya\`\nuntuk menambahkan nomor ke whitelist\n\n\`#add emojis emojinya\`\nuntuk menambahkan emoji ke emojis`,
                },
                { quoted: msg }
              )
            : msg.args.forEach(async (arg) => {
                const [list, data] = arg.trim().split(" ");
                if (list === "emojis") {
                  let emojiRegex = /^[\p{Emoji}\u200D\uFE0F]$/gu;
                  if (!data) {
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      {
                        text: `emoji harus diisi.\ncontoh ketik :\n\`#add emojis 👍\``,
                      },
                      { quoted: msg }
                    );
                    return;
                  }
                  if (!emojiRegex.test(data)) {
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      {
                        text: `hanya boleh mengisi 1 emoji.\ncontoh ketik :\n\`#add emojis 👍\``,
                      },
                      { quoted: msg }
                    );
                    return;
                  }
                  if (!emojis.includes(data)) {
                    emojis.push(data);
                    updateConfig("emojis", emojis);
                    logCuy(
                      `Kamu menambahkan emoji ${data} ke daftar emojis`,
                      "blue"
                    );
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      {
                        text: `emoji ${data} berhasil ditambahkan ke daftar emojis`,
                      },
                      { quoted: msg }
                    );
                  } else {
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      { text: `emoji ${data} sudah ada di daftar emojis` },
                      { quoted: msg }
                    );
                  }
                } else if (list === "blacklist") {
                  const isValid = await validateNumber(
                    "#add",
                    "menambahkan",
                    "ke",
                    data
                  );
                  if (!isValid) return;
                  let displayNumber = data;
                  if (sensorNomor) {
                    displayNumber =
                      displayNumber.slice(0, 3) +
                      "****" +
                      displayNumber.slice(-2);
                  }
                  if (!blackList.includes(data)) {
                    blackList.push(data);
                    updateConfig("blackList", blackList);
                    logCuy(
                      `Kamu menambahkan nomor ${displayNumber} ke blacklist`,
                      "blue"
                    );
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      {
                        text: `Nomor ${displayNumber} berhasil ditambahkan ke blacklist`,
                      },
                      { quoted: msg }
                    );
                  } else {
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      { text: `Nomor ${displayNumber} sudah ada di blacklist` },
                      { quoted: msg }
                    );
                  }
                } else if (list === "whitelist") {
                  const isValid = await validateNumber(
                    "#add",
                    "menambahkan",
                    "ke",
                    data
                  );
                  if (!isValid) return;
                  let displayNumber = data;
                  if (sensorNomor) {
                    displayNumber =
                      displayNumber.slice(0, 3) +
                      "****" +
                      displayNumber.slice(-2);
                  }
                  if (!whiteList.includes(data)) {
                    whiteList.push(data);
                    updateConfig("whiteList", whiteList);
                    logCuy(
                      `Kamu menambahkan nomor ${displayNumber} ke whitelist`,
                      "blue"
                    );
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      {
                        text: `Nomor ${displayNumber} berhasil ditambahkan ke whitelist`,
                      },
                      { quoted: msg }
                    );
                  } else {
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      { text: `Nomor ${displayNumber} sudah ada di whitelist` },
                      { quoted: msg }
                    );
                  }
                } else {
                  await sock.sendMessage(
                    `${loggedInNumber}@s.whatsapp.net`,
                    {
                      text: `Argumen tidak valid: ${arg}. Pilihan yang tersedia: blacklist, whitelist, emojis`,
                    },
                    { quoted: msg }
                  );
                }
              });
          break;
        case "remove":
          msg.args[0].trim() === ""
            ? await sock.sendMessage(
                `${loggedInNumber}@s.whatsapp.net`,
                {
                  text: `mana argumennya ?\ncontoh ketik :\n\`#remove blacklist 628123456789\`\n\nArgumen yang tersedia:\n\n\`#remove blacklist nomornya\`\nuntuk menghapus nomor dari blacklist\n\n\`#remove whitelist nomornya\`\nuntuk menghapus nomor dari whitelist\n\n\`#remove emojis emojinya\`\nuntuk menghapus emoji dari daftar emojis`,
                },
                { quoted: msg }
              )
            : msg.args.forEach(async (arg) => {
                const [list, data] = arg.trim().split(" ");
                if (list === "emojis") {
                  let emojiRegex = /^[\p{Emoji}\u200D\uFE0F]$/gu;
                  if (!data) {
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      {
                        text: `emoji harus diisi.\ncontoh ketik :\n\`#remove emojis 👍\``,
                      },
                      { quoted: msg }
                    );
                    return;
                  }
                  if (!emojiRegex.test(data)) {
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      {
                        text: `hanya boleh mengisi 1 emoji.\ncontoh ketik :\n\`#remove emojis 👍\``,
                      },
                      { quoted: msg }
                    );
                    return;
                  }
                  if (emojis.length === 1) {
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      {
                        text: `Tidak bisa menghapus emoji terakhir. Harus ada minimal satu emoji.\n\nKetik \`#info\` untuk mengecek daftar emoji yang tersedia`,
                      },
                      { quoted: msg }
                    );
                    return;
                  }
                  if (emojis.includes(data)) {
                    emojis = emojis.filter((n) => n !== data);
                    updateConfig("emojis", emojis);
                    logCuy(`Kamu menghapus emoji ${data} dari emojis`, "blue");
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      {
                        text: `emoji ${data} berhasil dihapus dari daftar emojis`,
                      },
                      { quoted: msg }
                    );
                  } else {
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      {
                        text: `emoji ${data} tidak ada di daftar emojis\n\nKetik \`#info\` untuk mengecek daftar emoji yang tersedia`,
                      },
                      { quoted: msg }
                    );
                  }
                } else if (list === "blacklist") {
                  const isValid = await validateNumber(
                    "#remove",
                    "menghapus",
                    "dari",
                    data
                  );
                  if (!isValid) return;
                  let displayNumber = data;
                  if (sensorNomor) {
                    displayNumber =
                      displayNumber.slice(0, 3) +
                      "****" +
                      displayNumber.slice(-2);
                  }
                  if (blackList.includes(data)) {
                    blackList = blackList.filter((n) => n !== data);
                    updateConfig("blackList", blackList);
                    logCuy(
                      `Kamu menghapus nomor ${displayNumber} dari blacklist`,
                      "blue"
                    );
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      {
                        text: `Nomor ${displayNumber} berhasil dihapus dari blacklist`,
                      },
                      { quoted: msg }
                    );
                  } else {
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      {
                        text: `Nomor ${displayNumber} tidak ada di blacklist\n\nKetik \`#info\` untuk mengecek daftar nomor yang tersedia`,
                      },
                      { quoted: msg }
                    );
                  }
                } else if (list === "whitelist") {
                  const isValid = await validateNumber(
                    "#remove",
                    "menghapus",
                    "dari",
                    data
                  );
                  if (!isValid) return;
                  let displayNumber = data;
                  if (sensorNomor) {
                    displayNumber =
                      displayNumber.slice(0, 3) +
                      "****" +
                      displayNumber.slice(-2);
                  }
                  if (whiteList.includes(data)) {
                    whiteList = whiteList.filter((n) => n !== data);
                    updateConfig("whiteList", whiteList);
                    logCuy(
                      `Kamu menghapus nomor ${displayNumber} dari whitelist`,
                      "blue"
                    );
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      {
                        text: `Nomor ${displayNumber} berhasil dihapus dari whitelist`,
                      },
                      { quoted: msg }
                    );
                  } else {
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      {
                        text: `Nomor ${displayNumber} tidak ada di whitelist\n\nKetik \`#info\` untuk mengecek daftar nomor yang tersedia`,
                      },
                      { quoted: msg }
                    );
                  }
                } else {
                  await sock.sendMessage(
                    `${loggedInNumber}@s.whatsapp.net`,
                    {
                      text: `Argumen tidak valid: ${arg}. Pilihan yang tersedia: blacklist, whitelist, emojis`,
                    },
                    { quoted: msg }
                  );
                }
              });
          break;
        case "menu":
          const menuMessage = `Daftar Menu:
contoh penggunaan: #on autolike

Perintah On:
\`#on autolike\`
Mengaktifkan fitur autolike

\`#on dlmedia\`
Mengaktifkan fitur download media (foto, video, dan audio) dari story

\`#on sensornomor\`
Mengaktifkan sensor nomor

\`#on antitelpon\`
Mengaktifkan anti telpon

\`#on kickstory\`
Mengaktifkan auto kick story tag grup

Perintah Off:
\`#off autolike\`
Menonaktifkan fitur autolike

\`#off dlmedia\`
Menonaktifkan fitur download media (foto, video, dan audio) dari story

\`#off sensornomor\`
Menonaktifkan sensor nomor

\`#off antitelpon\`
Menonaktifkan anti telpon

\`#off kickstory\`
Menonaktifkan auto kick story tag grup

Perintah Add:
\`#add blacklist nomornya\`
Menambahkan nomor ke blacklist

\`#add whitelist nomornya\`
Menambahkan nomor ke whitelist

\`#add emojis emojinya\`
Menambahkan emoji ke daftar emojis

Perintah Remove:
\`#remove blacklist nomornya\`
Menghapus nomor dari blacklist

\`#remove whitelist nomornya\`
Menghapus nomor dari whitelist

\`#remove emojis emojinya\`
Menghapus emoji dari daftar emojis

Perintah Info:
\`#info\`
Menampilkan informasi status fitur, daftar nomor/emoji yang ada di blacklist, whitelist dan emojis`;

          await sock.sendMessage(
            `${loggedInNumber}@s.whatsapp.net`,
            { text: menuMessage },
            { quoted: msg }
          );
          break;
        case "info":
          const infoMessage = `Informasi Status Fitur:
- Auto Like Status: ${autoLikeStatus ? "*Aktif*" : "*Nonaktif*"}
- Download Media Status: ${downloadMediaStatus ? "*Aktif*" : "*Nonaktif*"}
- Sensor Nomor: ${sensorNomor ? "*Aktif*" : "*Nonaktif*"}
- Anti Telpon: ${antiTelpon ? "*Aktif*" : "*Nonaktif*"}`;

          const formatList = (list) =>
            list
              .map((number, index) => {
                let displayNumber = number;
                if (sensorNomor) {
                  displayNumber =
                    displayNumber.slice(0, 3) +
                    "****" +
                    displayNumber.slice(-2);
                }
                return `\u25CF ${displayNumber}`;
              })
              .join("\n");
          const formatEmojiList = (list) =>
            list.map((emoji, index) => `${emoji}`).join(", ");

          const blacklistMessage =
            blackList.length > 0
              ? `Blacklist:\n${formatList(blackList)}`
              : "Blacklist kosong.";
          const whitelistMessage =
            whiteList.length > 0
              ? `Whitelist:\n${formatList(whiteList)}`
              : "Whitelist kosong.";
          const emojisMessage =
            emojis.length > 0
              ? `Emojis:\n${formatEmojiList(emojis)}`
              : "Emojis kosong.";
          const listMessage = `\n\n${blacklistMessage}\n\n${whitelistMessage}\n\n${emojisMessage}\n\nKetik \`#add\` untuk menambahkan nomor atau emoji ke blacklist, whitelist, dan emojis\nKetik \`#remove\` untuk menghapus nomor atau emoji dari blacklist, whitelist, dan emojis\nKetik \`#on\` untuk mengaktifkan fitur\nKetik \`#off\` untuk menonaktifkan fitur\nKetik \`#menu\` untuk melihat menu perintah yang tersedia`;

          await sock.sendMessage(
            `${loggedInNumber}@s.whatsapp.net`,
            { text: infoMessage + listMessage },
            { quoted: msg }
          );
          break;
      }
    }

    if (autoKickStory) {
      if (msg.message.groupStatusMentionMessage && !msg.key.fromMe) {
        const groupId = msg.key.remoteJid;
        const participant = msg.key.participant;

        const groupMetadata = await sock.groupMetadata(groupId);
        const groupName = groupMetadata.subject;
        const botNumber = sock.user.id.split(":")[0] + "@s.whatsapp.net";
        const isAdmin = groupMetadata.participants.some(
          (member) => member.id === botNumber && member.admin !== null
        );

        if (isAdmin) {
          await sock.sendMessage(
            groupId,
            {
              text: `@${
                participant.split("@")[0]
              } terdeteksi tag grup di story, kamu akan dikick.`,
              mentions: [participant],
            },
            { quoted: msg }
          );

          await sock.groupParticipantsUpdate(groupId, [participant], "remove");
          logCuy(
            `Kamu mengeluarkan sesorang dari group ${groupName} karena telah tag grup di story.`,
            "red"
          );
        } else {
          // await sock.sendMessage(
          //   `${loggedInNumber}@s.whatsapp.net`,
          //   {
          //     text: `terdeteksi ada yang tag grup di story, namun bot bukan admin jadi tidak bisa kick.`,
          //   },
          //   { quoted: msg }
          // );
          logCuy(
            `Kamu bukan admin di grup ${groupName} jadi tidak bisa kick.`,
            "yellow"
          );
        }
      }
    }

    // status
    if (
      msg.key.remoteJid === "status@broadcast" &&
      msg.key.participant !== `${loggedInNumber}@s.whatsapp.net`
    ) {
      let senderNumber = msg.key.participant
        ? msg.key.participant.split("@")[0]
        : "Tidak diketahui";
      let displaySendernumber = senderNumber;
      const senderName = msg.pushName || "Tidak diketahui";

      if (sensorNomor && displaySendernumber !== "Tidak diketahui") {
        displaySendernumber =
          displaySendernumber.slice(0, 3) +
          "****" +
          displaySendernumber.slice(-2);
      }

      if (msg.message.protocolMessage) {
        logCuy(
          `Status dari ${senderName} (${displaySendernumber}) telah dihapus.`,
          "red"
        );
      } else if (!msg.message.reactionMessage) {
        if (blackList.includes(senderNumber)) {
          logCuy(
            `${senderName} (${displaySendernumber}) membuat status tapi karena ada di blacklist. Status tidak akan dilihat.`,
            "yellow"
          );
          return;
        }

        if (whiteList.length > 0 && !whiteList.includes(senderNumber)) {
          logCuy(
            `${senderName} (${displaySendernumber}) membuat status tapi karena tidak ada di whitelist. Status tidak akan dilihat.`,
            "yellow"
          );
          return;
        }

        const myself = jidNormalizedUser(sock.user.id);
        const emojiToReact = emojis[Math.floor(Math.random() * emojis.length)];

        if (msg.key.remoteJid && msg.key.participant) {
          await sock.readMessages([msg.key]);

          if (autoLikeStatus) {
            await sock.sendMessage(
              msg.key.remoteJid,
              { react: { key: msg.key, text: emojiToReact } },
              { statusJidList: [msg.key.participant, myself] }
            );
          }

          logCuy(
            `Berhasil melihat ${
              autoLikeStatus ? "dan menyukai " : ""
            }status dari: ${senderName} (${displaySendernumber})`,
            "green"
          );

          const targetNumber = loggedInNumber;
          let messageContent = `Status dari *${senderName}* (${displaySendernumber}) telah dilihat ${
            autoLikeStatus ? "dan disukai" : ""
          }`;
          let caption =
            msg.message.imageMessage?.caption ||
            msg.message.videoMessage?.caption ||
            msg.message.extendedTextMessage?.text ||
            "Tidak ada caption";

          if (downloadMediaStatus) {
            if (msg.type === "imageMessage" || msg.type === "videoMessage") {
              let mediaType = msg.type === "imageMessage" ? "image" : "video";
              messageContent = `Status ${
                mediaType === "image" ? "gambar" : "video"
              } dari *${senderName}* (${displaySendernumber}) telah dilihat ${
                autoLikeStatus ? "dan disukai" : ""
              }`;

              try {
                const buffer = await downloadMediaMessage(
                  msg,
                  "buffer",
                  {},
                  {
                    logger: pino({ level: "fatal" }),
                  }
                );

                await sock.sendMessage(`${targetNumber}@s.whatsapp.net`, {
                  [mediaType]: Buffer.from(buffer),
                  caption: `${messageContent} dengan caption : "*${caption}*"`,
                });
              } catch (error) {
                logCuy(`Error uploading media: ${error}`, "red");
                await sock.sendMessage(`${targetNumber}@s.whatsapp.net`, {
                  text: `${messageContent} namun Gagal mengunggah media dari status ${
                    mediaType === "image" ? "gambar" : "video"
                  } dari *${senderName}* (${displaySendernumber}).`,
                });
              }
            } else if (msg.type === "audioMessage") {
              messageContent = `Status audio dari *${senderName}* (${displaySendernumber}) telah dilihat ${
                autoLikeStatus ? "dan disukai" : ""
              }. Berikut audionya.`;

              await sock.sendMessage(`${targetNumber}@s.whatsapp.net`, {
                text: messageContent,
              });

              try {
                const buffer = await downloadMediaMessage(
                  msg,
                  "buffer",
                  {},
                  {
                    logger: pino({ level: "fatal" }),
                  }
                );

                await sock.sendMessage(`${targetNumber}@s.whatsapp.net`, {
                  audio: Buffer.from(buffer),
                  caption: "",
                });
              } catch (error) {
                logCuy(`Error uploading media: ${error}`, "red");
                await sock.sendMessage(`${targetNumber}@s.whatsapp.net`, {
                  text: `Gagal mengunggah audio dari status audio dari *${senderName}* (${displaySendernumber}).`,
                });
              }
            } else {
              messageContent = `Status teks dari *${senderName}* (${displaySendernumber}) telah dilihat ${
                autoLikeStatus ? "dan disukai" : ""
              } dengan caption: "*${caption}*"`;

              await sock.sendMessage(`${targetNumber}@s.whatsapp.net`, {
                text: messageContent,
              });
            }
          } else {
            await sock.sendMessage(`${targetNumber}@s.whatsapp.net`, {
              text: messageContent,
            });
          }
        }
      }
    }
  });
}

connectToWhatsApp();
