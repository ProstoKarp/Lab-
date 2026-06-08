import { App } from '../backend/app';

const PORT = process.env.PORT || 3000;

const app = new App();

app.listen(Number(PORT));
