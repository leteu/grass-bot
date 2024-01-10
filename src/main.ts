import 'reflect-metadata'

import { dirname, importx } from '@discordx/importer'
import type { Interaction, Message, RichPresenceAssets } from 'discord.js'
import { IntentsBitField } from 'discord.js'
import { Client } from 'discordx'

interface StateInterface {
  guildCnt: number
}

const state = new Proxy<StateInterface>(
  {
    guildCnt: 0,
  },
  {
    get: (target, prop: keyof StateInterface) => {
      return target[prop]
    },
    set: <T extends StateInterface, K extends keyof T>(target: T, prop: K, value: T[K]) => {
      target[prop] = value

      return true
    },
  },
)

export const bot = new Client({
  // To only use global commands (use @Guild for specific guild command), comment this line
  botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],

  // Discord intents
  intents: [IntentsBitField.Flags.Guilds],

  // Debug logs are disabled in silent mode
  silent: false,

  // Configuration for @SimpleCommand
  // simpleCommand: {
  //   prefix: '!',
  // },
})

bot.once('ready', async (client) => {
  // Make sure all guilds are cached
  await bot.guilds.fetch()

  // Synchronize applications commands with Discord
  await bot.initApplicationCommands()

  // Synchronize applications command permissions with Discord
  // await bot.initApplicationPermissions()

  // To clear all guild commands, uncomment this line,
  // This is useful when moving from guild commands to global commands
  // It must only be executed once
  //
  //  await bot.clearApplicationCommands(
  //    ...bot.guilds.cache.map((g) => g.id)
  //  );

  console.log('Bot started')

  state.guildCnt = client.guilds.cache.size

  setActivity(client as Client)
})

bot.on('interactionCreate', (interaction: Interaction) => {
  bot.executeInteraction(interaction)
})

bot.on('messageCreate', (message: Message) => {
  bot.executeCommand(message)
})

//joined a server
bot.on('guildCreate', () => {
  state.guildCnt += 1
  setActivity(bot)
})

//removed from a server
bot.on('guildDelete', () => {
  state.guildCnt -= 1
  setActivity(bot)
})

async function run() {
  // The following syntax should be used in the commonjs environment
  //
  // await importx(__dirname + "/{events,commands}/**/*.{ts,js}");

  // The following syntax should be used in the ECMAScript environment
  await importx(dirname(require('url').pathToFileURL(__filename).toString()) + '/{events,commands}/**/*.{ts,js}')

  // Let's start the bot
  if (!process.env.BOT_TOKEN) {
    throw Error('Could not find BOT_TOKEN in your environment')
  }

  if (!process.env.GITHUB_TOKEN) {
    throw Error('Colud not find GITHUB_TOKEN in your environment')
  }

  // Log in with your bot token
  await bot.login(process.env.BOT_TOKEN)
}

function setActivity(client: Client) {
  client.user?.setActivity({
    name: `/도움말 /help | ${state.guildCnt}개의 서버에서 활동`,
  })
}

run()
