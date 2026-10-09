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
  } catch {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.end(
      JSON.stringify({
        error: 'Backend belum dikonfigurasi atau sedang tidak tersedia.',
      }),
    );
  }
}
