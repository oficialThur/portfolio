import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
// seed.js fica em backend/prisma/, então sobe dois níveis até a raiz do repo.
dotenv.config({ path: fileURLToPath(new URL('../../env/.env', import.meta.url)) });

import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import bcrypt from 'bcryptjs';

const adapterOptions = {
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT) || 3306,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    allowPublicKeyRetrieval: true,
};

if (process.env.DATABASE_SSL === 'true') {
    adapterOptions.ssl = { rejectUnauthorized: true };
}

const adapter = new PrismaMariaDb(adapterOptions);

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