/* eslint-disable @typescript-eslint/no-explicit-any */
import CommandGroup from '../../../src/classes/command/CommandGroup';
import Command from '../../../src/classes/command/Command';
import ExtendedClient from '../../../src/classes/ExtendedClient';
import ConcreteCommand from '../../../__mocks__/command';

const clientMock = new ExtendedClient();

describe('Classes: Command: CommandGroup', () => {
  let group: CommandGroup;
  let command: Command;

  beforeEach(() => {
    group = new CommandGroup('group', 'Group');
    command = new ConcreteCommand(clientMock);
  });
  
  describe('registerCommand()', () => {
    it('should throw if command does not have the same groupID.', () => {
      group = new CommandGroup('notThisGroup', 'Group');

      expect(() => {
        group.registerCommand(command);
      }).toThrow();
    });

    it('should add the command to the group collection.', () => {
      group.registerCommand(command);

      expect(group.commands.get(command.name)).toBe(command);
    });

    it('should set the command group.', () => {
      group.registerCommand(command);

      expect(command.group).toBe(group);
    });
  });
});
