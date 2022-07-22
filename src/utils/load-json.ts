import { FileStorage } from '../file-storage'

const rootStorage = new FileStorage('./');

/**
 * Synchronously load the JSON file at a given file path, relative to the root of the Node runtime.
 */
export function loadJson(path: string): any {
    return rootStorage.readJsonSync(path);
};