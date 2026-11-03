import type { ServerInterface, ServersInterface } from '@asyncapi/parser';
import type { ServerLike, ServerCollection } from './types';

export type { ServerLike, ServerCollection };

/**
 * Get server URL from AsyncAPI server object.
 *
 * Ensures protocol is correctly prepended if omitted, and appends pathname when defined.
 *
 * @param {ServerInterface | ServerLike} server - The AsyncAPI server object.
 * @throws {Error} If server object is missing or has no host method.
 * @returns {string} The formatted server URL.
 */
export const getServerUrl = (server: ServerInterface | ServerLike): string => {
  if (!server || typeof server.host !== 'function') {
    throw new Error('Valid server object must be provided.');
  }
  let url = server.host();

  // Handle case where user or spec omits protocol in host field
  if (typeof server.protocol === 'function') {
    const protocol = server.protocol();
    if (protocol && !url.includes(`${protocol}://`)) {
      url = `${protocol}://${url}`;
    }
  }

  if (typeof server.hasPathname === 'function' && server.hasPathname()) {
    if (typeof server.pathname === 'function') {
      const pathname = server.pathname();
      if (pathname) {
        url = `${url}${pathname}`;
      }
    }
  }

  return url;
};

/**
 * Extracts a formatted list of available server names from a collection or Map.
 */
function getAvailableServerNames(
  servers: ServersInterface | ServerCollection | Map<string, ServerInterface>
): string {
  const serverMap = servers as { keys?: () => Iterable<string>; all?: () => Array<{ id(): string }> };
  if (typeof serverMap.keys === 'function') {
    return Array.from(serverMap.keys()).join(', ');
  }
  if (typeof serverMap.all === 'function') {
    return serverMap.all().map(server => server.id()).join(', ');
  }
  return '';
}

/**
 * Retrieve a server object from the provided AsyncAPI servers collection.
 *
 * @param {ServersInterface | ServerCollection | Map<string, ServerInterface>} servers - A collection or Map of server objects.
 * @param {string} serverName - The name of the server to retrieve.
 * @throws {Error} If servers is missing, serverName is missing, or serverName is not found.
 * @returns {ServerInterface | ServerLike} The AsyncAPI server object corresponding to the given server name.
 */
export const getServer = (
  servers: ServersInterface | ServerCollection | Map<string, ServerInterface>,
  serverName: string
): ServerInterface | ServerLike => {
  if (!servers) {
    throw new Error("Provided AsyncAPI document doesn't contain Servers object.");
  }
  if (!serverName) {
    throw new Error('Server name must be provided.');
  }
  if (typeof servers.has !== 'function' || !servers.has(serverName)) {
    const available = getAvailableServerNames(servers);
    throw new Error(`Server "${serverName}" not found in AsyncAPI document. Available servers: ${available}`);
  }
  const server = servers.get(serverName);
  if (!server) {
    throw new Error(`Server "${serverName}" was not found.`);
  }
  return server;
};

/**
 * Get server Host from AsyncAPI server object without protocol prefix.
 *
 * @param {ServerInterface | ServerLike} server - The AsyncAPI server object.
 * @throws {Error} If server is invalid or host is missing.
 * @returns {string} The server host without protocol prefix.
 */
export const getServerHost = (server: ServerInterface | ServerLike): string => {
  if (!server || typeof server.host !== 'function') {
    throw new Error('Host not found in the server configuration.');
  }
  const serverHost = server.host();
  if (!serverHost) {
    throw new Error('Host not found in the server configuration.');
  }
  // Match common protocols followed by :// (e.g. ws://, wss://, kafka://)
  const protocolRegex = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//;
  return serverHost.replace(protocolRegex, '');  
};

/**
 * Get server Protocol from AsyncAPI server object.
 *
 * @param {ServerInterface | ServerLike} server - The AsyncAPI server object.
 * @throws {Error} If server is invalid or protocol is not defined.
 * @returns {string} The server protocol.
 */
export const getServerProtocol = (server: ServerInterface | ServerLike): string => {
  if (!server || typeof server.protocol !== 'function') {
    throw new Error('Protocol is not defined in server configuration.');
  }
  const serverProtocol = server.protocol();
  
  if (!serverProtocol) {
    throw new Error('Protocol is not defined in server configuration.');
  }
  
  return serverProtocol;
};
