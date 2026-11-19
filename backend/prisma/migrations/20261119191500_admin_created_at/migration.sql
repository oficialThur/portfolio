-- Typo histórico: a coluna nasceu como `createAr`. Renomeia preservando os dados.
ALTER TABLE `admins`
  CHANGE COLUMN `createAr` `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
