import { createConfiguredApp } from './bootstrap.js';
const { app } = await createConfiguredApp();
const port = Number(process.env.PORT || 3001);
app.listen(port, '0.0.0.0', () =>
  console.log(`Portfolio API listening on port ${port}`),
);
