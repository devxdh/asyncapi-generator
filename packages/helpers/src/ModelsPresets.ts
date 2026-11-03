import { JAVA_COMMON_PRESET } from '@asyncapi/modelina';
import type {
  ModelContext,
  PresetSelfArg,
  WebSocketJavaPreset,
  JavaModelsPresetItem
} from './types';

export type { ModelContext, PresetSelfArg, WebSocketJavaPreset, JavaModelsPresetItem };

/**
 * Helper function to prefix generated model code with package declaration.
 *
 * @param {string} content - Rendered model source code.
 * @returns {string} Source code prepended with package declaration.
 */
function addPackage(content: string): string {
  return `package com.asyncapi.models;\n\n${content}`;
}

const websocketJavaPreset: WebSocketJavaPreset = {
  class: {
    self({ content, model }: ModelContext): string {
      const requiredImports = new Set<string>();
      requiredImports.add('import java.util.Objects;');
      
      const properties = model && model.properties ? Object.values(model.properties) : [];
      for (const property of properties) {
        const type = property.property ? property.property.type : undefined;

        if (type === 'Map<String, Object>') {
          requiredImports.add('import java.util.Map;');
        }
      }
      const imports = Array.from(requiredImports).join('\n');
      return `package com.asyncapi.models;\n\n${imports}\n\n${content}`;
    }
  },
  enum: {
    self({ content }: PresetSelfArg): string {
      return addPackage(content);
    }
  },
  union: {
    self({ content }: PresetSelfArg): string {
      return addPackage(content);
    }
  }
};

/**
 * Shared Modelina presets for Java client generation.
 * Includes JAVA_COMMON_PRESET with equals/hashCode/toString, and package/import decorators.
 */
export const JavaModelsPresets: JavaModelsPresetItem[] = [
  {
    preset: JAVA_COMMON_PRESET,
    options: {
      equal: true,
      hashCode: true,
      classToString: true,
      marshalling: false
    }
  },
  websocketJavaPreset
];
