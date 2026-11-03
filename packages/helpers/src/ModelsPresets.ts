import { JAVA_COMMON_PRESET } from '@asyncapi/modelina';
import type { ModelContext } from './types';

export { ModelContext };

// Helper function to add package declaration
function addPackage(content: string): string {
  return `package com.asyncapi.models;\n\n${content}`;
}

const websocketJavaPreset: Record<string, any> = {
  class: {
    self({ content, model }: ModelContext): string {
      // Solution to handle imports dynamically
      const requiredImports = new Set<string>();
      requiredImports.add('import java.util.Objects;');
      Object.values(model?.properties || {}).forEach(property => {
        const type = property.property?.type;

        if (type === 'Map<String, Object>') {
          requiredImports.add('import java.util.Map;');
        }
        // Add other type checks and imports as needed
      });
      const imports = Array.from(requiredImports).join('\n');
      return `package com.asyncapi.models;\n\n${imports}\n\n${content}`;
    }
  }
};

const otherModelTypes = ['enum', 'union'];
otherModelTypes.forEach(type => {
  websocketJavaPreset[type] = {
    self({ content }: { content: string }): string {
      return addPackage(content);
    }
  };
});

export const JavaModelsPresets = [
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
