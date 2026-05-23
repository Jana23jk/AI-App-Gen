'use client';

import React, { useState, useEffect } from 'react';
import { AppConfig, ComponentSchema } from '@ai-app/shared';
import { apiUrl } from '@/lib/api';
import { LocaleType, translate } from '@/lib/translations';
import ComponentRenderer from './ComponentRenderer';
import LayoutRenderer from './LayoutRenderer';
import toast from 'react-hot-toast';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface FormRendererProps {
  appId?: string;
  config: AppConfig;
  locale: LocaleType;
  onSuccessSubmit?: (data: any, logs: any) => void;
  isPreview?: boolean;
}

export const FormRenderer: React.FC<FormRendererProps> = ({
  appId,
  config,
  locale,
  onSuccessSubmit,
  isPreview = false,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when config changes
  useEffect(() => {
    setFormData({});
    setErrors({});
  }, [config]);

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    config.components.forEach((comp) => {
      const isInput = ['input', 'textarea', 'select', 'checkbox'].includes(comp.type);
      if (isInput && comp.name) {
        const val = formData[comp.name];
        
        // Required validation
        if (comp.required) {
          if (comp.type === 'checkbox') {
            if (!val) {
              newErrors[comp.name] = `${translate(comp.label || 'Field', locale)} is required`;
            }
          } else {
            if (val === undefined || val === null || String(val).trim() === '') {
              newErrors[comp.name] = `${translate(comp.label || 'Field', locale)} is required`;
            }
          }
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(locale === 'ta' ? 'தயவுசெய்து தேவையான புலங்களை நிரப்பவும்.' : 'Please fix validation errors before submitting.', {
        icon: <AlertCircle className="w-5 h-5 text-red-500" />,
        className: 'bg-zinc-900 border border-zinc-800 text-white rounded-xl',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (isPreview || !appId) {
        // Mock submission for preview environment
        await new Promise((resolve) => setTimeout(resolve, 800));
        
        // Trigger workflow notification log simulation
        const mockLog = {
          event: 'form_submission',
          appId: appId || 'preview',
          appName: config.title,
          timestamp: new Date().toISOString(),
          status: 'SUCCESS',
          summary: `Mock form submission received with ${Object.keys(formData).length} fields.`,
        };

        toast.success(translate('submitSuccess', locale), {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
          className: 'bg-zinc-900 border border-zinc-800 text-white rounded-xl',
        });

        onSuccessSubmit?.(formData, mockLog);
        setFormData({});
      } else {
        // Direct database submission via API route
        const response = await fetch(apiUrl(`/api/apps/${appId}/submit`), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: formData }),
        });

        if (!response.ok) {
          throw new Error('Network error submitting data');
        }

        const result = await response.json();
        
        toast.success(translate('submitSuccess', locale), {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
          className: 'bg-zinc-900 border border-zinc-800 text-white rounded-xl',
        });

        onSuccessSubmit?.(result.data, result.logs);
        setFormData({});
      }
    } catch (err) {
      console.error(err);
      toast.error(translate('submitError', locale), {
        icon: <AlertCircle className="w-5 h-5 text-red-500" />,
        className: 'bg-zinc-900 border border-zinc-800 text-white rounded-xl',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render components through the layout manager
  const renderedElements = config.components.map((comp, idx) => {
    // If it's a submission button, bind submission controls
    if (comp.type === 'button' && comp.buttonType === 'submit') {
      return (
        <div key={idx} className="pt-2 w-full">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:from-emerald-800 disabled:to-teal-800 text-white font-semibold rounded-xl text-sm transition-all hover:scale-[1.01] hover:shadow-lg hover:shadow-emerald-500/10 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {translate('submitting', locale)}
              </>
            ) : (
              translate(comp.text || 'submitBtn', locale)
            )}
          </button>
        </div>
      );
    }

    return (
      <ComponentRenderer
        key={idx}
        component={comp}
        value={comp.name ? formData[comp.name] : undefined}
        onChange={comp.name ? (val) => handleFieldChange(comp.name!, val) : undefined}
        error={comp.name ? errors[comp.name] : undefined}
        locale={locale}
      />
    );
  });

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <LayoutRenderer layout={config.layout}>
        {renderedElements}
      </LayoutRenderer>
    </form>
  );
};

export default FormRenderer;
