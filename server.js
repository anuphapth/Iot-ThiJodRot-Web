import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import { readdirSync } from 'fs';
import pageRoutes from './routes/pages.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static('public'));

app.use('/', pageRoutes);

readdirSync("./routes").forEach(async (r) => {
  if (r !== 'pages.js') {
    const router = await import(`./routes/${r}`);
    app.use("/api", router.default);
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});