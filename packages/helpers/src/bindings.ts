import type { ChannelsInterface } from '@asyncapi/parser';
import type { ChannelsLike, ChannelLike } from './types';

export type { ChannelsLike, ChannelLike };

/**
 * Extracts query parameters from all channels with WebSocket bindings.
 *
 * Scans each channel in the collection. When a channel contains a WebSocket ('ws') binding
 * with query properties, this function extracts each property name and its default value
 * (or empty string if no default is specified).
 *
 * @param {ChannelsInterface | ChannelsLike} channels - An AsyncAPI channels collection object.
 * @returns {Map<string, Map<string, string>>} A Map where keys are channel names and values are Maps of parameter names to their defaults (or `''`).
 *
 * @example
 * // channels:
 * //   chat:
 * //     bindings:
 * //       ws:
 * //         query:
 * //           properties:
 * //             token: { default: 'auth123' }
 * //             roomId: { }
 * 
 * const allParams = getQueryParamsForAllChannels(channels);
 * const chatParams = allParams.get('chat');
 * console.log(chatParams.get('token')); // → 'auth123'
 * console.log(chatParams.get('roomId')); // → ''
 */
export function getQueryParamsForAllChannels(
  channels: ChannelsInterface | ChannelsLike
): Map<string, Map<string, string>> {
  const allChannelsParams = new Map<string, Map<string, string>>();
  
  if (!channels || typeof channels.isEmpty !== 'function' || channels.isEmpty()) {
    return allChannelsParams;
  }

  const allChannels = typeof channels.all === 'function' ? channels.all() : [];
  for (const channel of allChannels) {
    if (!channel || typeof channel.id !== 'function') {
      continue;
    }
    const channelName = channel.id();
    
    const channelLike = channel as ChannelLike;
    if (typeof channelLike.bindings !== 'function') {
      continue;
    }

    const bindings = channelLike.bindings();
    if (!bindings || typeof bindings.has !== 'function' || !bindings.has('ws')) {
      continue;
    }

    const wsBinding = bindings.get('ws');
    if (!wsBinding || typeof wsBinding.value !== 'function') {
      continue;
    }

    const bindingValue = wsBinding.value();
    if (!bindingValue || typeof bindingValue !== 'object') {
      continue;
    }

    const query = (bindingValue as { query?: unknown }).query;
    if (!query || typeof query !== 'object') {
      continue;
    }

    const properties = (query as { properties?: unknown }).properties;
    if (!properties || typeof properties !== 'object' || Object.keys(properties).length === 0) {
      continue;
    }

    const channelParams = new Map<string, string>();
    for (const [key, schema] of Object.entries(properties as Record<string, unknown>)) {
      let defaultValue = '';
      if (schema && typeof schema === 'object' && 'default' in schema) {
        const rawDefault = (schema as { default: unknown }).default;
        if (rawDefault !== undefined && rawDefault !== null) {
          defaultValue = String(rawDefault);
        }
      }
      channelParams.set(key, defaultValue);
    }

    allChannelsParams.set(channelName, channelParams);
  }

  return allChannelsParams;
}

/**
 * Extracts default query parameters from the first channel's WebSocket binding.
 * (Maintained for backward compatibility with single-channel templates)
 *
 * @param {ChannelsInterface | ChannelsLike} channels - An AsyncAPI channels collection object.
 * @returns {Map<string, string> | null} A Map of parameter names to defaults (or `''`), or null if no WS binding found.
 *
 * @example
 * const params = getQueryParams(channels);
 * if (params) {
 *   console.log(params.get('token'));
 * }
 */
export function getQueryParams(
  channels: ChannelsInterface | ChannelsLike
): Map<string, string> | null {
  const allChannelsParams = getQueryParamsForAllChannels(channels);
  
  if (allChannelsParams.size === 0) {
    return null;
  }

  const firstEntry = allChannelsParams.values().next();
  if (firstEntry.done || !firstEntry.value) {
    return null;
  }

  return firstEntry.value;
}
