import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import { readdirSync } from 'fs';
import pageRoutes from './src/routes/pages.js';
import { errorHandler } from './src/utils/errorHandler.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("combined"));
app.use(express.static('public'));

app.use('/', pageRoutes);

readdirSync("./src/routes").forEach(async (r) => {
  if (r !== 'pages.js') {
    const router = await import(`./src/routes/${r}`);
    app.use("/api", router.default);
  }
});

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});