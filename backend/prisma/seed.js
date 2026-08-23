import dotenv from 'dotenv';
dotenv.config({ path: '../env/.env' });

import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import bcrypt from 'bcryptjs';

const adapter = new PrismaMariaDb({
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT ?? 3306),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
});

const prisma = new PrismaClient({ adapter });

async function main() {
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

    if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
        throw new Error('Defina ADMIN_NAME, ADMIN_EMAIL e ADMIN_PASSWORD no .env');
    }

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const admin = await prisma.admin.upsert({
        where: { email: ADMIN_EMAIL },
        update: { name: ADMIN_NAME, password: passwordHash },
        create: { name: ADMIN_NAME, email: ADMIN_EMAIL, password: passwordHash },
    });

    console.log(`Admin pronto: ${admin.email}`);
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());