Nome do Projeto: CoinTracker
Integrantes: Joao Victor Colpo e Joao Guilherme Altran 
Resumo do Projeto: O Cointracker tem a ideia de gerenciar todos os gastos e entradas financeiras de uma pessoa, afim de promever uma vida mais estavel financeiramente para o usuario
Tecnologias: Backend em Node (javascript), frontend React, banco de dados: PostgresSQL

Segue instrucoes para execucao: 

Criar o banco no pgAdmin ou pelo terminal:
CREATE USER cointrack WITH PASSWORD 'cointrack123';
CREATE DATABASE cointrack OWNER cointrack;
ALTER USER cointrack CREATEDB;
Depois rodar:
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm start
cd frontend
npm install
npm run dev

Funcionalidades: 

Controle de Entrada e Saida de Receita, edicoes de entradas/transferencias 
Criacao de Categoria baseada no tipo de transacao para um melhor controle das mesmas 
Relatorios 