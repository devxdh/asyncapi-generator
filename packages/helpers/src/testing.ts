import { readFile, rm, readdir } from 'fs/promises';
import path from 'path';
import type {
  TestConfig,
  DirectoryElement,
  ExpectedDirectoryElement,
  TestBuildConfig
} from './types';

export { TestConfig, DirectoryElement, ExpectedDirectoryElement, TestBuildConfig };

/**
 * Helper function to clean up test result paths recursively.
 * @param {TestConfig} config - The configuration object containing paths to clean. 
 */
export async function cleanTestResultPaths(config: TestConfig): Promise<void> {
  if (!config) return;

  if (config.testResultPath) {
    try {
      await rm(config.testResultPath, { recursive: true, force: true });
    } catch (error: any) {
      console.error(`Failed to clean ${config.testResultPath}: ${error?.message}`);
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
 * Helper function to check if config has nested sub-configs.
 * @param {Record<string, unknown>} obj - The object to inspect.
 * @returns {boolean} True if any value is a non-null object.
 */
export function hasNestedConfig(obj: Record<string, unknown>): boolean {
  return Object.values(obj).some(val => typeof val === 'object' && val !== null);
}

/**
 * Helper function to recursively get all files and directories in a given directory.
 * @param {string} dir - The directory path to scan.
 * @returns {Promise<DirectoryElement[]>} Array of directory elements.
 */
export async function getDirElementsRecursive(dir: string): Promise<DirectoryElement[]> {
  const elements: DirectoryElement[] = [];
  
  const items = await readdir(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      // If it's a directory, add it to the list and recurse into it
      elements.push({
        type: 'directory',
        name: item.name,
        path: fullPath,
        children: await getDirElementsRecursive(fullPath)
      });
    } else {
      // If it's a file, just add it to the list
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
 * Helper function to build parameters for the test cases.
 * 
 * Consider refactoring if language-specific logic grows.
 * 
 * @param {string} language - The target language (e.g., 'java', 'dart').
 * @param {TestBuildConfig} config - Configuration object containing test settings.
 * @param {string} [serverName] - Optional server name.
 * @param {Record<string, unknown>} [baseParams={}] - Additional parameters to merge into the final set.
 * @returns {Record<string, unknown>} - The final parameters object for use in the test case.
 */
export function buildParams(
  language: string,
  config: TestBuildConfig,
  serverName?: string,
  baseParams: Record<string, unknown> = {}
): Record<string, unknown> {
  // Note: This function is currently hardcoded to treat 'java' differently by excluding the 'clientFileName' parameter.
  const isJava = language.toLowerCase() === 'java';

  return {
    server: serverName,
    ...(isJava ? {} : { clientFileName: config.clientFileName }),
    ...baseParams,
  };
}

/**
 * Helper function to verify the directory structure against expected elements.
 * @param {ExpectedDirectoryElement[]} expectedElements - The expected elements in the directory.
 * @param {string} dirPath - The path of the directory to verify.
 */
export async function verifyDirectoryStructure(
  expectedElements: ExpectedDirectoryElement[],
  dirPath: string
): Promise<void> {
  for (const element of expectedElements) {
    const filePath = path.join(dirPath, element.name);

    if (element.type === 'directory') {
      // Recurse into the subdirectory
      if (element.children) {
        await verifyDirectoryStructure(element.children, filePath);
      }
    } else if (element.type === 'file') {
      // Verifying a file
      try {
        const content = await readFile(filePath, 'utf8');
        (expect(content) as any).toMatchSnapshot(element.name);
      } catch (err: any) {
        throw new Error(`File ${filePath} not found or couldn't be read. Original error: ${err.message}`);
      }
    }
  }
}

/**
 * Get the list of files in a directory
 *
 * @param {string} dir - The directory path.
 * @returns {Promise<string[]>} - A promise that resolves to an array of file paths.
 */
export const listFiles = async (dir: string): Promise<string[]> => {
  const dirElements = await readdir(dir, { withFileTypes: true });

  // Filter to only files, map to full paths
  return dirElements
    .filter(dirE => dirE.isFile())
    .map(dirE => dirE.name);
};
