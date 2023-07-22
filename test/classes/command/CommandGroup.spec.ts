import CommandGroup from '../../../src/classes/command/CommandGroup';
import RegularCommand from '../../../src/classes/command/RegularCommand';
import ExtendedClient from '../../../src/classes/ExtendedClient';
import { ConcreteRegularCommand } from '../../../__mocks__/command';

const clientMock = new ExtendedClient({ intents: [] });

describe('Classes: Command: CommandGroup', () => {
  let group: CommandGroup;
  let regularCommand: RegularCommand;

  beforeEach(() => {
    group = new CommandGroup('group', 'Group');
    regularCommand = new ConcreteRegularCommand(clientMock);
  });

  describe('registerCommand()', () => {
    it('should throw if regular command does not have the same groupID.', () => {
      group = new CommandGroup('notThisGroup', 'Group');

      expect(() => {
        group.registerCommand(regularCommand);
      }).toThrow();
    });

    it('should add the regular command to the group collection.', () => {
      group.registerCommand(regularCommand);

      expect(group.commands.get(regularCommand.name)).toBe(regularCommand);
    });

    it('should set the regular command group.', () => {
      group.registerCommand(regularCommand);

      expect(regularCommand.group).toBe(group);
    });
  });
});
