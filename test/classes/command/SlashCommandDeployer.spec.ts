import { mockDiscordJs } from '../../../__mocks__/local/discordMocks';
mockDiscordJs();

import { SlashCommandDeployer, ExtendedClient } from '../../../src';
import { ConcreteSlashCommand } from '../../../__mocks__/local/command';

let clientMock = new ExtendedClient({ testingGuildID: '123', intents: [] });
const slashCommandMocks = [new ConcreteSlashCommand(clientMock), new ConcreteSlashCommand(clientMock)];

describe('Classes: Command: SlashCommandDeployer', () => {
  let deployer: SlashCommandDeployer;
  let restPutSpy: jest.SpyInstance;

  beforeEach(() => {
    clientMock = new ExtendedClient({ testingGuildID: '123', intents: [] });
    deployer = new SlashCommandDeployer(clientMock);
    restPutSpy = jest.spyOn(deployer.rest, 'put').mockResolvedValue(null);

    clientMock.registry.getSlashCommands = jest.fn(() => slashCommandMocks);
  });

  describe('constructor()', function() {
    it('should emit a warn event if no testingGuildID is present in client.', () => {
      clientMock = new ExtendedClient();
      deployer = new SlashCommandDeployer(clientMock);

      expect(clientMock.emit).toHaveBeenCalledWith('warn', expect.anything());
    });

    it('should not emit a warn event if no testingGuildID is present in client.', () => {
      clientMock = new ExtendedClient({ testingGuildID: '123', intents: [] });
      deployer = new SlashCommandDeployer(clientMock);

      expect(clientMock.emit).not.toHaveBeenCalledWith('warn', expect.anything());
    });
  });

  describe('deployGlobally()', () => {
    it('should emit a commandsDeployed event if commands are deployed.', () => {
      restPutSpy.mockResolvedValueOnce(null);

      return deployer.deployGlobally()
        .then(() => {
          expect(clientMock.emit).toHaveBeenCalledWith('commandsDeployed', slashCommandMocks, null);
        });
    });

    it('should emit an error event if something goes wrong when deploying.', () => {
      const expectedError = new Error('oops.');
      restPutSpy.mockRejectedValueOnce(expectedError);
      expect.assertions(1);

      return deployer.deployGlobally()
        .catch(() => {
          expect(clientMock.emit).toHaveBeenCalledWith('error', expectedError);
        });
    });
  });

  describe('deployToGuild()', () => {
    it('should emit a commandsDeployed event if commands are deployed.', () => {
      restPutSpy.mockResolvedValueOnce(null);

      return deployer.deployToGuild('123')
        .then(() => {
          expect(clientMock.emit).toHaveBeenCalledWith('commandsDeployed', slashCommandMocks, '123');
        });
    });

    it('should emit an error event if something goes wrong when deploying.', () => {
      const expectedError = new Error('oops.');
      restPutSpy.mockRejectedValueOnce(expectedError);
      expect.assertions(1);

      return deployer.deployToGuild('123')
        .catch(() => {
          expect(clientMock.emit).toHaveBeenCalledWith('error', expectedError);
        });
    });
  });

  describe('deployToGuilds()', () => {
    it('should deploy to every guild specified.', () => {
      const deployToGuildSpy = jest.spyOn(deployer, 'deployToGuild');

      return deployer.deployToGuilds(['1', '2', '3'])
        .then(() => {
          expect(deployToGuildSpy).toHaveBeenCalledTimes(3);
        });
    });
  });

  describe('deployToTestingGuild()', () => {
    it('should reject if no testingGuildID is present in client.', () => {
      clientMock = new ExtendedClient();
      deployer = new SlashCommandDeployer(clientMock);
      expect.assertions(1);

      return deployer.deployToTestingGuild()
        .catch((error) => {
          expect(error.message).toContain('You have not set');
        });
    });

    it('should deploy to the testing guild.', () => {
      const deployToGuildSpy = jest.spyOn(deployer, 'deployToGuild');

      return deployer.deployToTestingGuild()
        .then(() => {
          expect(deployToGuildSpy).toHaveBeenCalledWith(clientMock.testingGuildID);
        });
    });
  });
});
