import { graphql } from '@octokit/graphql'
import { CommandInteraction, MessageEmbed } from 'discord.js'
import { Discord, Slash, SlashOption, SimpleCommand, SimpleCommandMessage } from 'discordx'
import { GithubGraphQL } from 'src/types'

const accessToken = process.env.GITHUB_TOKEN
const githubGraphqlAPI = graphql.defaults({
  headers: {
    Authorization: `Bearer ${accessToken || ''}`,
  },
})

const statQuery = (username: string) => `
{
  user(login: "${username}"){
    contributionsCollection {
      contributionCalendar {
        totalContributions
      }
      issueContributions {
        totalCount
      }
      pullRequestContributions {
        totalCount
      }
    }
  }
}
`

const statisticsEmbed = new MessageEmbed().setColor('GREEN')

@Discord()
export class Statistics {
  @SimpleCommand('stats', { aliases: ['통계'] })
  async SimplePing(command: SimpleCommandMessage): Promise<void> {
    const username = command.message.content
      .replace('!', '')
      .trim()
      .replace('통계 ', '')
      .trim()
      .replace('stats ', '')
      .trim()
      .split(/ +/g)

    if (username.length === 0) throw void 0

    username.forEach(async (arg) => {
      const embed = await this.getStatsEmbed(arg)

      await command.message.reply(embed)
    })
  }

  @Slash('stats')
  @Slash('통계')
  async SlashStats(
    @SlashOption('username', { description: 'Github username', required: true })
    username: string,

    interaction: CommandInteraction
  ): Promise<void> {
    const embed = await this.getStatsEmbed(username)

    await interaction.reply(embed)
  }

  public async getStatsEmbed(username: string) {
    try {
      const { user } = await githubGraphqlAPI<GithubGraphQL>(statQuery(username))

      const toContributions = user.contributionsCollection.contributionCalendar.totalContributions
      const toIssues = user.contributionsCollection.issueContributions.totalCount
      const toPRs = user.contributionsCollection.pullRequestContributions.totalCount

      const embed = new MessageEmbed()
        .setColor('AQUA')
        .setTitle(`${username}'s Github Statistics`)
        .setAuthor({
          name: 'leteu',
          iconURL: 'https://avatars.githubusercontent.com/u/77822996?v=4',
          url: 'https://github.com/leteu',
        })
        .setTimestamp()
        .setFooter({ text: '문의 : leteu#0718' })
        .addFields(
          { name: 'Total contributions', value: `${toContributions}` },
          { name: 'Total issues', value: `${toIssues}` },
          { name: 'Total pull requests', value: `${toPRs}` }
        )

      return { embeds: [embed] }
    } catch (e) {
      console.log(e)

      return `${username} is not defined.\n${username}를 찾을 수 없습니다.`
    }
  }
}
