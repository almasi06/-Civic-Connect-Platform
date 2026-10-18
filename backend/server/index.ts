import app from "./app";

const PORT = Number(process.env.API_PORT ?? 4000);
app.listen(PORT, () => {
  console.log(`CivicConnect API listening on http://localhost:${PORT}`);
});