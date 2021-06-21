import Discord from 'discord.js';

interface PresenceData {
  type?: Discord.ActivityType,
  status?: Discord.PresenceStatusData,
  afk?: boolean
}

export default PresenceData;
