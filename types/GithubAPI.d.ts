type HexColorString = `#${string}`
type ContributionLevelType = 'NONE' | `${'FIRST' | 'SECOND' | 'THIRD' | 'FOURTH'}_QUARTILE`
type weekdayType = 0 | 1 | 2 | 3 | 4 | 5 | 6

interface ContributionDay {
  contributionCount: number
  /**
   * #000000 ~ #FFFFFF
   */
  color: HexColorString
  /**
   * Date - An ISO-8601 encoded date string.
   */
  date: string
  /**
   * **NONE** - *No contributions occurred.*
   * **FIRST_QUARTILE** - *Lowest 25% of days of contributions.*
   * **SECOND_QUARTILE** - *Second lowest 25% of days of contributions. More contributions than the first quartile.*
   * **THIRD_QUARTILE** - *Second highest 25% of days of contributions. More contributions than second quartile, less than the fourth quartile.*
   * **FOURTH_QUARTILE** - *Highest 25% of days of contributions. More contributions than the third quartile.*
   */
  contributionLevel: ContributionLevelType
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
  weekday: weekdayType
}

interface GithubGraphQL {
  user: {
    contributionsCollection: {
      contributionCalendar: {
        totalContributions: number
        weeks: { contributionDays: ContributionDay[] }[]
      }
      issueContributions: { totalCount: number }
      pullRequestContributions: { totalCount: number }
    }
  }
}

export { GithubGraphQL, HexColorString, ContributionLevelType, weekdayType, ContributionDay }
