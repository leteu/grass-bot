import util from "util";
import { graphql } from "@octokit/graphql";
import type { SimpleCommandMessage } from "discordx";
import { Discord, SimpleCommand } from "discordx";
import grassWidget from '../events/grassWidget.ts';
import { MessageAttachment, MessageEmbed } from "discord.js";
import * as path from 'path';
const __dirname = path.resolve();

type HexColorString = `#${string}`;
type ContributionLevelType =
  | "NONE"
  | `${"FIRST" | "SECOND" | "THIRD" | "FOURTH"}_QUARTILE`;
type weekdayType = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface ContributionDay {
  contributionCount: number;
  /**
   * #000000 ~ #FFFFFF
   */
  color: HexColorString;
  /**
   * Date - An ISO-8601 encoded date string.
   */
  date: string;
  /**
   * **NONE** - *No contributions occurred.*   
   * **FIRST_QUARTILE** - *Lowest 25% of days of contributions.*   
   * **SECOND_QUARTILE** - *Second lowest 25% of days of contributions. More contributions than the first quartile.*   
   * **THIRD_QUARTILE** - *Second highest 25% of days of contributions. More contributions than second quartile, less than the fourth quartile.*   
   * **FOURTH_QUARTILE** - *Highest 25% of days of contributions. More contributions than the third quartile.*
   */
  contributionLevel: ContributionLevelType;
  /**
   * number   
   * **0** - *Sunday(일)*   
   * **1** - *Monday(월)*   
   * **2** - *Tuesday(화)*   
   * **3** - *Wednesday(수)*   
   * **4** - *Thursday(목)*   
   * **5** - *Friday(금)*   
   * **6** - *Saturday(토)*   
   */
  weekday: weekdayType;
}

const accessToken = process.env.GITHUB_TOKEN;
const githubGraphqlAPI = graphql.defaults({
  headers: {
    Authorization: `Bearer ${accessToken || ""}`,
  },
});

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
`;

function divistion(arr: ContributionDay[], n: number) {
  const len = arr.length;
  const cnt = Math.floor(len / n) + (Math.floor(len % n) > 0 ? 1 : 0);
  let tmp = [];

  for (var i = 0; i < cnt; i++) {
    tmp.push(arr.splice(0, n));
  }

  return tmp;
}

@Discord()
export class Grass {
  @SimpleCommand("grass", { aliases: ["잔디"] })
  async SimplePing(command: SimpleCommandMessage): Promise<void> {
    command

    const username = command.message.content
      .replace("!", "").trim()
      .replace("잔디 ", "").trim()
      .replace("grass ", "").trim()
      .split(/ +/g);

    if (username.length === 0) return;

    username.forEach(async (arg) => {
      const { user } = await githubGraphqlAPI(DateQuery(arg));
      const weeks: { contributionDays: ContributionDay[] }[] =
        user.contributionsCollection.contributionCalendar.weeks;
      const total = user.contributionsCollection.contributionCalendar.totalContributions;

      const dateArr = divistion(weeks
        .reverse()
        .slice(0, 16)
        .reverse()
        .map((item) => item.contributionDays)
        .flat(2), 7);

      await grassWidget(arg, total, dateArr);

      const file = new MessageAttachment(path.resolve(__dirname, 'users', `${arg}.png`));
      const embed = new MessageEmbed()
          .setColor("AQUA")
          .setTitle(`${arg}'s 잔디`)
          .setDescription('Github contributions in the last 16 weeks')
          .setImage(`attachment://${arg}.png`)
          .setAuthor({ name: 'leteu', url: 'https://github.com/leteu' })
          .setTimestamp()
          .setFooter({ text: '문의 : leteu#0718', iconURL: 'https://avatars.githubusercontent.com/u/77822996?v=4' });

      command.message.reply({
        embeds: [embed],
        files: [file]
      })
    });
  }
}
