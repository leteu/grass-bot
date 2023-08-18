import { graphql } from '@octokit/graphql'
import { Slash, SlashOption } from 'discordx'
import { Discord } from 'discordx'
import { CommandInteraction, MessageAttachment, MessageEmbed } from 'discord.js'
import * as path from 'path'
// const __dirname = path.resolve();
import * as fs from 'fs'

import { ContributionDay, GithubGraphQL } from 'src/types'
import { grassWidget } from 'src/utils/grassWidget'

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
  @Slash('grass')
  @Slash('잔디')
  async SlashGrass(
    @SlashOption('username', { description: 'Github username', required: true })
    username: string,

    interaction: CommandInteraction
  ): Promise<void> {
    const result = await this.getGrassEmbed(username)

    if (typeof result === 'string') {
      interaction.reply(result)
    } else {
      await interaction.reply({
        embeds: [result.embed],
        files: [result.file],
        fetchReply: true,
      })

      fs.unlink(path.resolve(path.resolve(), 'users', `${username}.png`), function (err) {
        if (err) throw err
        console.log(`successfully deleted ${username}.png`)
      })
      fs.unlink(path.resolve(path.resolve(), 'users', `${username}.svg`), function (err) {
        if (err) throw err
        console.log(`successfully deleted ${username}.svg`)
      })
    }
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

      await grassWidget(username, dateArr)

      const file = new MessageAttachment(path.resolve(path.resolve(), 'users', `${username}.png`))
      const embed = new MessageEmbed()
        .setColor('AQUA')
        .setTitle(`${username}'s grass`)
        .setDescription(`${total} contributions in the last 16 weeks`)
        .setImage(`attachment://${username}.png`)
        .setAuthor({
          name: 'leteu',
          url: 'https://github.com/leteu',
        })
        .setTimestamp()
        .setFooter({
          text: 'discord : leteu',
          iconURL: 'https://avatars.githubusercontent.com/u/77822996?v=4',
        })

      return { embed, file }
    } catch (e) {
      return `${username} is not defined.\n${username}를 찾을 수 없습니다.`
    }
  }
}
