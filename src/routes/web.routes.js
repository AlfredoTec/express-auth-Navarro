import express from 'express';

const router = express.Router();

router.get('/', (req, res) => res.redirect('/signIn'));
router.get('/signIn', (req, res) => res.render('auth/signIn', { title: 'Iniciar Sesión' }));
router.get('/signUp', (req, res) => res.render('auth/signUp', { title: 'Registrarse' }));
router.get('/profile', (req, res) => res.render('user/profile', { title: 'Mi Cuenta' }));
router.get('/dashboard', (req, res) => res.render('user/dashboard', { title: 'Dashboard' }));
router.get('/admin', (req, res) => res.render('admin/dashboard', { title: 'Panel Administrador' }));
router.get('/403', (req, res) => res.status(403).render('errors/403', { title: 'Acceso Denegado' }));

export default router;
