import { AppConfig, ComponentSchema } from '../types/appConfig';

export interface ValidationResult {
  isValid: boolean;
  cleanedConfig: AppConfig;
  warnings: string[];
}

/**
 * Validates a parsed JSON configuration object and repairs any issues
 * by injecting fallback values. This guarantees the renderer never crashes.
 */
export function validateAndCleanConfig(rawConfig: any): ValidationResult {
  const warnings: string[] = [];

  if (!rawConfig || typeof rawConfig !== 'object' || Array.isArray(rawConfig)) {
    return {
      isValid: false,
      cleanedConfig: {
        title: 'Error: Invalid Configuration',
        description: 'The configuration must be a valid JSON object.',
        components: [],
      },
      warnings: ['Configuration is not a JSON object.'],
    };
  }

  // 1. Title Validation
  let title = 'Dynamic App';
  if (typeof rawConfig.title !== 'string' || !rawConfig.title.trim()) {
    warnings.push('Missing or invalid property "title". Defaulted to "Dynamic App".');
  } else {
    title = rawConfig.title;
  }

  // 2. Layout Validation
  let layout = 'single-column';
  if (rawConfig.layout) {
    if (!['single-column', 'two-column', 'grid'].includes(rawConfig.layout)) {
      warnings.push(`Unsupported layout type "${rawConfig.layout}". Defaulted to "single-column".`);
    } else {
      layout = rawConfig.layout;
    }
  }

  // 3. Components Validation
  let rawComponents = rawConfig.components;
  if (!Array.isArray(rawComponents)) {
    warnings.push('Property "components" must be an array. Defaulted to empty array.');
    rawComponents = [];
  }

  const cleanedComponents: ComponentSchema[] = [];
  const supportedTypes = ['heading', 'input', 'textarea', 'select', 'checkbox', 'button', 'table', 'card', 'stats card'];

  rawComponents.forEach((comp: any, index: number) => {
    if (!comp || typeof comp !== 'object' || Array.isArray(comp)) {
      warnings.push(`Component at index ${index} is not a valid object. Skipping.`);
      return;
    }

    const cleaned: ComponentSchema = { ...comp };

    // Validate type
    if (!cleaned.type || typeof cleaned.type !== 'string') {
      warnings.push(`Component at index ${index} is missing "type" string. Defaulted to "card".`);
      cleaned.type = 'card';
    }

    const isSupported = supportedTypes.includes(cleaned.type);

    // Validate name and label for input components
    const isInputType = ['input', 'textarea', 'select', 'checkbox'].includes(cleaned.type);
    if (isInputType) {
      // Missing name fallback
      if (!cleaned.name || typeof cleaned.name !== 'string' || !cleaned.name.trim()) {
        const fallbackName = `field_${cleaned.type}_${index}`;
        warnings.push(`Field of type "${cleaned.type}" at index ${index} is missing a "name". Generated fallback: "${fallbackName}".`);
        cleaned.name = fallbackName;
      } else {
        // Sanitize name to be safe for React state keys
        cleaned.name = cleaned.name.trim().replace(/[^a-zA-Z0-9_]/g, '_');
      }

      // Missing label fallback
      if (!cleaned.label || typeof cleaned.label !== 'string' || !cleaned.label.trim()) {
        const fallbackLabel = `Field ${index + 1} (${cleaned.type})`;
        warnings.push(`Field "${cleaned.name}" at index ${index} is missing a "label". Defaulted to "${fallbackLabel}".`);
        cleaned.label = fallbackLabel;
      }
    }

    // Specific Component Logic
    switch (cleaned.type) {
      case 'heading': {
        const textVal = cleaned.text || cleaned.value;
        if (!textVal || typeof textVal !== 'string') {
          warnings.push(`Heading at index ${index} is missing "text" content. Defaulted to "Heading Text".`);
          cleaned.text = 'Heading Text';
        } else {
          cleaned.text = String(textVal);
        }
        break;
      }

      case 'button': {
        const btnText = cleaned.text || cleaned.value || 'Submit';
        cleaned.text = String(btnText);
        if (!cleaned.buttonType || !['submit', 'button', 'reset'].includes(cleaned.buttonType)) {
          cleaned.buttonType = 'submit';
        }
        break;
      }

      case 'select': {
        if (!cleaned.options || !Array.isArray(cleaned.options)) {
          warnings.push(`Dropdown select field "${cleaned.name}" is missing a valid "options" array. Defaulted to placeholder choices.`);
          cleaned.options = ['Select Option 1', 'Select Option 2', 'Select Option 3'];
        } else if (cleaned.options.length === 0) {
          warnings.push(`Dropdown select field "${cleaned.name}" has an empty "options" list.`);
        }
        break;
      }

      case 'table': {
        if (!cleaned.columns || !Array.isArray(cleaned.columns)) {
          warnings.push(`Table component at index ${index} is missing "columns". Created default headers.`);
          cleaned.columns = ['ID', 'Column A', 'Column B'];
        }
        if (!cleaned.rows || !Array.isArray(cleaned.rows)) {
          cleaned.rows = [
            { ID: '1', 'Column A': 'Value A1', 'Column B': 'Value B1' },
            { ID: '2', 'Column A': 'Value A2', 'Column B': 'Value B2' }
          ];
        }
        break;
      }

      case 'stats card': {
        if (!cleaned.label || typeof cleaned.label !== 'string') {
          warnings.push(`Stats card at index ${index} is missing a "label". Defaulted to "Statistic".`);
          cleaned.label = 'Statistic';
        }
        if (cleaned.value === undefined) {
          warnings.push(`Stats card "${cleaned.label}" is missing a "value" property. Defaulted to "0".`);
          cleaned.value = '0';
        } else {
          cleaned.value = String(cleaned.value);
        }
        break;
      }

      case 'card': {
        if (!cleaned.title || typeof cleaned.title !== 'string') {
          cleaned.title = 'Card Title';
        }
        if (!cleaned.text && !cleaned.value) {
          cleaned.text = 'Card description text here.';
        } else {
          cleaned.text = String(cleaned.text || cleaned.value);
        }
        break;
      }

      default: {
        // Unknown components are kept so the Fallback UI handles them, but we make sure they don't break
        if (!isSupported) {
          // Leave it, Fallback renderer will display a diagnostic card instead of crashing
        }
      }
    }

    cleanedComponents.push(cleaned);
  });

  return {
    isValid: warnings.length === 0,
    cleanedConfig: {
      title,
      description: typeof rawConfig.description === 'string' ? rawConfig.description : undefined,
      layout,
      components: cleanedComponents,
    },
    warnings,
  };
}
