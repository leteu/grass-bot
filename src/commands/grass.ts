import { graphql } from "@octokit/graphql";
import type { SimpleCommandMessage } from "discordx";
import { Discord, SimpleCommand } from "discordx";

const accessToken = process.env.GITHUB_TOKEN;
const githubGraphqlAPI = graphql.defaults({
  headers: {
    Authorization: `Bearer ${accessToken || ""}`,
  }
});

const DateQuery = (username: string) => `
{
  user(login: "${username}"){
    contributionsCollection {
      contributionCalendar {
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
`;

@Discord()
export class Grass {
  @SimpleCommand("grass", { aliases: ["잔디"] })
  async SimplePing(command: SimpleCommandMessage): Promise<void> {
    const username = command.message.content.replace("!잔디 ", "").replace("!grass ", '').trim().split(/ +/g);

    username.forEach(async arg => {
      const { user } = await githubGraphqlAPI(DateQuery(arg));
      console.log(user.contributionsCollection);
    })
  }
}
