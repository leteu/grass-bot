import { graphql } from '@octokit/graphql'
import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder } from 'discord.js'
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

@Discord()
export class Statistics {
  @Slash({ name: 'stats', description: 'stats' })
  @Slash({ name: '통계', description: '통계' })
  async SlashStats(
    @SlashOption({
      name: 'username',
      description: 'Github username',
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    username: string,

    interaction: CommandInteraction,
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

      const embed = new EmbedBuilder()
        .setColor('Aqua')
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
          { name: 'Total pull requests', value: `${toPRs}` },
        )

      return { embeds: [embed] }
    } catch (e) {
      console.log(e)

      return `${username} is not defined.\n${username}를 찾을 수 없습니다.`
    }
  }
}
