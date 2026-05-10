import bcrypt from 'bcryptjs';
import userRepository from '../repositories/UserRepository.js';

function calculateAge(birthdate) {
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

function mapUser(user) {
    return {
        id: user._id,
        email: user.email,
        name: user.name,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        birthdate: user.birthdate,
        age: calculateAge(user.birthdate),
        url_profile: user.url_profile,
        address: user.address,
        roles: user.roles.map(r => r.name),
        createdAt: user.createdAt
    };
}

class UserService {

    async getAll() {
        const users = await userRepository.getAll();
        return users.map(mapUser);
    }

    async getById(id) {
        const user = await userRepository.findById(id);
        if (!user) {
            const err = new Error('Usuario no encontrado');
            err.status = 404;
            throw err;
        }
        return mapUser(user);
    }

    async updateMe(id, data) {
        const allowed = ['name', 'lastName', 'phoneNumber', 'birthdate', 'url_profile', 'address'];
        const update = {};
        for (const key of allowed) {
            if (data[key] !== undefined) update[key] = data[key];
        }

        if (data.password) {
            const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[#$%&*@]).{8,}$/;
            if (!PASSWORD_REGEX.test(data.password)) {
                const err = new Error('La contraseña debe tener mínimo 8 caracteres, 1 mayúscula, 1 dígito y 1 carácter especial (#$%&*@)');
                err.status = 400;
                throw err;
            }
            const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '10', 10);
            update.password = await bcrypt.hash(data.password, saltRounds);
        }

        const user = await userRepository.update(id, update);
        if (!user) {
            const err = new Error('Usuario no encontrado');
            err.status = 404;
            throw err;
        }
        return mapUser(user);
    }
}

export default new UserService();
