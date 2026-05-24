import express from 'express';
import path from 'path';
const app = express();
const staticPath = path.join(process.cwd(), 'uploads');
console.log('Serving static files from:', staticPath);
app.use((req, res, next) => { console.log('DEBUG:', req.url); next(); })
app.use('/uploads', express.static(staticPath));
app.listen(3005, () => console.log('Test on 3005'));
