import type { ServerInterface, ServersInterface } from '@asyncapi/parser';
import type { ServerLike, ServersLike } from './types';

export { ServerLike, ServersLike };

/**
 * Get server URL from AsyncAPI server object.
 *
 * @param {ServerInterface | ServerLike} server - The AsyncAPI server object.
 * @returns {string} - The server URL.
 */
export const getServerUrl = (server: ServerInterface | ServerLike): string => {
  let url = server.host();

  // might be that somebody by mistake duplicated protocol info inside the host field
  // we need to make sure host do not hold protocol info
  if (server.protocol() && !url.includes(`${server.protocol()}://`)) {
    url = `${server.protocol()}://${url}`;
  }

  if (server.hasPathname()) {
    url = `${url}${server.pathname()}`;
  }

  return url;
};

/**
 * Retrieve a server object from the provided AsyncAPI servers collection.
 *
 * @param {ServersInterface | ServersLike | Map<string, ServerInterface>} servers - A map or collection of server names to AsyncAPI server objects.
 * @param {string} serverName - The name of the server to retrieve.
 * 
 * @throws {Error} If any of the parameter is missing or invalid.
 * @returns {ServerInterface | ServerLike} The AsyncAPI server object corresponding to the given server name.
 */
export const getServer = (
  servers: ServersInterface | ServersLike | Map<string, ServerInterface>,
  serverName: string
): ServerInterface | ServerLike => {
  if (!servers) {
    throw new Error("Provided AsyncAPI document doesn't contain Servers object.");
  }
  if (!serverName) {
    throw new Error('Server name must be provided.');
  }
  if (!servers.has(serverName)) {
    const available = typeof (servers as any).keys === 'function' ? Array.from((servers as any).keys()).join(', ') : '';
    throw new Error(`Server "${serverName}" not found in AsyncAPI document. Available servers: ${available}`);
  }
  return (servers as any).get(serverName);
};

/**
 * Get server Host from AsyncAPI server object.
 *
 * @param {ServerInterface | ServerLike} server - The AsyncAPI server object.
 * @returns {string} - The server host.
 */
export const getServerHost = (server: ServerInterface | ServerLike): string => {
  const serverHost = server.host();
  if (!serverHost) {
    throw new Error('Host not found in the server configuration.');
  }
  // Match common protocols followed by :// (User should not include protocol in host, check with server.protocol() method)
  const protocolRegex = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//;
  return serverHost.replace(protocolRegex, '');  
};

/**
 * Get server Protocol from AsyncAPI server object.
 *
 * @param {ServerInterface | ServerLike} server - The AsyncAPI server object.
 * @returns {string} - The server protocol.
 */
export const getServerProtocol = (server: ServerInterface | ServerLike): string => {
  const serverProtocol = server.protocol();
  
  if (!serverProtocol) {
    throw new Error('Protocol is not defined in server configuration.');
  }
  
  return serverProtocol;
};
