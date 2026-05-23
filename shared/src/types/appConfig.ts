export type ComponentType =
  | 'heading'
  | 'input'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'button'
  | 'table'
  | 'card'
  | 'stats card';

export interface ComponentSchema {
  id?: string;
  type: ComponentType | string; // Allow any string for testing fallback
  name?: string;                 // Field name for form submissions
  label?: string;                // Field label
  placeholder?: string;          // Input placeholder
  required?: boolean;            // Field validation: required
  options?: string[] | any;      // Options for select, dropdowns
  text?: string;                 // Content text (for headings, buttons)
  title?: string;                // Title (for cards)
  value?: string | number | any; // Value (for stats cards, static content, or defaults)
  icon?: string;                 // Icon name (for stats cards or cards)
  columns?: string[] | any;      // Table columns
  rows?: Record<string, any>[] | any; // Table rows data
  buttonType?: 'submit' | 'button' | 'reset';
  className?: string;            // Custom CSS class override
}

export interface AppConfig {
  title: string;
  description?: string;
  layout?: 'single-column' | 'two-column' | 'grid' | string;
  components: ComponentSchema[];
}

export interface AppInstance {
  id: string;
  name: string;
  subdomain?: string | null;
  config: AppConfig;
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionInstance {
  id: string;
  appId: string;
  data: Record<string, any>;
  logs: Record<string, any> | null;
  createdAt: string;
}
