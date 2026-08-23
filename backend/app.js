import express from 'express';
import { PrismaClient } from './generated/prisma/client.js';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config({ path: '../env/.env' });

const adapter = new PrismaMariaDb({
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT) ?? 3306,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    connectionLimit: 5,
});

const app = express();
const prisma = new PrismaClient({adapter});
const port = process.env.PORT || 3001;

const secretKey = process.env.SECRET_KEY;

app.use(express.json());

app.post("/login", async (req, res) => {
    const {email, password} = req.body;
    
    if(!email || !password){
        return res.status(400).json({msg:"Email e senha são obrigatórios"});
    }
    
    try{
        const admin = await prisma.admin.findUnique({where:{email}});
        
        if(!admin){
            return res.status(401).json({msg:"credenciais inválidas"});
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        
        if(!isPasswordValid){
            return res.status(401).json({msg:"credenciais inválidas"});
        }
        
        const token = jwt.sign({
            id: admin.id.toString(),email: admin.email }, 
            secretKey, 
            {expiresIn: '1h'}
        );
        
        return res.status(200).json({msg:"Login realizado com sucesso", token});

    } catch(error){
        console.error("Erro ao fazer login:", error);
        return res.status(500).json({msg:"Erro interno do servidor"})
    }
});

function authMiddleware(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).json({msg:"Acesso não autorizado"})
    }

    const token = authHeader.split(' ')[1];
    try{
        const decoded = jwt.verify(token, secretKey);
        req.admin = decoded.id;
        next();
    } catch(error){
        return res.status(401).json({msg:"Token inválido"})
    }
}

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
})