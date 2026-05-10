import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/users.routes.js';
import webRoutes from './routes/web.routes.js';
import seedRoles from './utils/seedRoles.js';
import seedUsers from './utils/seedUsers.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));
app.use(express.static(join(__dirname, '..', 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/', webRoutes);

app.get('/health', (req, res) => res.status(200).json({ ok: true }));

app.use((req, res) => {
    res.status(404).render('errors/404', { title: 'Página no encontrada' });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message || 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI, { autoIndex: true })
    .then(async () => {
        console.log('MongoDB conectado');
        await seedRoles();
        await seedUsers();
        app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
    })
    .catch(err => {
        console.error('Error al conectar con MongoDB:', err);
        process.exit(1);
    });
