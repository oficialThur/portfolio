const express = require('express');
const {PrismaClient} = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3001;

app.use(express.json());


app.get("/login", async (req, res) => {
    const {email, password} = req.body;

    const admin = await prisma.admin.findUnique({where:{email}});
    if(!admin){
        return res.status(401).json({msg:"Credenciais inválidas"})
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if(!isPasswordValid){
        return res.status(401).json({msg:"Credenciais inválidas"})
    }

    return res.status(200).json({msg:"Login realizado com sucesso", token: generateToken(admin.id)});
});

function authMiddleware(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).json({msg:"Acesso não autorizado"})
    }
}