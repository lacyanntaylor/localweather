import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Router, Request, Response } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = Router();

// Route to serve index.html
router.get('/', (_req: Request, res: Response) => {
    const indexPath = path.join(__dirname, '../clinet/dist/index.html');
    res.sendFile(indexPath);
});

// Catch-all route to serve index.html for client-side routing (e.g., React SPAs)
router.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

export default router;
