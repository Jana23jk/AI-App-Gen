import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AppConfig, validateAndCleanConfig } from '@ai-app/shared';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const apps = await prisma.app.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(apps);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('API Error GET /api/apps:', error);
    res.status(500).json({ error: 'Internal Server Error', details: message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, config, id, subdomain } = req.body;

    if (!name || typeof name !== 'string') {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    const { cleanedConfig, warnings } = validateAndCleanConfig(config);

    const cleanSubdomain =
      subdomain && typeof subdomain === 'string' && subdomain.trim() !== ''
        ? subdomain.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
        : null;

    let savedApp;
    if (id) {
      savedApp = await prisma.app.update({
        where: { id },
        data: {
          name,
          subdomain: cleanSubdomain,
          config: cleanedConfig as object,
        },
      });
    } else {
      savedApp = await prisma.app.create({
        data: {
          name,
          subdomain: cleanSubdomain,
          config: cleanedConfig as object,
        },
      });
    }

    res.json({
      app: savedApp,
      warnings,
      message: 'Application saved successfully',
    });
  } catch (error: unknown) {
    console.error('API Error POST /api/apps:', error);
    const err = error as { code?: string; message?: string };
    if (err.code === 'P2002') {
      res.status(400).json({
        error: 'Subdomain is already taken. Please choose another one.',
      });
      return;
    }
    res.status(500).json({
      error: 'Failed to process request',
      details: err.message ?? 'Unknown error',
    });
  }
});

router.get('/subdomain/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      res.status(400).json({ error: 'Subdomain slug is required' });
      return;
    }

    const app = await prisma.app.findUnique({
      where: { subdomain: slug },
      include: {
        submissions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!app) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    res.json({
      app,
      submissions: app.submissions,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('API Error GET /api/apps/subdomain/[slug]:', error);
    res.status(500).json({ error: 'Internal Server Error', details: message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const app = await prisma.app.findUnique({
      where: { id },
      include: {
        submissions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!app) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    res.json({
      app,
      submissions: app.submissions,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('API Error GET /api/apps/[id]:', error);
    res.status(500).json({ error: 'Internal Server Error', details: message });
  }
});

router.post('/:id/submit', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data } = req.body;

    if (!data || typeof data !== 'object') {
      res.status(400).json({ error: 'Data payload is required' });
      return;
    }

    const app = await prisma.app.findUnique({
      where: { id },
    });

    if (!app) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    const config = app.config as unknown as AppConfig;

    const validationErrors: Record<string, string> = {};
    if (config && Array.isArray(config.components)) {
      config.components.forEach((comp) => {
        const isInput = ['input', 'textarea', 'select', 'checkbox'].includes(comp.type);
        if (isInput && comp.name && comp.required) {
          const val = data[comp.name];
          if (comp.type === 'checkbox') {
            if (!val) {
              validationErrors[comp.name] = `${comp.label || 'Field'} is required`;
            }
          } else if (val === undefined || val === null || String(val).trim() === '') {
            validationErrors[comp.name] = `${comp.label || 'Field'} is required`;
          }
        }
      });
    }

    if (Object.keys(validationErrors).length > 0) {
      res.status(400).json({ error: 'Validation failed', fields: validationErrors });
      return;
    }

    const logs = {
      event: 'form_submission',
      appId: id,
      appName: app.name,
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
      summary: 'Form submission received successfully.',
      metadata: {
        fieldCount: Object.keys(data).length,
        fieldsSubmitted: Object.keys(data),
        ipPlaceholder: '127.0.0.1',
        userAgentPlaceholder: req.headers['user-agent'] || 'Unknown',
      },
    };

    const submission = await prisma.submission.create({
      data: {
        appId: id,
        data: data as object,
        logs: logs as object,
      },
    });

    res.json({
      message: 'Submission successfully recorded',
      submission,
      data: submission.data,
      logs: submission.logs,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('API Error POST /api/apps/[id]/submit:', error);
    res.status(500).json({ error: 'Failed to submit data', details: message });
  }
});

export default router;
