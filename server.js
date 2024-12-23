const { PrismaClient } = require('@prisma/client');
const express = require('express');
const cors = require('cors'); // Importa o pacote cors
const app = express();
const port = 3001;
const prisma = new PrismaClient();

//DATABASE_URL="mongodb+srv://bayer:JK87obZGZ6NK9Szz@cluster0.jg2ro.mongodb.net/cluster0?retryWrites=true&w=majority"

// Configuração do CORS - permitindo apenas requisições de 'http://localhost:3000'
app.use(cors({
  origin: 'http://localhost:3000', // Permite requisições apenas do frontend rodando em localhost:3000
  methods: 'GET, POST, PUT, DELETE', // Permite esses métodos HTTP
  allowedHeaders: 'Content-Type', // Permite o cabeçalho Content-Type
}));

app.use(express.json());

// Root
app.get('/', (req, res) => {
  res.send('route root');
});

// ROTAS USUARIO

// criacao user
app.post('/usuario', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    // Verifica se o e-mail já está cadastrado
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      return res.status(400).json({ error: 'E-mail já está em uso.' });
    }

    // Cria o novo usuário
    const novoUsuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha, // Lembre-se de usar hashing de senha em produção!
      },
    });

    res.status(201).json(novoUsuario);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro interno ao criar usuário.' });
  }
});

// excluir user

app.delete('/usuario/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verifica se o usuário existe
    const usuario = await prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // Exclui as notas associadas ao usuário (opcional)
    await prisma.note.deleteMany({
      where: { idUser: id },
    });

    // Exclui o usuário
    await prisma.usuario.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Usuário e suas notas foram excluídos com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ error: 'Erro interno ao excluir usuário.' });
  }
});


// ROTAS DOS NOTES

// cria uma nota com o id do user
app.post('/note', async (req, res) => {
  try {
    const { tittle, body, date, hour, idUser } = req.body;

    // Verifica se o usuário existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: idUser },
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // Cria a nota associada ao idUser
    const novaNota = await prisma.note.create({
      data: {
        tittle,
        body,
        date,
        hour,
        idUser,
      },
    });

    res.status(201).json(novaNota);
  } catch (error) {
    console.error('Erro ao criar nota:', error);
    res.status(500).json({ error: 'Erro interno ao criar nota.' });
  }
});

// busca todas as notas pelo id do user 
app.get('/usuario/:id/notes', async (req, res) => {
  try {
    const { id } = req.params;

    // Verifica se o usuário existe
    const usuario = await prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // Busca todas as notas do usuário
    const notas = await prisma.note.findMany({
      where: { idUser: id },
    });

    res.status(200).json(notas);
  } catch (error) {
    console.error('Erro ao buscar notas do usuário:', error);
    res.status(500).json({ error: 'Erro interno ao buscar notas.' });
  }
});

//deletar uma nota
app.delete('/note/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verifica se a nota existe
    const nota = await prisma.note.findUnique({
      where: { id },
    });

    if (!nota) {
      return res.status(404).json({ error: 'Nota não encontrada.' });
    }

    // Exclui a nota
    await prisma.note.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Nota excluída com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir nota:', error);
    res.status(500).json({ error: 'Erro interno ao excluir nota.' });
  }
});

//busca nota pelo id
app.get('/note/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verifica se a nota existe
    const nota = await prisma.note.findUnique({
      where: { id },
    });

    if (!nota) {
      return res.status(404).json({ error: 'Nota não encontrada.' });
    }

    res.status(200).json(nota);
  } catch (error) {
    console.error('Erro ao buscar nota:', error);
    res.status(500).json({ error: 'Erro interno ao buscar nota.' });
  }
});


// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
