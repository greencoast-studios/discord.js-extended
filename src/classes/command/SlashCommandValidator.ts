import SlashCommand from './SlashCommand';

/**
 * A validator class to verify if the information of a slash command valid
 * and can be deployed.
 */
class SlashCommandValidator {
  private static readonly NAME_REGEX: RegExp = /^[\P{Lu}\p{N}_-]+$/u;
  private static readonly NAME_MIN: number = 1;
  private static readonly NAME_MAX: number = 32;

  private static readonly DESC_MIN: number = 1;
  private static readonly DESC_MAX: number = 100;


  /**
   * Validate a given slash command.
   * @param command The slash command to validate.
   * @throws Throws if command name is too short or too long.
   * @throws Throws if command name contains invalid characters (i.e. upper-cased characters).
   * @throws Throws if command description is too short or too long.
   * @throws Throws if any command alias is too short or too long.
   * @throws Throws if any command alias contains invalid characters (i.e. upper-cased characters).
   */
  public static validate(command: SlashCommand): void {
    SlashCommandValidator.validateName(command.name);
    SlashCommandValidator.validateDescription(command.description);

    for (const alias of command.aliases) {
      SlashCommandValidator.validateName(alias);
    }
  }

  /**
   * Validate the slash command's name.
   * @param name The name of the slash command.
   * @throws Throws if command name is too short or too long.
   * @throws Throws if command name contains invalid characters (i.e. upper-cased characters).
   */
  private static validateName(name: string): void {
    const { length } = name;

    if (length < SlashCommandValidator.NAME_MIN || length > SlashCommandValidator.NAME_MAX) {
      throw new RangeError(`${name} is not a valid name for a SlashCommand. It must be between ${SlashCommandValidator.NAME_MIN} and ${SlashCommandValidator.NAME_MAX} characters long.`);
    }

    if (!SlashCommandValidator.NAME_REGEX.test(name)) {
      throw new Error(`${name} is not a valid name for a SlashCommand. Please use all lower-cased characters.`);
    }
  }

  /**
   * Validate the slash command's description.
   * @param description
   * @throws Throws if command description is too short or too long.
   */
  private static validateDescription(description: string): void {
    const { length } = description;

    if (length < SlashCommandValidator.DESC_MIN || length > SlashCommandValidator.DESC_MAX) {
      throw new RangeError(`${description} is not a valid name for a SlashCommand. It must be between ${SlashCommandValidator.DESC_MIN} and ${SlashCommandValidator.DESC_MAX} characters long.`);
    }
  }
}

export default SlashCommandValidator;
