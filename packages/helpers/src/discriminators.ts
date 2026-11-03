import type { MessageInterface, OperationInterface } from '@asyncapi/parser';
import type { DiscriminatorData, MessageLike, OperationLike } from './types';

export type { DiscriminatorData };

/**
 * Extracts discriminator metadata from an AsyncAPI message for operation routing.
 * 
 * Inspects the message payload schema for an AsyncAPI discriminator declaration,
 * checks that the discriminator property exists in payload properties, and extracts
 * its const value.
 *
 * @param {MessageInterface | MessageLike} message - The AsyncAPI message object.
 * @param {string} operationId - The operation ID associated with this message.
 * @returns {DiscriminatorData | null} Discriminator metadata with key, value, and operation_id, or null if invalid.
 */
export const getMessageDiscriminatorData = (
  message: MessageInterface | MessageLike,
  operationId: string
): DiscriminatorData | null => {
  if (!message || typeof message !== 'object') {
    return null;
  }
  if (!operationId || typeof operationId !== 'string') {
    return null;
  }

  if (typeof message.payload !== 'function') {
    return null;
  }
  const payload = message.payload();
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  if (typeof payload.discriminator !== 'function') {
    return null;
  }
  const discriminatorKey = payload.discriminator();
  if (!discriminatorKey || typeof discriminatorKey !== 'string') {
    return null;
  }

  if (typeof payload.properties !== 'function') {
    return null;
  }
  const properties = payload.properties();
  if (!properties || typeof properties !== 'object') {
    return null;
  }

  const discriminatorProperty = properties[discriminatorKey];
  if (!discriminatorProperty || typeof discriminatorProperty !== 'object') {
    return null;
  }

  if (typeof (discriminatorProperty as { const?: () => unknown }).const !== 'function') {
    return null;
  }
  const discriminatorValue = (discriminatorProperty as { const: () => unknown }).const();
  if (discriminatorValue === undefined || discriminatorValue === null || discriminatorValue === '') {
    return null;
  }

  return {
    key: discriminatorKey,
    value: String(discriminatorValue),
    operation_id: operationId
  };
};

/**
 * Extracts discriminator metadata from all messages across a list of AsyncAPI operations.
 *
 * @param {Array<OperationInterface | OperationLike>} operations - List of AsyncAPI Operation objects.
 * @returns {DiscriminatorData[]} Array of discriminator metadata objects with key, value, and operation_id.
 */
export const getMessageDiscriminatorsFromOperations = (
  operations: Array<OperationInterface | OperationLike>
): DiscriminatorData[] => {
  if (!operations || !Array.isArray(operations)) {
    return [];
  }
  const operationDiscriminators: DiscriminatorData[] = [];

  for (const operation of operations) {
    if (!operation || typeof operation.id !== 'function' || typeof operation.messages !== 'function') {
      continue;
    }
    const operationId = operation.id();
    if (!operationId) {
      continue;
    }
    const messagesCollection = operation.messages();
    if (!messagesCollection || typeof messagesCollection.all !== 'function') {
      continue;
    }
    const messages = messagesCollection.all();

    for (const message of messages) {
      const hasPayload = typeof message.hasPayload === 'function' ? message.hasPayload() : true;
      if (!hasPayload) {
        continue;
      }
      const discriminatorData = getMessageDiscriminatorData(message, operationId);
      if (discriminatorData !== null) {
        operationDiscriminators.push(discriminatorData);
      }
    }
  }

  return operationDiscriminators;
};
