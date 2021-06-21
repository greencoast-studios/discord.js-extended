import PresenceData from './PresenceData';

interface PresenceManagerOptions extends PresenceData {
  templates?: string[],
  refreshInterval?: number | null
}

export default PresenceManagerOptions;
