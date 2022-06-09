import { graphql } from "@octokit/graphql";
import { Query } from "@octokit/graphql/dist-types/types";
import { CommandInteraction, Message } from "discord.js";
import type { SimpleCommandMessage } from "discordx";
import { Discord, SimpleCommand, Slash } from "discordx";

const accessToken = process.env.GITHUB_TOKEN;
const githubGraphqlAPI = graphql.defaults({
  headers: {
    Authorization: `Bearer ${accessToken || ""}`,
  }
});

const query = ($username: string) => `
{
  user(login: "${$username}"){
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            contributionCount
            date
          }
        }
      }
    }
  }
}
`;

@Discord()
export class Example {
  @SimpleCommand("grass", { aliases: ["잔디"] })
  async SimplePing(command: SimpleCommandMessage): Promise<void> {
    const $username = command.message.content.replace("!잔디 ", "").replace("!grass ", '').trim().split(/ +/g);

    $username.forEach(async arg => {
      const { user } = await githubGraphqlAPI(query(arg));
      console.log(user.contributionsCollection);
    })
  }
}
