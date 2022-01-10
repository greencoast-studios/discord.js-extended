import path from 'path';
import CommandRegistry from '../../../src/classes/command/CommandRegistry';
import CommandGroup from '../../../src/classes/command/CommandGroup';
import SlashCommand from '../../../src/classes/command/SlashCommand';
import ExtendedClient from '../../../src/classes/ExtendedClient';
import * as DefaultCommands from '../../../src/classes/command/default';
import { ConcreteRegularCommand, ConcreteSlashCommand } from '../../../__mocks__/command';

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
    let command: ConcreteRegularCommand;

    beforeEach(() => {
      command = new ConcreteRegularCommand(clientMock, { group: 'group' });
      registry.registerGroup('group', 'Group');
      registry.registerCommand(command);
    });

    it('should throw if command group is not registered.', () => {
      command = new ConcreteRegularCommand(clientMock, { group: 'unknown' });

      expect(() => {
        registry.registerCommand(command);
      }).toThrow();
    });

    it('should throw if command is already registered by name.', () => {
      expect(() => {
        registry.registerCommand(command);
      }).toThrow();
    });

    it('should throw if command is already registered by alias.', () => {
      const command1 = new ConcreteRegularCommand(clientMock, { name: 'cmd', aliases: ['commando'] });
      const command2 = new ConcreteRegularCommand(clientMock, { name: 'cmd2', aliases: ['cm3', 'cmd'] });
      const command3 = new ConcreteRegularCommand(clientMock, { name: 'cmd3', aliases: ['commando'] });

      registry.registerCommand(command1);

      expect(() => {
        registry.registerCommand(command2);
      }).toThrow();
      expect(() => {
        registry.registerCommand(command3);
      }).toThrow();
    });

    it('should throw if command aliases contain command name.', () => {
      const command = new ConcreteRegularCommand(clientMock, { name: 'cmd', aliases: ['cm3', 'cmd'] });

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
      const command = new ConcreteRegularCommand(clientMock, { group: 'unknown' });

      expect(() => {
        registry.registerCommands([command]);
      }).toThrow();
    });

    it('should throw if command is already registered.', () => {
      const command = new ConcreteRegularCommand(clientMock, { group: 'group' });
      registry.registerGroup('group', 'Group');

      expect(() => {
        registry.registerCommands([command, command]);
      }).toThrow();
    });

    it('should register the command.', () => {
      const commands = [
        new ConcreteRegularCommand(clientMock, { group: 'group1', name: 'cmd1' }),
        new ConcreteRegularCommand(clientMock, { group: 'group1', name: 'cmd2' }),
        new ConcreteRegularCommand(clientMock, { group: 'group2', name: 'cmd3' })
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
        expect(registry.groups.get('config')!.name).toBe('Configuration Commands');
      });
    });

    describe('registerDefaultCommands()', () => {
      it('should register all default regular commands if false is passed as parameter.', () => {
        registry.registerDefaultGroups();
        registry.registerDefaultCommands(false);

        expect(registry.commands.get('help')).toBeInstanceOf(DefaultCommands.Regular.HelpRegularCommand);
        expect(registry.commands.get('set_locale')).toBeInstanceOf(DefaultCommands.Regular.SetLocaleRegularCommand);
      });

      it('should register all default slash commands if true is passed as parameter.', () => {
        registry.registerDefaultGroups();
        registry.registerDefaultCommands();

        expect(registry.commands.get('help')).toBeInstanceOf(DefaultCommands.Slash.HelpSlashCommand);
        expect(registry.commands.get('set_locale')).toBeInstanceOf(DefaultCommands.Slash.SetLocaleSlashCommand);
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

    describe('resolveCommand()', () => {
      beforeEach(() => {
        registry.registerGroups([
          ['group1', 'Group1'],
          ['group2', 'Group2']
        ]);
        registry.registerCommands([
          new ConcreteRegularCommand(clientMock, { name: 'cmdName', group: 'group1' }),
          new ConcreteRegularCommand(clientMock, { name: 'cmdNameWithAlias', group: 'group2', aliases: ['alias1', 'alias2'] })
        ]);
      });

      it('should return undefined if no command is found.', () => {
        expect(registry.resolveCommand('unknown')).toBeUndefined();
      });

      it('should return a command if the command is found by name.', () => {
        expect(registry.resolveCommand('cmdName')).toHaveProperty('name', 'cmdName');
      });

      it('should return a command if the command with alias is found by name.', () => {
        expect(registry.resolveCommand('cmdNameWithAlias')).toHaveProperty('name', 'cmdNameWithAlias');
      });

      it('should return a command if the command with alias is found by alias.', () => {
        expect(registry.resolveCommand('alias1')).toHaveProperty('name', 'cmdNameWithAlias');
        expect(registry.resolveCommand('alias2')).toHaveProperty('name', 'cmdNameWithAlias');
      });
    });

    describe('getSlashCommands()', () => {
      beforeEach(() => {
        registry.registerGroups([
          ['group1', 'Group1'],
          ['group2', 'Group2']
        ]);
        registry.registerCommands([
          new ConcreteRegularCommand(clientMock, { name: 'reg1', group: 'group1' }),
          new ConcreteSlashCommand(clientMock, { name: 'slash1', group: 'group1' }),
          new ConcreteSlashCommand(clientMock, { name: 'slash2', group: 'group2' })
        ]);
      });

      it('should return an array of only slash commands.', () => {
        const commands = registry.getSlashCommands();

        commands.forEach((command) => {
          expect(command).toBeInstanceOf(SlashCommand);
        });

        expect(commands.some((command) => command.name === 'slash1')).toBe(true);
        expect(commands.some((command) => command.name === 'slash2')).toBe(true);
        expect(commands.some((command) => command.name === 'reg1')).toBe(false);
      });
    });
  });
});
