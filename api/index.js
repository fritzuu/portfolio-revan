import { createConfiguredApp } from '../server/bootstrap.js';
let application;
export default async function handler(req, res) {
  try {
    application ||= createConfiguredApp().catch((error) => {
      application = null;
      throw error;
    });
    const { app } = await application;
    return app(req, res);
  } catch (error) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.end(
      JSON.stringify({
        error: 'Backend belum dikonfigurasi atau sedang tidak tersedia.',
        ...(['BACKEND_MISSING_ENV', 'BACKEND_INVALID_CONFIG'].includes(
          error.code,
        )
          ? {
              code: error.code,
              variables: error.variables,
              help: 'Periksa variabel di Vercel Settings > Environment Variables untuk Production, lalu Redeploy.',
            }
          : {}),
      }),
    );
  }
}
