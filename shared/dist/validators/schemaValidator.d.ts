import { AppConfig } from '../types/appConfig';
export interface ValidationResult {
    isValid: boolean;
    cleanedConfig: AppConfig;
    warnings: string[];
}
/**
 * Validates a parsed JSON configuration object and repairs any issues
 * by injecting fallback values. This guarantees the renderer never crashes.
 */
export declare function validateAndCleanConfig(rawConfig: any): ValidationResult;
