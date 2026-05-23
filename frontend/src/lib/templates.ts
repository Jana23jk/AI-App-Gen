import { AppConfig } from '@ai-app/shared';

export interface AppTemplate {
  id: string;
  name: string;
  config: AppConfig;
}

export const templates: AppTemplate[] = [
  {
    id: 'student-reg-template',
    name: 'Student Registration Form',
    config: {
      title: 'student.registration',
      layout: 'single-column',
      components: [
        {
          type: 'heading',
          text: 'student.registration',
        },
        {
          type: 'input',
          label: 'student.name',
          name: 'name',
          placeholder: 'student.name.placeholder',
          required: true,
        },
        {
          type: 'input',
          label: 'student.email',
          name: 'email',
          placeholder: 'student.email.placeholder',
          required: true,
        },
        {
          type: 'select',
          label: 'student.department',
          name: 'department',
          placeholder: 'Select a department',
          options: ['student.cse', 'student.ece', 'student.mech'],
          required: true,
        },
        {
          type: 'checkbox',
          label: 'student.hostel',
          name: 'hostel',
          required: false,
        },
        {
          type: 'textarea',
          label: 'student.remarks',
          name: 'remarks',
          placeholder: 'Any other feedback...',
        },
        {
          type: 'button',
          text: 'submit.registration',
          buttonType: 'submit',
        },
      ],
    },
  },
  {
    id: 'analytics-dashboard-template',
    name: 'Executive Analytics Dashboard',
    config: {
      title: 'Enterprise Management System',
      layout: 'grid',
      components: [
        {
          type: 'stats card',
          label: 'Active System Users',
          value: '18,924',
          icon: 'users',
        },
        {
          type: 'stats card',
          label: 'Database Server Queries',
          value: '3,452,190',
          icon: 'database',
        },
        {
          type: 'stats card',
          label: 'PDF Reports Generated',
          value: '1,429',
          icon: 'document',
        },
        {
          type: 'heading',
          text: 'Microservice Cluster Performance',
          className: 'col-span-full',
        },
        {
          type: 'table',
          columns: ['Service Name', 'Response Latency', 'Health Status'],
          rows: [
            { 'Service Name': 'Auth Gateway', 'Response Latency': '32ms', 'Health Status': 'Healthy' },
            { 'Service Name': 'Data Ingestion', 'Response Latency': '112ms', 'Health Status': 'Healthy' },
            { 'Service Name': 'Dynamic Runtime', 'Response Latency': '4ms', 'Health Status': 'Optimal' },
            { 'Service Name': 'Reporting Broker', 'Response Latency': '248ms', 'Health Status': 'Degraded' },
          ],
          className: 'col-span-full lg:col-span-2',
        },
        {
          type: 'card',
          title: 'Infrastructure Summary Report',
          text: 'The reporting broker is experiencing minor queue latency. Dynamic runtime optimization is complete. Autoscaling has provisioned 2 additional node instances.',
          className: 'col-span-full lg:col-span-1',
        },
      ],
    },
  },
  {
    id: 'customer-feedback-template',
    name: 'Customer Feedback Portal',
    config: {
      title: 'Customer Feedback Portal',
      layout: 'two-column',
      components: [
        {
          type: 'heading',
          text: 'We Value Your Feedback',
          className: 'col-span-full',
        },
        {
          type: 'input',
          label: 'Customer Name',
          name: 'client_name',
          placeholder: 'Enter your name',
          required: true,
        },
        {
          type: 'input',
          label: 'Contact Email Address',
          name: 'client_email',
          placeholder: 'your.name@company.com',
          required: true,
        },
        {
          type: 'select',
          label: 'Experience Rating',
          name: 'rating',
          options: ['Outstanding', 'Highly Satisfied', 'Satisfied', 'Needs Improvement'],
          required: true,
        },
        {
          type: 'checkbox',
          label: 'Subscribe to Newsletter updates',
          name: 'newsletter_subscribe',
          required: false,
        },
        {
          type: 'textarea',
          label: 'Detailed Feedback Remarks',
          name: 'comments',
          placeholder: 'Please describe your experience in detail...',
          className: 'col-span-full',
        },
        {
          type: 'button',
          text: 'Submit Feedback Report',
          buttonType: 'submit',
          className: 'col-span-full',
        },
      ],
    },
  },
];
