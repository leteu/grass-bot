import { graphql } from '@octokit/graphql'
import { CommandInteraction, MessageEmbed } from 'discord.js'
import { Discord, Slash, SlashOption } from 'discordx'
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
          url: 'https://github.com/leteu',
        })
        .setTimestamp()
        .setFooter({
          text: 'discord : leteu',
          iconURL: 'https://avatars.githubusercontent.com/u/77822996?v=4',
        })
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
