const { PrismaClient } = require('@prisma/client');
const express = require('express');
const cors = require('cors'); // Importa o pacote cors
const app = express();
const port = 3001;

const prisma = new PrismaClient();

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

// Nova nota
app.post('/note', async (req, res) => {
  await prisma.note.create({
    data: {
      tittle: req.body.tittle,
      body: req.body.body,
      date: req.body.date,
      hour: req.body.hour
    }
  });

  res.status(201).json(req.body);
});

// Exibir todas as notas
app.get('/note', async (req, res) => {
  const notes = await prisma.note.findMany();
  res.status(200).json(notes);
});

// Exibir nota por id
app.get('/note/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar a nota pelo ID
    const note = await prisma.note.findUnique({
      where: { id },
    });

    if (!note) {
      return res.status(404).json({ error: 'Nota não encontrada.' });
    }

    res.status(200).json(note);
  } catch (error) {
    console.error('Erro ao buscar nota:', error);
    res.status(500).json({ error: 'Erro interno ao buscar nota.' });
  }
});

// Deletar nota por id
app.delete('/note/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const note = await prisma.note.findUnique({ where: { id } });

    if (!note) {
      return res.status(404).json({ error: 'Nota não encontrada.' });
    }

    await prisma.note.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Nota excluída com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir nota:', error);
    res.status(500).json({ error: 'Erro interno ao excluir nota.' });
  }
});

// Editar nota
app.put('/note/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { tittle, body } = req.body;

    const note = await prisma.note.findUnique({ where: { id } });

    if (!note) {
      return res.status(404).json({ error: 'Nota não encontrada.' });
    }

    const updatedNote = await prisma.note.update({
      where: { id },
      data: {
        tittle,
        body,
      },
    });

    res.status(200).json(updatedNote);
  } catch (error) {
    console.error('Erro ao atualizar nota:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar nota.' });
  }
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
