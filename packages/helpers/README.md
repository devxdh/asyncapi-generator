# @asyncapi/generator-helpers

A utility library providing reusable TypeScript and JavaScript helpers over the AsyncAPI Parser and Generator pipelines. These helpers simplify template creation, eliminate boilerplate, and standardize data extraction from AsyncAPI documents.

## Installation

```bash
npm install @asyncapi/generator-helpers
```

## Features & Exports

### Servers
- `getServerUrl(server)`: Resolves full URL for an AsyncAPI server object, handling protocols and pathnames safely.
- `getServer(servers, serverName)`: Retrieves a specific server from a servers collection or map, throwing clear errors if missing.
- `getServerHost(server)`: Extracts host string without protocol prefix.
- `getServerProtocol(server)`: Extracts protocol string from server.

### Channels & Bindings
- `getQueryParamsForAllChannels(channels)`: Extracts query parameters and defaults from all channels with WebSocket bindings as nested Maps.
- `getQueryParams(channels)`: Backwards-compatible helper returning query parameters from the first channel with WebSocket bindings.

### Operations & Messages
- `getOperationMessages(operation)`: Returns an array of messages associated with an operation or `null` if none exist.
- `getMessageExamples(message)`: Retrieves examples collection from a message or `null`.
- `getMessageDiscriminatorData(message, operationId)`: Extracts discriminator metadata (`key`, `value`, `operation_id`) for routing.
- `getMessageDiscriminatorsFromOperations(operations)`: Returns all discriminator data across a list of operations.

### Utils
- `getInfo(asyncapi)`: Validates and returns the document's `info` section.
- `getTitle(asyncapi)`: Validates and retrieves the non-empty document title.
- `getClientName(asyncapi, appendClientSuffix, customClientName)`: Formats and generates a client class/file name from title.
- `toSnakeCase(str)`: Converts camelCase or PascalCase strings to snake_case.
- `toCamelCase(str)`: Converts kebab-case or snake_case strings to camelCase.
- `lowerFirst(str)` / `upperFirst(str)`: Casing helpers.

### Testing Helpers
- `cleanTestResultPaths(config)`: Recursively cleans test output directories.
- `getDirElementsRecursive(dir)`: Scans directories and returns a recursive file/directory tree.
- `buildParams(language, config, serverName, baseParams)`: Standardizes generator parameters for integration test suites.
- `verifyDirectoryStructure(expectedElements, dirPath)`: Validates directory output against Jest snapshots.
- `listFiles(dir)`: Returns file names within a directory.

### Modelina Presets
- `JavaModelsPresets`: Shared Modelina presets for Java clients.

## Development & Build

This package is authored in TypeScript under `src/` and compiled to CommonJS with complete `.d.ts` declaration files in `lib/`.

```bash
npm run build      # Compile TypeScript with tsc
npm test           # Run Jest test suite
npm run lint       # Lint source and test files
```

## License

Apache-2.0
