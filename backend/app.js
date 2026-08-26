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

// Rotas de login

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

// Rota de projeto - Admin

function formatProjeto(projeto){
    return {
        id: projeto.id.toString(),
        name: projeto.nome,
        description: projeto.descricao,
        link: projeto.link,
        tecnologias: projeto.tecnologias?.map((pt) => ({
            id: pt.tecnologia.id.toString(),
            name: pt.tecnologia.nome,
        })) ?? [],
        createdAt: projeto.createdAt,
        updatedAt: projeto.updatedAt,
    }
};

app.get("/projetos", async (req, res) => {
    try{
        const projeto = await prisma.projeto.findMany({
            include:{ tecnologias: { include: { tecnologia: true } } },
            orderBy: { createdAt: 'desc' },
        });
        return res.status(200).json(projeto.map(formatProjeto));
    } catch(error){
        console.error("Erro ao buscar projetos:", error);
        return res.status(500).json({msg:"Erro interno do servidor"})
    }
});

app.post("/projetos", authMiddleware, async (req, res) => {
    const { nome, descricao, link, tecnologias } = req.body;

    if (!nome || !descricao || !link || !tecnologias){
        return res.status(400).json({msg:"Nome, descrição, link e tecnologias são obrigatórios"})
    } 

    try{
        const newProjeto = await prisma.projeto.create({
            data:{
                nome,
                descricao,
                link,
                adminId: BigInt(req.admin),
                tecnologias:{
                    create: (tecnologias ?? []).map((nomeTecnologia) =>  ({
                        tecnologia: {
                            connectOrCreate: {
                                where: { nome: nomeTecnologia },
                                create: { nome: nomeTecnologia },
                            },
                        },
                    })),
                },
            },
            include:{ tecnologias: { include: { tecnologia: true } } },
        });
        return res.status(201).json(formatProjeto(newProjeto));
    } catch(error){
        console.error("Erro ao criar projeto:", error);
        return res.status(500).json({msg:"Erro interno do servidor"})
    }
});

app.put("/projetos/:id", authMiddleware, async (req, res) => {
    const { nome, descricao, link, tecnologias } = req.body;
    const id = BigInt(req.params.id);

    try{
        const existeProjeto = await prisma.projeto.findUnique({where: {id}});

        if(!existeProjeto){
            return res.status(404).json({msg:"Projeto não encontrado"})
        } 

        const projeto = await prisma.projeto.update({
            where: {id},
            data: {
                ...(nome && { nome }),
                ...(descricao && { descricao }),
                ...(link && { link }),
                ...(tecnologias && {
                    tecnologias: {
                        deleteMany: {},
                        create: tecnologias.map((nomeTec) => ({
                            tecnologia: {
                                connectOrCreate: {
                                    where: { nome: nomeTec },
                                    create: { nome: nomeTec },
                                },
                            },
                        })),
                    },
                }),
            },
            include: { tecnologias: { include: { tecnologia: true } } },
        });
        return res.status(200).json(formatProjeto(projeto));
    } catch(error){
        console.error("Erro ao atualizar projeto:", error);
        return res.status(500).json({msg:"Erro interno do servidor"})
    }
});

app.delete("/projetos/:id", authMiddleware, async (req, res) => {
    const id = BigInt(req.params.id);

    try{
        const existeProjeto = await prisma.projeto.findUnique({where: {id}});
        if(!existeProjeto){
            return res.status(404).json({msg:"Projeto não encontrado"})
        }

        await prisma.projeto.delete({where: {id}});
        return res.status(204).send();
    } catch(error){
        console.error("Erro ao deletar projeto:", error);
        return res.status(500).json({msg:"Erro interno do servidor"})
    }
});

// Rotas de Subtitulos - Admin

function formatSubtitle(subtitle){
    return {
        id: subtitle.id.toString(),
        subtitle: subtitle.subtitle,
    }
}

app.get("/subtitulos", async (req, res) => {
    try{
        const subtitulo = await prisma.subtitle.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return res.status(200).json(subtitulo.map(formatSubtitle));
    } catch(error){
        console.error("Erro ao buscar subtitulos:", error);
        return res.status(500).json({msg:"Erro interno do servidor"})
    }
});

app.post("/subtitulos", authMiddleware, async (req, res) => {
    const { subtitle } = req.body;

    if(!subtitle){
        return res.status(400).json({msg:"Subtitulo é obrigatório"})
    }

    try{
        const newSubtitle = await prisma.subtitle.create({
            data: { 
                subtitle, 
                adminId: BigInt(req.admin),
            },
        });
        return res.status(201).json(formatSubtitle(newSubtitle));
    } catch(error){ 
        console.error("Erro ao criar subtitulo:", error);
        return res.status(500).json({msg:"Erro interno do servidor"})
    }
});

app.put("/subtitulos/:id", authMiddleware, async (req, res) => {
    const { subtitle } = req.body;
    const id = BigInt(req.params.id);


    if(!subtitle){
        return res.status(400).json({msg:"Subtitulo é obrigatório"})
    }

    try{
        const existeSubtitulo = await prisma.subtitle.findUnique({where: {id}});

        if(!existeSubtitulo){
            return res.status(404).json({msg:"Subtitulo não encontrado"})
        }

        const subtituloAtualizado = await prisma.subtitle.update({
            where: {id},
            data: { 
                subtitle
            },
        });
        return res.status(200).json(formatSubtitle(subtituloAtualizado));
    } catch(error){
        console.error("Erro ao atualizar subtitulo:", error);
        return res.status(500).json({msg:"Erro interno do servidor"})
    }
});

app.delete("/subtitulos/:id", authMiddleware, async (req, res) => {
    const id = BigInt(req.params.id);

    try{
        const existeSubtitulo = await prisma.subtitle.findUnique({where: {id}});
        if(!existeSubtitulo){
            return res.status(404).json({msg:"Subtitulo não encontrado"})
        }

        await prisma.subtitle.delete({where: {id}});
        return res.status(204).send();
    } catch(error){
        console.error("Erro ao deletar subtitulo:", error);
        return res.status(500).json({msg:"Erro interno do servidor"})
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
})