const { PrismaClient } = require('@prisma/client')
const express = require('express')
const app = express()
const port = 3001

const prisma = new PrismaClient()
app.use(express.json())

//root 
app.get('/', (req, res) => {
  res.send('route root')
})

//new note
app.post('/note', async (req, res) => {

  await prisma.note.create({
    data: {
      tittle: req.body.tittle,
      body: req.body.body,
      date: req.body.date,
      hour: req.body.hour
    }
  })

  res.status(201).json(req.body)
})

//display note
app.get('/note', async (req, res) => {

  const notes = await prisma.note.findMany()

  res.status(200).json(notes)
})

//display note by id
app.get('/note/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar a nota pelo ID
    const note = await prisma.note.findUnique({
      where: { id },
    });

    // Verificar se a nota existe
    if (!note) {
      return res.status(404).json({ error: 'Nota não encontrada.' });
    }

    // Retornar a nota encontrada
    res.status(200).json(note);
  } catch (error) {
    console.error('Erro ao buscar nota:', error);
    res.status(500).json({ error: 'Erro interno ao buscar nota.' });
  }
});

// delete by id
app.delete('/note/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se a nota existe antes de excluir
    const note = await prisma.note.findUnique({ where: { id } });

    if (!note) {
      return res.status(404).json({ error: 'Nota não encontrada.' });
    }

    // Excluir a nota
    await prisma.note.delete({
      where: { id },
    });

    // Retornar uma mensagem de sucesso
    res.status(200).json({ message: 'Nota excluída com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir nota:', error);
    res.status(500).json({ error: 'Erro interno ao excluir nota.' });
  }
});


// Editar título e corpo de uma nota por ID
app.put('/note/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { tittle, body } = req.body;

    // Verificar se a nota existe antes de atualizar
    const note = await prisma.note.findUnique({ where: { id } });

    if (!note) {
      return res.status(404).json({ error: 'Nota não encontrada.' });
    }

    // Atualizar apenas os campos fornecidos (título e corpo)
    const updatedNote = await prisma.note.update({
      where: { id },
      data: {
        tittle,
        body,
      },
    });

    // Retornar a nota atualizada
    res.status(200).json(updatedNote);
  } catch (error) {
    console.error('Erro ao atualizar nota:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar nota.' });
  }
});


app.listen(port, () => {
  console.log(`running in  localhost:${port}`)
})

