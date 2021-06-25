import path from 'path';
import CommandRegistry from '../../../src/classes/command/CommandRegistry';
import CommandGroup from '../../../src/classes/command/CommandGroup';
import ExtendedClient from '../../../src/classes/ExtendedClient';
import DefaultCommands from '../../../src/classes/command/default';
import ConcreteCommand from '../../../__mocks__/command';

describe('Classes: Command: CommandRegistry', () => {
  let clientMock: ExtendedClient;
  let registry: CommandRegistry;

  beforeEach(() => {
    clientMock = new ExtendedClient();
    registry = new CommandRegistry(clientMock);
  });

  describe('registerGroup()', () => {
    it('should register the group.', () => {
      registry.registerGroup('group', 'Group');

      expect(registry.groups.get('group')).toBeInstanceOf(CommandGroup);
      expect(registry.groups.get('group')!.id).toBe('group');
    });

    it('should throw if group is already registered.', () => {
      registry.registerGroup('group', 'Group');

      expect(() => {
        registry.registerGroup('group', 'Group');
      }).toThrow();
    });

    it('should emit a groupRegistered event.', () => {
      registry.registerGroup('group', 'Group');

      expect(clientMock.emit).toHaveBeenCalledWith('groupRegistered', expect.anything());
    });
  });

  describe('registerGroups()', () => {
    it('should register multiple groups.', () => {
      registry.registerGroups([
        ['group1', 'Group1'],
        ['group2', 'Group2']
      ]);

      expect(registry.groups.get('group1')).toBeInstanceOf(CommandGroup);
      expect(registry.groups.get('group1')!.id).toBe('group1');
      expect(registry.groups.get('group2')).toBeInstanceOf(CommandGroup);
      expect(registry.groups.get('group2')!.id).toBe('group2');
    });

    it('should throw if group is already registered.', () => {
      expect(() => {
        registry.registerGroups([
          ['group1', 'Group1'],
          ['group1', 'Group1']
        ]);
      }).toThrow();
    });
  });

  describe('registerCommand()', () => {
    let command: ConcreteCommand;

    beforeEach(() => {
      command = new ConcreteCommand(clientMock, { group: 'group' });
      registry.registerGroup('group', 'Group');
      registry.registerCommand(command);
    });

    it('should throw if command group is not registered.', () => {
      command = new ConcreteCommand(clientMock, { group: 'unknown' });

      expect(() => {
        registry.registerCommand(command);
      }).toThrow();
    });

    it('should throw if command is already registered.', () => {
      expect(() => {
        registry.registerCommand(command);
      }).toThrow();
    });

    it('should register the command.', () => {
      expect(registry.commands.get(command.name)).toBe(command);
    });

    it('should emit a commandRegistered event.', () => {
      expect(clientMock.emit).toHaveBeenCalledWith('commandRegistered', command);
    });
  });

  describe('registerCommands()', () => {
    it('should throw if command group is not registered.', () => {
      const command = new ConcreteCommand(clientMock, { group: 'unknown' });

      expect(() => {
        registry.registerCommands([command]);
      }).toThrow();
    });

    it('should throw if command is already registered.', () => {
      const command = new ConcreteCommand(clientMock, { group: 'group' });
      registry.registerGroup('group', 'Group');

      expect(() => {
        registry.registerCommands([command, command]);
      }).toThrow();
    });

    it('should register the command.', () => {
      const commands = [
        new ConcreteCommand(clientMock, { group: 'group1', name: 'cmd1' }),
        new ConcreteCommand(clientMock, { group: 'group1', name: 'cmd2' }),
        new ConcreteCommand(clientMock, { group: 'group2', name: 'cmd3' })
      ];
      registry.registerGroups([
        ['group1', 'Group1'],
        ['group2', 'Group2']
      ]);
      registry.registerCommands(commands);

      commands.forEach((command) => {
        expect(registry.commands.get(command.name)).toBe(command);
      });
    });

    // WARNING: This test requires the project to be built since the JS mocks require from dist.
    describe('registerCommandsIn()', () => {
      it('should register all commands in a directory for each group.', () => {
        registry.registerGroups([
          ['group1', 'Group1'],
          ['group2', 'Group2']
        ]);
        registry.registerCommandsIn(path.join(__dirname, '../../../__mocks__/commandMocks'));

        ['Group1JSCommand', 'Group1TSCommand', 'Group2Command'].forEach((commandName) => {
          expect(registry.commands.has(commandName)).toBe(true);
        });

        ['NoGroupCommand', 'UnregisteredGroupCommand'].forEach((commandName) => {
          expect(registry.commands.has(commandName)).toBe(false);
        });

        expect(registry.commands.reduce((s) => s + 1, 0)).toBe(3);
      });
    });

    describe('registerDefaultGroups()', () => {
      it('should register all default groups.', () => {
        registry.registerDefaultGroups();

        expect(registry.groups.get('misc')!.name).toBe('Miscellaneous Commands');
      });
    });

    describe('registerDefaultCommands()', () => {
      it('should register all default commands.', () => {
        registry.registerDefaultGroups();
        registry.registerDefaultCommands();

        expect(registry.commands.get('help')).toBeInstanceOf(DefaultCommands.HelpCommand);
      });

      it('should throw if the default groups are not registered prior.', () => {
        expect(() => {
          registry.registerDefaultCommands();
        }).toThrow();
      });
    });

    describe('registerDefaults()', () => {
      it('should call registerDefaultGroups() and registerDefaultCommands().', () => {
        jest.spyOn(registry, 'registerDefaultGroups');
        jest.spyOn(registry, 'registerDefaultCommands');
        registry.registerDefaults();

        expect(registry.registerDefaultGroups).toHaveBeenCalledTimes(1);
        expect(registry.registerDefaultCommands).toHaveBeenCalledTimes(1);
      });
    });
  });
});
