const {
  makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  Browsers,
  jidNormalizedUser,
  downloadMediaMessage,
  fetchLatestBaileysVersion,
  prepareWAMessageMedia,
  generateWAMessageFromContent,
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const readline = require("readline");
const fs = require("fs");
const path = require("path");
const colors = require("colors");
const moment = require("moment-timezone");
const { randomBytes } = require("crypto");

let useCode = true;
let loggedInNumber;

function logCuy(message, type = "green") {
  moment.locale(lang);
  const now = moment().tz("Asia/Jakarta");
  console.log(
    `\n${now.format(" dddd ").bgRed}${
      now.format(" D MMMM YYYY ").bgYellow.black
    }${now.format(" HH:mm:ss ").bgWhite.black}\n`,
  );
  console.log(`${message.bold[type]}`);
}

const configPath = path.join(__dirname, "config.json");
let config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

let {
  autoReadStatus,
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

const locales = {
  id: require("./locales/id"),
  en: require("./locales/en"),
};
let lang = locales[config.language] ? config.language : "id";
const t = (key, ...args) => {
  const value = locales[lang][key] ?? locales.id[key];
  return typeof value === "function" ? value(...args) : value;
};

let welcomeMessage = false;

// ===== kontak & post story =====
const contactsPath = path.join(__dirname, "contacts.json");
let contacts = {};

// muat kontak tersimpan dari sesi sebelumnya
if (fs.existsSync(contactsPath)) {
  try {
    contacts = JSON.parse(fs.readFileSync(contactsPath, "utf-8"));
  } catch {
    contacts = {};
  }
}

let contactsSyncedNotified = false;

const saveContacts = () => {
  fs.writeFileSync(contactsPath, JSON.stringify(contacts, null, 4), "utf-8");
};

// kumpulkan kontak dari event baileys, hanya simpan nomor personal (@s.whatsapp.net)
const collectContacts = (list) => {
  let added = 0;
  for (const c of list) {
    if (!c || typeof c.id !== "string") continue;
    const jid = c.id;
    if (!jid.endsWith("@s.whatsapp.net")) continue;
    if (jid.startsWith(`${loggedInNumber}@`)) continue;

    const number = jid.split("@")[0].split(":")[0];
    if (!number || !/^\d+$/.test(number)) continue;

    const name = c.notify || c.name || c.verifiedName || c.username || null;
    if (contacts[number]) {
      // perbarui nama jika sebelumnya kosong
      if (!contacts[number].name && name) {
        contacts[number].name = name;
        added++;
      }
    } else {
      contacts[number] = { name };
      added++;
    }
  }
  if (added > 0) saveContacts();
  return added;
};

// beri tahu sekali ke pemilik bot bahwa kontak sudah tersinkron
const notifyContactsSynced = async (sock) => {
  if (contactsSyncedNotified) return;
  contactsSyncedNotified = true;
  const count = Object.keys(contacts).length;
  logCuy(t("contactsSyncedLog", count), "blue");
  await sock
    .sendMessage(`${loggedInNumber}@s.whatsapp.net`, {
      text: t("contactsSynced", count),
    })
    .catch(() => {});
};

const statusPosterBusy = { value: false };

// kirim pesan ke status/story: audio pakai sendMessage (sudah didukung),
// media & teks pakai relayMessage + statusJidList (kontak tertentu)
const postStatus = async (sock, content, statusJidList) => {
  const options = { statusJidList: statusJidList || [] };

  if (content.audio) {
    // audio status dikirim langsung ke status@broadcast
    return sock.sendMessage("status@broadcast", {
      audio: content.audio,
      ptt: true,
      statusJidList: options.statusJidList,
    });
  }

  let message;
  if (content.text) {
    // status teks (font & warna seperti di WhatsApp)
    message = generateWAMessageFromContent(
      "status@broadcast",
      {
        extendedTextMessage: {
          text: content.text,
          textArgb: content.textColor ?? 0,
          backgroundArgb: content.backgroundColor ?? 0,
          font: content.font ?? 0,
        },
      },
      {},
    );
  } else {
    // upload media lalu bungkus ke pesan status
    const mediaType = content.image ? "image" : "video";
    const prepared = await prepareWAMessageMedia(
      { [mediaType]: content[mediaType], caption: content.caption },
      { upload: sock.waUploadToServer, logger: pino({ level: "fatal" }) },
    );
    message = generateWAMessageFromContent("status@broadcast", prepared, {});
  }

  // WA memvalidasi status dengan messageSecret di messageContextInfo
  message.message.messageContextInfo = {
    ...(message.message.messageContextInfo || {}),
    messageSecret: randomBytes(32),
  };

  await sock.relayMessage("status@broadcast", message.message, options);
  return message.key.id;
};

async function connectToWhatsApp() {
  const sessionPath = path.join(__dirname, "sessions");
  const sessionExists =
    fs.existsSync(sessionPath) && fs.readdirSync(sessionPath).length > 0;

  const { state, saveCreds } = await useMultiFileAuthState("sessions");
  const { version, isLatest } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    auth: state,
    printQRInTerminal: !useCode,
    defaultQueryTimeoutMs: undefined,
    keepAliveIntervalMs: 30000,
    browser: Browsers.macOS("Chrome"),
    shouldSyncHistoryMessage: () => true,
    syncFullHistory: true,
    generateHighQualityLinkPreview: true,
  });

  if (useCode && !sessionExists) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // pemilihan bahasa saat pertama kali login (ditampilkan dua bahasa karena bahasa belum dipilih)
    console.log(
      "\nPilih bahasa / Choose language:\n  1. Bahasa Indonesia\n  2. English"
        .cyan.bold,
    );
    rl.question("Ketik 1 atau 2 / Type 1 or 2: ".yellow.bold, (answer) => {
      lang = answer.trim() === "2" ? "en" : "id";
      updateConfig("language", lang);
      logCuy(t("langChangedLog", lang), "blue");
      logCuy(t("loginPrompt"), "cyan"); // pesan untuk yang menggunakan panel
      askPairingCode();
    });

    const askPairingCode = () => {
      rl.question(
        t("pairingQuestion").yellow.bold,
        async (answer) => {
          if (answer.toLowerCase() === "y" || answer.trim() === "") {
            logCuy(t("enterNumberNote"), "cyan"); // pesan untuk yang menggunakan panel
            const askWaNumber = () => {
              rl.question(
                t("enterNumberPrompt").yellow.bold,
                async (waNumber) => {
                  if (!/^\d+$/.test(waNumber)) {
                    logCuy(t("numberDigitsOnly"), "red");
                    askWaNumber();
                  } else {
                    const code = await sock.requestPairingCode(
                      waNumber,
                      "AUTOREAD",
                    );
                    console.log(
                      t("pairingCodeNotice").blue.bold,
                      code.bold.red,
                    );
                    rl.close();
                  }
                },
              );
            };
            askWaNumber();
          } else if (answer.toLowerCase() === "n") {
            useCode = false;
            logCuy(t("qrInstructions"), "cyan");
            connectToWhatsApp();
            rl.close();
          } else {
            logCuy(t("invalidInput"), "red");
            askPairingCode();
          }
        },
      );
    };
  }

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect.error?.output.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) {
        logCuy(t("reconnecting"), "cyan");
        connectToWhatsApp();
      } else {
        logCuy(t("loggedOut"), "red");
        fs.rmSync(sessionPath, { recursive: true, force: true });
        connectToWhatsApp();
      }
    } else if (connection === "open") {
      logCuy(t("connected"));
      loggedInNumber = sock.user.id.split("@")[0].split(":")[0];
      let displayedLoggedInNumber = loggedInNumber;
      if (sensorNomor) {
        displayedLoggedInNumber =
          displayedLoggedInNumber.slice(0, 3) +
          "****" +
          displayedLoggedInNumber.slice(-2);
      }
      let messageInfo = t("welcome", {
        number: displayedLoggedInNumber,
        autoReadStatus,
        autoLikeStatus,
        downloadMediaStatus,
        sensorNomor,
        antiTelpon,
        autoKickStory,
      });
      console.log(
        t("loggedInConsole").green.bold,
        displayedLoggedInNumber.yellow.bold,
      );
      console.log(
        t("botActiveConsole").green.bold,
        "github.com/Jauhariel\n".red.bold,
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

  // sync kontak dari history sync (daftar kontak hp) — dipanggil bertahap saat login
  sock.ev.on("messaging-history.set", async ({ contacts: contactList }) => {
    try {
      const added = collectContacts(contactList || []);
      if (added > 0) {
        logCuy(t("contactsSavedLog", added, Object.keys(contacts).length), "cyan");
      }
      // history sync dianggap lengkap setelah progress 100% / isLatest
      if (Object.keys(contacts).length > 0) {
        await notifyContactsSynced(sock);
      }
    } catch (error) {
      logCuy(`Error saving contacts: ${error}`, "red");
    }
  });

  // kontak juga bisa datang dari push name (saat kontak ngirim pesan) — opsional
  sock.ev.on("contacts.upsert", async (contactList) => {
    try {
      collectContacts(contactList || []);
    } catch (error) {
      logCuy(`Error saving contacts: ${error}`, "red");
    }
  });

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

    msg.isQuoted =
      msg.type === "extendedTextMessage"
        ? msg.message.extendedTextMessage.contextInfo?.quotedMessage
        : msg.type === "imageMessage"
          ? msg.message.imageMessage.contextInfo?.quotedMessage
          : msg.type === "videoMessage"
            ? msg.message.videoMessage.contextInfo?.quotedMessage
            : msg.type === "audioMessage"
              ? msg.message.audioMessage.contextInfo?.quotedMessage
              : null;

    msg.quoted = msg.isQuoted
      ? msg.message.extendedTextMessage?.contextInfo ||
        msg.message.imageMessage?.contextInfo ||
        msg.message.videoMessage?.contextInfo ||
        msg.message.audioMessage?.contextInfo
      : null;

    const prefixes = [".", "#", "!", "/"];
    let prefix = prefixes.find((p) => msg.text.startsWith(p));

    if (prefix && msg.key.fromMe) {
      msg.cmd = msg.text.trim().split(" ")[0].replace(prefix, "").toLowerCase();

      msg.args = msg.text.trim().replace(/^\S+/, "").trim().split("|");

      async function validateNumber(commandname, type, sc, data) {
        if (!data) {
          await sock.sendMessage(
            `${loggedInNumber}@s.whatsapp.net`,
            {
              text: t("numberMissing", commandname, type, sc),
            },
            { quoted: msg },
          );
          return false;
        }
        if (!/^\d+$/.test(data)) {
          await sock.sendMessage(
            `${loggedInNumber}@s.whatsapp.net`,
            {
              text: t("numberInvalid", commandname, type, sc),
            },
            { quoted: msg },
          );
          return false;
        }
        // if (!data.startsWith("62")) {
        //   await sock.sendMessage(
        //     `${loggedInNumber}@s.whatsapp.net`,
        //     {
        //       text: `Nomor harus diawali dengan 62.\ncontoh ketik :\n\`${commandname} blacklist 628123456789\`\n\nArgumen yang tersedia:\n\n\`${commandname} blacklist nomornya\`\nuntuk ${type} nomor ${sc} blacklist\n\n\`${commandname} whitelist nomornya\`\nuntuk ${type} nomor ${sc} whitelist`,
        //     },
        //     { quoted: msg }
        //   );
        //   return false;
        // }
        return true;
      }

      // command
      switch (msg.cmd) {
        case "on":
          msg.args[0].trim() === ""
            ? await sock.sendMessage(
                `${loggedInNumber}@s.whatsapp.net`,
                {
                  text: t("onHelp"),
                },
                { quoted: msg },
              )
            : msg.args.forEach(async (arg) => {
                switch (arg.trim().toLowerCase()) {
                  case "autoread":
                    autoReadStatus = true;
                    updateConfig("autoReadStatus", true);
                    logCuy(t("featureOnLog", t("featAutoread")), "blue");
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      { text: t("featureOn", t("featAutoread")) },
                      { quoted: msg },
                    );
                    break;
                  case "autolike":
                    autoLikeStatus = true;
                    updateConfig("autoLikeStatus", true);
                    logCuy(t("featureOnLog", t("featAutolike")), "blue");
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      { text: t("featureOn", t("featAutolike")) },
                      { quoted: msg },
                    );
                    break;
                  case "dlmedia":
                    downloadMediaStatus = true;
                    updateConfig("downloadMediaStatus", true);
                    logCuy(t("featureOnLog", t("featDlmedia")), "blue");
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      { text: t("featureOn", t("featDlmedia")) },
                      { quoted: msg },
                    );
                    break;
                  case "sensornomor":
                  case "sensornumber":
                    sensorNomor = true;
                    updateConfig("sensorNomor", true);
                    logCuy(t("featureOnLog", t("featSensornomor")), "blue");
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      { text: t("featureOn", t("featSensornomor")) },
                      { quoted: msg },
                    );
                    break;
                  case "antitelpon":
                  case "anticall":
                    antiTelpon = true;
                    updateConfig("antiTelpon", true);
                    logCuy(t("featureOnLog", t("featAntitelpon")), "blue");
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      { text: t("featureOn", t("featAntitelpon")) },
                      { quoted: msg },
                    );
                    break;
                  case "kickstory":
                    autoKickStory = true;
                    updateConfig("autoKickStory", true);
                    logCuy(t("featureOnLog", t("featKickstory")), "blue");
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      { text: t("featureOn", t("featKickstory")) },
                      { quoted: msg },
                    );
                    break;
                  default:
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      {
                        text: t("invalidFeatureArg", arg),
                      },
                      { quoted: msg },
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
                  text: t("offHelp"),
                },
                { quoted: msg },
              )
            : msg.args.forEach(async (arg) => {
                switch (arg.trim().toLowerCase()) {
                  case "autoread":
                    autoReadStatus = false;
                    updateConfig("autoReadStatus", false);
                    logCuy(t("featureOffLog", t("featAutoread")), "blue");
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      { text: t("featureOff", t("featAutoread")) },
                      { quoted: msg },
                    );
                    break;
                  case "autolike":
                    autoLikeStatus = false;
                    updateConfig("autoLikeStatus", false);
                    logCuy(t("featureOffLog", t("featAutolike")), "blue");
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      { text: t("featureOff", t("featAutolike")) },
                      { quoted: msg },
                    );
                    break;
                  case "dlmedia":
                    downloadMediaStatus = false;
                    updateConfig("downloadMediaStatus", false);
                    logCuy(t("featureOffLog", t("featDlmedia")), "blue");
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      { text: t("featureOff", t("featDlmedia")) },
                      { quoted: msg },
                    );
                    break;
                  case "sensornomor":
                  case "sensornumber":
                    sensorNomor = false;
                    updateConfig("sensorNomor", false);
                    logCuy(t("featureOffLog", t("featSensornomor")), "blue");
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      { text: t("featureOff", t("featSensornomor")) },
                      { quoted: msg },
                    );
                    break;
                  case "antitelpon":
                  case "anticall":
                    antiTelpon = false;
                    updateConfig("antiTelpon", false);
                    logCuy(t("featureOffLog", t("featAntitelpon")), "blue");
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      { text: t("featureOff", t("featAntitelpon")) },
                      { quoted: msg },
                    );
                    break;
                  case "kickstory":
                    autoKickStory = false;
                    updateConfig("autoKickStory", false);
                    logCuy(t("featureOffLog", t("featKickstory")), "blue");
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      { text: t("featureOff", t("featKickstory")) },
                      { quoted: msg },
                    );
                    break;
                  default:
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      {
                        text: t("invalidFeatureArg", arg),
                      },
                      { quoted: msg },
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
                  text: t("addHelp"),
                },
                { quoted: msg },
              )
            : msg.args.forEach(async (arg) => {
                const [list, data] = arg.trim().split(" ");
                if (list === "emojis") {
                  const emojiSegments = data ? [...new Intl.Segmenter().segment(data)].map(s => s.segment) : [];
                  if (!data || emojiSegments.length === 0) {
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      {
                        text: t("emojiRequired", "#add"),
                      },
                      { quoted: msg },
                    );
                    return;
                  }
                  if (emojiSegments.length > 1) {
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      {
                        text: t("emojiOnlyOne", "#add"),
                      },
                      { quoted: msg },
                    );
                    return;
                  }
                  if (!emojis.includes(data)) {
                    emojis.push(data);
                    updateConfig("emojis", emojis);
                    logCuy(t("emojiAddedLog", data), "blue");
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      {
                        text: t("emojiAdded", data),
                      },
                      { quoted: msg },
                    );
                  } else {
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      { text: t("emojiExists", data) },
                      { quoted: msg },
                    );
                  }
                } else if (list === "blacklist") {
                  const isValid = await validateNumber(
                    "#add",
                    t("actionAdd"),
                    t("prepTo"),
                    data,
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
                    logCuy(t("numberAddedLog", displayNumber, "blacklist"), "blue");
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      {
                        text: t("numberAdded", displayNumber, "blacklist"),
                      },
                      { quoted: msg },
                    );
                  } else {
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      { text: t("numberExists", displayNumber, "blacklist") },
                      { quoted: msg },
                    );
                  }
                } else if (list === "whitelist") {
                  const isValid = await validateNumber(
                    "#add",
                    t("actionAdd"),
                    t("prepTo"),
                    data,
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
                    logCuy(t("numberAddedLog", displayNumber, "whitelist"), "blue");
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      {
                        text: t("numberAdded", displayNumber, "whitelist"),
                      },
                      { quoted: msg },
                    );
                  } else {
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      { text: t("numberExists", displayNumber, "whitelist") },
                      { quoted: msg },
                    );
                  }
                } else {
                  await sock.sendMessage(
                    `${loggedInNumber}@s.whatsapp.net`,
                    {
                      text: t("invalidListArg", arg),
                    },
                    { quoted: msg },
                  );
                }
              });
          break;
        case "remove":
          msg.args[0].trim() === ""
            ? await sock.sendMessage(
                `${loggedInNumber}@s.whatsapp.net`,
                {
                  text: t("removeHelp"),
                },
                { quoted: msg },
              )
            : msg.args.forEach(async (arg) => {
                const [list, data] = arg.trim().split(" ");
                if (list === "emojis") {
                  const emojiSegments = data ? [...new Intl.Segmenter().segment(data)].map(s => s.segment) : [];
                  if (!data || emojiSegments.length === 0) {
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      {
                        text: t("emojiRequired", "#remove"),
                      },
                      { quoted: msg },
                    );
                    return;
                  }
                  if (emojiSegments.length > 1) {
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      {
                        text: t("emojiOnlyOne", "#remove"),
                      },
                      { quoted: msg },
                    );
                    return;
                  }
                  if (emojis.length === 1) {
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      {
                        text: t("emojiLast"),
                      },
                      { quoted: msg },
                    );
                    return;
                  }
                  if (emojis.includes(data)) {
                    emojis = emojis.filter((n) => n !== data);
                    updateConfig("emojis", emojis);
                    logCuy(t("emojiRemovedLog", data), "blue");
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      {
                        text: t("emojiRemoved", data),
                      },
                      { quoted: msg },
                    );
                  } else {
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      {
                        text: t("emojiNotFound", data),
                      },
                      { quoted: msg },
                    );
                  }
                } else if (list === "blacklist") {
                  const isValid = await validateNumber(
                    "#remove",
                    t("actionRemove"),
                    t("prepFrom"),
                    data,
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
                    logCuy(t("numberRemovedLog", displayNumber, "blacklist"), "blue");
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      {
                        text: t("numberRemoved", displayNumber, "blacklist"),
                      },
                      { quoted: msg },
                    );
                  } else {
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      {
                        text: t("numberNotFound", displayNumber, "blacklist"),
                      },
                      { quoted: msg },
                    );
                  }
                } else if (list === "whitelist") {
                  const isValid = await validateNumber(
                    "#remove",
                    t("actionRemove"),
                    t("prepFrom"),
                    data,
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
                    logCuy(t("numberRemovedLog", displayNumber, "whitelist"), "blue");
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      {
                        text: t("numberRemoved", displayNumber, "whitelist"),
                      },
                      { quoted: msg },
                    );
                  } else {
                    await sock.sendMessage(
                      `${loggedInNumber}@s.whatsapp.net`,
                      {
                        text: t("numberNotFound", displayNumber, "whitelist"),
                      },
                      { quoted: msg },
                    );
                  }
                } else {
                  await sock.sendMessage(
                    `${loggedInNumber}@s.whatsapp.net`,
                    {
                      text: t("invalidListArg", arg),
                    },
                    { quoted: msg },
                  );
                }
              });
          break;
        case "menu":
          const menuMessage = t("menu");

          await sock.sendMessage(
            `${loggedInNumber}@s.whatsapp.net`,
            { text: menuMessage },
            { quoted: msg },
          );
          break;
        case "viewonce":
          if (msg.isQuoted && msg.quoted && msg.quoted.quotedMessage) {
            if (msg.quoted.quotedMessage.imageMessage) {
              let buffer = await downloadMediaMessage(
                {
                  message: {
                    imageMessage: msg.quoted.quotedMessage.imageMessage,
                  },
                  key: msg.quoted.key,
                },
                "buffer",
                {},
                {
                  logger: pino({ level: "fatal" }),
                },
              );

              await sock.sendMessage(
                `${loggedInNumber}@s.whatsapp.net`,
                {
                  image: Buffer.from(buffer),
                },
                { quoted: msg },
              );

              logCuy(t("viewonceImageLog"), "blue");

              buffer = null;
            } else if (msg.quoted.quotedMessage.videoMessage) {
              let buffer = await downloadMediaMessage(
                {
                  message: {
                    videoMessage: msg.quoted.quotedMessage.videoMessage,
                  },
                  key: msg.quoted.key,
                },
                "buffer",
                {},
                {
                  logger: pino({ level: "fatal" }),
                },
              );

              await sock.sendMessage(
                `${loggedInNumber}@s.whatsapp.net`,
                {
                  video: Buffer.from(buffer),
                },
                { quoted: msg },
              );

              logCuy(t("viewonceVideoLog"), "blue");

              buffer = null;
            } else if (msg.quoted.quotedMessage.audioMessage) {
              let buffer = await downloadMediaMessage(
                {
                  message: {
                    audioMessage: msg.quoted.quotedMessage.audioMessage,
                  },
                  key: msg.quoted.key,
                },
                "buffer",
                {},
                {
                  logger: pino({ level: "fatal" }),
                },
              );

              await sock.sendMessage(
                `${loggedInNumber}@s.whatsapp.net`,
                {
                  audio: Buffer.from(buffer),
                },
                { quoted: msg },
              );

              logCuy(t("viewonceAudioLog"), "blue");

              buffer = null;
            } else {
              await sock.sendMessage(
                `${loggedInNumber}@s.whatsapp.net`,
                {
                  text: t("viewonceInvalid"),
                },
                { quoted: msg },
              );
              logCuy(t("viewonceInvalid"), "yellow");
            }
          } else {
            await sock.sendMessage(
              `${loggedInNumber}@s.whatsapp.net`,
              {
                text: t("viewonceNoQuote"),
              },
              { quoted: msg },
            );
          }
          break;
        case "info":
          const infoMessage = t("info", {
            autoReadStatus,
            autoLikeStatus,
            downloadMediaStatus,
            sensorNomor,
            antiTelpon,
            autoKickStory,
          });

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
              ? t("blacklistList", formatList(blackList))
              : t("blacklistEmpty");
          const whitelistMessage =
            whiteList.length > 0
              ? t("whitelistList", formatList(whiteList))
              : t("whitelistEmpty");
          const emojisMessage =
            emojis.length > 0
              ? t("emojisList", formatEmojiList(emojis))
              : t("emojisEmpty");
          const listMessage =
            "\n\n" +
            blacklistMessage +
            "\n\n" +
            whitelistMessage +
            "\n\n" +
            emojisMessage +
            t("infoFooter");

          await sock.sendMessage(
            `${loggedInNumber}@s.whatsapp.net`,
            { text: infoMessage + listMessage },
            { quoted: msg },
          );
          break;
        case "lang": {
          const targetLang = msg.args[0].trim().toLowerCase();
          if (targetLang !== "id" && targetLang !== "en") {
            await sock.sendMessage(
              `${loggedInNumber}@s.whatsapp.net`,
              { text: t("langHelp", lang) },
              { quoted: msg },
            );
            break;
          }
          lang = targetLang;
          updateConfig("language", lang);
          logCuy(t("langChangedLog", lang), "blue");
          await sock.sendMessage(
            `${loggedInNumber}@s.whatsapp.net`,
            { text: t("langChanged", lang) },
            { quoted: msg },
          );
          break;
        }
        case "poststory": {
          const totalContacts = Object.keys(contacts).length;

          if (statusPosterBusy.value) {
            await sock.sendMessage(
              `${loggedInNumber}@s.whatsapp.net`,
              { text: t("postStoryBusy") },
              { quoted: msg },
            );
            break;
          }

          // pisahkan teks dan daftar nomor: #poststory teksnya | nomor1,nomor2
          // segmen terakhir setelah | dianggap daftar nomor hanya jika ada angkanya
          const rawText = msg.text.replace(/^\S+/, "").trim();
          let segments = rawText.split("|").map((s) => s.trim());
          let targetNums = [];
          let invalidTarget = "";
          if (segments.length > 1) {
            const last = segments[segments.length - 1];
            if (/\d/.test(last)) {
              const nums = last
                .split(",")
                .map((n) => n.replace(/\D/g, ""))
                .filter((n) => n.length > 5);
              if (nums.length > 0) {
                targetNums = nums;
                segments = segments.slice(0, -1);
              } else {
                invalidTarget = last;
              }
            }
          }
          const contentText = segments.join(" | ").trim();

          if (invalidTarget) {
            await sock.sendMessage(
              `${loggedInNumber}@s.whatsapp.net`,
              { text: t("postStoryInvalidTarget", invalidTarget) },
              { quoted: msg },
            );
            break;
          }

          // tentukan target: default semua kontak, atau nomor tertentu
          let targetJids;
          if (targetNums.length > 0) {
            targetJids = targetNums.map((n) => `${n}@s.whatsapp.net`);
          } else if (totalContacts === 0) {
            await sock.sendMessage(
              `${loggedInNumber}@s.whatsapp.net`,
              { text: t("postStoryNoContacts") },
              { quoted: msg },
            );
            break;
          } else {
            targetJids = Object.keys(contacts).map((n) => `${n}@s.whatsapp.net`);
          }

          // sumber konten: media yang dikirim/reply, audio yang direply, atau teks
          let content = null;
          const selfImage = msg.message.imageMessage;
          const selfVideo = msg.message.videoMessage;
          const quotedImage = msg.quoted?.quotedMessage?.imageMessage;
          const quotedVideo = msg.quoted?.quotedMessage?.videoMessage;
          const quotedAudio = msg.quoted?.quotedMessage?.audioMessage;

          try {
            if (selfImage || selfVideo) {
              // foto/video yang dikirim langsung dengan caption #poststory
              const buffer = await downloadMediaMessage(
                msg,
                "buffer",
                {},
                { logger: pino({ level: "fatal" }) },
              );
              content = {
                [selfImage ? "image" : "video"]: Buffer.from(buffer),
                caption: contentText || undefined,
              };
            } else if (quotedImage || quotedVideo) {
              const buffer = await downloadMediaMessage(
                {
                  message: {
                    [quotedImage ? "imageMessage" : "videoMessage"]:
                      quotedImage || quotedVideo,
                  },
                  key: msg.quoted.key,
                },
                "buffer",
                {},
                { logger: pino({ level: "fatal" }) },
              );
              content = {
                [quotedImage ? "image" : "video"]: Buffer.from(buffer),
                caption: contentText || undefined,
              };
            } else if (quotedAudio) {
              const buffer = await downloadMediaMessage(
                {
                  message: { audioMessage: quotedAudio },
                  key: msg.quoted.key,
                },
                "buffer",
                {},
                { logger: pino({ level: "fatal" }) },
              );
              content = { audio: Buffer.from(buffer) };
            } else if (contentText) {
              content = { text: contentText };
            }
          } catch (error) {
            logCuy(`Error downloading media: ${error}`, "red");
            await sock.sendMessage(
              `${loggedInNumber}@s.whatsapp.net`,
              { text: t("postStoryFail", error?.message || error) },
              { quoted: msg },
            );
            break;
          }

          if (!content) {
            await sock.sendMessage(
              `${loggedInNumber}@s.whatsapp.net`,
              { text: t("postStoryHelp") },
              { quoted: msg },
            );
            break;
          }

          statusPosterBusy.value = true;
          try {
            await postStatus(sock, content, targetJids);
            const kind = content.text
              ? t("postStoryKindText")
              : content.image
                ? t("postStoryKindImage")
                : content.audio
                  ? t("postStoryKindAudio")
                  : t("postStoryKindVideo");
            logCuy(
              t("postStorySuccessLog", kind, targetJids.length),
              "green",
            );
            await sock.sendMessage(
              `${loggedInNumber}@s.whatsapp.net`,
              { text: t("postStorySuccess", targetJids.length, totalContacts) },
              { quoted: msg },
            );
          } catch (error) {
            logCuy(`Error posting story: ${error}`, "red");
            await sock.sendMessage(
              `${loggedInNumber}@s.whatsapp.net`,
              { text: t("postStoryFail", error?.message || error) },
              { quoted: msg },
            );
          } finally {
            statusPosterBusy.value = false;
          }
          break;
        }
        case "listkontak": {
          const totalContacts = Object.keys(contacts).length;
          const searchArg = (msg.args[0] || "").trim().toLowerCase();

          if (totalContacts === 0) {
            await sock.sendMessage(
              `${loggedInNumber}@s.whatsapp.net`,
              { text: t("postStoryNoContacts") },
              { quoted: msg },
            );
            break;
          }

          if (searchArg) {
            // cari kontak berdasarkan nama atau nomor
            const matches = Object.entries(contacts)
              .filter(
                ([number, c]) =>
                  number.includes(searchArg.replace(/\D/g, "") || "\u0000") ||
                  (c.name || "").toLowerCase().includes(searchArg),
              )
              .slice(0, 20);
            if (matches.length === 0) {
              await sock.sendMessage(
                `${loggedInNumber}@s.whatsapp.net`,
                { text: t("contactSearchEmpty", searchArg) },
                { quoted: msg },
              );
            } else {
              const listText = matches
                .map(([number, c]) => `\u25CF ${c.name || "-"} : ${number}`)
                .join("\n");
              await sock.sendMessage(
                `${loggedInNumber}@s.whatsapp.net`,
                { text: t("contactSearchResult", searchArg, matches.length, listText) },
                { quoted: msg },
              );
            }
          } else {
            await sock.sendMessage(
              `${loggedInNumber}@s.whatsapp.net`,
              { text: t("contactCount", totalContacts) },
              { quoted: msg },
            );
          }
          break;
        }
      }
    }

    if (autoKickStory) {
      if (msg.message.groupStatusMentionMessage && !msg.key.fromMe) {
        const groupId = msg.key.remoteJid;
        const participant =
          msg.key.participantAlt && !msg.key.participantAlt.includes("@lid")
            ? msg.key.participantAlt
            : msg.key.participant && !msg.key.participant.includes("@lid")
            ? msg.key.participant
            : msg.key.participant || msg.key.participantAlt;

        if (!participant) return;

        let resolvedParticipant = participant;
        if (participant.includes("@lid")) {
          const pn = await sock.signalRepository.lidMapping.getPNForLID(participant).catch(() => null);
          if (pn) resolvedParticipant = pn;
        }

        const groupMetadata = await sock.groupMetadata(groupId);
        const groupName = groupMetadata.subject;
        const botNumber = sock.user.id.split(":")[0] + "@s.whatsapp.net";
        const isAdmin = groupMetadata.participants.some(
          (member) => member.phoneNumber === botNumber && member.admin !== null,
        );

        if (isAdmin) {
          await sock.sendMessage(
            groupId,
            {
              text: t("kickTagMsg", resolvedParticipant.split("@")[0]),
              mentions: [resolvedParticipant],
            },
            { quoted: msg },
          );

          await sock.groupParticipantsUpdate(groupId, [resolvedParticipant], "remove");
          logCuy(t("kickLog", groupName), "red");
        } else {
          // await sock.sendMessage(
          //   `${loggedInNumber}@s.whatsapp.net`,
          //   {
          //     text: `terdeteksi ada yang tag grup di story, namun bot bukan admin jadi tidak bisa kick.`,
          //   },
          //   { quoted: msg }
          // );
          logCuy(t("notAdminLog", groupName), "yellow");
        }
      }
    }

    // status
    if (
      msg.key.remoteJid === "status@broadcast" &&
      autoReadStatus
    ) {
      if (msg.message.reactionMessage) return;

      if (msg.message.protocolMessage) {
        logCuy(t("statusDeletedLog", msg.pushName || "?"), "red");
        return;
      }

      let senderJid =
        (msg.key.participant && !msg.key.participant.includes("@lid") ? msg.key.participant : null) ||
        (msg.key.participantAlt && !msg.key.participantAlt.includes("@lid") ? msg.key.participantAlt : null) ||
        (msg.key.remoteJidAlt && !msg.key.remoteJidAlt.includes("@lid") ? msg.key.remoteJidAlt : null) ||
        msg.key.participant ||
        msg.key.participantAlt ||
        msg.key.remoteJidAlt ||
        null;

      if (!senderJid) return;

      const originalParticipant = msg.key.participant || msg.key.participantAlt || null;

      if (senderJid.includes("@lid")) {
        const pnJid = await sock.signalRepository.lidMapping.getPNForLID(senderJid).catch(() => null);
        if (pnJid) senderJid = pnJid;
      }

      if (jidNormalizedUser(senderJid) === jidNormalizedUser(sock.user.id)) return;

      let senderNumber = senderJid.split("@")[0].split(":")[0];
      let displaySendernumber = senderNumber;
      const senderName = msg.pushName || t("unknown");

      if (sensorNomor) {
        displaySendernumber =
          displaySendernumber.slice(0, 3) +
          "****" +
          displaySendernumber.slice(-2);
      }

      if (blackList.includes(senderNumber)) {
        logCuy(t("statusBlacklistedLog", senderName, displaySendernumber), "yellow");
        return;
      }

      if (whiteList.length > 0 && !whiteList.includes(senderNumber)) {
        logCuy(
          t("statusNotWhitelistedLog", senderName, displaySendernumber),
          "yellow",
        );
        return;
      }

      const myself = jidNormalizedUser(sock.user.id);
      const emojiToReact = emojis[Math.floor(Math.random() * emojis.length)];

      {
        const receiptParticipant = originalParticipant || senderJid;
        await sock.sendReceipt(msg.key.remoteJid, receiptParticipant, [msg.key.id], 'read');

        if (autoLikeStatus) {
          await sock.sendMessage(
            msg.key.remoteJid,
            {
              react: {
                key: {
                  remoteJid: "status@broadcast",
                  id: msg.key.id,
                  participant: originalParticipant || senderJid,
                  fromMe: false,
                },
                text: emojiToReact,
              },
            },
            { statusJidList: [senderJid, myself] },
          );
        }

        logCuy(
          t("statusViewedLog", senderName, displaySendernumber, autoLikeStatus),
          "green",
        );

        const targetNumber = loggedInNumber;
        let messageContent = t("statusViewedMsg", senderName, displaySendernumber, autoLikeStatus);
        let caption =
          msg.message.imageMessage?.caption ||
          msg.message.videoMessage?.caption ||
          msg.message.extendedTextMessage?.text ||
          t("noCaption");

          if (downloadMediaStatus) {
            if (msg.type === "imageMessage" || msg.type === "videoMessage") {
              let mediaType = msg.type === "imageMessage" ? "image" : "video";
              messageContent = t(
                "mediaStatusViewedMsg",
                mediaType === "image" ? t("mediaImage") : t("mediaVideo"),
                senderName,
                displaySendernumber,
                autoLikeStatus,
              );

              try {
                let buffer = await downloadMediaMessage(
                  msg,
                  "buffer",
                  {},
                  {
                    logger: pino({ level: "fatal" }),
                  },
                );

                await sock.sendMessage(`${targetNumber}@s.whatsapp.net`, {
                  [mediaType]: Buffer.from(buffer),
                  caption: t("withCaption", messageContent, caption),
                });

                buffer = null;
              } catch (error) {
                logCuy(`Error uploading media: ${error}`, "red");
                await sock.sendMessage(`${targetNumber}@s.whatsapp.net`, {
                  text: t(
                    "mediaUploadFailMsg",
                    messageContent,
                    mediaType === "image" ? t("mediaImage") : t("mediaVideo"),
                    senderName,
                    displaySendernumber,
                  ),
                });
              }
            } else if (msg.type === "audioMessage") {
              messageContent = t(
                "audioStatusViewedMsg",
                senderName,
                displaySendernumber,
                autoLikeStatus,
              );

              await sock.sendMessage(`${targetNumber}@s.whatsapp.net`, {
                text: messageContent,
              });

              try {
                let buffer = await downloadMediaMessage(
                  msg,
                  "buffer",
                  {},
                  {
                    logger: pino({ level: "fatal" }),
                  },
                );

                await sock.sendMessage(`${targetNumber}@s.whatsapp.net`, {
                  audio: Buffer.from(buffer),
                  caption: "",
                });

                buffer = null;
              } catch (error) {
                logCuy(`Error uploading media: ${error}`, "red");
                await sock.sendMessage(`${targetNumber}@s.whatsapp.net`, {
                  text: t("audioUploadFailMsg", senderName, displaySendernumber),
                });
              }
            } else {
              messageContent = t(
                "textStatusViewedMsg",
                senderName,
                displaySendernumber,
                autoLikeStatus,
                caption,
              );

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
