// Bahasa Indonesia — teks asli bot (sumber kebenaran untuk fallback)
module.exports = {
  // pairing / login (terminal)
  loginPrompt:
    "Halo sepertinya kamu belum login, Mau login wangsaf pakai pairing code?\nSilahkan balas dengan (y/n)\nketik y untuk setuju atau ketik n untuk login menggunakan qrcode",
  pairingQuestion:
    "\nApakah kamu ingin menggunakan pairing code untuk login ke wangsaf? (y/n): ",
  enterNumberNote:
    "Wokeh kalau gitu silahkan masukkan nomor wangsafmu!\ncatatan : gunakan format internasional lengkap dengan kode negara, contoh 628123456789",
  enterNumberPrompt: "\nMasukkan nomor wangsaf Anda: ",
  numberDigitsOnly:
    "Nomor harus berupa angka!\nSilakan masukkan nomor wangsaf kembali!.",
  numberIntlFormat:
    "Nomor harus menggunakan format internasional lengkap dengan kode negara!\nContoh : Indonesia 628123456789, Malaysia 60123456789\nSilakan masukkan nomor wangsaf kembali!.",
  pairingCodeNotice: "\nCek notifikasi wangsafmu dan masukin kode login wangsaf:",
  qrInstructions:
    "Buka wangsafmu lalu klik titik tiga di kanan atas kemudian klik perangkat tertaut setelah itu Silahkan scan QR code dibawah untuk login ke wangsaf",
  invalidInput: 'Input tidak valid. Silakan masukkan "y" atau "n".',

  // koneksi (terminal)
  reconnecting: "Mencoba menghubungkan ke wangsaf...\n",
  loggedOut:
    "Nampaknya kamu telah logout dari wangsaf, silahkan login ke wangsaf kembali!",
  connected: "Berhasil Terhubung ke wangsaf",
  loggedInConsole: "kamu berhasil login dengan nomor:",
  botActiveConsole:
    "Bot sudah aktif!\n\nSelamat menikmati fitur auto read story whatsapp by",

  // pesan welcome (WhatsApp)
  welcome: ({
    number,
    autoReadStatus,
    autoLikeStatus,
    downloadMediaStatus,
    sensorNomor,
    antiTelpon,
    autoKickStory,
  }) => {
    const a = (v) => (v ? "*Aktif*" : "*Nonaktif*");
    return `Bot *AutoReadStoryWhatsApp* Aktif!
Kamu berhasil login dengan nomor: ${number}

info status fitur:
- Auto Read Status: ${a(autoReadStatus)}
- Auto Like Status: ${a(autoLikeStatus)}
- Download Media Status: ${a(downloadMediaStatus)}
- Sensor Nomor: ${a(sensorNomor)}
- Anti Telpon: ${a(antiTelpon)}
- Auto Kick tag Story: ${a(autoKickStory)}

Ketik *#menu* untuk melihat menu perintah yang tersedia.

SC : https://github.com/jauhariel/AutoReadStoryWhatsapp`;
  },

  // validateNumber
  numberMissing: (commandname, type, sc) =>
    `Nomor harus diisi.\ncontoh ketik :\n\`${commandname} blacklist 628123456789\`\n\nArgumen yang tersedia:\n\n\`${commandname} blacklist nomornya\`\nuntuk ${type} nomor ${sc} blacklist\n\n\`${commandname} whitelist nomornya\`\nuntuk ${type} nomor ${sc} whitelist`,
  numberInvalid: (commandname, type, sc) =>
    `Nomor harus berupa angka.\ncontoh ketik :\n\`${commandname} blacklist 628123456789\`\n\nArgumen yang tersedia:\n\n\`${commandname} blacklist nomornya\`\nuntuk ${type} nomor ${sc} blacklist\n\n\`${commandname} whitelist nomornya\`\nuntuk ${type} nomor ${sc} whitelist`,
  actionAdd: "menambahkan",
  actionRemove: "menghapus",
  prepTo: "ke",
  prepFrom: "dari",

  // nama fitur (untuk log & balasan on/off)
  featAutoread: "Auto Read Status",
  featAutolike: "Auto Like Status",
  featDlmedia: "Download Media Status",
  featSensornomor: "Sensor Nomor",
  featAntitelpon: "Anti-telpon",
  featKickstory: "Auto Kick Tag Grup di Story",

  featureOnLog: (name) => `Kamu mengaktifkan fitur ${name}`,
  featureOffLog: (name) => `Kamu mematikan fitur ${name}`,
  featureOn: (name) => `${name} aktif`,
  featureOff: (name) => `${name} nonaktif`,

  invalidFeatureArg: (arg) =>
    `Argumen tidak valid: ${arg}. Pilihan yang tersedia: autoread, autolike, dlmedia, sensornomor, kickstory dan antitelpon`,
  invalidListArg: (arg) =>
    `Argumen tidak valid: ${arg}. Pilihan yang tersedia: blacklist, whitelist, emojis`,

  // bantuan #on / #off / #add / #remove
  onHelp: `mana argumennya ?\ncontoh ketik : \`#on autolike\`\n\nArgumen yang tersedia:\n\n\`#on autoread\`\nuntuk mengaktifkan fitur autoread story\n\n\`#on autolike\`\nuntuk mengaktifkan fitur autolike story\n\n\`#on dlmedia\`\nuntuk mengaktifkan fitur download media(foto,video, dan audio) dari story\n\n\`#on sensornomor\`\nuntuk mengaktifkan sensor nomor\n\n\`#on antitelpon\`\nuntuk mengaktifkan anti-telpon\n\n\`#on kickstory\`\nuntuk mengaktifkan auto kick story grup`,
  offHelp: `mana argumennya ?\ncontoh ketik : \`#off autolike\`\n\nArgumen yang tersedia:\n\n\`#off autoread\`\nuntuk menonaktifkan fitur autoread story\n\n\`#off autolike\`\nuntuk menonaktifkan fitur autolike story\n\n\`#off dlmedia\`\nuntuk menonaktifkan fitur download media(foto,video, dan audio) dari story\n\n\`#off sensornomor\`\nuntuk menonaktifkan sensor nomor\n\n\`#off antitelpon\`\nuntuk menonaktifkan anti-telpon\n\n\`#off kickstory\`\nuntuk menonaktifkan auto kick story grup`,
  addHelp: `mana argumennya ?\ncontoh ketik :\n\`#add blacklist 628123456789\`\n\nArgumen yang tersedia:\n\n\`#add blacklist nomornya\`\nuntuk menambahkan nomor ke blacklist\n\n\`#add whitelist nomornya\`\nuntuk menambahkan nomor ke whitelist\n\n\`#add emojis emojinya\`\nuntuk menambahkan emoji ke emojis`,
  removeHelp: `mana argumennya ?\ncontoh ketik :\n\`#remove blacklist 628123456789\`\n\nArgumen yang tersedia:\n\n\`#remove blacklist nomornya\`\nuntuk menghapus nomor dari blacklist\n\n\`#remove whitelist nomornya\`\nuntuk menghapus nomor dari whitelist\n\n\`#remove emojis emojinya\`\nuntuk menghapus emoji dari daftar emojis`,

  // emojis
  emojiRequired: (cmd) =>
    `emoji harus diisi.\ncontoh ketik :\n\`${cmd} emojis 👍\``,
  emojiOnlyOne: (cmd) =>
    `hanya boleh mengisi 1 emoji.\ncontoh ketik :\n\`${cmd} emojis 👍\``,
  emojiAddedLog: (e) => `Kamu menambahkan emoji ${e} ke daftar emojis`,
  emojiAdded: (e) => `emoji ${e} berhasil ditambahkan ke daftar emojis`,
  emojiExists: (e) => `emoji ${e} sudah ada di daftar emojis`,
  emojiLast:
    "Tidak bisa menghapus emoji terakhir. Harus ada minimal satu emoji.\n\nKetik `#info` untuk mengecek daftar emoji yang tersedia",
  emojiRemovedLog: (e) => `Kamu menghapus emoji ${e} dari emojis`,
  emojiRemoved: (e) => `emoji ${e} berhasil dihapus dari daftar emojis`,
  emojiNotFound: (e) =>
    `emoji ${e} tidak ada di daftar emojis\n\nKetik \`#info\` untuk mengecek daftar emoji yang tersedia`,

  // blacklist / whitelist
  numberAddedLog: (num, list) => `Kamu menambahkan nomor ${num} ke ${list}`,
  numberAdded: (num, list) => `Nomor ${num} berhasil ditambahkan ke ${list}`,
  numberExists: (num, list) => `Nomor ${num} sudah ada di ${list}`,
  numberRemovedLog: (num, list) => `Kamu menghapus nomor ${num} dari ${list}`,
  numberRemoved: (num, list) => `Nomor ${num} berhasil dihapus dari ${list}`,
  numberNotFound: (num, list) =>
    `Nomor ${num} tidak ada di ${list}\n\nKetik \`#info\` untuk mengecek daftar nomor yang tersedia`,

  // menu
  menu: `Daftar Menu:
contoh penggunaan: #on autolike

Perintah On:
\`#on autoread\`
Mengaktifkan fitur autoread story

\`#on autolike\`
Mengaktifkan fitur autolike story

\`#on dlmedia\`
Mengaktifkan fitur download media (foto, video, dan audio) dari story

\`#on sensornomor\`
Mengaktifkan sensor nomor

\`#on antitelpon\`
Mengaktifkan anti telpon

\`#on kickstory\`
Mengaktifkan auto kick story tag grup

Perintah Off:
\`#off autoread\`
Menonaktifkan fitur autoread story

\`#off autolike\`
Menonaktifkan fitur autolike story

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
Menampilkan informasi status fitur, daftar nomor/emoji yang ada di blacklist, whitelist dan emojis

Perintah Viewonce:
\`#viewonce\`
Mengambil/download foto, video, audio dari pesan sementara/sekali liat dari yang kamu reply

Perintah Language:
\`#lang en\`
Mengubah bahasa pesan bot dan terminal (id/en)

Perintah Story:
\`#poststory teksnya\`
Posting story berupa teks

\`#poststory\` (reply foto/video)
Posting story foto/video dari pesan yang kamu reply

\`#poststory teks | nomor1,nomor2\`
Posting story yang hanya bisa dilihat oleh nomor yang kamu daftarkan

Perintah Kontak:
\`#listkontak\`
Menampilkan jumlah kontak yang sudah tersinkron ke bot

\`#listkontak namanya\`
Mencari kontak berdasarkan nama atau nomor
`,

  // viewonce
  viewonceImageLog: "Berhasil mengambil gambar sekali liat dari yang kamu reply",
  viewonceVideoLog: "Berhasil mengambil video sekali liat dari yang kamu reply",
  viewonceAudioLog: "Berhasil mengambil audio sekali liat dari yang kamu reply",
  viewonceInvalid:
    "Pesan yang kamu reply bukan pesan yang bertipe foto, video, audio dan sekali liat",
  viewonceNoQuote: "Reply/balas pesan sekali liat dengan perintah #viewonce",

  // info
  info: ({
    autoReadStatus,
    autoLikeStatus,
    downloadMediaStatus,
    sensorNomor,
    antiTelpon,
    autoKickStory,
  }) => {
    const a = (v) => (v ? "*Aktif*" : "*Nonaktif*");
    return `Informasi Status Fitur:
- Auto Read Status: ${a(autoReadStatus)}
- Auto Like Status: ${a(autoLikeStatus)}
- Download Media Status: ${a(downloadMediaStatus)}
- Sensor Nomor: ${a(sensorNomor)}
- Anti Telpon: ${a(antiTelpon)}
- Auto Kick tag Story: ${a(autoKickStory)}`;
  },
  blacklistList: (list) => `Blacklist:\n${list}`,
  blacklistEmpty: "Blacklist kosong.",
  whitelistList: (list) => `Whitelist:\n${list}`,
  whitelistEmpty: "Whitelist kosong.",
  emojisList: (list) => `Emojis:\n${list}`,
  emojisEmpty: "Emojis kosong.",
  infoFooter: `\n\nKetik \`#add\` untuk menambahkan nomor atau emoji ke blacklist, whitelist, dan emojis\nKetik \`#remove\` untuk menghapus nomor atau emoji dari blacklist, whitelist, dan emojis\nKetik \`#on\` untuk mengaktifkan fitur\nKetik \`#off\` untuk menonaktifkan fitur\nKetik \`#menu\` untuk melihat menu perintah yang tersedia`,

  // #lang
  langHelp: (current) =>
    `bahasa sekarang: *${current}*\ncontoh ketik :\n\`#lang id\` untuk bahasa Indonesia\n\`#lang en\` untuk English`,
  langChangedLog: (lang) => `Bahasa diubah ke: ${lang}`,
  langChanged: (lang) => `Bahasa berhasil diubah ke *${lang}*`,

  // sync kontak
  contactsSavedLog: (added, total) =>
    `Tersinkron ${added} kontak baru (total ${total} kontak tersimpan di contacts.json)`,
  contactsSyncedLog: (total) =>
    `Sinkronisasi kontak selesai! ${total} kontak tersimpan. Fitur #poststory siap digunakan.`,
  contactsSynced: (total) =>
    `✅ Sinkronisasi kontak selesai!\n\n*${total}* kontak dari hp kamu sudah tersimpan di bot.\nSekarang kamu bisa posting story dengan perintah \`#poststory\`\n\nKetik \`#listkontak\` untuk mengecek daftar kontak.\nKetik \`#poststory\` untuk melihat cara pakai.`,

  // #poststory
  postStoryHelp: `Cara pakai *#poststory* :

*1. Post story berupa teks :*
\`#poststory halo semua\`

*2. Post story foto/video :*
Kirim foto/video di chat ini dengan caption \`#poststory\` atau reply foto/video dengan perintah \`#poststory\`
(bisa ditambah caption : \`#poststory captionnya\`)

*3. Post story audio :*
Reply pesan audio/voice note dengan perintah \`#poststory\`

*3. Post story ke kontak tertentu :*
\`#poststory halo | 628123456789,628987654321\`

Catatan :
- Tanpa daftar nomor → story terlihat oleh semua kontak yang tersinkron
- Dengan daftar nomor → story hanya terlihat oleh nomor yang kamu daftarkan
- Ketik \`#listkontak\` untuk mengecek kontak yang sudah tersinkron`,
  postStoryBusy:
    "Masih ada proses posting story yang sedang berjalan, tunggu sebentar lagi ya.",
  postStoryInvalidTarget: (arg) =>
    `Format daftar nomor tidak valid: "${arg}"\ncontoh yang benar :\n\`#poststory halo | 628123456789,628987654321\``,
  postStoryNoContacts:
    "Daftar kontak belum tersinkron.\n\nTunggu beberapa saat setelah login sampai bot mengirim pemberitahuan \"sinkronisasi kontak selesai\", lalu coba lagi.\n\nKetik `#listkontak` untuk mengecek jumlah kontak yang sudah tersinkron.",
  postStoryKindText: "teks",
  postStoryKindImage: "foto",
  postStoryKindVideo: "video",
  postStoryKindAudio: "audio",
  postStorySuccessLog: (kind, count) =>
    `Berhasil posting story ${kind} ke ${count} kontak`,
  postStorySuccess: (targetCount, totalContacts) =>
    `✅ Story berhasil di-post ke *${targetCount}* kontak!${
      targetCount < totalContacts
        ? `\n(hanya nomor yang kamu daftarkan yang bisa melihat story ini)`
        : `\n(semua kontak tersinkron dapat melihat story ini)`
    }`,
  postStoryFail: (err) => `❌ Gagal posting story :\n${err}`,

  // #listkontak
  contactCount: (total) =>
    `📚 Total *${total}* kontak tersinkron di bot.\n\nKetik \`#listkontak namanya\` untuk mencari kontak berdasarkan nama/nomor.\ncontoh : \`#listkontak budi\` atau \`#listkontak 62812\``,
  contactSearchResult: (query, count, list) =>
    `Hasil pencarian "*${query}*" (${count} kontak, maksimal 20 ditampilkan) :\n\n${list}`,
  contactSearchEmpty: (query) =>
    `Tidak ada kontak yang cocok dengan "*${query}*".`,

  // auto kick story
  kickTagMsg: (n) => `@${n} terdeteksi tag grup di story, kamu akan dikick.`,
  kickLog: (group) =>
    `Kamu mengeluarkan sesorang dari group ${group} karena telah tag grup di story.`,
  notAdminLog: (group) => `Kamu bukan admin di grup ${group} jadi tidak bisa kick.`,

  // pembacaan status
  statusDeletedLog: (name) => `Status dari ${name} telah dihapus.`,
  unknown: "Tidak diketahui",
  statusBlacklistedLog: (name, num) =>
    `${name} (${num}) membuat status tapi karena ada di blacklist. Status tidak akan dilihat.`,
  statusNotWhitelistedLog: (name, num) =>
    `${name} (${num}) membuat status tapi karena tidak ada di whitelist. Status tidak akan dilihat.`,
  statusViewedLog: (name, num, liked) =>
    `Berhasil melihat ${liked ? "dan menyukai " : ""}status dari: ${name} (${num})`,
  statusViewedMsg: (name, num, liked) =>
    `Status dari *${name}* (${num}) telah dilihat ${liked ? "dan disukai" : ""}`,
  noCaption: "Tidak ada caption",
  mediaImage: "gambar",
  mediaVideo: "video",
  mediaStatusViewedMsg: (kind, name, num, liked) =>
    `Status ${kind} dari *${name}* (${num}) telah dilihat ${liked ? "dan disukai" : ""}`,
  withCaption: (content, caption) => `${content} dengan caption : "*${caption}*"`,
  mediaUploadFailMsg: (content, kind, name, num) =>
    `${content} namun Gagal mengunggah media dari status ${kind} dari *${name}* (${num}).`,
  audioStatusViewedMsg: (name, num, liked) =>
    `Status audio dari *${name}* (${num}) telah dilihat ${liked ? "dan disukai" : ""}. Berikut audionya.`,
  audioUploadFailMsg: (name, num) =>
    `Gagal mengunggah audio dari status audio dari *${name}* (${num}).`,
  textStatusViewedMsg: (name, num, liked, caption) =>
    `Status teks dari *${name}* (${num}) telah dilihat ${liked ? "dan disukai" : ""} dengan caption: "*${caption}*"`,
};
