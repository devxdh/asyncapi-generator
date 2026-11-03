import type { MessageInterface, OperationInterface } from '@asyncapi/parser';
import type { DiscriminatorData, MessageLike, OperationLike } from './types';

export { DiscriminatorData };

/**
 * Extracts discriminator metadata from a message for operation routing.
 * 
 * @param {MessageInterface | MessageLike} message - The AsyncAPI message object containing payload and discriminator info.
 * @param {string} operationId - The operation ID associated with this message.
 * @returns {DiscriminatorData | null} An object with key, value, and operation_id if discriminator is valid; otherwise null.
 */
export const getMessageDiscriminatorData = (
  message: MessageInterface | MessageLike,
  operationId: string
): DiscriminatorData | null => {
  const payload = message.payload?.();
  if (!payload) {
    return null;
  }
  const discriminator = payload.discriminator?.();

  if (!discriminator) {
    return null;
  }

  const discriminator_key = discriminator;
  const properties = payload.properties?.();

  if (!properties || !properties[discriminator_key]) {
    return null;
  }

  const discriminatorProperty = properties[discriminator_key] as { const?(): string | undefined };
  const discriminator_value = discriminatorProperty?.const?.();

  if (!discriminator_value) {
    return null;
  }

  return {
    key: discriminator_key,
    value: discriminator_value,
    operation_id: operationId
  };
};

/**
 * Get discriminator metadata from all messages across a list of AsyncAPI operations.
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

  operations.forEach((operation) => {
    const operationId = operation.id();
    if (!operationId) {
      return;
    }
    const messages = operation.messages().all();

    messages
      .filter(message => (typeof message.hasPayload === 'function' ? message.hasPayload() : true))
      .forEach(message => {
        const discriminatorData = getMessageDiscriminatorData(message, operationId);
        if (discriminatorData) {
          operationDiscriminators.push(discriminatorData);
        }
      });
  });

  return operationDiscriminators;
};
