import { createApp } from './app.js';
const { app } = createApp();
const port = Number(process.env.PORT || 3001);
app.listen(port, '0.0.0.0', () =>
  console.log(`Portfolio API listening on port ${port}`),
);
