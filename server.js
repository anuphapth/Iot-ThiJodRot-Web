import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import { readdirSync } from 'fs';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(morgan("dev"));

// Load All Routes
readdirSync("./routes").forEach(async (r) => {
  const router = await import(`./routes/${r}`);
  app.use("/api", router.default)
});

// server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running`);
});