const { PrismaClient } = require('@prisma/client')
const express = require('express')
const cors = require('cors')
const app = express()
const port = 3001
const prisma = new PrismaClient()

//DATABASE_URL="mongodb+srv://bayer:JK87obZGZ6NK9Szz@cluster0.jg2ro.mongodb.net/cluster0?retryWrites=true&w=majority"

// cors / so apenas requisições de 'http://localhost:3000'
app.use(cors({
  origin: 'http://localhost:3000',
  methods: 'GET, POST, PUT, DELETE',
  allowedHeaders: 'Content-Type',
}));

app.use(express.json());

// root
app.get('/', (req, res) => {
  res.send('route root');
});

// ROTAS USUARIO

// criacao user
app.post('/usuario', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      return res.status(400).json({ error: 'E-mail já está em uso.' })
    }

    const novoUsuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha,
      },
    })

    res.status(201).json(novoUsuario);
  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    res.status(500).json({ error: 'Erro interno ao criar usuário.' })
  }
});

// Rota de login
app.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    const usuario = await prisma.usuario.findUnique({
      where: { email },
    })

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    if (usuario.senha !== senha) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    //  return os os do usuário como resposta
    res.status(200).json({
      message: 'Login bem-sucedido!',
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
    })
  } catch (error) {
    console.error('Erro ao realizar login:', error);
    res.status(500).json({ error: 'Erro interno ao realizar login.' });
  }
})

// rota auth pelo google
app.post('/auth/google', async (req, res) => {
  let { email, name, imageUrl } = req.body
  let statis = 200


  try {
    let user = await prisma.usuario.findUnique({ where: { email } })

    if (!user) {
      user = await prisma.usuario.create({
        data: {
          email,
          nome: name,
          imageUrl,
          authType: 'google'
        }
      })
      statis = 201
    } return res.status(statis).json({
      id: user.id,
      email: user.email,
      nome: user.nome,
      authType: user.authType,
      imageUrl: user.imageUrl
    });
  }

  catch (error) {
    console.error('[Google Auth Error]', error);
    return res.status(500).json({ error: 'Erro ao autenticar com Google' });
  }
})

// excluir user
app.delete('/usuario/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await prisma.usuario.findUnique({
      where: { id },
    })

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    await prisma.note.deleteMany({
      where: { idUser: id },
    });

    await prisma.usuario.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Usuário e suas notas foram excluídos com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ error: 'Erro interno ao excluir usuário.' });
  }
})

// ROTAS DOS NOTES

// Rota para criar uma nova nota
app.post('/usuario/:id/notes', async (req, res) => {
  try {
    const { content, date, hour } = req.body;
    const { id } = req.params;

    // Pega o primeiro bloco do tipo "heading" como título
    const titleBlock = content.find(block => block.type === "heading");
    const title = titleBlock ? titleBlock.content : "Nova Nota";

    const novaNota = await prisma.note.create({
      data: {
        title,
        content,
        date,
        hour,
        idUser: id,
      }
    });

    res.status(201).json(novaNota);
  } catch (error) {
    console.error("Erro ao criar nota:", error);
    res.status(500).json({ error: "Erro interno ao criar nota." });
  }
});

// put do note
// Rota para atualizar uma nota existente
app.put('/note/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { content, date, hour } = req.body;

    // Atualiza a nota com o ID fornecido
    const notaAtualizada = await prisma.note.update({
      where: { id: id },
      data: {
        content: content, // Ex: [{ type: "paragraph", content: "Texto" }]
        date: date,
        hour: hour
      }
    });

    res.status(200).json(notaAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar a nota:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar a nota.' });
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
})

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

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
