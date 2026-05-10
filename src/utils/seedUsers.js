import bcrypt from 'bcryptjs';
import userRepository from '../repositories/UserRepository.js';
import roleRepository from '../repositories/RoleRepository.js';

export default async function seedUsers() {
    const adminEmail = process.env.ADMIN_EMAIL;
    const existing = await userRepository.findByEmail(adminEmail);
    if (existing) return;

    const adminRole = await roleRepository.findByName('admin');
    if (!adminRole) {
        console.warn('El rol admin no existe aún. Ejecuta seedRoles primero.');
        return;
    }

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10);
    const rawPassword = process.env.ADMIN_PASSWORD;
    const hashed = await bcrypt.hash(rawPassword, saltRounds);

    await userRepository.create({
        email: adminEmail,
        password: hashed,
        name: 'Admin',
        lastName: 'Sistema',
        phoneNumber: '000000000',
        birthdate: new Date('1990-01-01'),
        roles: [adminRole._id]
    });

    console.log(`Admin creado: ${adminEmail} / ${rawPassword}`);
}
