import type {
  AsyncAPIDocumentInterface,
  ServerInterface,
  ServersInterface,
  ChannelInterface,
  ChannelsInterface,
  OperationInterface,
  MessageInterface,
  InfoInterface
} from '@asyncapi/parser';

export type {
  AsyncAPIDocumentInterface,
  ServerInterface,
  ServersInterface,
  ChannelInterface,
  ChannelsInterface,
  OperationInterface,
  MessageInterface,
  InfoInterface
};

/**
 * Discriminator metadata extracted from an AsyncAPI message for operation routing.
 */
export interface DiscriminatorData {
  key: string;
  value: string;
  operation_id: string;
}

/**
 * Represents a node in a directory tree scan.
 */
export interface DirectoryElement {
  type: 'directory' | 'file';
  name: string;
  path: string;
  children?: DirectoryElement[];
}

/**
 * Expected directory structure node used in integration snapshot assertions.
 */
export interface ExpectedDirectoryElement {
  type: 'directory' | 'file';
  name: string;
  children?: ExpectedDirectoryElement[];
}

/**
 * Test configuration object that may contain output directory paths.
 */
export interface TestConfig {
  testResultPath?: string;
  [key: string]: unknown;
}

/**
 * Parameters configuration used to build generator template test options.
 */
export interface TestBuildConfig {
  clientFileName?: string;
  [key: string]: unknown;
}

/**
 * Modelina model property representation.
 */
export interface ModelProperty {
  property?: {
    type?: string;
  };
}

/**
 * Modelina model context passed to class presets.
 */
export interface ModelContext {
  content: string;
  model?: {
    properties?: Record<string, ModelProperty>;
  };
}

/**
 * Basic preset argument providing content string.
 */
export interface PresetSelfArg {
  content: string;
}

/**
 * Section definition for a Modelina preset.
 */
export interface JavaPresetSection<T = PresetSelfArg> {
  self(args: T): string;
}

/**
 * WebSocket Java Modelina preset structure.
 */
export interface WebSocketJavaPreset {
  class: JavaPresetSection<ModelContext>;
  enum: JavaPresetSection<PresetSelfArg>;
  union: JavaPresetSection<PresetSelfArg>;
  [key: string]: JavaPresetSection<PresetSelfArg | ModelContext>;
}

/**
 * Common Modelina preset configured with specific generator flags.
 */
export interface JavaCommonPresetWithOptions {
  preset: unknown;
  options: {
    equal: boolean;
    hashCode: boolean;
    classToString: boolean;
    marshalling: boolean;
  };
}

/**
 * Union type representing items in JavaModelsPresets array.
 */
export type JavaModelsPresetItem = JavaCommonPresetWithOptions | WebSocketJavaPreset;

/**
 * Minimal structural interface for an AsyncAPI channel with bindings.
 */
export interface ChannelLike {
  id(): string;
  bindings?(): {
    has(name: string): boolean;
    get(name: string): {
      value(): {
        query?: {
          properties?: Record<string, { default?: unknown } | unknown>;
        };
      };
    };
  };
}

/**
 * Minimal structural interface for an AsyncAPI channels collection.
 */
export interface ChannelsLike {
  isEmpty(): boolean;
  all(): Iterable<ChannelLike | ChannelInterface> | Array<ChannelLike | ChannelInterface>;
}

/**
 * Minimal structural interface for an AsyncAPI message with payload and discriminator.
 */
export interface MessageLike {
  id?(): string;
  payload?(): {
    discriminator?(): string | undefined;
    properties?(): Record<string, { const?(): string | undefined } | unknown> | undefined;
  } | undefined;
  hasPayload?(): boolean;
  examples?(): {
    isEmpty?(): boolean;
  } & unknown[];
}

/**
 * Minimal structural interface for an AsyncAPI operation.
 */
export interface OperationLike {
  id(): string;
  messages(): {
    isEmpty?(): boolean;
    all(): Array<MessageInterface | MessageLike>;
  };
}

/**
 * Minimal structural interface for an AsyncAPI server object.
 */
export interface ServerLike {
  id?(): string;
  host(): string;
  protocol(): string;
  hasPathname?(): boolean;
  pathname?(): string | undefined;
}

/**
 * Minimal structural interface for an AsyncAPI servers collection or Map.
 */
export interface ServerCollection {
  has(name: string): boolean;
  get(name: string): ServerInterface | ServerLike | undefined;
  keys?(): Iterable<string>;
  all?(): Array<ServerInterface | ServerLike>;
}

/**
 * Minimal structural interface for an AsyncAPI document containing an Info section.
 */
export interface AsyncAPIDocumentLike {
  info?(): InfoInterface | { title?: (() => string) | string } | undefined;
}
