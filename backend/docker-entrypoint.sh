#!/bin/sh
set -e

# Em um reboot, o Docker pode iniciar o backend antes do MySQL. O pool do
# Prisma não se recupera sozinho nesse caso; esperamos o banco responder de
# verdade (não só abrir a porta, que o MySQL abre durante a inicialização).
wait_for_db() {
  node -e "const m=require('mariadb');m.createConnection({host:process.env.DATABASE_HOST,port:Number(process.env.DATABASE_PORT)||3306,user:process.env.DATABASE_USER,password:process.env.DATABASE_PASSWORD,database:process.env.DATABASE_NAME,allowPublicKeyRetrieval:true}).then(async c=>{const rows=await c.query(\"SHOW GLOBAL STATUS LIKE 'Uptime'\");const uptime=Number(rows?.[0]?.Value??0);await c.end();process.exit(uptime>=10?0:1)}).catch(()=>process.exit(1));"
}

if [ -n "$DATABASE_HOST" ]; then
  echo "Aguardando banco em ${DATABASE_HOST}:${DATABASE_PORT:-3306}..."
  # O entrypoint do MySQL sobe um servidor temporário para inicializar o
  # volume, depois reinicia. Exigir uptime >= 10s evita conectar no temporário.
  until wait_for_db; do
    sleep 2
  done
fi

exec "$@"
