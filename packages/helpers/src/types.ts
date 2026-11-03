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

export interface DiscriminatorData {
  key: string;
  value: string;
  operation_id: string;
}

export interface DirectoryElement {
  type: 'directory' | 'file';
  name: string;
  path: string;
  children?: DirectoryElement[];
}

export interface ExpectedDirectoryElement {
  type: 'directory' | 'file';
  name: string;
  children?: ExpectedDirectoryElement[];
}

export interface TestConfig {
  testResultPath?: string;
  [key: string]: unknown;
}

export interface TestBuildConfig {
  clientFileName?: string;
  [key: string]: unknown;
}

export interface ModelProperty {
  property: {
    type?: string;
  };
}

export interface ModelContext {
  content: string;
  model?: {
    properties?: Record<string, ModelProperty>;
  };
}

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

export interface ChannelsLike {
  isEmpty(): boolean;
  all(): Iterable<ChannelLike | ChannelInterface> | Array<ChannelLike | ChannelInterface>;
}

export interface MessageLike {
  id?(): string;
  payload?(): {
    discriminator?(): string | undefined;
    properties?(): Record<string, { const?(): string | undefined } | unknown> | undefined;
  } | undefined;
  hasPayload?(): boolean;
  examples?(): {
    isEmpty(): boolean;
  } & unknown[];
}

export interface OperationLike {
  id(): string;
  messages(): {
    isEmpty?(): boolean;
    all(): Array<MessageInterface | MessageLike>;
  };
}

export interface ServerLike {
  host(): string;
  protocol(): string;
  hasPathname(): boolean;
  pathname(): string | undefined;
}

export interface ServersLike {
  has(name: string): boolean;
  get(name: string): ServerInterface | ServerLike | undefined;
  keys?(): Iterable<string>;
}

export interface AsyncAPIDocumentLike {
  info?(): InfoInterface | { title?(): string } | undefined;
}
