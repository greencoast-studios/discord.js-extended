/* eslint-disable camelcase */
import { mocked } from 'ts-jest/utils';
import fs from 'fs';
import ConfigProvider from '../../../src/classes/config/ConfigProvider';

jest.mock('fs');
const mockedFs = mocked(fs, true);

describe('Classes: Config: ConfigProvider', () => {
  let config: ConfigProvider;

  beforeAll(() => {
    mockedFs.existsSync.mockReturnValue(false);
  });

  beforeEach(() => {
    mockedFs.existsSync.mockClear();
    mockedFs.readFileSync.mockClear();
  });

  describe('get()', () => {
    describe('With default.', () => {
      const mockedDefault = {
        TOKEN: 'hi',
        OTHER_OPTION: '234'
      };

      it('should return any value from default.', () => {
        config = new ConfigProvider({ default: mockedDefault });
        
        expect(config.get('TOKEN')).toBe(mockedDefault.TOKEN);
        expect(config.get('OTHER_OPTION')).toBe(mockedDefault.OTHER_OPTION);
      });
    });

    describe('With configPath.', () => {
      const mockedJson = {
        token: 'hello',
        prefix: '?',
        other_option: false
      };

      beforeAll(() => {
        mockedFs.existsSync.mockReturnValue(true);
        mockedFs.readFileSync.mockReturnValue(Buffer.from(JSON.stringify(mockedJson), 'utf-8'));
      });

      afterAll(() => {
        mockedFs.existsSync.mockReturnValue(false);
      });

      it('should return any value from json.', () => {
        config = new ConfigProvider({ configPath: 'path' });

        expect(config.get('TOKEN')).toBe(mockedJson.token);
        expect(config.get('PREFIX')).toBe(mockedJson.prefix);
        expect(config.get('OTHER_OPTION')).toBe(mockedJson.other_option);
      });

      it('should override any default.', () => {
        config = new ConfigProvider({ configPath: 'path', default: { PREFIX: '!', OTHER_OPTION: 'x' } });

        expect(config.get('TOKEN')).toBe(mockedJson.token);
        expect(config.get('PREFIX')).toBe(mockedJson.prefix);
        expect(config.get('OTHER_OPTION')).toBe(mockedJson.other_option);
      });

      it('should not delete non-specified defaults.', () => {
        config = new ConfigProvider({ configPath: 'path', default: { NEW: 'new' } });

        expect(config.get('NEW')).toBe('new');
      });

      it('should not modify config if no path is provided.', () => {
        config = new ConfigProvider();

        expect(config.config).toMatchObject({});
      });

      it('should not modify config if path cannot be resolved.', () => {
        mockedFs.existsSync.mockReturnValueOnce(false);
        config = new ConfigProvider({ configPath: 'path' });

        expect(config.config).toMatchObject({});
      });
    });

    describe('With env.', () => {
      const mockedEnv = {
        DISCORD_TOKEN: 'whats up',
        DISCORD_PREFIX: ':',
        DISCORD_OTHER_OPTION: 'false',
        DISCORD_TRUE: 'true',
        SHOULD_BE_IGNORED: 'hey'
      };

      it('should return any value from env with a key that starts with DISCORD_.', () => {
        config = new ConfigProvider({ env: mockedEnv });

        expect(config.get('TOKEN')).toBe(mockedEnv.DISCORD_TOKEN);
        expect(config.get('PREFIX')).toBe(mockedEnv.DISCORD_PREFIX);
        expect(config.get('OTHER_OPTION')).toBe(false);
        expect(config.get('TRUE')).toBe(true);
        expect(Object.keys(config.config)).toHaveLength(4);
      });

      it('should override any default.', () => {
        config = new ConfigProvider({ env: mockedEnv, default: { TOKEN: 'new_token', TRUE: false } });

        expect(config.get('TOKEN')).toBe(mockedEnv.DISCORD_TOKEN);
        expect(config.get('PREFIX')).toBe(mockedEnv.DISCORD_PREFIX);
        expect(config.get('OTHER_OPTION')).toBe(false);
        expect(config.get('TRUE')).toBe(true);
      });

      it('should not delete non-specified defaults.', () => {
        config = new ConfigProvider({ env: mockedEnv, default: { NEW: 'new' } });

        expect(config.get('NEW')).toBe('new');
      });

      it('should override any config from file.', () => {
        mockedFs.existsSync.mockReturnValueOnce(true);
        mockedFs.readFileSync.mockReturnValueOnce(Buffer.from(JSON.stringify({ prefix: 'new_prefix', other_option: true }), 'utf-8'));
        config = new ConfigProvider({ env: mockedEnv, configPath: 'path' });

        expect(config.get('TOKEN')).toBe(mockedEnv.DISCORD_TOKEN);
        expect(config.get('PREFIX')).toBe(mockedEnv.DISCORD_PREFIX);
        expect(config.get('OTHER_OPTION')).toBe(false);
        expect(config.get('TRUE')).toBe(true);
      });

      it('should not delete non-specified from config file.', () => {
        mockedFs.existsSync.mockReturnValueOnce(true);
        mockedFs.readFileSync.mockReturnValueOnce(Buffer.from(JSON.stringify({ new: 'new' }), 'utf-8'));
        config = new ConfigProvider({ env: mockedEnv, configPath: 'path' });

        expect(config.get('NEW')).toBe('new');
      });

      it('should not modify config if no env is provided.', () => {
        config = new ConfigProvider();

        expect(config.config).toMatchObject({});
      });
    });
  });
});