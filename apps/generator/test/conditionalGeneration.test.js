const { isGenerationConditionMet } = require('../lib/conditionalGeneration');
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true });

describe('conditionalGeneration unit tests', () => {
  const testFeaturePath = 'feature/file.js';
  const serverProtocolSubject = 'server.protocol';
  const productionServer = 'production';

  const dummyAsyncapiDocument = {
    json: () => ({
      asyncapi: '2.0.0',
      info: {
        title: 'Dummy API',
        version: '1.0.0',
        contact: {
          name: 'API Support',
          url: 'https://example.com/support'
        }
      }
    }),
    servers: () => ({
      get: (name) => {
        if (name === productionServer) {
          return {
            json: () => ({
              url: 'production.example.com',
              protocol: 'kafka'
            })
          };
        }
        return undefined;
      }
    })
  };

  it('should return true when no conditional rules are configured', async () => {
    const templateConfig = {};
    const result = await isGenerationConditionMet(
      templateConfig,
      'some/path.js',
      {},
      dummyAsyncapiDocument
    );
    expect(result).toBe(true);
  });

  it('should return true when matched path is not in conditional rules', async () => {
    const templateConfig = {
      conditionalGeneration: {
        'other/path.js': {
          parameter: 'generateOther',
          validate: ajv.compile({ const: true })
        }
      }
    };
    const result = await isGenerationConditionMet(
      templateConfig,
      'some/path.js',
      {},
      dummyAsyncapiDocument
    );
    expect(result).toBe(true);
  });

  describe('conditionalGeneration - parameter-based condition', () => {
    it('should return true when parameter satisfies validation', async () => {
      const templateConfig = {
        conditionalGeneration: {
          [testFeaturePath]: {
            parameter: 'enableFeature',
            validate: ajv.compile({ const: true })
          }
        }
      };
      const templateParams = { enableFeature: true };
      const result = await isGenerationConditionMet(
        templateConfig,
        testFeaturePath,
        templateParams,
        dummyAsyncapiDocument
      );
      expect(result).toBe(true);
    });

    it('should return false when parameter fails validation', async () => {
      const templateConfig = {
        conditionalGeneration: {
          [testFeaturePath]: {
            parameter: 'enableFeature',
            validate: ajv.compile({ const: true })
          }
        }
      };
      const templateParams = { enableFeature: false };
      const result = await isGenerationConditionMet(
        templateConfig,
        testFeaturePath,
        templateParams,
        dummyAsyncapiDocument
      );
      expect(result).toBe(false);
    });

    it('should return false when parameter is missing and validation requires it', async () => {
      const templateConfig = {
        conditionalGeneration: {
          [testFeaturePath]: {
            parameter: 'enableFeature',
            validate: ajv.compile({ type: 'boolean', const: true })
          }
        }
      };
      const templateParams = {};
      const result = await isGenerationConditionMet(
        templateConfig,
        testFeaturePath,
        templateParams,
        dummyAsyncapiDocument
      );
      expect(result).toBe(false);
    });
  });

  describe('conditionalGeneration - subject-based condition', () => {
    it('should return true when subject query matches document and satisfies validation', async () => {
      const templateConfig = {
        conditionalGeneration: {
          'docs/support.html': {
            subject: 'info.contact.name',
            validate: ajv.compile({ const: 'API Support' })
          }
        }
      };
      const result = await isGenerationConditionMet(
        templateConfig,
        'docs/support.html',
        {},
        dummyAsyncapiDocument
      );
      expect(result).toBe(true);
    });

    it('should return false when subject query matches document but fails validation', async () => {
      const templateConfig = {
        conditionalGeneration: {
          'docs/support.html': {
            subject: 'info.contact.name',
            validate: ajv.compile({ const: 'Other Team' })
          }
        }
      };
      const result = await isGenerationConditionMet(
        templateConfig,
        'docs/support.html',
        {},
        dummyAsyncapiDocument
      );
      expect(result).toBe(false);
    });

    it('should return false when subject is not found in document', async () => {
      const templateConfig = {
        conditionalGeneration: {
          'docs/nonexistent.html': {
            subject: 'info.nonexistentField',
            validate: ajv.compile({ type: 'string' })
          }
        }
      };
      const result = await isGenerationConditionMet(
        templateConfig,
        'docs/nonexistent.html',
        {},
        dummyAsyncapiDocument
      );
      expect(result).toBe(false);
    });

    it('should correctly query server when server param is provided', async () => {
      const templateConfig = {
        conditionalGeneration: {
          'kafka/client.js': {
            subject: serverProtocolSubject,
            validate: ajv.compile({ const: 'kafka' })
          }
        }
      };
      const templateParams = { server: productionServer };
      const result = await isGenerationConditionMet(
        templateConfig,
        'kafka/client.js',
        templateParams,
        dummyAsyncapiDocument
      );
      expect(result).toBe(true);
    });

    it('should return false when queried server protocol does not match validation', async () => {
      const templateConfig = {
        conditionalGeneration: {
          'mqtt/client.js': {
            subject: serverProtocolSubject,
            validate: ajv.compile({ const: 'mqtt' })
          }
        }
      };
      const templateParams = { server: productionServer };
      const result = await isGenerationConditionMet(
        templateConfig,
        'mqtt/client.js',
        templateParams,
        dummyAsyncapiDocument
      );
      expect(result).toBe(false);
    });
  });

  describe('conditionalFiles (backward compatibility) - subject-based condition', () => {
    const testLegacyPath = 'legacy/file.js';

    it('should return true when legacy conditionalFiles subject satisfies validation', async () => {
      const templateConfig = {
        conditionalFiles: {
          [testLegacyPath]: {
            subject: 'info.title',
            validate: ajv.compile({ const: 'Dummy API' })
          }
        }
      };
      const result = await isGenerationConditionMet(
        templateConfig,
        testLegacyPath,
        {},
        dummyAsyncapiDocument
      );
      expect(result).toBe(true);
    });

    it('should return false when legacy conditionalFiles subject fails validation', async () => {
      const templateConfig = {
        conditionalFiles: {
          [testLegacyPath]: {
            subject: 'info.title',
            validate: ajv.compile({ const: 'Different API' })
          }
        }
      };
      const result = await isGenerationConditionMet(
        templateConfig,
        testLegacyPath,
        {},
        dummyAsyncapiDocument
      );
      expect(result).toBe(false);
    });

    it('should return false when legacy conditionalFiles subject is not in document', async () => {
      const templateConfig = {
        conditionalFiles: {
          [testLegacyPath]: {
            subject: 'info.unknownProperty',
            validate: ajv.compile({ const: 'val' })
          }
        }
      };
      const result = await isGenerationConditionMet(templateConfig,
        testLegacyPath,
        {},
        dummyAsyncapiDocument
      );
      expect(result).toBe(false);
    });
  });

  it('should return false when validate function is missing', async () => {
    const templateConfig = {
      conditionalGeneration: {
        'file.js': {
          parameter: 'flag'
        }
      }
    };
    const result = await isGenerationConditionMet(
      templateConfig,
      'file.js',
      { flag: true },
      dummyAsyncapiDocument
    );
    expect(result).toBe(false);
  });
});
