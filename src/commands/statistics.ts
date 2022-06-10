import { graphql } from "@octokit/graphql";
import { MessageEmbed } from "discord.js";
import type { SimpleCommandMessage } from "discordx";
import { Discord, SimpleCommand } from "discordx";

const accessToken = process.env.GITHUB_TOKEN;
const githubGraphqlAPI = graphql.defaults({
  headers: {
    Authorization: `Bearer ${accessToken || ""}`,
  }
});

const statQuery = (username: string) => `
{
  user(login: "${username}"){
    contributionsCollection {
      contributionCalendar {
        totalContributions
        
      }
    }
  }
}
`;

const statisticsEmbed = new MessageEmbed()
    .setColor("GREEN")

@Discord()
export class Statistics {
  @SimpleCommand("stat", { aliases: ["통계"] })
  async SimplePing(command: SimpleCommandMessage): Promise<void> {
    const username = command.message.content.replace("!", "").replace("stat ", "").replace("통계 ", '').trim().split(/ +/g);

    username.forEach(async arg => {
      const { user } = await githubGraphqlAPI(statQuery(arg));
      console.log(user.contributionsCollection);
      command.message.reply(`커밋 합계 : ${user.contributionsCollection.contributionCalendar.totalContributions}`);
    })
  }
}
