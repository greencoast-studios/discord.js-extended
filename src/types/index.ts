import Discord from 'discord.js';

export type ConfigValue = string | boolean | null | number | string[] | boolean[] | number[];
export type ConfigCustomValidators = Record<string, (value: ConfigValue) => void>;

export type CommandTrigger = Discord.Message | Discord.CommandInteraction;

export type PresenceTemplaterGetters = Record<string, () => Promise<string>>;
