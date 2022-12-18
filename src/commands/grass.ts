import { graphql } from '@octokit/graphql'
import { SimpleCommandMessage, Slash, SlashOption } from 'discordx'
import { Discord, SimpleCommand } from 'discordx'
import { grassWidget } from '../events/grassWidget'
import { CommandInteraction, MessageAttachment, MessageEmbed } from 'discord.js'
import * as path from 'path'
// const __dirname = path.resolve();
import * as fs from 'fs'
import { ContributionDay, GithubGraphQL } from 'types'

const accessToken = process.env.GITHUB_TOKEN
const githubGraphqlAPI = graphql.defaults({
  headers: {
    Authorization: `Bearer ${accessToken || ''}`,
  },
})

const DateQuery = (username: string) => `
{
  user(login: "${username}"){
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            contributionCount
            color
            date
            contributionLevel
            weekday
          }
        }
      }
    }
  }
}
`

function divistion(arr: ContributionDay[], n: number) {
  const len = arr.length
  const cnt = Math.floor(len / n) + (Math.floor(len % n) > 0 ? 1 : 0)
  let tmp = []

  for (var i = 0; i < cnt; i++) {
    tmp.push(arr.splice(0, n))
  }

  return tmp
}

@Discord()
export class Grass {
  @SimpleCommand('grass', { aliases: ['잔디'] })
  async SimpleGrass(command: SimpleCommandMessage): Promise<void> {
    command

    const username = command.message.content
      .replace('!', '')
      .trim()
      .replace('잔디 ', '')
      .trim()
      .replace('grass ', '')
      .trim()
      .split(/ +/g)

    if (username.length === 0) throw void 0

    username.forEach(async (arg) => {
      const result = await this.getGrassEmbed(arg)

      if (typeof result === 'string') {
        command.message.reply(result)
      } else {
        await command.message.reply({
          embeds: [result.embed],
          files: [result.file],
        })

        fs.unlink(path.resolve(path.resolve(), 'users', `${arg}.png`), function (err) {
          if (err) throw err
          console.log(`successfully deleted ${arg}.png`)
        })
        fs.unlink(path.resolve(path.resolve(), 'users', `${arg}.svg`), function (err) {
          if (err) throw err
          console.log(`successfully deleted ${arg}.svg`)
        })
      }
    })
  }

  @Slash('grass')
  @Slash('잔디')
  async SlashGrass(
    @SlashOption('username', { description: 'Github username', required: true })
    username: string,

    interaction: CommandInteraction
  ): Promise<void> {
    interaction.reply({
      content:
        'slash grass command will be released soon...\nplease use `!grass <username>` instead of splash\n\n슬래시 잔디 명령어는 준비중입니다...\n슬래시 명령어 대신 `!잔디 <username>`을 사용해보세요!',
      ephemeral: true,
    })

    // const result = await this.getGrassEmbed(username)

    // if (typeof result === 'string') {
    //   interaction.reply(result)
    // } else {
    //   await interaction.reply({
    //     embeds: [result.embed],
    //     files: [result.file],
    //   })

    //   fs.unlink(path.resolve(path.resolve(), 'users', `${username}.png`), function (err) {
    //     if (err) throw err
    //     console.log(`successfully deleted ${username}.png`)
    //   })
    //   fs.unlink(path.resolve(path.resolve(), 'users', `${username}.svg`), function (err) {
    //     if (err) throw err
    //     console.log(`successfully deleted ${username}.svg`)
    //   })
    // }
  }

  public async getGrassEmbed(username: string) {
    try {
      const { user } = await githubGraphqlAPI<GithubGraphQL>(DateQuery(username))
      const weeks = user.contributionsCollection.contributionCalendar.weeks
      const total = user.contributionsCollection.contributionCalendar.totalContributions

      const dateArr = divistion(
        weeks
          .reverse()
          .slice(0, 16)
          .reverse()
          .map((item) => item.contributionDays)
          .flat(2),
        7
      )

      await grassWidget(username, total, dateArr)

      const file = new MessageAttachment(path.resolve(path.resolve(), 'users', `${username}.png`))
      const embed = new MessageEmbed()
        .setColor('AQUA')
        .setTitle(`${username}'s 잔디`)
        .setDescription('Github contributions in the last 16 weeks')
        .setImage(`attachment://${username}.png`)
        .setAuthor({ name: 'leteu', url: 'https://github.com/leteu' })
        .setTimestamp()
        .setFooter({
          text: '문의 : leteu#0718',
          iconURL: 'https://avatars.githubusercontent.com/u/77822996?v=4',
        })

      return { embed, file }
    } catch (e) {
      return `${username} is not defined.\n${username}를 찾을 수 없습니다.`
    }
  }
}
