import { graphql } from "@octokit/graphql";
import { CommandInteraction, Message } from "discord.js";
import type { SimpleCommandMessage } from "discordx";
import { Discord, SimpleCommand, Slash } from "discordx";

const accessToken = process.env.GITHUB_TOKEN;
const githubGraphqlAPI = graphql.defaults({
  headers: {
    Authorization: `Bearer ${accessToken || ""}`,
  }
});

const { user } = await githubGraphqlAPI(`
  {
    user(login: "leteu"){
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
`);

@Discord()
export class Example {
  @SimpleCommand("grass", { aliases: ["잔디"] })
  async SimplePing(command: SimpleCommandMessage): Promise<void> {
    // const $username = command.message;
    const $username = 'leteu';

    console.log(user);
  }
}
