import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from './generated/prisma/client.js';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

// Relativo ao arquivo (não ao cwd), então funciona de qualquer diretório.
dotenv.config({ path: fileURLToPath(new URL('../env/.env', import.meta.url)) });

const adapterOptions = {
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT) || 3306,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    connectionLimit: 5,
    // MySQL 8 com caching_sha2_password precisa buscar a chave pública
    // quando a conexão não usa TLS (MySQL local no Docker).
    allowPublicKeyRetrieval: true,
};

// Azure MySQL e outros bancos gerenciados exigem TLS. No dev fica desligado.
if (process.env.DATABASE_SSL === 'true') {
    adapterOptions.ssl = { rejectUnauthorized: true };
}

const adapter = new PrismaMariaDb(adapterOptions);

const app = express();
const prisma = new PrismaClient({adapter});

// Sem SECRET_KEY o JWT fica inválido. Em dev usamos um fallback previsível
// para o projeto subir do zero; em produção o processo falha logo no boot.
const secretKey = process.env.SECRET_KEY
    || (process.env.NODE_ENV === 'production' ? null : 'dev-only-secret-change-me');

if (!secretKey) {
    console.error('SECRET_KEY não definida. Configure em env/.env antes de subir em produção.');
    process.exit(1);
}

// O JWT fica num cookie httpOnly: JS da página não consegue lê-lo, então um
// XSS não rouba a sessão. SameSite=strict cobre CSRF no fluxo same-origin.
// COOKIE_SECURE=true só quando o site estiver atrás de HTTPS.
const COOKIE_NAME = 'token';
const COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.COOKIE_SECURE === 'true',
    path: '/',
    maxAge: 60 * 60 * 1000,
};
const { maxAge: _maxAge, ...CLEAR_COOKIE_OPTIONS } = COOKIE_OPTIONS;

// Esconde a assinatura do Express e adiciona os headers de segurança padrão.
app.disable('x-powered-by');
app.use(helmet());
app.use(cookieParser());

// Em produção o Express fica atrás de proxies (Caddy e nginx). O número de
// hops confiáveis é configurável para o rate limit enxergar o IP real.
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', Number(process.env.TRUST_PROXY) || 1);
}

app.use(express.json());

// Rotas de login

// 10 falhas por IP a cada 15 minutos. Logins bem-sucedidos não consomem cota.
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: { msg: "Muitas tentativas de login. Tente novamente em alguns minutos." },
});

app.post("/login", loginLimiter, async (req, res) => {
    const email = cleanString(req.body?.email);
    const password = req.body?.password;

    if (!email || typeof password !== "string" || !password) {
        return res.status(400).json({ msg: "Email e senha são obrigatórios" });
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
            id: admin.id.toString(),
            email: admin.email,
            ver: admin.tokenVersion,
        }, secretKey, { expiresIn: '1h' });

        res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
        return res.status(200).json({ msg: "Login realizado com sucesso" });

    } catch(error){
        console.error("Erro ao fazer login:", error);
        return res.status(500).json({msg:"Erro interno do servidor"})
    }
});

// IDs são BIGINT no banco. Só aceitamos dígitos para evitar que o BigInt
// estoure (ex.: "abc") e para não confundir o cliente com um 500.
function parseId(value) {
    if (!/^\d+$/.test(value)) {
        return null;
    }
    return BigInt(value);
}

// Limites alinhados com o banco (descricao/subtitle são TEXT; link 2048).
// O nome e a tecnologia continuam VARCHAR(191), mas a API é mais restritiva.
const LIMITS = {
    nome: 120,
    descricao: 5000,
    link: 2048,
    tecnologia: 60,
    subtitle: 2000,
    contatoNome: 120,
    contatoSobre: 200,
    contatoMensagem: 5000,
    email: 254,
};

// Normaliza texto vindo do cliente: só aceita string e remove espaços nas pontas.
function cleanString(value) {
    return typeof value === "string" ? value.trim() : "";
}

// O link vai direto para um <a href>, então só liberamos http/https.
function isHttpUrl(value) {
    try {
        const url = new URL(value);
        return (
            (url.protocol === "http:" || url.protocol === "https:") &&
            Boolean(url.hostname)
        );
    } catch {
        return false;
    }
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// Aceita só array de strings, remove vazios e duplicatas.
// Retorna null quando o formato é inválido (para virar 400, não 500).
function parseTecnologias(value) {
    if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
        return null;
    }

    return [...new Set(value.map((item) => item.trim()).filter(Boolean))];
}

// Cookie httpOnly é o padrão; o header Bearer fica como fallback para
// integrações/CLI que não gerenciam cookies.
function getToken(req) {
    const cookieToken = req.cookies?.[COOKIE_NAME];
    if (cookieToken) {
        return cookieToken;
    }

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.slice(7);
    }

    return null;
}

function clearSessionCookie(res) {
    res.clearCookie(COOKIE_NAME, CLEAR_COOKIE_OPTIONS);
}

async function authMiddleware(req, res, next){
    const token = getToken(req);
    if(!token){
        return res.status(401).json({msg:"Acesso não autorizado"})
    }

    let decoded;
    try{
        decoded = jwt.verify(token, secretKey);
    } catch(error){
        clearSessionCookie(res);
        return res.status(401).json({msg:"Token inválido"})
    }

    try{
        const admin = await prisma.admin.findUnique({ where: { id: BigInt(decoded.id) } });

        // tokenVersion muda no logout, então tokens antigos param de valer aqui.
        if (!admin || admin.tokenVersion !== decoded.ver) {
            clearSessionCookie(res);
            return res.status(401).json({ msg: "Sessão expirada" });
        }

        req.admin = decoded.id;
        next();
    } catch (error) {
        console.error("Erro ao validar sessão:", error);
        return res.status(500).json({ msg: "Erro interno do servidor" });
    }
}

// Usado pelo front para saber se a sessão ainda vale (o cookie é invisível
// para o JS). Sempre 200: "authenticated: false" é uma resposta válida.
app.get("/me", async (req, res) => {
    const token = getToken(req);

    if (!token) {
        return res.status(200).json({ authenticated: false });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, secretKey);
    } catch {
        clearSessionCookie(res);
        return res.status(200).json({ authenticated: false });
    }

    try {
        const admin = await prisma.admin.findUnique({ where: { id: BigInt(decoded.id) } });

        if (!admin || admin.tokenVersion !== decoded.ver) {
            clearSessionCookie(res);
            return res.status(200).json({ authenticated: false });
        }

        return res.status(200).json({
            authenticated: true,
            admin: { id: admin.id.toString(), email: admin.email },
        });
    } catch (error) {
        console.error("Erro ao checar sessão:", error);
        return res.status(500).json({ msg: "Erro interno do servidor" });
    }
});

app.post("/logout", async (req, res) => {
    const token = getToken(req);

    if (token) {
        let decoded = null;

        try {
            decoded = jwt.verify(token, secretKey);
        } catch {
            // Token expirado/inválido: não há sessão a revogar.
        }

        if (decoded) {
            try {
                // Invalida todos os JWTs já emitidos para este admin.
                await prisma.admin.update({
                    where: { id: BigInt(decoded.id) },
                    data: { tokenVersion: { increment: 1 } },
                });
            } catch (error) {
                console.error("Erro ao revogar sessão:", error);
            }
        }
    }

    clearSessionCookie(res);
    return res.status(204).send();
});

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
    const nome = cleanString(req.body?.nome);
    const descricao = cleanString(req.body?.descricao);
    const link = cleanString(req.body?.link);
    const tecnologias = parseTecnologias(req.body?.tecnologias);

    if (!nome || !descricao || !link) {
        return res.status(400).json({ msg: "Nome, descrição e link são obrigatórios" });
    }

    if (nome.length > LIMITS.nome) {
        return res.status(400).json({ msg: `Nome deve ter no máximo ${LIMITS.nome} caracteres` });
    }

    if (descricao.length > LIMITS.descricao) {
        return res.status(400).json({ msg: `Descrição deve ter no máximo ${LIMITS.descricao} caracteres` });
    }

    if (link.length > LIMITS.link) {
        return res.status(400).json({ msg: `Link deve ter no máximo ${LIMITS.link} caracteres` });
    }

    if (!isHttpUrl(link)) {
        return res.status(400).json({ msg: "Link deve ser uma URL http:// ou https:// válida" });
    }

    if (!tecnologias || tecnologias.length === 0) {
        return res.status(400).json({ msg: "Selecione ao menos uma tecnologia válida" });
    }

    if (tecnologias.some((tec) => tec.length > LIMITS.tecnologia)) {
        return res.status(400).json({ msg: `Cada tecnologia deve ter no máximo ${LIMITS.tecnologia} caracteres` });
    }

    try{
        const newProjeto = await prisma.projeto.create({
            data:{
                nome,
                descricao,
                link,
                adminId: BigInt(req.admin),
                tecnologias:{
                    create: tecnologias.map((nomeTecnologia) =>  ({
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
    const id = parseId(req.params.id);

    if (id === null) {
        return res.status(400).json({ msg: "ID inválido" });
    }

    const body = req.body ?? {};
    const data = {};

    if (body.nome !== undefined) {
        const nome = cleanString(body.nome);
        if (!nome) {
            return res.status(400).json({ msg: "Nome não pode ser vazio" });
        }
        if (nome.length > LIMITS.nome) {
            return res.status(400).json({ msg: `Nome deve ter no máximo ${LIMITS.nome} caracteres` });
        }
        data.nome = nome;
    }

    if (body.descricao !== undefined) {
        const descricao = cleanString(body.descricao);
        if (!descricao) {
            return res.status(400).json({ msg: "Descrição não pode ser vazia" });
        }
        if (descricao.length > LIMITS.descricao) {
            return res.status(400).json({ msg: `Descrição deve ter no máximo ${LIMITS.descricao} caracteres` });
        }
        data.descricao = descricao;
    }

    if (body.link !== undefined) {
        const link = cleanString(body.link);
        if (link.length > LIMITS.link) {
            return res.status(400).json({ msg: `Link deve ter no máximo ${LIMITS.link} caracteres` });
        }
        if (!isHttpUrl(link)) {
            return res.status(400).json({ msg: "Link deve ser uma URL http:// ou https:// válida" });
        }
        data.link = link;
    }

    if (body.tecnologias !== undefined) {
        const tecnologias = parseTecnologias(body.tecnologias);
        if (!tecnologias || tecnologias.length === 0) {
            return res.status(400).json({ msg: "Selecione ao menos uma tecnologia válida" });
        }
        if (tecnologias.some((tec) => tec.length > LIMITS.tecnologia)) {
            return res.status(400).json({ msg: `Cada tecnologia deve ter no máximo ${LIMITS.tecnologia} caracteres` });
        }
        data.tecnologias = {
            deleteMany: {},
            create: tecnologias.map((nomeTec) => ({
                tecnologia: {
                    connectOrCreate: {
                        where: { nome: nomeTec },
                        create: { nome: nomeTec },
                    },
                },
            })),
        };
    }

    if (Object.keys(data).length === 0) {
        return res.status(400).json({ msg: "Nenhum campo para atualizar" });
    }

    try{
        const existeProjeto = await prisma.projeto.findUnique({where: {id}});

        if(!existeProjeto){
            return res.status(404).json({msg:"Projeto não encontrado"})
        } 

        const projeto = await prisma.projeto.update({
            where: {id},
            data,
            include: { tecnologias: { include: { tecnologia: true } } },
        });
        return res.status(200).json(formatProjeto(projeto));
    } catch(error){
        console.error("Erro ao atualizar projeto:", error);
        return res.status(500).json({msg:"Erro interno do servidor"})
    }
});

app.delete("/projetos/:id", authMiddleware, async (req, res) => {
    const id = parseId(req.params.id);

    if (id === null) {
        return res.status(400).json({ msg: "ID inválido" });
    }

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
    const subtitle = cleanString(req.body?.subtitle);

    if (!subtitle) {
        return res.status(400).json({ msg: "Subtitulo é obrigatório" });
    }

    if (subtitle.length > LIMITS.subtitle) {
        return res.status(400).json({ msg: `Subtitulo deve ter no máximo ${LIMITS.subtitle} caracteres` });
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
    const id = parseId(req.params.id);

    if (id === null) {
        return res.status(400).json({ msg: "ID inválido" });
    }

    const subtitle = cleanString(req.body?.subtitle);

    if (!subtitle) {
        return res.status(400).json({ msg: "Subtitulo é obrigatório" });
    }

    if (subtitle.length > LIMITS.subtitle) {
        return res.status(400).json({ msg: `Subtitulo deve ter no máximo ${LIMITS.subtitle} caracteres` });
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
    const id = parseId(req.params.id);

    if (id === null) {
        return res.status(400).json({ msg: "ID inválido" });
    }

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

// Rotas de nodemailer - Contato

const emailPort = Number(process.env.EMAIL_PORT) || 465;

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: emailPort,
    // 465 usa TLS direto; 587/25 começam em texto puro e sobem via STARTTLS.
    // Fixar secure: true quebrava qualquer porta diferente de 465.
    secure: emailPort === 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    // Sem isso, um SMTP fora do ar segura a requisição por muito tempo.
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
});

// 5 mensagens por IP a cada 15 minutos. O envio é caro (SMTP), então o limite
// é mais apertado que o do login.
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { msg: "Muitas mensagens enviadas. Tente novamente mais tarde." },
});

app.post("/enviando-email", contactLimiter, async (req, res) => {
    const nome = cleanString(req.body?.nome);
    const sobre = cleanString(req.body?.sobre);
    const email = cleanString(req.body?.email);
    const mensagem = cleanString(req.body?.mensagem);

    // Honeypot: campo invisível para humanos. Se veio preenchido, é bot:
    // fingimos sucesso e não enviamos nada.
    if (cleanString(req.body?.website)) {
        return res.status(200).json({ msg: "Email enviado com sucesso" });
    }

    if (!nome || !sobre || !email || !mensagem) {
        return res.status(400).json({ msg: "Nome, sobre, email e mensagem são obrigatórios" });
    }

    if (email.length > LIMITS.email) {
        return res.status(400).json({ msg: `Email deve ter no máximo ${LIMITS.email} caracteres` });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({ msg: "Email inválido" });
    }

    if (nome.length > LIMITS.contatoNome) {
        return res.status(400).json({ msg: `Nome deve ter no máximo ${LIMITS.contatoNome} caracteres` });
    }

    if (sobre.length > LIMITS.contatoSobre) {
        return res.status(400).json({ msg: `Sobre deve ter no máximo ${LIMITS.contatoSobre} caracteres` });
    }

    if (mensagem.length > LIMITS.contatoMensagem) {
        return res.status(400).json({ msg: `Mensagem deve ter no máximo ${LIMITS.contatoMensagem} caracteres` });
    }

    try {
        const info = await transporter.sendMail({
            from: `"Portfólio" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            replyTo: email,
            // Evita injeção de cabeçalho via quebra de linha no assunto.
            subject: `[Portfólio] ${sobre.replace(/[\r\n]+/g, " ")}`,
            text: `Nome: ${nome}\nEmail: ${email}\nSobre: ${sobre}\n\nMensagem:\n${mensagem}`,
        });

        return res.status(200).json({ msg: "Email enviado com sucesso", messageId: info.messageId });
    } catch (error) {
        console.error("Erro ao enviar email:", error);
        return res.status(500).json({ msg: "Erro interno do servidor" });
    }
});

// 404 — a API só fala JSON, então não devolve o HTML padrão do Express.
app.use((req, res) => {
    return res.status(404).json({ msg: "Rota não encontrada" });
});

// Error handler central: mantém o contrato JSON mesmo quando o erro estoura
// antes das rotas (JSON malformado, body grande, charset inválido etc.).
app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    if (error.type === "entity.parse.failed") {
        return res.status(400).json({ msg: "JSON inválido" });
    }

    if (error.type === "entity.too.large") {
        return res.status(413).json({ msg: "Corpo da requisição muito grande" });
    }

    // Outros erros do body-parser (charset não suportado etc.) já vêm com 4xx.
    const status = Number(error.status) || 500;
    if (status >= 400 && status < 500) {
        return res.status(status).json({ msg: "Requisição inválida" });
    }

    console.error("Erro não tratado:", error);
    return res.status(500).json({ msg: "Erro interno do servidor" });
});

// Exporta para os testes de integração (Supertest) usarem o app sem subir porta.
export { app, prisma };