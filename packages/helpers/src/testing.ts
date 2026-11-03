import { readFile, rm, readdir } from 'fs/promises';
import path from 'path';
import type {
  TestConfig,
  DirectoryElement,
  ExpectedDirectoryElement,
  TestBuildConfig
} from './types';

export type { TestConfig, DirectoryElement, ExpectedDirectoryElement, TestBuildConfig };

/**
 * Ambient declaration of Jest's expect assertion function.
 * Allows helper to be compiled without hard-coupling to Jest runtime typings.
 */
declare const expect: (actual: unknown) => {
  toMatchSnapshot: (name: string) => void;
};

/**
 * Helper function to clean up test result paths recursively.
 *
 * Traverses configuration objects and deletes directory paths specified by `testResultPath`.
 *
 * @param {TestConfig} config - The configuration object containing paths to clean.
 */
export async function cleanTestResultPaths(config: TestConfig): Promise<void> {
  if (!config) return;

  if (typeof config.testResultPath === 'string' && config.testResultPath.length > 0) {
    try {
      await rm(config.testResultPath, { recursive: true, force: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Failed to clean ${config.testResultPath}: ${message}`);
    }
  } else if (!hasNestedConfig(config)) {
    console.warn('Configuration missing testResultPath - no test results to clean:', config);
  }

  // Recursively check nested configurations
  for (const subConfig of Object.values(config)) {
    if (typeof subConfig === 'object' && subConfig !== null) {
      await cleanTestResultPaths(subConfig as TestConfig);
    }
  }
}

/**
 * Helper function to check if a configuration object has nested sub-configs.
 *
 * @param {Record<string, unknown>} obj - The object to inspect.
 * @returns {boolean} True if any value is a non-null object.
 */
export function hasNestedConfig(obj: Record<string, unknown>): boolean {
  return Object.values(obj).some(val => typeof val === 'object' && val !== null);
}

/**
 * Helper function to recursively get all files and directories in a given directory.
 *
 * @param {string} dir - The directory path to scan.
 * @returns {Promise<DirectoryElement[]>} Array of directory elements with nested children.
 */
export async function getDirElementsRecursive(dir: string): Promise<DirectoryElement[]> {
  const elements: DirectoryElement[] = [];
  
  const items = await readdir(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      elements.push({
        type: 'directory',
        name: item.name,
        path: fullPath,
        children: await getDirElementsRecursive(fullPath)
      });
    } else {
      elements.push({
        type: 'file',
        name: item.name,
        path: fullPath
      });
    }
  }

  return elements;
}

/**
 * Helper function to build parameters for generator integration test cases.
 *
 * Standardizes common parameter structures across language targets.
 * Note: Language-specific logic (e.g. Java excluding clientFileName) is maintained here.
 *
 * @param {string} language - The target language (e.g., 'java', 'dart', 'python').
 * @param {TestBuildConfig} config - Configuration object containing test settings.
 * @param {string} [serverName] - Optional server name to pass to generator.
 * @param {Record<string, unknown>} [baseParams={}] - Additional parameters to merge into the final set.
 * @returns {Record<string, unknown>} The final parameters object for use in generator runs.
 */
export function buildParams(
  language: string,
  config: TestBuildConfig,
  serverName?: string,
  baseParams: Record<string, unknown> = {}
): Record<string, unknown> {
  const isJava = language.toLowerCase() === 'java';

  return {
    server: serverName,
    ...(isJava ? {} : { clientFileName: config.clientFileName }),
    ...baseParams,
  };
}

/**
 * Helper function to verify directory contents against expected snapshot elements.
 *
 * @param {ExpectedDirectoryElement[]} expectedElements - Expected tree structure with names and types.
 * @param {string} dirPath - The base path of the directory to verify.
 * @throws {Error} If a file is missing or unreadable.
 */
export async function verifyDirectoryStructure(
  expectedElements: ExpectedDirectoryElement[],
  dirPath: string
): Promise<void> {
  for (const element of expectedElements) {
    const filePath = path.join(dirPath, element.name);

    if (element.type === 'directory') {
      if (element.children && Array.isArray(element.children)) {
        await verifyDirectoryStructure(element.children, filePath);
      }
    } else if (element.type === 'file') {
      try {
        const content = await readFile(filePath, 'utf8');
        expect(content).toMatchSnapshot(element.name);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(`File ${filePath} not found or couldn't be read. Original error: ${message}`);
      }
    }
  }
}

/**
 * Get the list of file names in a directory (excluding subdirectories).
 *
 * @param {string} dir - The directory path.
 * @returns {Promise<string[]>} Array of file names.
 */
export const listFiles = async (dir: string): Promise<string[]> => {
  const dirElements = await readdir(dir, { withFileTypes: true });

  return dirElements
    .filter(dirE => dirE.isFile())
    .map(dirE => dirE.name);
};
