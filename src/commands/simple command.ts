import { CommandInteraction, Message } from "discord.js";
import type { SimpleCommandMessage } from "discordx";
import {
  Discord,
  SimpleCommand,
  Slash,
} from "discordx";

@Discord()
export class Example {
  @SimpleCommand('ping')
  SimplePing(command: SimpleCommandMessage): void {
    command.message.reply('pong!! 🏓')
  }
}
