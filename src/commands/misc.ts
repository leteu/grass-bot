import { CommandInteraction, MessageEmbed } from 'discord.js'
import { Discord, Slash } from 'discordx'

@Discord()
export class Example {
  @Slash('ping')
  SlashPing(interaction: CommandInteraction): void {
    interaction.reply('pong!! 🏓')
  }

  @Slash('help')
  SlashHelp(command: CommandInteraction): void {
    const embed = new MessageEmbed()
      .setColor('AQUA')
      .setTitle(`깃허브 기여도 확인 봇 - help`)
      .setDescription('Github contributions bot commands')
      .setAuthor({
        name: 'leteu',
        iconURL: 'https://avatars.githubusercontent.com/u/77822996?v=4',
        url: 'https://github.com/leteu',
      })
      .setTimestamp()
      .setFooter({ text: '문의 : leteu#0718' })
      .addFields(
        { name: '/help', value: '도움말' },
        { name: '/grass | /잔디 <Github Username>', value: 'Contributions calendar | 기여 달력' },
        { name: '/stats | /통계 <Github Username>', value: 'Contributions statistics | 기여 통계' }
      )

    command.reply({ embeds: [embed], ephemeral: true })
  }
}
