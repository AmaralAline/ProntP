// ================================================
// ProntPsi Portal CMS — Rotas da API
// Arquivo: portal.js
// ================================================

const express = require('express');
const router  = express.Router();
const db      = require('./db'); // sua conexão MySQL já existente

// ── Middleware de autenticação admin ──────────────────────────────────────────
// Reutiliza o mesmo JWT do sistema clínico, mas exige is_admin = true
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'prontpsi_secret';

function authAdmin(req, res, next) {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ erro: 'Token não enviado' });

  const token = header.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (!payload.is_admin) return res.status(403).json({ erro: 'Acesso negado' });
    req.usuario = payload;
    next();
  } catch {
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
}

// ════════════════════════════════════════════════
// NOTÍCIAS
// ════════════════════════════════════════════════

// GET /api/portal/noticias — pública, retorna só publicadas
router.get('/noticias', async (req, res) => {
  try {
    const { categoria, limite = 20 } = req.query;
    let sql = 'SELECT * FROM portal_noticias WHERE status = "publicado"';
    const params = [];

    if (categoria && categoria !== 'all') {
      sql += ' AND categoria = ?';
      params.push(categoria);
    }

    sql += ' ORDER BY criado_em DESC LIMIT ?';
    params.push(parseInt(limite));

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar notícias' });
  }
});

// GET /api/portal/noticias/todas — admin, retorna todas incluindo rascunhos
router.get('/noticias/todas', authAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM portal_noticias ORDER BY criado_em DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar notícias' });
  }
});

// POST /api/portal/noticias — admin, cria notícia
router.post('/noticias', authAdmin, async (req, res) => {
  try {
    const { titulo, resumo, corpo, categoria, autor, img_url, status } = req.body;

    if (!titulo || !resumo || !corpo) {
      return res.status(400).json({ erro: 'Título, resumo e corpo são obrigatórios' });
    }

    const [result] = await db.query(
      `INSERT INTO portal_noticias (titulo, resumo, corpo, categoria, autor, img_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        titulo,
        resumo,
        corpo,
        categoria   || 'Psicologia',
        autor       || 'Redação ProntPsi',
        img_url     || null,
        status      || 'publicado'
      ]
    );

    res.status(201).json({ id: result.insertId, mensagem: 'Notícia salva com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao salvar notícia' });
  }
});

// DELETE /api/portal/noticias/:id — admin
router.delete('/noticias/:id', authAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM portal_noticias WHERE id = ?', [req.params.id]);
    res.json({ mensagem: 'Notícia removida' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao remover notícia' });
  }
});

// ════════════════════════════════════════════════
// EVENTOS
// ════════════════════════════════════════════════

// GET /api/portal/eventos — pública
router.get('/eventos', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM portal_eventos
       WHERE data_evento >= CURDATE()
       ORDER BY data_evento ASC
       LIMIT 10`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar eventos' });
  }
});

// GET /api/portal/eventos/todos — admin, incluindo passados
router.get('/eventos/todos', authAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM portal_eventos ORDER BY data_evento DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar eventos' });
  }
});

// POST /api/portal/eventos — admin
router.post('/eventos', authAdmin, async (req, res) => {
  try {
    const { titulo, data_evento, modalidade, local_evento, descricao, link_inscricao } = req.body;

    if (!titulo || !data_evento) {
      return res.status(400).json({ erro: 'Título e data são obrigatórios' });
    }

    const [result] = await db.query(
      `INSERT INTO portal_eventos (titulo, data_evento, modalidade, local_evento, descricao, link_inscricao)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [titulo, data_evento, modalidade || 'online', local_evento || null, descricao || null, link_inscricao || null]
    );

    res.status(201).json({ id: result.insertId, mensagem: 'Evento salvo com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao salvar evento' });
  }
});

// DELETE /api/portal/eventos/:id — admin
router.delete('/eventos/:id', authAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM portal_eventos WHERE id = ?', [req.params.id]);
    res.json({ mensagem: 'Evento removido' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao remover evento' });
  }
});

// ════════════════════════════════════════════════
// PROFISSIONAIS EM DESTAQUE
// ════════════════════════════════════════════════

// GET /api/portal/profissionais — pública
router.get('/profissionais', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM portal_profissionais ORDER BY criado_em DESC LIMIT 4'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar profissionais' });
  }
});

// GET /api/portal/profissionais/todos — admin
router.get('/profissionais/todos', authAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM portal_profissionais ORDER BY criado_em DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar profissionais' });
  }
});

// POST /api/portal/profissionais — admin
router.post('/profissionais', authAdmin, async (req, res) => {
  try {
    const { nome, iniciais, especialidade, cidade, link_perfil } = req.body;

    if (!nome || !iniciais) {
      return res.status(400).json({ erro: 'Nome e iniciais são obrigatórios' });
    }

    const [result] = await db.query(
      `INSERT INTO portal_profissionais (nome, iniciais, especialidade, cidade, link_perfil)
       VALUES (?, ?, ?, ?, ?)`,
      [nome, iniciais.toUpperCase(), especialidade || '', cidade || null, link_perfil || null]
    );

    res.status(201).json({ id: result.insertId, mensagem: 'Profissional adicionado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao salvar profissional' });
  }
});

// DELETE /api/portal/profissionais/:id — admin
router.delete('/profissionais/:id', authAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM portal_profissionais WHERE id = ?', [req.params.id]);
    res.json({ mensagem: 'Profissional removido' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao remover profissional' });
  }
});

module.exports = router;
