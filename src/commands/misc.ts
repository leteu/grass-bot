import { ApplicationCommandOptionBase, CommandInteraction, EmbedBuilder } from 'discord.js'
import { Discord, Slash } from 'discordx'

@Discord()
export class Misc {
  @Slash({ description: 'ping', name: 'ping' })
  SlashPing(interaction: CommandInteraction): void {
    interaction.reply('pong!! 🏓')
  }

  @Slash({ description: '잔디 봇 도움말', name: '도움말' })
  @Slash({ description: 'help for use grass bot', name: 'help' })
  SlashHelp(command: CommandInteraction): void {
    const embed = new EmbedBuilder()
      .setColor('Aqua')
      .setTitle(`깃허브 기여도 확인 봇 - help`)
      .setDescription('Github contributions bot commands')
      .setAuthor({
        name: 'leteu',
        iconURL: 'https://avatars.githubusercontent.com/u/77822996?v=4',
        url: 'https://discord.com/users/leteu',
      })
      .setTimestamp()
      .setFooter({ text: 'discord : leteu' })
      .addFields(
        { name: '/help', value: '도움말' },
        { name: '/grass <Github Username> | /잔디 <Github Username>', value: 'Contributions calendar | 기여 달력' },
        { name: '/stats <Github Username> | /통계 <Github Username>', value: 'Contributions statistics | 기여 통계' },
      )

    command.reply({ embeds: [embed], ephemeral: true })
  }
}
