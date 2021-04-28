const Discord = require("discord.js");
const fs = require("fs");
const client = new Discord.Client();
const http = require("http");
const db = require("quick.db");
const moment = require("moment");
const express = require("express");
const ayarlar = require("./ayarlar.json");
const request = require("node-superfetch");
const Canvas = require("canvas");
client.login(process.env.token);
const app = express();
app.get("/", (request, response) => {
  response.sendStatus(200);
});
app.listen(process.env.PORT);
const log = message => {
  console.log(` ${message}`);
};
require("./utils/eventLoader.js")(client);

client.on("ready", () => {
  client.user.setActivity(`Adem Reyzz Bot | a!yardım`);
  console.log(
    `[${moment().format("YYYY-MM-DD HH:mm:ss")}] BOT: ${client.user.username}`
  );
  console.log(
    `[${moment().format("YYYY-MM-DD HH:mm:ss")}] BOT: Şu an ` +
      client.channels.cache.size +
      ` adet kanala, ` +
      client.guilds.cache.size +
      ` adet sunucuya ve ` +
      client.guilds.cache
        .reduce((a, b) => a + b.memberCount, 0)
        .toLocaleString() +
      ` kullanıcıya hizmet veriliyor!`
  );
});

//-------------Bot Eklenince Bir Kmmmla Mesaj Gönderme Komutu ---------------\\

const emmmmbed = new Discord.MessageEmbed()
  .setThumbnail()
  .setImage(
    "https://cdn.discordapp.com/attachments/813881349004984370/826793395677691924/350kb_1.gif"
  )
  .addField(
    `Adem Reyzz | Teşekkürler`,
    `**Selamlar, Ben Adem Reyzz (Adem Reyzz Bot'un Geliştiricisi) Öncelikle Botumuzu Eklediğiniz ve Bize Destek Olduğunuz İçin Sizlere Teşekkürlerimi Sunarım**`
  )
  .addField(
    `Adem Reyzz | Prefix`,
    `**Adem Reyzz Botun Prefixi(ön eki) = \`a!\`\n\n Değiştirebilmek için \`a!prefix\` Yazabilirsiniz.**`
  )
  .addField(
    `Adem Reyzz | Nasıl Kullanılır?`,
    `**Adem Reyzz botun tüm özelliklerinden yararlanabilmek için sadece \`a!yardım\` yazmanız yeterlidir.**`
  )
  .addField(
    `Adem Reyzz | Linkler`,
    `**Sohbet Kanalına y!davet Yazmanız Yeterlidir**`
  )
  .setFooter(`Adem Reyzz | Gelişmiş Türkçe Bot | 2021`)
  .setTimestamp();

client.on("guildCreate", guild => {
  let defaultChannel = "";
  guild.channels.cache.forEach(channel => {
    if (channel.type == "text" && defaultChannel == "") {
      if (channel.permissionsFor(guild.me).has("SEND_MESSAGES")) {
        defaultChannel = channel;
      }
    }
  });

  defaultChannel.send(emmmmbed);
});

//----------------------------------------------------------------\\

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir("./komutlar/", (err, files) => {
  if (err) console.error(err);
  log(`${files.length} komut yüklenecek.`);
  files.forEach(f => {
    let props = require(`./komutlar/${f}`);
    log(`Yüklenen komut: ${props.help.name}.`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      client.aliases.set(alias, props.help.name);
    });
  });
});

client.reload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.load = command => {
  return new Promise((resolve, reject) => {
    try {
      let cmd = require(`./komutlar/${command}`);
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.unload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.elevation = message => {
  if (!message.guild) {
    return;
  }
  let permlvl = 0;
  if (message.member.hasPermission("BAN_MEMBERS")) permlvl = 2;
  if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 3;
  if (message.author.id === ayarlar.sahip) permlvl = 4;
  return permlvl;
};

client.on("guildMemberRemove", async member => {
  const channel = db.fetch(`sayaçKanal_${member.guild.id}`);
  if (db.has(`sayacsayı_${member.guild.id}`) == false) return;
  if (db.has(`sayaçKanal_${member.guild.id}`) == false) return;

  member.guild.channels.cache
    .get(channel)
    .send(
      `📤 **${member.user.tag}** Sunucudan ayrıldı! \`${db.fetch(
        `sayacsayı_${member.guild.id}`
      )}\` üye olmamıza son \`${db.fetch(`sayacsayı_${member.guild.id}`) -
        member.guild.memberCount}\` üye kaldı!`
    );
});
client.on("guildMemberAdd", async member => {
  const channel = db.fetch(`sayaçKanal_${member.guild.id}`);
  if (db.has(`sayacsayı_${member.guild.id}`) == false) return;
  if (db.has(`sayaçKanal_${member.guild.id}`) == false) return;

  member.guild.channels.cache
    .get(channel)
    .send(
      `📥 **${member.user.tag}** Sunucuya Katıldı! \`${db.fetch(
        `sayacsayı_${member.guild.id}`
      )}\` üye olmamıza son \`${db.fetch(`sayacsayı_${member.guild.id}`) -
        member.guild.memberCount}\` üye kaldı!`
    );
});

///////////////////////////////////SA-AS

client.on("message", async msg => {
  const i = await db.fetch(`ssaass_${msg.guild.id}`);
  if (i == "acik") {
    if (
      msg.content.toLowerCase() == "sa" ||
      msg.content.toLowerCase() == "s.a" ||
      msg.content.toLowerCase() == "selamun aleyküm" ||
      msg.content.toLowerCase() == "sea" ||
      msg.content.toLowerCase() == "selam"
    ) {
      try {
        return msg.reply("**Aleyküm Selam Hoşgeldin** 👻");
      } catch (err) {
        console.log(err);
      }
    }
  } else if (i == "kapali") {
  }
  if (!i) return;
});

//////////////afk

const { DiscordAPIError } = require("discord.js");

client.on("message", async message => {
  if (message.author.bot) return;
  if (!message.guild) return;
  if (message.content.includes(`afk`)) return;

  if (await db.fetch(`afk_${message.author.id}`)) {
    db.delete(`afk_${message.author.id}`);
    db.delete(`afk_süre_${message.author.id}`);

    const embed = new Discord.MessageEmbed()

      .setColor("GREEN")
      .setAuthor(message.author.username, message.author.avatarURL)
      .setDescription(`${message.author.username} Artık \`AFK\` Değilsin.`);

    message.channel.send(embed);
  }

  var USER = message.mentions.users.first();
  if (!USER) return;
  var REASON = await db.fetch(`afk_${USER.id}`);

  if (REASON) {
    let süre = await db.fetch(`afk_süre_${USER.id}`);

    const afk = new Discord.MessageEmbed()

      .setColor("GOLD")
      .setDescription(
        `**BU KULLANICI AFK**\n\n**Afk Olan Kullanıcı :** \`${USER.tag}\`\n\n**Sebep :** \`${REASON}\``
      );

    message.channel.send(afk);
  }
});

/////////////////////////////////

client.on("guildDelete", guild => {
  let Crewembed = new Discord.MessageEmbed()

    .setColor("RED")
    .setTitle(" ATILDIM !")
    .addField("Sunucu Adı:", guild.name)
    .addField("Sunucu sahibi", guild.owner)
    .addField("Sunucudaki Kişi Sayısı:", guild.memberCount);

  client.channels.cache.get("LOGKANALİD").send(Crewembed);
});

client.on("guildCreate", guild => {
  let Crewembed = new Discord.MessageEmbed()

    .setColor("GREEN")
    .setTitle("EKLENDİM !")
    .addField("Sunucu Adı:", guild.name)
    .addField("Sunucu sahibi", guild.owner)
    .addField("Sunucudaki Kişi Sayısı:", guild.memberCount);

  client.channels.cache.get("LOGKANALİD").send(Crewembed);
});

///////////////////////////////////REKLAMENLGEL

client.on("message", msg => {
  if (!db.has(`reklam_${msg.guild.id}`)) return;
  const reklam = [
    ".com",
    ".net",
    ".xyz",
    ".tk",
    ".pw",
    ".io",
    ".me",
    ".gg",
    "www.",
    "https",
    "http",
    ".gl",
    ".org",
    ".com.tr",
    ".biz",
    "net",
    ".rf.gd",
    ".az",
    ".party",
    "discord.gg"
  ];
  if (reklam.some(word => msg.content.includes(word))) {
    try {
      if (!msg.member.hasPermission("BAN_MEMBERS")) {
        msg.delete();
        return msg
          .reply(
            "**Bu Sunucuda** `Reklam Engelle`** Aktif Reklam Yapmana İzin Vermem !**"
          )
          .then(msg => msg.delete(4000));

        msg.delete(4000);
      }
    } catch (err) {
      console.log(err);
    }
  }
});

////////////////////KÜFÜR

client.on("message", async msg => {
  if (msg.author.bot) return;
  if (msg.channel.type === "dm") return;

  let i = await db.fetch(`küfürFiltre_${msg.guild.id}`);
  if (i == "acik") {
    const küfür = [
      "amcık",
      "yarrak",
      "orospu",
      "piç",
      "sikerim",
      "sikik",
      "amına",
      "pezevenk",
      "yavşak",
      "ananı",
      "anandır",
      "orospu",
      "evladı",
      "göt",
      "pipi",
      "sokuk",
      "yarak",
      "bacını",
      "karını",
      "amk",
      "aq",
      "mk",
      "anaskm"
    ];
    if (küfür.some(word => msg.content.toLowerCase().includes(word))) {
      try {
        if (!msg.member.hasPermission("MANAGE_WEBHOOKS")) {
          msg.delete();
          let embed = new Discord.MessageEmbed()
            .setColor(0xffa300)
            .setFooter("Adem Reyzz Küfür Sistemi", client.user.avatarURL())
            .setAuthor(
              msg.guild.owner.user.username,
              msg.guild.owner.user.avatarURL()
            )
            .setDescription(
              "Adem Reyzz, " +
                `***${msg.guild.name}***` +
                " adlı sunucunuzda küfür yakaladım."
            )
            .addField(
              "Küfür Eden Kişi",
              "Kullanıcı: " + msg.author.tag + "\nID: " + msg.author.id,
              true
            )
            .addField("Engellenen mesaj", msg.content, true)
            .setTimestamp();
          msg.guild.owner.user.send(embed);
          return msg.channel
            .send(
              `${msg.author}, Küfür Etmek Yasak! Senin Mesajını Özelden Kurucumuza Gönderdim.`
            )
            .then(msg => msg.delete(25000));
        }
      } catch (err) {
        console.log(err);
      }
    }
  }
  if (!i) return;
});

//////////////////////////MODLOG///////////////////
client.on("messageDelete", async message => {
  if (message.author.bot || message.channel.type == "dm") return;

  let log = message.guild.channels.cache.get(
    await db.fetch(`log_${message.guild.id}`)
  );

  if (!log) return;

  const embed = new Discord.MessageEmbed()

    .setTitle(message.author.username + " | Mesaj Silindi")

    .addField("Kullanıcı: ", message.author)

    .addField("Kanal: ", message.channel)

    .addField("Mesaj: ", "" + message.content + "");

  log.send(embed);
});

client.on("messageUpdate", async (oldMessage, newMessage) => {
  let modlog = await db.fetch(`log_${oldMessage.guild.id}`);

  if (!modlog) return;

  let embed = new Discord.MessageEmbed()

    .setAuthor(oldMessage.author.username, oldMessage.author.avatarURL())

    .addField("**Eylem**", "Mesaj Düzenleme")

    .addField(
      "**Mesajın sahibi**",
      `<@${oldMessage.author.id}> === **${oldMessage.author.id}**`
    )

    .addField("**Eski Mesajı**", `${oldMessage.content}`)

    .addField("**Yeni Mesajı**", `${newMessage.content}`)

    .setTimestamp()

    .setColor("RANDOM")

    .setFooter(
      `Sunucu: ${oldMessage.guild.name} - ${oldMessage.guild.id}`,
      oldMessage.guild.iconURL()
    )

    .setThumbnail(oldMessage.guild.iconURL);

  client.channels.cache.get(modlog).send(embed);
});

client.on("channelCreate", async channel => {
  let modlog = await db.fetch(`log_${channel.guild.id}`);

  if (!modlog) return;

  const entry = await channel.guild
    .fetchAuditLogs({ type: "CHANNEL_CREATE" })
    .then(audit => audit.entries.first());

  let kanal;

  if (channel.type === "text") kanal = `<#${channel.id}>`;

  if (channel.type === "voice") kanal = `\`${channel.name}\``;

  let embed = new Discord.MessageEmbed()

    .setAuthor(entry.executor.username, entry.executor.avatarURL())

    .addField("**Eylem**", "Kanal Oluşturma")

    .addField("**Kanalı Oluşturan Kişi**", `<@${entry.executor.id}>`)

    .addField("**Oluşturduğu Kanal**", `${kanal}`)

    .setTimestamp()

    .setColor("RANDOM")

    .setFooter(
      `Sunucu: ${channel.guild.name} - ${channel.guild.id}`,
      channel.guild.iconURL()
    )

    .setThumbnail(channel.guild.iconUR);

  client.channels.cache.get(modlog).send(embed);
});

client.on("channelDelete", async channel => {
  let modlog = await db.fetch(`log_${channel.guild.id}`);

  if (!modlog) return;

  const entry = await channel.guild
    .fetchAuditLogs({ type: "CHANNEL_DELETE" })
    .then(audit => audit.entries.first());

  let embed = new Discord.MessageEmbed()

    .setAuthor(entry.executor.username, entry.executor.avatarURL())

    .addField("**Eylem**", "Kanal Silme")

    .addField("**Kanalı Silen Kişi**", `<@${entry.executor.id}>`)

    .addField("**Silinen Kanal**", `\`${channel.name}\``)

    .setTimestamp()

    .setColor("RANDOM")

    .setFooter(
      `Sunucu: ${channel.guild.name} - ${channel.guild.id}`,
      channel.guild.iconURL()
    )

    .setThumbnail(channel.guild.iconURL);

  client.channels.cache.get(modlog).send(embed);
});

client.on("roleCreate", async role => {
  let modlog = await db.fetch(`log_${role.guild.id}`);

  if (!modlog) return;

  const entry = await role.guild
    .fetchAuditLogs({ type: "ROLE_CREATE" })
    .then(audit => audit.entries.first());

  let embed = new Discord.MessageEmbed()

    .setAuthor(entry.executor.username, entry.executor.avatarURL())

    .addField("**Eylem**", "Rol Oluşturma")

    .addField("**Rolü oluşturan kişi**", `<@${entry.executor.id}>`)

    .addField("**Oluşturulan rol**", `\`${role.name}\` **=** \`${role.id}\``)

    .setTimestamp()

    .setFooter(
      `Sunucu: ${role.guild.name} - ${role.guild.id}`,
      role.guild.iconURL
    )

    .setColor("RANDOM")

    .setThumbnail(role.guild.iconURL);

  client.channels.cache.get(modlog).send(embed);
});

client.on("roleDelete", async role => {
  let modlog = await db.fetch(`log_${role.guild.id}`);

  if (!modlog) return;

  const entry = await role.guild
    .fetchAuditLogs({ type: "ROLE_DELETE" })
    .then(audit => audit.entries.first());

  let embed = new Discord.MessageEmbed()

    .setAuthor(entry.executor.username, entry.executor.avatarURL())

    .addField("**Eylem**", "Rol Silme")

    .addField("**Rolü silen kişi**", `<@${entry.executor.id}>`)

    .addField("**Silinen rol**", `\`${role.name}\` **=** \`${role.id}\``)

    .setTimestamp()

    .setFooter(
      `Sunucu: ${role.guild.name} - ${role.guild.id}`,
      role.guild.iconURL
    )

    .setColor("RANDOM")

    .setThumbnail(role.guild.iconURL);

  client.channels.cache.get(modlog).send(embed);
});

client.on("emojiCreate", async emoji => {
  let modlog = await db.fetch(`log_${emoji.guild.id}`);

  if (!modlog) return;

  const entry = await emoji.guild
    .fetchAuditLogs({ type: "EMOJI_CREATE" })
    .then(audit => audit.entries.first());

  let embed = new Discord.MessageEmbed()

    .setAuthor(entry.executor.username, entry.executor.avatarURL())

    .addField("**Eylem**", "Emoji Oluşturma")

    .addField("**Emojiyi oluşturan kişi**", `<@${entry.executor.id}>`)

    .addField("**Oluşturulan emoji**", `${emoji} - İsmi: \`${emoji.name}\``)

    .setTimestamp()

    .setColor("RANDOM")

    .setFooter(
      `Sunucu: ${emoji.guild.name} - ${emoji.guild.id}`,
      emoji.guild.iconURL
    )

    .setThumbnail(emoji.guild.iconURL);

  client.channels.cache.get(modlog).send(embed);
});

client.on("emojiDelete", async emoji => {
  let modlog = await db.fetch(`log_${emoji.guild.id}`);

  if (!modlog) return;

  const entry = await emoji.guild
    .fetchAuditLogs({ type: "EMOJI_DELETE" })
    .then(audit => audit.entries.first());

  let embed = new Discord.MessageEmbed()

    .setAuthor(entry.executor.username, entry.executor.avatarURL())

    .addField("**Eylem**", "Emoji Silme")

    .addField("**Emojiyi silen kişi**", `<@${entry.executor.id}>`)

    .addField("**Silinen emoji**", `${emoji}`)

    .setTimestamp()

    .setFooter(
      `Sunucu: ${emoji.guild.name} - ${emoji.guild.id}`,
      emoji.guild.iconURL
    )

    .setColor("RANDOM")

    .setThumbnail(emoji.guild.iconURL);

  client.channels.cache.get(modlog).send(embed);
});

client.on("emojiUpdate", async (oldEmoji, newEmoji) => {
  let modlog = await db.fetch(`log_${oldEmoji.guild.id}`);

  if (!modlog) return;

  const entry = await oldEmoji.guild
    .fetchAuditLogs({ type: "EMOJI_UPDATE" })
    .then(audit => audit.entries.first());

  let embed = new Discord.MessageEmbed()

    .setAuthor(entry.executor.username, entry.executor.avatarURL())

    .addField("**Eylem**", "Emoji Güncelleme")

    .addField("**Emojiyi güncelleyen kişi**", `<@${entry.executor.id}>`)

    .addField(
      "**Güncellenmeden önceki emoji**",
      `${oldEmoji} - İsmi: \`${oldEmoji.name}\``
    )

    .addField(
      "**Güncellendikten sonraki emoji**",
      `${newEmoji} - İsmi: \`${newEmoji.name}\``
    )

    .setTimestamp()

    .setColor("RANDOM")

    .setFooter(
      `Sunucu: ${oldEmoji.guild.name} - ${oldEmoji.guild.id}`,
      oldEmoji.guild.iconURL
    )

    .setThumbnail(oldEmoji.guild.iconURL);

  client.channels.cache.get(modlog).send(embed);
});

client.on("guildBanAdd", async (guild, user) => {
  let modlog = await db.fetch(`log_${guild.id}`);

  if (!modlog) return;

  const entry = await guild
    .fetchAuditLogs({ type: "MEMBER_BAN_ADD" })
    .then(audit => audit.entries.first());

  let embed = new Discord.MessageEmbed()

    .setAuthor(entry.executor.username, entry.executor.avatarURL())

    .addField("**Eylem**", "Yasaklama")

    .addField("**Kullanıcıyı yasaklayan yetkili**", `<@${entry.executor.id}>`)

    .addField("**Yasaklanan kullanıcı**", `**${user.tag}** - ${user.id}`)

    .addField("**Yasaklanma sebebi**", `${entry.reason}`)

    .setTimestamp()

    .setColor("RANDOM")

    .setFooter(`Sunucu: ${guild.name} - ${guild.id}`, guild.iconURL)

    .setThumbnail(guild.iconURL);

  client.channels.cache.get(modlog).send(embed);
});

client.on("guildBanRemove", async (guild, user) => {
  let modlog = await db.fetch(`log_${guild.id}`);

  if (!modlog) return;

  const entry = await guild
    .fetchAuditLogs({ type: "MEMBER_BAN_REMOVE" })
    .then(audit => audit.entries.first());

  let embed = new Discord.MessageEmbed()

    .setAuthor(entry.executor.username, entry.executor.avatarURL())

    .addField("**Eylem**", "Yasak kaldırma")

    .addField("**Yasağı kaldıran yetkili**", `<@${entry.executor.id}>`)

    .addField("**Yasağı kaldırılan kullanıcı**", `**${user.tag}** - ${user.id}`)

    .setTimestamp()

    .setColor("RANDOM")

    .setFooter(`Sunucu: ${guild.name} - ${guild.id}`, guild.iconURL)

    .setThumbnail(guild.iconURL);

  client.channels.cache.get(modlog).send(embed);
});

//////////////////////////////MODLOG///////////////////////////

//////////////////////////////OTOROL

client.on("guildMemberAdd", member => {
  let rol = db.fetch(`autoRole_${member.guild.id}`);
  if (!rol) return;
  let kanal = db.fetch(`autoRoleChannel_${member.guild.id}`);
  if (!kanal) return;

  member.roles.add(member.guild.roles.cache.get(rol));
  let embed = new Discord.MessageEmbed()
    .setDescription(
      "**Sunucuya yeni katılan** **" +
        member.user.username +
        "** **Kullanıcısına** <@&" +
        rol +
        ">**Rolü verildi**"
    )
    .setColor("RANDOM"); //.setFooter(`<@member.id>`)
  member.guild.channels.cache.get(kanal).send(embed);
});

//////////////////////////////////////////////////

client.on("ready", async () => {
  let botVoiceChannel = client.channels.cache.get("SES KANAL İD");
  console.log("Bot Ses Kanalına bağlandı!");
  if (botVoiceChannel)
    botVoiceChannel
      .join()
      .catch(err => console.error("Bot ses kanalına bağlanamadı!"));
});
///////////////////Fake Katıl
client.on("message", async message => {
  if (message.content === "fakekatıl") {
    // Buraya ne yazarsanız yazdığınız şeye göre çalışır
    client.emit(
      "guildMemberAdd",
      message.member || (await message.guild.fetchMember(message.author))
    );
  }
});
/////////////////////////////////Fake Ayrıl
client.on("message", async message => {
  if (message.content === "fakeayrıl") {
    // Buraya ne yazarsanız yazdığınız şeye göre çalışır
    client.emit(
      "guildMemberRemove",
      message.member || (await message.guild.fetchMember(message.author))
    );
  }
});

/////////////////////////////////Oto-Cevap////////////////
client.on("message", async message => {
  if (message.author.bot) return;
  let yazılar = db.fetch(`${message.guild.id}.otocevap.yazılar`);
  let cevaplar = db.fetch(`${message.guild.id}.otocevap.cevaplar`);
  var efe = "";
  let sunucuadı = message.guild.name;
  let üyesayı = message.guild.members.cache.size;
  for (
    var i = 0;
    i <
    (db.fetch(`${message.guild.id}.otocevap.yazılar`)
      ? db.fetch(`${message.guild.id}.otocevap.yazılar`).length
      : 0);
    i++
  ) {
    if (message.content.toLowerCase() == yazılar[i].toLowerCase()) {
      efe += `${cevaplar[i]
        .replace("{sunucuadı}", `${sunucuadı}`)
        .replace("{üyesayı}", `${üyesayı}`)}`;
      message.channel.send(`${efe}`);
    }
  }
});
///////////////////////////////Resimli Giriş-Çıkış///////////////////
//client.on("guildMemberRemove", async member => {
//let resimkanal = JSON.parse(fs.readFileSync("./ayarlar/gç.json", "utf8"));
//const canvaskanal = member.guild.channels.cache.get(resimkanal[member.guild.id].resim);

//if (db.has(`gçkanal_${member.guild.id}`) === false) return;
// var canvaskanal = member.guild.channels.cache.get(
// db.fetch(`gçkanal_${member.guild.id}`)
// );
//if (!canvaskanal) return;

//const Canvas = require("canvas"),
//Image = Canvas.Image,
// Font = Canvas.Font,
// path = require("path");

//var randomMsg = ["Sunucudan Ayrıldı."];
// var randomMsg_integer =
// randomMsg[Math.floor(Math.random() * randomMsg.length)];

//let msj = await db.fetch(`cikisM_${member.guild.id}`);
//if (!msj) msj = `{uye}, ${randomMsg_integer}`;

// const canvas = Canvas.createCanvas(640, 360);
///const ctx = canvas.getContext("2d");

//const background = await Canvas.loadImage(
//"https://i.hizliresim.com/Wrn1XW.jpg"
//);
//ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

//ctx.strokeStyle = "#74037b";
//ctx.strokeRect(0, 0, canvas.width, canvas.height);

//ctx.fillStyle = `#D3D3D3`;
//ctx.font = `37px "Warsaw"`;
//ctx.textAlign = "center";
//ctx.fillText(`${member.user.username}`, 300, 342);

//let avatarURL = member.user.displayAvatarURL({
// format: "png",
// dynamic: true,
// size: 1024
//});
// const { body } = await request.get(avatarURL);
//const avatar = await Canvas.loadImage(body);

//ctx.beginPath();
//ctx.lineWidth = 4;
//ctx.fill();
// ctx.lineWidth = 4;
//ctx.arc(250 + 55, 55 + 55, 55, 0, 2 * Math.PI, false);
//ctx.clip();
//ctx.drawImage(avatar, 250, 55, 110, 110);

//const attachment = new Discord.MessageAttachment(
//canvas.toBuffer(),
// "ro-BOT-güle-güle.png"
// );

//canvaskanal.send(attachment);
// canvaskanal.send(
// msj.replace("{uye}", member).replace("{sunucu}", member.guild.name)
//);
//if (member.user.bot)
//return canvaskanal.send(`🤖 Bu bir bot, ${member.user.tag}`);
//});

//client.on("guildMemberAdd", async member => {
//if (db.has(`gçkanal_${member.guild.id}`) === false) return;
// var canvaskanal = member.guild.channels.cache.get(
// db.fetch(`gçkanal_${member.guild.id}`)
//);

//if (!canvaskanal || canvaskanal === undefined) return;
// const request = require("node-superfetch");
// const Canvas = require("canvas"),
// Image = Canvas.Image,
// Font = Canvas.Font,
//path = require("path");

//var randomMsg = ["Sunucuya Katıldı."];
//var randomMsg_integer =
//randomMsg[Math.floor(Math.random() * randomMsg.length)];

//let paket = await db.fetch(`pakets_${member.id}`);
// let msj = await db.fetch(`cikisM_${member.guild.id}`);
//if (!msj) msj = `{uye}, ${randomMsg_integer}`;

// const canvas = Canvas.createCanvas(640, 360);
//const ctx = canvas.getContext("2d");

//const background = await Canvas.loadImage(
//"https://i.hizliresim.com/UyVZ4f.jpg"
//);
//ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

// ctx.strokeStyle = "#74037b";
//ctx.strokeRect(0, 0, canvas.width, canvas.height);

//ctx.fillStyle = `#D3D3D3`;
// ctx.font = `37px "Warsaw"`;
// ctx.textAlign = "center";
//ctx.fillText(`${member.user.username}`, 300, 342);

// let avatarURL = member.user.displayAvatarURL({
//format: "png",
// dynamic: true,
//size: 1024
//});
//const { body } = await request.get(avatarURL);
//const avatar = await Canvas.loadImage(body);

//ctx.beginPath();
//ctx.lineWidth = 4;
//ctx.fill();
//ctx.lineWidth = 4;
//ctx.arc(250 + 55, 55 + 55, 55, 0, 2 * Math.PI, false);
// ctx.clip();
//ctx.drawImage(avatar, 250, 55, 110, 110);

//const attachment = new Discord.MessageAttachment(
//canvas.toBuffer(),
//"ro-BOT-hosgeldin.png"
//);

//canvaskanal.send(attachment);
//canvaskanal.send(
// msj.replace("{uye}", member).replace("{sunucu}", member.guild.name)
//);
//if (member.user.bot)
//return canvaskanal.send(`🤖 Bu bir bot, ${member.user.tag}`);
//});
///////////////////////////////Gelişmiş Hoşgeldin///////////////////////
client.on(`guildMemberAdd`, async member => {
  var maze = new Discord.RichEmbed()
    .setColor("GREEN")
    .setTitle(":inbox_tray: Sunucuya yeni bir üye katıldı!")
    .setThumbnail(member.user.avatarURL)
    .setDescription(
      "Hoşgeldin " +
        member +
        " sunucuya hoşgeldin, seninle beraber " +
        member.guild.memberCount +
        " kişiye ulaştık."
    )
    .addField(`:id: Üye ID:`, `${member.id}`, true)
    .addField(`:octagonal_sign: Üye Adı`, `${member}`, true);
  client.channels.get("729096516853301288").send(maze); //Maze yaptı çalanı lucifer yakar, sağlığınız zarar görebilir ^^
});
///////////////////////////////DM Hoşgeldin Mesajı//////////////////////////////
client.on(`guildMemberAdd`, async member => {
  const e = new Discord.RichEmbed()
    .setColor(`RANDOM`)
    .setImage(`https://media.giphy.com/media/A06UFEx8jxEwU/giphy.gif`)
    .addField(
      `Sunucumuza Hoşgeldiniz Şeref Verdiniz Sizleri Buda Görmek Bizi Çok Mutlu Etti Geldiğiniz İçin Teşekkürler❤`,
      `Mesaj`
    )
    .setFooter(`footer mesajı`);
  member.send(e);
});
///////////////////////////////Biri Bir Kanal Silerse Onun Rollerini Alır////////////////////////
client.on("channelDelete", async function(channel) {
  if (channel.guild.id !== "sunucu id") return;
  let logs = await channel.guild.fetchAuditLogs({ type: "CHANNEL_DELETE" });
  if (logs.entries.first().executor.bot) return;
  channel.guild
    .member(logs.entries.first().executor)
    .roles.filter(role => role.name !== "@everyone")
    .array()
    .forEach(role => {
      channel.guild
        .member(logs.entries.first().executor)
        .removeRole(channel.guild.roles.get("alıncak rol 1"));
      channel.guild
        .member(logs.entries.first().executor)
        .removeRole(channel.guild.roles.get("alıncak rol 2"));
    });
  const sChannel = channel.guild.channels.find(c => c.id === "log kanal id");
  const cıks = new Discord.RichEmbed()
    .setColor("RANDOM")
    .setDescription(
      `${channel.name} adlı Kanal silindi Silen kişinin yetkilerini  çekiyom moruk çıkssss :tiks:`
    )
    .setFooter("Developer By Mecion");
  sChannel.send(cıks);

  channel.guild.owner.send(
    ` **${channel.name}** adlı Kanal silindi Silen  kişinin yetkilerini aldım:tiks:`
  );
});

///////////////////////////////Seviye Öğrenme////////////////
client.cooldown = new Discord.Collection();
client.config = {
  cooldown: 1 * 1000
};
client.db = require("quick.db");
client.on("message", async message => {
  if (!message.guild || message.author.bot) return;
  // XP
  exp(message);
  function exp(message) {
    if (
      !client.cooldown.has(`${message.author.id}`) ||
      Date.now() - client.cooldown.get(`${message.author.id}`) >
        client.config.cooldown
    ) {
      let exp = client.db.add(`exp_${message.author.id}`, 1);
      let level = Math.floor(0.3 * Math.sqrt(exp));
      let lvl =
        client.db.get(`level_${message.author.id}`) ||
        client.db.set(`level_${message.author.id}`, 1);
      if (level > lvl) {
        let newLevel = client.db.set(`level_${message.author.id}`, level);
        message.channel.send(
          `:tada: ${message.author.toString()}, Level atladın yeni levelin ${newLevel}!`
        );
      }
      client.cooldown.set(`${message.author.id}`, Date.now());
    }
  }
});
//////////////////////////////giriş-çıkış
//client.login("guildMemberAdd", member => {
// let guild = member.guild;
// let joinRole = guild.roles.find("name", "Üye"); // 'Üye' yazılan yeri otomatik rol vereceği rolü yapabilirsiniz.//Otorol Komudu :)
//member.sendMessage("Sunucuya Hoşgeldin Kardeşim."); //Sunucuya Yeni Biri Geldiğinde Mesaj Atar istediğini yaz.
// member.addRole(joinRole);

//const channel = member.guild.channels.find("name", "giriş-çıkış"); // 'gelen-giden' log ismidir. değiştirebilirsiniz. belirttiğiniz isme giriş çıkış gösterecektir.
//if (!channel) return;
//const embed = new Discord.RichEmbed()
//.setColor("0x00cc44")
//.setAuthor(client.user.username, client.user.avatarURL)
//.setThumbnail(member.user.avatarURL)
//.setTitle(`:inbox_tray: ${member.user.username} Sunucuya katıldı.`)
//.setTimestamp();
//channel.sendEmbed(embed);
//});

//client.login("guildMemberRemove", member => {
// const channel = member.guild.channels.find("name", "giriş-çıkış"); // 'gelen-giden' log ismidir. değiştirebilirsiniz. belirttiğiniz isme giriş çıkış gösterecektir.
//if (!channel) return;
//const embed = new Discord.RichEmbed()
//.setColor("0xff1a1a")
//.setAuthor(client.user.username, client.user.avatarURL)
//.setThumbnail(member.user.avatarURL)
// .setTitle(
// `:outbox_tray: ${member.user.username} Sunucudan ayrıldı buna üzüldüm :(`
//)
// .setTimestamp();
//channel.sendEmbed(embed);
//});
//////////////////////////////Afk Komutu
client.on("message", async message => {
  // chimp'∞B#1008
  if (message.channel.type === "dm") return;
  if (
    (await db.fetch(`afk.${message.author.id}.${message.guild.id}`)) ==
    undefined
  )
    return;
  const ms = require("ms");

  if (message.content.length > 2) {
    const sebepp = await db.fetch(
      `sebep.${message.author.id}.${message.guild.id}`
    );
    const sp = await db.fetch(`giriş.${message.author.id}.${message.guild.id}`);
    const asd = await db.fetch(
      `display.${message.author.id}.${message.guild.id}`
    );

    let atılmaay = moment(Date.now() + 10800000).format("MM");
    let atılmagün = moment(Date.now() + 10800000).format("DD");
    let atılmasaat = moment(Date.now() + 10800000).format("HH:mm:ss");
    let atılma = `\`${atılmagün} ${atılmaay
      .replace(/01/, "Ocak")
      .replace(/02/, "Şubat")
      .replace(/03/, "Mart")
      .replace(/04/, "Nisan")
      .replace(/05/, "Mayıs")
      .replace(/06/, "Haziran")
      .replace(/07/, "Temmuz")
      .replace(/08/, "Ağustos")
      .replace(/09/, "Eylül")
      .replace(/10/, "Ekim")
      .replace(/11/, "Kasım")
      .replace(/12/, "Aralık")} ${atılmasaat}\``;

    message.guild.members.get(message.author.id).setNickname(asd);
    message.channel.send(
      new Discord.RichEmbed()
        .setTitle(`${message.author.username}, hoşgeldin!`)
        .setColor("GREEN")
        .setDescription(`Afk modundan başarıyla çıkış yaptın.`)
        .addField("Giriş sebebin:", sebepp)
        .addField("AFK olma zamanın:", sp)
        .addField("Çıkış zamanın:", atılma)
    );
    db.delete(`afk.${message.author.id}.${message.guild.id}`);
    db.delete(`sebep.${message.author.id}.${message.guild.id}`);
    db.delete(`giriş.${message.author.id}.${message.guild.id}`);
    db.delete(`display.${message.author.id}.${message.guild.id}`);
  }
}); // codare ♥
//////////////////////////////giri scikis
//client.on("guildMemberRemove", async member => {
//let resimkanal = JSON.parse(fs.readFileSync("./ayarlar/gç.json", "utf8"));
//const canvaskanal = member.guild.channels.get(resimkanal[member.guild.id].resim);

// if (db.has(`gçkanal_${member.guild.id}`) === false) return;
// var canvaskanal = member.guild.channels.get(
//db.fetch(`gçkanal_${member.guild.id}`)
//);
//if (!canvaskanal) return;

//const request = require("node-superfetch");
//const Canvas = require("canvas"),
//Image = Canvas.Image,
//Font = Canvas.Font,
// path = require("path");

//var randomMsg = ["Sunucudan Ayrıldı."];
//var randomMsg_integer =
// randomMsg[Math.floor(Math.random() * randomMsg.length)];

//let msj = await db.fetch(`cikisM_${member.guild.id}`);
// if (!msj) msj = `{uye}, ${randomMsg_integer}`;

//const canvas = Canvas.createCanvas(640, 360);
// const ctx = canvas.getContext("2d");

//const background = await Canvas.loadImage(
// "https://i.hizliresim.com/Wrn1XW.jpg"
//);
//ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

//ctx.strokeStyle = "#74037b";
// ctx.strokeRect(0, 0, canvas.width, canvas.height);

//ctx.fillStyle = `#D3D3D3`;
// ctx.font = `37px "Warsaw"`;
//ctx.textAlign = "center";
//ctx.fillText(`${member.user.username}`, 300, 342);

// let avatarURL = member.user.avatarURL || member.user.defaultAvatarURL;
//const { body } = await request.get(avatarURL);
// const avatar = await Canvas.loadImage(body);

//ctx.beginPath();
//ctx.lineWidth = 4;
//ctx.fill();
//ctx.lineWidth = 4;
// ctx.arc(250 + 55, 55 + 55, 55, 0, 2 * Math.PI, false);
//ctx.clip();
//ctx.drawImage(avatar, 250, 55, 110, 110);

//const attachment = new Discord.Attachment(
// canvas.toBuffer(),
//"ro-BOT-güle-güle.png"
// );

//canvaskanal.send(attachment);
// canvaskanal.send(
// msj.replace("{uye}", member).replace("{sunucu}", member.guild.name)
//);
//if (member.user.bot)
// return canvaskanal.send(`🤖 Bu bir bot, ${member.user.tag}`);
//});

//client.on("guildMemberAdd", async member => {
// if (db.has(`gçkanal_${member.guild.id}`) === false) return;
//var canvaskanal = member.guild.channels.get(
// db.fetch(`gçkanal_${member.guild.id}`)
//);

//if (!canvaskanal || canvaskanal === undefined) return;
//const request = require("node-superfetch");
//const Canvas = require("canvas"),
//Image = Canvas.Image,
//Font = Canvas.Font,
//path = require("path");

// var randomMsg = ["Sunucuya Katıldı."];
//var randomMsg_integer =
//randomMsg[Math.floor(Math.random() * randomMsg.length)];

//let paket = await db.fetch(`pakets_${member.id}`);
//let msj = await db.fetch(`cikisM_${member.guild.id}`);
//if (!msj) msj = `{uye}, ${randomMsg_integer}`;

//const canvas = Canvas.createCanvas(640, 360);
//const ctx = canvas.getContext("2d");

//const background = await Canvas.loadImage(
// "https://i.hizliresim.com/UyVZ4f.jpg"
//);
//ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

//ctx.strokeStyle = "#74037b";
// ctx.strokeRect(0, 0, canvas.width, canvas.height);

// ctx.fillStyle = `#D3D3D3`;
//ctx.font = `37px "Warsaw"`;
//ctx.textAlign = "center";
//ctx.fillText(`${member.user.username}`, 300, 342);

//let avatarURL = member.user.avatarURL || member.user.defaultAvatarURL;
//const { body } = await request.get(avatarURL);
//const avatar = await Canvas.loadImage(body);

//ctx.beginPath();
//ctx.lineWidth = 4;
//ctx.fill();
//ctx.lineWidth = 4;
//ctx.arc(250 + 55, 55 + 55, 55, 0, 2 * Math.PI, false);
//ctx.clip();
//ctx.drawImage(avatar, 250, 55, 110, 110);

// const attachment = new Discord.Attachment(
//canvas.toBuffer(),
//"ro-BOT-hosgeldin.png"
//);

//canvaskanal.send(attachment);
// canvaskanal.send(
// msj.replace("{uye}", member).replace("{sunucu}", member.guild.name)
//);
//if (member.user.bot)
//return canvaskanal.send(`🤖 Bu bir bot, ${member.user.tag}`);
//});
//////////////////////////////
/////client.on("guildMemberAdd", async member => {
///moment.locale("tr");
///let tarih = moment(member.user.createdAt.getTime()).format("LLL");
////let gün = moment
////.duration(new Date().getTime() - member.user.createdAt.getTime())
///.format("D");
////let resim = new Discord.Attachment(
////"https://cdn.discordapp.com/attachments/713874856143355935/714443923338297364/giphy.gif"
////);
/// let kişi = member.guild.memberCount;
//// let kayıtcırol = "813875678100455425"; //Yetkili rolünüz ID'sini girin.
//// let kanal = client.channels.get("830023039160025128"); //Kanalınızın ID'sini girin.
///// kanal.send(
///`Merhaba <@${member.user.id}> hanedanımıza **hoşgeldin!**\n\nSeninle beraber **${kişi}** kişiyiz.\n\nTagımızı alarak bize destek olabilirsin\n\nHesap kuruluş tarihi; **${tarih}** [**${gün}** gün önce]\n\n${kayıtcırol} sizinle ilgilenecektir.`,
/// resim
/// );
//});

/////////////////////////////
client.on("message", msg => {
  var dm = client.channels.cache.get("830510584159141971"); //mesajın geleceği kanal idsi//
  if (msg.channel.type === "dm") {
    if (msg.author.id === client.user.id) return;
    const botdm = new Discord.MessageEmbed()
      .setTitle(`${client.user.username} Dm`)
      .setTimestamp()
      .setColor("BLUE")
      .setThumbnail(`${msg.author.avatarURL()}`)
      .addField(":boy: Gönderen ", msg.author.tag)
      .addField(":id:  Gönderen ID :", msg.author.id)
      .addField(":globe_with_meridians: Gönderilen Mesaj", msg.content);

    dm.send(botdm);
  }
  if (msg.channel.bot) return;
});
///////////////panel
client.on("message", async msg => {
  let everyone = msg.guild.roles.find(c => c.name === "@everyone");
  let sistem = await db.fetch(`panell_${msg.guild.id}`);
  if (sistem == "açık") {
    let kategori = msg.guild.channels.find(c =>
      c.name.startsWith(msg.guild.name)
    );
    if (!kategori) {
      msg.guild
        .createChannel(`${msg.guild.name} | Sunucu Paneli`, {
          type: "category",
          permissionOverwrites: [
            {
              id: msg.guild.id,
              deny: ["CONNECT"]
            }
          ]
        })
        .then(parent => {
          setTimeout(async function() {
            let eo = msg.guild.roles.find(r => r.name == "@everyone");
            parent.overwritePermissions(eo, {
              CONNECT: false
            });
            setTimeout(async function() {
              parent.setPosition(0);
            });
            db.set(`panelParentID_${msg.guild.id}`, parent.id);
            let toplamUye = msg.guild.channels.find(c =>
              c.name.startsWith("Toplam Üye •")
            );
            if (!toplamUye) {
              try {
                let s = msg.guild.memberCount;
                msg.guild
                  .createChannel(`Toplam Üye • ${s}`, {
                    type: "voice"
                  })
                  .then(ch => {
                    setTimeout(function() {
                      ch.overwritePermissions(everyone, {
                        CONNECT: false
                      });
                      db.set(`toplamID_${msg.guild.id}`, ch.id);
                      ch.setParent(parent);
                      ch.setPosition(1);
                    }, 120);
                  });
              } catch (err) {}
            }
            let uyesayısı = msg.guild.channels.find(c =>
              c.name.startsWith("Üye Sayısı •")
            );
            if (!uyesayısı) {
              try {
                let uyesayı = msg.guild.members.filter(m => !m.user.bot).size;
                msg.guild
                  .createChannel(`Üye Sayısı • ${uyesayı}`, {
                    type: "voice"
                  })
                  .then(ch => {
                    let ever = msg.guild.roles.find(
                      role => role.name === "@everyone"
                    );
                    setTimeout(function() {
                      ch.overwritePermissions(ever, {
                        CONNECT: false
                      });
                      ch.setParent(parent);
                      ch.setPosition(2);
                      db.set(`uyeSayıID_${msg.guild.id}`, ch.id);
                    }, 120);
                  });
              } catch (err) {}
              let botsayı = msg.guild.members.filter(m => m.user.bot).size;
              try {
                msg.guild
                  .createChannel(`Bot Sayısı • ${botsayı}`, {
                    type: "voice"
                  })
                  .then(ch => {
                    let ever = msg.guild.roles.find(
                      role => role.name === "@everyone"
                    );
                    setTimeout(function() {
                      ch.overwritePermissions(ever, {
                        CONNECT: false
                      });
                      ch.setParent(parent);
                      ch.setPosition(3);
                      db.set(`botSayıID_${msg.guild.id}`, ch.id);
                    }, 120);
                  });
              } catch (err) {}
              let onl = msg.guild.members.filter(
                m => m.presence.status != "offline" && !m.user.bot
              ).size;
              try {
                msg.guild
                  .createChannel(`Çevrimiçi Üye • ${onl}`, {
                    type: "voice"
                  })
                  .then(ch => {
                    let ever = msg.guild.roles.find(
                      role => role.name === "@everyone"
                    );
                    setTimeout(function() {
                      ch.setParent(parent);
                      ch.setPosition(4);
                      db.set(`onlSayıID_${msg.guild.id}`, ch.id);
                      ch.overwritePermissions(ever, {
                        CONNECT: false
                      });
                    }, 120);
                  });
              } catch (err) {}
            }
          }, 50);
        });
    } else {
      let parent = msg.guild.channels.find(
        c => c.name == `${msg.guild.name} | Sunucu Paneli`
      );
      if (msg.content.includes("panel kapat")) return false;
      let toplamuye = msg.guild.channels.find(c =>
        c.name.startsWith(`Toplam Üye •`)
      );
      toplamuye.setParent(parent);
      toplamuye.setName(`Toplam Üye • ${msg.guild.memberCount}`);
      let uyesayı = msg.guild.channels.find(c =>
        c.name.startsWith(`Üye Sayısı •`)
      );
      uyesayı.setParent(parent);
      uyesayı.setName(
        `Üye Sayısı • ${msg.guild.members.filter(m => !m.user.bot).size}`
      );
      let botuye = msg.guild.channels.find(c =>
        c.name.startsWith(`Bot Sayısı •`)
      );
      botuye.setParent(parent);
      botuye.setName(
        `Bot Sayısı • ${msg.guild.members.filter(m => m.user.bot).size}`
      );
      let onl = msg.guild.channels.find(c =>
        c.name.startsWith("Çevrimiçi Üye •")
      );
      onl.setParent(parent);
      onl.setName(
        `Çevrimiçi Üye • ${
          msg.guild.members.filter(
            m => m.presence.status != "offline" && !m.user.bot
          ).size
        }`
      );
    }
  } else {
  }
});
////////////////////Sunucu Sayaç
client.on("guildCreate", guild => {
  let ademreyzz_sayi = "100"; //Sayılmasını istediğiniz sunucu sayacı.
  let ademreyzz = "830023039160025128"; //Kanal ID
  var ademreyzz1 = `${ademreyzz_sayi - client.guilds.size}`; //Elleme skerim
  client.channels
    .get(ademreyzz)
    .send(
      `${guild.name} adlı sunucuya eklendim! \`${ademreyzz_sayi}\` sunucu olmamıza \`${ademreyzz1}\` sunucu kaldı!`
    );
});

////////////////////
client.on("message", msg => {
  var dm = client.channels.cache.get("830510584159141971");
  if (msg.channel.type === "dm") {
    if (msg.author.id === client.user.id) return;
    const botdm = new Discord.MessageEmbed()
      .setTitle(`🔔 Yeni Bir Mesajım Var`)
      .setTimestamp()
      .setColor("RED")
      .setThumbnail(`${msg.author.avatarURL()}`)
      .addField("Gönderen", msg.author.tag)
      .addField("Gönderen ID", msg.author.id)
      .addField("Gönderilen Mesaj", msg.content);

    dm.send(botdm);
  }
  if (msg.channel.bot) return;
});

//////////////gelismis sunucu kur
client.on("message", async message => {
  const ms = require("ms");
  const args = message.content
    .slice(ayarlar.prefix.length)
    .trim()
    .split(/ +/g);
  const command = args.shift().toLowerCase();
  let u = message.mentions.users.first() || message.author;
  if (command === ".sunucu-kur") {
    if (
      message.guild.channels.cache.find(
        channel => channel.name === "Bot Kullanımı"
      )
    )
      return message.channel.send(" Bot Paneli Zaten Ayarlanmış.");
    if (!message.member.hasPermission("ADMINISTRATOR"))
      return message.channel.send(
        " Bu Kodu `Yönetici` Yetkisi Olan Kişi Kullanabilir."
      );
    message.channel.send(
      `Bot Bilgi Kanallarının kurulumu başlatılsın mı? başlatılacak ise **evet** yazınız.`
    );
    message.channel
      .awaitMessages(response => response.content === "evet", {
        max: 1,
        time: 10000,
        errors: ["time"]
      })
      .then(collected => {
        message.guild.channels.create("|▬▬|ÖNEMLİ KANALLAR|▬▬|", "category", [
          {
            id: message.guild.id,
            deny: ["SEND_MESSAGES"]
          }
        ]);

        message.guild.channels
          .create("「:page_with_curl:」kurallar", "text", [
            {
              id: message.guild.id,
              deny: ["SEND_MESSAGES"]
            }
          ])
          .then(channel =>
            channel.setParent(
              message.guild.channels.cache.find(
                channel => channel.name === "|▬▬|ÖNEMLİ KANALLAR|▬▬|"
              )
            )
          );
        message.guild.channels
          .create("「:door:」gelen-giden", "text", [
            {
              id: message.guild.id,
              deny: ["SEND_MESSAGES"]
            }
          ])
          .then(channel =>
            channel.setParent(
              message.guild.channels.cache.find(
                channel => channel.name === "|▬▬|ÖNEMLİ KANALLAR|▬▬|"
              )
            )
          );
        message.guild.channels
          .create("「:white_check_mark:」sayaç", "text", [
            {
              id: message.guild.id,
              deny: ["SEND_MESSAGES"]
            }
          ])
          .then(channel =>
            channel.setParent(
              message.guild.channels.cache.find(
                channel => channel.name === "|▬▬|ÖNEMLİ KANALLAR|▬▬|"
              )
            )
          );
        message.guild.channels
          .create("「:floppy_disk:」log-kanalı", "text", [
            {
              id: message.guild.id,
              deny: ["SEND_MESSAGES"]
            }
          ])
          .then(channel =>
            channel.setParent(
              message.guild.channels.cache.find(
                channel => channel.name === "|▬▬|ÖNEMLİ KANALLAR|▬▬|"
              )
            )
          );
        message.guild.channels
          .create("「:loudspeaker:」duyuru-odası", "text", [
            {
              id: message.guild.id,
              deny: ["SEND_MESSAGES"]
            }
          ])
          .then(channel =>
            channel.setParent(
              message.guild.channels.cache.find(
                channel => channel.name === "|▬▬|ÖNEMLİ KANALLAR|▬▬|"
              )
            )
          );
      })
      .then(collected => {
        message.guild.channels.create("|▬▬|GENEL KANALLAR|▬▬|", "category", [
          {
            id: message.guild.id
          }
        ]);
        message.guild.channels
          .create(`「:bulb:」şikayet-ve-öneri`, "text")
          .then(channel =>
            channel.setParent(
              message.guild.channels.cache.find(
                channel => channel.name === "|▬▬|GENEL KANALLAR|▬▬|"
              )
            )
          );
        message.guild.channels
          .create(`「👥」pre-arama-odası`, "text")
          .then(channel =>
            channel.setParent(
              message.guild.channels.cache.find(
                channel => channel.name === "|▬▬|GENEL KANALLAR|▬▬|"
              )
            )
          );
        message.guild.channels
          .create(`「📷」görsel-içerik`, "text")
          .then(channel =>
            channel.setParent(
              message.guild.channels.cache.find(
                channel => channel.name === "|▬▬|GENEL KANALLAR|▬▬|"
              )
            )
          );
        message.guild.channels
          .create(`「🤖」bot-komutları`, "text")
          .then(channel =>
            channel.setParent(
              message.guild.channels.cache.find(
                channel => channel.name === "|▬▬|GENEL KANALLAR|▬▬|"
              )
            )
          );
        message.guild.channels
          .create(`「💬」sohbet`, "text")
          .then(channel =>
            channel.setParent(
              message.guild.channels.cache.find(
                channel => channel.name === "|▬▬|GENEL KANALLAR|▬▬|"
              )
            )
          );

        message.guild.channels
          .create(`🏆》Kurucu Odası`, "voice")
          .then(channel =>
            channel.setParent(
              message.guild.channels.cache.find(
                channel => channel.name === "|▬▬|SES KANALLARI|▬▬|"
              )
            )
          )
          .then(c => {
            let role = message.guild.roles.cache.find("name", "@everyone");
            let role2 = message.guild.roles.cache.find("name", "Kurucu");

            c.createOverwrite(role, {
              CONNECT: false
            });
            c.createOverwrite(role2, {
              CONNECT: true
            });
          });
        message.guild.channels
          .create(`「:bulb:」şikayet-ve-öneri`, "text")
          .then(channel =>
            channel.setParent(
              message.guild.channels.cache.find(
                channel => channel.name === "|▬▬|GENEL KANALLAR|▬▬|"
              )
            )
          );
        message.guild.channels
          .create(`「👥」pre-arama-odası`, "text")
          .then(channel =>
            channel.setParent(
              message.guild.channels.cache.find(
                channel => channel.name === "|▬▬|GENEL KANALLAR|▬▬|"
              )
            )
          );
        message.guild.channels
          .create(`「📷」görsel-içerik`, "text")
          .then(channel =>
            channel.setParent(
              message.guild.channels.cache.find(
                channel => channel.name === "|▬▬|GENEL KANALLAR|▬▬|"
              )
            )
          );
        message.guild.channels
          .create(`「🤖」bot-komutları`, "text")
          .then(channel =>
            channel.setParent(
              message.guild.channels.cache.find(
                channel => channel.name === "|▬▬|GENEL KANALLAR|▬▬|"
              )
            )
          );
        message.guild.channels
          .create(`「💬」sohbet`, "text")
          .then(channel =>
            channel.setParent(
              message.guild.channels.cache.find(
                channel => channel.name === "|▬▬|GENEL KANALLAR|▬▬|"
              )
            )
          );

        message.guild.channels
          .create(`🏆》Kurucu Odası`, "voice")
          .then(channel =>
            channel.setParent(
              message.guild.channels.cache.find(
                channel => channel.name === "|▬▬|SES KANALLARI|▬▬|"
              )
            )
          )
          .then(c => {
            let role = message.guild.roles.cache.find("name", "@everyone");
            let role2 = message.guild.roles.cache.find("name", "Kurucu");

            c.createOverwrite(role, {
              CONNECT: false
            });
            c.createOverwrite(role2, {
              CONNECT: true
            });
          });
        message.guild.channels.create(
          "|鈻柆|SES KANALLARI|鈻柆|",
          "category",
          [
            {
              id: message.guild.id
            }
          ]
        );

        message.guild.channels
          .create(`馃弳銆媃枚netici Odas谋`, "voice")
          .then(channel =>
            channel.setParent(
              message.guild.channels.cache.find(
                channel => channel.name === "|鈻柆|SES KANALLARI|鈻柆|"
              )
            )
          )
          .then(c => {
            let role = message.guild.roles.cache.find("name", "@everyone");
            let role2 = message.guild.roles.cache.find("name", "Kurucu");
            let role3 = message.guild.roles.cache.find("name", "Y枚netici");
            c.createOverwrite(role, {
              CONNECT: false
            });
            c.createOverwrite(role2, {
              CONNECT: true
            });
            c.createOverwrite(role3, {
              CONNECT: true
            });
          });

        message.guild.channels
          .create(`馃挰銆婼ohbet Odas谋`, "voice")
          .then(channel =>
            channel.setParent(
              message.guild.channels.cache.find(
                channel => channel.name === "|鈻柆|SES KANALLARI|鈻柆|"
              )
            )
          )
          .then(c => {
            let role = message.guild.roles.cache.find("name", "@everyone");
            c.createOverwrite(role, {
              CONNECT: true
            });
          });

        message.guild.channels.create(
          "|鈻柆|OYUN ODALARI|鈻柆|",
          "category",
          [
            {
              id: message.guild.id
            }
          ]
        );
        message.guild.channels
          .create(`:video_game:��LOL`, "voice")
          .then(channel =>
            channel.setParent(
              message.guild.channels.cache.find(
                channel => channel.name === "|�7�6�7�6|OYUN ODALARI|�7�6�7�6|"
              )
            )
          );
        message.guild.channels
          .create(`�9�2��ZULA`, "voice")
          .then(channel =>
            channel.setParent(
              message.guild.channels.cache.find(
                channel => channel.name === "|�7�6�7�6|OYUN ODALARI|�7�6�7�6|"
              )
            )
          );
        message.guild.channels
          .create(`�9�2��COUNTER STR�0�2KE`, "voice")
          .then(channel =>
            channel.setParent(
              message.guild.channels.cache.find(
                channel => channel.name === "|�7�6�7�6|OYUN ODALARI|�7�6�7�6|"
              )
            )
          );
        message.guild.channels
          .create(`�9�2��PUBG`, "voice")
          .then(channel =>
            channel.setParent(
              message.guild.channels.cache.find(
                channel => channel.name === "|�7�6�7�6|OYUN ODALARI|�7�6�7�6|"
              )
            )
          );
        message.guild.channels
          .create(`�9�2��FORTN�0�2TE`, "voice")
          .then(channel =>
            channel.setParent(
              message.guild.channels.cache.find(
                channel => channel.name === "|�7�6�7�6|OYUN ODALARI|�7�6�7�6|"
              )
            )
          );
        message.guild.channels
          .create(`�9�2��M�0�2NECRAFT`, "voice")
          .then(channel =>
            channel.setParent(
              message.guild.channels.cache.find(
                channel => channel.name === "|�7�6�7�6|OYUN ODALARI|�7�6�7�6|"
              )
            )
          );
        message.guild.channels
          .create(`�9�2��ROBLOX`, "voice")
          .then(channel =>
            channel.setParent(
              message.guild.channels.cache.find(
                channel => channel.name === "|�7�6�7�6|OYUN ODALARI|�7�6�7�6|"
              )
            )
          );
        message.guild.channels
          .create(`�9�2��WOLFTEAM`, "voice")
          .then(channel =>
            channel.setParent(
              message.guild.channels.cache.find(
                channel => channel.name === "|�7�6�7�6|OYUN ODALARI|�7�6�7�6|"
              )
            )
          );
        message.guild.roles.create({
          name: "Kurucu",
          color: "RED",
          permissions: ["ADMINISTRATOR"]
        });

        message.guild.roles.create({
          name: "Y�0�2netici",
          color: "BLUE",
          permissions: [
            "MANAGE_GUILD",
            "MANAGE_ROLES",
            "MUTE_MEMBERS",
            "DEAFEN_MEMBERS",
            "MANAGE_MESSAGES",
            "MANAGE_NICKNAMES",
            "KICK_MEMBERS"
          ]
        });

        message.guild.roles.create({
          name: "Moderat�0�2r",
          color: "GREEN",
          permissions: [
            "MANAGE_GUILD",
            "MANAGE_ROLES",
            "MUTE_MEMBERS",
            "DEAFEN_MEMBERS",
            "MANAGE_MESSAGES",
            "MANAGE_NICKNAMES"
          ]
        });

        message.guild.roles.create({
          name: "V.I.P",
          color: "00ffff"
        });

        message.guild.roles.create({
          name: "�0�5ye",
          color: "WHITE"
        });

        message.guild.roles.create({
          name: "Bot",
          color: "ORANGE"
        });

        message.channel.send("Gerekli Odalar Kuruldu!");
      });
  }
});

///////////////kız arkadaşyapma
client.on("message", msg => {
  let kelime = msg.content.toLowerCase();
  if (
    kelime === "kız arkadaşım yok" ||
    kelime === "yanlızım" ||
    kelime === "karı kız" ||
    kelime === "kız lazım" ||
    kelime === "manita lazım" ||
    kelime === "sevgili arıyorum" ||
    kelime === "karı karı karı"
  ) {
    msg.reply(
      `**Hey Yıkık Çocuk !**, https://cdn.discordapp.com/attachments/653255820955615239/806876440234688523/ezgif.com-gif-maker_10.gif`
    );
  }
});

////////////////
client.on("guildMemberRemove", async member => {
  //let resimkanal = JSON.parse(fs.readFileSync("./ayarlar/gç.json", "utf8"));
  //const canvaskanal = member.guild.channels.cache.get(resimkanal[member.guild.id].resim);

  if (db.has(`gçkanal_${member.guild.id}`) === false) return;
  var canvaskanal = member.guild.channels.cache.get(
    db.fetch(`gçkanal_${member.guild.id}`)
  );
  if (!canvaskanal) return;

  const request = require("node-superfetch");
  const Canvas = require("canvas"),
    Image = Canvas.Image,
    Font = Canvas.Font,
    path = require("path");

  var randomMsg = ["Sunucudan Ayrıldı."];
  var randomMsg_integer =
    randomMsg[Math.floor(Math.random() * randomMsg.length)];

  let msj = await db.fetch(`cikisM_${member.guild.id}`);
  if (!msj) msj = `{uye}, ${randomMsg_integer}`;

  const canvas = Canvas.createCanvas(640, 360);
  const ctx = canvas.getContext("2d");

  const background = await Canvas.loadImage(
    "https://i.hizliresim.com/Wrn1XW.jpg"
  );
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#74037b";
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = `#D3D3D3`;
  ctx.font = `37px "Warsaw"`;
  ctx.textAlign = "center";
  ctx.fillText(`${member.user.username}`, 300, 342);

  let avatarURL = member.user.displayAvatarURL({
    format: "png",
    dynamic: true,
    size: 1024
  });
  const { body } = await request.get(avatarURL);
  const avatar = await Canvas.loadImage(body);

  ctx.beginPath();
  ctx.lineWidth = 4;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.arc(250 + 55, 55 + 55, 55, 0, 2 * Math.PI, false);
  ctx.clip();
  ctx.drawImage(avatar, 250, 55, 110, 110);

  const attachment = new Discord.MessageAttachment(
    canvas.toBuffer(),
    "ro-BOT-güle-güle.png"
  );

  canvaskanal.send(attachment);
  canvaskanal.send(
    msj.replace("{uye}", member).replace("{sunucu}", member.guild.name)
  );
  if (member.user.bot)
    return canvaskanal.send(`🤖 Bu bir bot, ${member.user.tag}`);
});

client.on("guildMemberAdd", async member => {
  if (db.has(`gçkanal_${member.guild.id}`) === false) return;
  var canvaskanal = member.guild.channels.cache.get(
    db.fetch(`gçkanal_${member.guild.id}`)
  );

  if (!canvaskanal || canvaskanal === undefined) return;
  const request = require("node-superfetch");
  const Canvas = require("canvas"),
    Image = Canvas.Image,
    Font = Canvas.Font,
    path = require("path");

  var randomMsg = [""];
  var randomMsg_integer =
    randomMsg[Math.floor(Math.random() * randomMsg.length)];

  let paket = await db.fetch(`pakets_${member.id}`);
  let msj = await db.fetch(`cikisM_${member.guild.id}`);
  if (!msj) msj = `{uye}, ${randomMsg_integer}`;

  const canvas = Canvas.createCanvas(640, 360);
  const ctx = canvas.getContext("2d");

  const background = await Canvas.loadImage(
    "https://cdn.discordapp.com/attachments/813881989778112562/836756865101856778/PicsArt_04-28-03.08.48.jpg"
  );
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#74037b";
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = `#ffffff`;
  ctx.font = `37px "Warsaw"`;
  ctx.textAlign = "center";
  ctx.fillText(`${member.user.username}`, 310, 320);

  let avatarURL = member.user.displayAvatarURL({
    format: "png",
    dynamic: true,
    size: 1024
  });
  const { body } = await request.get(avatarURL);
  const avatar = await Canvas.loadImage(body);

  ctx.beginPath();
  ctx.lineWidth = 30;
  ctx.fill();
  ctx.lineWidth = 15;
  ctx.arc(210, 210, 70, 0, Math.PI * 2, true)
  ctx.clip();
  ctx.drawImage(avatar, 75, 75, 234, 234);

  const attachment = new Discord.MessageAttachment(
    canvas.toBuffer(),
    "Adem-Reyzz-Bot-hosgeldin.png"
  );

  canvaskanal.send(attachment);
  canvaskanal.send(
    msj.replace("{uye}", member).replace("{sunucu}", member.guild.name)
  );
  if (member.user.bot)
    return canvaskanal.send(`Sunucuya Bir Bot Girdi ${member.user.tag}`);
});
////////////
client.on("guildMemberRemove", async member => {
  //let resimkanal = JSON.parse(fs.readFileSync("./ayarlar/gç.json", "utf8"));
  //const canvaskanal = member.guild.channels.get(resimkanal[member.guild.id].resim);

  if (db.has(`gçkanal_${member.guild.id}`) === false) return;
  var canvaskanal = member.guild.channels.get(
    db.fetch(`gçkanal_${member.guild.id}`)
  );
  if (!canvaskanal) return;

  const request = require("node-superfetch");
  const Canvas = require("canvas"),
    Image = Canvas.Image,
    Font = Canvas.Font,
    path = require("path");

  var randomMsg = [""];
  var randomMsg_integer =
    randomMsg[Math.floor(Math.random() * randomMsg.length)];

  let msj = await db.fetch(`cikisM_${member.guild.id}`);
  if (!msj) msj = `{uye}, ${randomMsg_integer}`;

  const canvas = Canvas.createCanvas(640, 360);
  const ctx = canvas.getContext("2d");

  const background = await Canvas.loadImage(
    "https://cdn.discordapp.com/attachments/813881989778112562/836756865521942558/PicsArt_04-28-03.12.23.jpg"
  );
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#74037b";
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = `#D3D3D3`;
  ctx.font = `37px "Warsaw"`;
  ctx.textAlign = "center";
  ctx.fillText(`${member.user.username}`, 300, 342);

  let avatarURL = member.user.displayAvatarURL({
    format: "png",
    dynamic: true,
    size: 1024
  });
  const { body } = await request.get(avatarURL);
  const avatar = await Canvas.loadImage(body);

  ctx.beginPath();
  ctx.lineWidth = 4;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.arc(250 + 55, 55 + 55, 55, 0, 2 * Math.PI, false);
  ctx.clip();
  ctx.drawImage(avatar, 250, 55, 110, 110);

  const attachment = new Discord.Attachment(
    canvas.toBuffer(),
    "ro-BOT-güle-güle.png"
  );

  canvaskanal.sendFileFilesCodeEmbedMessage(attachment);
  canvaskanal.sendFileFilesCodeEmbedMessage(
    msj.replace("{uye}", member).replace("{sunucu}", member.guild.name)
  );
  if (member.user.bot)
    return canvaskanal.sendFileFilesCodeEmbedMessage(
      `🤖 Bu bir bot, ${member.user.tag}`
    );
});

client.on("guildMemberAdd", async member => {
  if (db.has(`gçkanal_${member.guild.id}`) === false) return;
  var canvaskanal = member.guild.channels.get(
    db.fetch(`gçkanal_${member.guild.id}`)
  );

  if (!canvaskanal || canvaskanal === undefined) return;
  const request = require("node-superfetch");
  const Canvas = require("canvas"),
    Image = Canvas.Image,
    Font = Canvas.Font,
    path = require("path");

  var randomMsg = [""];
  var randomMsg_integer =
    randomMsg[Math.floor(Math.random() * randomMsg.length)];

  let paket = await db.fetch(`pakets_${member.id}`);
  let msj = await db.fetch(`cikisM_${member.guild.id}`);
  if (!msj) msj = `{uye}, ${randomMsg_integer}`;

  const canvas = Canvas.createCanvas(640, 360);
  const ctx = canvas.getContext("2d");

  const background = await Canvas.loadImage(
    "https://cdn.discordapp.com/attachments/813881989778112562/836756865101856778/PicsArt_04-28-03.08.48.jpg"
  );
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#74037b";
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = `#ffffff`;
  ctx.font = `37px "Warsaw"`;
  ctx.textAlign = "center";
  ctx.fillText(`${member.user.username}`, 300, 342);

  let avatarURL = member.user.displayAvatarURL({
    format: "png",
    dynamic: true,
    size: 1024
  });
  const { body } = await request.get(avatarURL);
  const avatar = await Canvas.loadImage(body);

  ctx.beginPath();
  ctx.lineWidth = 4;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.arc(250 + 55, 55 + 55, 55, 0, 2 * Math.PI, false);
  ctx.clip();
  ctx.drawImage(avatar, 250, 55, 110, 110);

  const attachment = new Discord.Attachment(
    canvas.toBuffer(),
    "https://cdn.discordapp.com/attachments/813881989778112562/836756865101856778/PicsArt_04-28-03.08.48.jpg"
  );

  canvaskanal.sendFileFilesCodeEmbedMessage(attachment);
  canvaskanal.sendFileFilesCodeEmbedMessage(
    msj.replace("{uye}", member).replace("{sunucu}", member.guild.name)
  );
  if (member.user.bot)
    return canvaskanal.sendFileFilesCodeEmbedMessage(
      `🤖 Bu bir bot, ${member.user.tag}`
    );
});
//////////
client.on("message", async message => {
  let gold = db.fetch(`gold_${message.author.id}`);
  if (gold === "gold") {
    if (message.content.toLowerCase() === "sa") {
      return message.channel.send(
        "**O Bir Premium üye.Aleyküm selam Hoşgeldin.**"
      );
    } else {
      return;
    }
  }
});
///////////
