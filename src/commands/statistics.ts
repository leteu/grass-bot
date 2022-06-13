import { graphql } from "@octokit/graphql";
import { MessageEmbed } from "discord.js";
import type { SimpleCommandMessage } from "discordx";
import { Discord, SimpleCommand } from "discordx";

const accessToken = process.env.GITHUB_TOKEN;
const githubGraphqlAPI = graphql.defaults({
  headers: {
    Authorization: `Bearer ${accessToken || ""}`,
  },
});

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
`;

const statisticsEmbed = new MessageEmbed().setColor("GREEN");

@Discord()
export class Statistics {
  @SimpleCommand("stats", { aliases: ["통계"] })
  async SimplePing(command: SimpleCommandMessage): Promise<void> {
    const username = command.message.content
      .replace("!", "")
      .trim()
      .replace("통계 ", "")
      .trim()
      .replace("stats ", "")
      .trim()
      .split(/ +/g);

    if (username.length === 0) throw void 0;

    username.forEach(async (arg) => {
      try {
        const { user } = await githubGraphqlAPI(statQuery(arg));

        const toContributions = user.contributionsCollection.contributionCalendar.totalContributions;
        const toIssues = user.contributionsCollection.issueContributions.totalCount;
        const toPRs = user.contributionsCollection.pullRequestContributions.totalCount;

        const embed = new MessageEmbed()
          .setColor("AQUA")
          .setTitle(`${arg}'s Github Statistics`)
          .setAuthor({ name: 'leteu', iconURL: 'https://avatars.githubusercontent.com/u/77822996?v=4', url: 'https://github.com/leteu' })
          .setTimestamp()
          .setFooter({ text: '문의 : leteu#0718' })
          .addFields(
            { name: 'Total contributions', value: `${toContributions}` },
            { name: 'Total issues', value: `${toIssues}` },
            { name: 'Total pull requests', value: `${toPRs}` },
          );

        command.message.reply({ embeds: [embed] });
      } catch (e) {
        console.log(e);

        command.message.reply(
          `${arg} is not defined.\n${arg}를 찾을 수 없습니다.`
        );
      }
    });
  }
}
