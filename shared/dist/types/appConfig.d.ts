export type ComponentType = 'heading' | 'input' | 'textarea' | 'select' | 'checkbox' | 'button' | 'table' | 'card' | 'stats card';
export interface ComponentSchema {
    id?: string;
    type: ComponentType | string;
    name?: string;
    label?: string;
    placeholder?: string;
    required?: boolean;
    options?: string[] | any;
    text?: string;
    title?: string;
    value?: string | number | any;
    icon?: string;
    columns?: string[] | any;
    rows?: Record<string, any>[] | any;
    buttonType?: 'submit' | 'button' | 'reset';
    className?: string;
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
