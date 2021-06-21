import PresenceData from './PresenceData';

interface PresenceManagerOptions extends PresenceData {
  templates?: string[],
  refreshInterval?: number
}

export default PresenceManagerOptions;
