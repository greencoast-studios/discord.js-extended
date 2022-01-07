import Discord from 'discord.js';

export type ConfigValue = string | boolean | null | number;

export type CommandTrigger = Discord.Message | Discord.Interaction;
