import { SlashCommandBuilder } from '@discordjs/builders';
import CommandInfo from './CommandInfo';

/**
 * The slash command's information object. This defines the command's properties, as well
 * as the data builder for the slash command.
 */
interface SlashCommandInfo extends CommandInfo {
  /**
   * The data builder for this slash command.
   */
  dataBuilder: SlashCommandBuilder;
}

export default SlashCommandInfo;
