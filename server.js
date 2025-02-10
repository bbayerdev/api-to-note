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

    await prisma.note.create({
      data: {
        title: 'Welcome To-Note 🎉',
        content: [
          {
            "type": "heading",
            "content": [
              {
                "type": "text",
                "text": "Welcome to this demo!",
                "styles": {}
              }
            ]
          },
          {
            "type": "heading",
            "props": {
              "level": 2
            },
            "content": [
              {
                "type": "text",
                "text": "Check out the features of To-Note!",
                "styles": { "underline": true }
              }
            ]
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Blocks:",
                styles: { bold: true },
              },
            ],
          },
          {
            type: "paragraph",
            content: "Paragraph",
          },
          {
            type: "heading",
            content: "Heading 1",
          },
          {
            "type": "heading",
            "props": {
              "level": 2
            },
            "content": "Heading 2"
          },
          {
            "type": "heading",
            "props": {
              "level": 3
            },
            "content": "Heading 3"
          },
          {
            type: "paragraph",
          },
          {
            type: "bulletListItem",
            content: "Bullet List Item",
          },
          {
            type: "numberedListItem",
            content: "Numbered List Item",
          },
          {
            type: "checkListItem",
            content: "Check List Item",
          },
          {
            type: "codeBlock",
            props: { language: "javascript" },
            content: "console.log('Hello, world!');",
          },
          {
            type: "table",
            content: {
              type: "tableContent",
              rows: [
                {
                  cells: ["Table Cell", "Table Cell", "Table Cell"],
                },
                {
                  cells: ["Table Cell", "Table Cell", "Table Cell"],
                },
                {
                  cells: ["Table Cell", "Table Cell", "Table Cell"],
                },
              ],
            },
          },
          {
            type: "file",
          },
          {
            type: "image",
            props: {
              url: "https://interactive-examples.mdn.mozilla.net/media/cc0-images/grapefruit-slice-332-332.jpg",
              caption:
                "From https://interactive-examples.mdn.mozilla.net/media/cc0-images/grapefruit-slice-332-332.jpg",
            },
          },
          {
            type: "video",
            props: {
              url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm",
              caption:
                "From https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm",
            },
          },
          {
            type: "audio",
            props: {
              url: "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3",
              caption:
                "From https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3",
            },
          },
          {
            type: "paragraph",
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Inline Content:",
                styles: { bold: true },
              },
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Styled Text",
                styles: {
                  bold: true,
                  italic: true,
                  textColor: "red",
                  backgroundColor: "blue",
                },
              },
              {
                type: "text",
                text: " ",
                styles: {},
              },
              {
                type: "link",
                content: "Link",
                href: "https://github.com",
              },
            ],
          },
          {
            type: "paragraph",
          },
        ],
        date: new Date().toISOString(),
        hour: new Date().toLocaleTimeString(),
        idUser: novoUsuario.id,
      }
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

      await prisma.note.create({
        data: {
          title: 'Welcome To-Note 🎉',
          content: [
            {
              "type": "heading",
              "content": [
                {
                  "type": "text",
                  "text": "Welcome to this demo!",
                  "styles": {}
                }
              ]
            },
            {
              "type": "heading",
              "props": {
                "level": 2
              },
              "content": [
                {
                  "type": "text",
                  "text": "Check out the features of To-Note!",
                  "styles": { "underline": true }
                }
              ]
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Blocks:",
                  styles: { bold: true },
                },
              ],
            },
            {
              type: "paragraph",
              content: "Paragraph",
            },
            {
              type: "heading",
              content: "Heading 1",
            },
            {
              "type": "heading",
              "props": {
                "level": 2
              },
              "content": "Heading 2"
            },
            {
              "type": "heading",
              "props": {
                "level": 3
              },
              "content": "Heading 3"
            },
            {
              type: "paragraph",
            },
            {
              type: "bulletListItem",
              content: "Bullet List Item",
            },
            {
              type: "numberedListItem",
              content: "Numbered List Item",
            },
            {
              type: "checkListItem",
              content: "Check List Item",
            },
            {
              type: "codeBlock",
              props: { language: "javascript" },
              content: "console.log('Hello, world!');",
            },
            {
              type: "table",
              content: {
                type: "tableContent",
                rows: [
                  {
                    cells: ["Table Cell", "Table Cell", "Table Cell"],
                  },
                  {
                    cells: ["Table Cell", "Table Cell", "Table Cell"],
                  },
                  {
                    cells: ["Table Cell", "Table Cell", "Table Cell"],
                  },
                ],
              },
            },
            {
              type: "file",
            },
            {
              type: "image",
              props: {
                url: "https://interactive-examples.mdn.mozilla.net/media/cc0-images/grapefruit-slice-332-332.jpg",
                caption:
                  "From https://interactive-examples.mdn.mozilla.net/media/cc0-images/grapefruit-slice-332-332.jpg",
              },
            },
            {
              type: "video",
              props: {
                url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm",
                caption:
                  "From https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm",
              },
            },
            {
              type: "audio",
              props: {
                url: "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3",
                caption:
                  "From https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3",
              },
            },
            {
              type: "paragraph",
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Inline Content:",
                  styles: { bold: true },
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Styled Text",
                  styles: {
                    bold: true,
                    italic: true,
                    textColor: "red",
                    backgroundColor: "blue",
                  },
                },
                {
                  type: "text",
                  text: " ",
                  styles: {},
                },
                {
                  type: "link",
                  content: "Link",
                  href: "https://github.com",
                },
              ],
            },
            {
              type: "paragraph",
            },
          ],
          date: new Date().toISOString(),
          hour: new Date().toLocaleTimeString(),
          idUser: user.id,
        }
      })

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
    const { content, date, hour, title } = req.body;
    const { id } = req.params;

    const novaNota = await prisma.note.create({
      data: {
        title,
        content,
        date,
        hour,
        idUser: id,
      }
    })



    res.status(201).json(novaNota);
  } catch (error) {
    console.error("Erro ao criar nota:", error);
    res.status(500).json({ error: "Erro interno ao criar nota." });
  }
});

// put do note
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

// put do note title
app.put('/note/title/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    // Atualiza a nota com o ID fornecido
    const notaAtualizada = await prisma.note.update({
      where: { id: id },
      data: {
        title
      }
    })

    res.status(200).json(notaAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar o titulo:', error);
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
