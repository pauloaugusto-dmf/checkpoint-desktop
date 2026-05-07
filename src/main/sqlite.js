// src/main/sqlite.js
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const { app } = require('electron');

const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'checkpoint.sqlite');

console.log('Database path:', dbPath);

let dbInstance = null;

async function initDatabase() {
  try {
    if (dbInstance) return dbInstance;

    console.log('Initializing database...');
    dbInstance = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    await dbInstance.exec('PRAGMA foreign_keys = ON;');

    // Tabela de jogos
      await dbInstance.exec(`
        CREATE TABLE IF NOT EXISTS jogos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          titulo TEXT NOT NULL,
          plataforma TEXT,
          status TEXT NOT NULL,
          nota_pessoal REAL DEFAULT 0,
          tempo_jogo_minutos INTEGER DEFAULT 0,
          percentual_conclusao REAL DEFAULT 0,
          data_lancamento TEXT,
          capa_caminho TEXT,
          banner_caminho TEXT,
          nota_metacritic INTEGER DEFAULT 0,
          tempo_estimado_hltb INTEGER DEFAULT 0,
          hltb_main_extra INTEGER DEFAULT 0,
          hltb_completionist INTEGER DEFAULT 0
        );
      `);

      const columns = await dbInstance.all("PRAGMA table_info(jogos)");
      const columnNames = columns.map(c => c.name);

      if (!columnNames.includes('hltb_main_extra')) {
        await dbInstance.run("ALTER TABLE jogos ADD COLUMN hltb_main_extra INTEGER DEFAULT 0;");
      }
      if (!columnNames.includes('hltb_completionist')) {
        await dbInstance.run("ALTER TABLE jogos ADD COLUMN hltb_completionist INTEGER DEFAULT 0;");
      }


    // Tabela de gêneros
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS generos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL UNIQUE,
        cor TEXT
      );
    `);

    // Verificar se a coluna 'cor' existe (para bancos já criados)
    const columnsGeneros = await dbInstance.all("PRAGMA table_info(generos)");
    if (!columnsGeneros.some(c => c.name === 'cor')) {
      await dbInstance.exec("ALTER TABLE generos ADD COLUMN cor TEXT;");
    }

    // Tabela pivot jogos_generos
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS jogos_generos (
        jogo_id INTEGER NOT NULL,
        genero_id INTEGER NOT NULL,
        PRIMARY KEY (jogo_id, genero_id),
        FOREIGN KEY (jogo_id) REFERENCES jogos(id) ON DELETE CASCADE,
        FOREIGN KEY (genero_id) REFERENCES generos(id) ON DELETE CASCADE
      );
    `);

    // Migração de status se necessário
    const tableDef = await dbInstance.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='jogos'");
    if (tableDef && tableDef.sql.includes("CHECK(status IN")) {
      console.log('Migrating jogos table to remove check constraints...');
      await dbInstance.exec('PRAGMA foreign_keys = OFF;');
      await dbInstance.exec('BEGIN TRANSACTION;');
      try {
        await dbInstance.exec(`
          CREATE TABLE jogos_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            plataforma TEXT,
            status TEXT NOT NULL,
            nota_pessoal REAL DEFAULT 0,
            tempo_jogo_minutos INTEGER DEFAULT 0,
            percentual_conclusao REAL DEFAULT 0,
            data_lancamento TEXT,
            capa_caminho TEXT,
            banner_caminho TEXT,
            nota_metacritic INTEGER DEFAULT 0,
            tempo_estimado_hltb INTEGER DEFAULT 0,
            hltb_main_extra INTEGER DEFAULT 0,
            hltb_completionist INTEGER DEFAULT 0
          );
          INSERT INTO jogos_new (
            id, titulo, plataforma, status, nota_pessoal, 
            tempo_jogo_minutos, percentual_conclusao, 
            data_lancamento, capa_caminho, banner_caminho,
            nota_metacritic, tempo_estimado_hltb,
            hltb_main_extra, hltb_completionist
          ) 
          SELECT 
            id, titulo, plataforma, status, nota_pessoal, 
            tempo_jogo_minutos, percentual_conclusao, 
            data_lancamento, capa_caminho, banner_caminho,
            nota_metacritic, tempo_estimado_hltb,
            hltb_main_extra, hltb_completionist
          FROM jogos;
          DROP TABLE jogos;
          ALTER TABLE jogos_new RENAME TO jogos;
        `);
        await dbInstance.exec('COMMIT;');
      } catch (e) {
        await dbInstance.exec('ROLLBACK;');
        console.error('Migration failed:', e);
      }
      await dbInstance.exec('PRAGMA foreign_keys = ON;');
    }

    // Migrar dados da tabela tags para generos se existirem
    const checkTagsTable = await dbInstance.get("SELECT name FROM sqlite_master WHERE type='table' AND name='tags'");
    if (checkTagsTable) {
      console.log('Migrating legacy tags to genres...');
      try {
        await dbInstance.exec('BEGIN TRANSACTION;');
        await dbInstance.exec(`INSERT OR IGNORE INTO generos (nome) SELECT nome FROM tags;`);
        // Tentar migrar associações se jogos_tags existir
        const checkJogosTags = await dbInstance.get("SELECT name FROM sqlite_master WHERE type='table' AND name='jogos_tags'");
        if (checkJogosTags) {
          await dbInstance.exec(`
            INSERT OR IGNORE INTO jogos_generos (jogo_id, genero_id)
            SELECT jt.jogo_id, g.id
            FROM jogos_tags jt
            JOIN tags t ON jt.tag_id = t.id
            JOIN generos g ON t.nome = g.nome;
          `);
          await dbInstance.exec('DROP TABLE jogos_tags;');
        }
        await dbInstance.exec('DROP TABLE tags;');
        await dbInstance.exec('COMMIT;');
        console.log('Legacy migration completed.');
      } catch (e) {
        await dbInstance.exec('ROLLBACK;');
        console.error('Legacy migration failed:', e);
      }
    }

    // Sincronizar gêneros principais com cores
    console.log('Syncing main genres with colors...');
    const mainGeneros = [
      { nome: 'Ação', cor: '#ef4444' },
      { nome: 'Aventura', cor: '#10b981' },
      { nome: 'RPG', cor: '#8b5cf6' },
      { nome: 'FPS', cor: '#f59e0b' },
      { nome: 'TPS', cor: '#fbbf24' },
      { nome: 'Shooter', cor: '#f97316' },
      { nome: 'Estratégia', cor: '#0ea5e9' },
      { nome: 'Simulação', cor: '#6366f1' },
      { nome: 'Esportes', cor: '#3b82f6' },
      { nome: 'Corrida', cor: '#22c55e' },
      { nome: 'Terror', cor: '#7f1d1d' },
      { nome: 'Horror', cor: '#450a0a' },
      { nome: 'Plataforma', cor: '#ec4899' },
      { nome: 'Puzzle', cor: '#14b8a6' },
      { nome: 'Luta', cor: '#dc2626' },
      { nome: 'Mundo Aberto', cor: '#06b6d4' },
      { nome: 'Indie', cor: '#f43f5e' },
      { nome: 'Soulslike', cor: '#475569' },
      { nome: 'Metroidvania', cor: '#2dd4bf' },
      { nome: 'Roguelike', cor: '#84cc16' },
      { nome: 'Survival', cor: '#166534' },
      { nome: 'Sandbox', cor: '#0891b2' },
      { nome: 'MOBA', cor: '#2563eb' },
      { nome: 'Battle Royale', cor: '#9333ea' },
      { nome: 'MMO', cor: '#4f46e5' },
      { nome: 'MMORPG', cor: '#6366f1' },
      { nome: 'Hack and Slash', cor: '#be123c' },
      { nome: 'Ritmo', cor: '#f06292' },
      { nome: 'Point and Click', cor: '#5c6bc0' },
      { nome: 'Visual Novel', cor: '#d81b60' },
      { nome: 'Casual', cor: '#9ccc65' },
      { nome: 'Estratégia em Tempo Real (RTS)', cor: '#1e88e5' },
      { nome: 'Estratégia por Turnos', cor: '#3949ab' },
      { nome: 'Card Game', cor: '#795548' },
      { nome: 'Party Game', cor: '#ff7043' },
      { nome: 'Ficção Científica', cor: '#00bcd4' },
      { nome: 'Fantasia', cor: '#673ab7' },
      { nome: 'Cyberpunk', cor: '#f81ce5' },
      { nome: 'Pós-Apocalíptico', cor: '#546e7a' },
      { nome: 'Mistério', cor: '#303f9f' },
      { nome: 'Investigação', cor: '#1a237e' },
      { nome: 'Simulador de Vida', cor: '#ff80ab' },
      { nome: 'Simulador de Voo', cor: '#4fc3f7' },
      { nome: 'Simulador de Fazenda', cor: '#9ccc65' },
      { nome: 'Stealth', cor: '#263238' },
      { nome: 'Bullet Hell', cor: '#ff1744' },
      { nome: 'Dungeon Crawler', cor: '#4e342e' },
      { nome: 'JRPG', cor: '#7e57c2' },
      { nome: 'WRPG', cor: '#5c6bc0' },
      { nome: 'Tático', cor: '#2e7d32' },
      { nome: 'Educativo', cor: '#9c27b0' }
    ];
    
    for (const gen of mainGeneros) {
      await dbInstance.run('INSERT OR IGNORE INTO generos (nome, cor) VALUES (?, ?)', [gen.nome, gen.cor]);
      // Se já existe mas não tem cor, atualizar
      await dbInstance.run('UPDATE generos SET cor = ? WHERE nome = ? AND (cor IS NULL OR cor = "")', [gen.cor, gen.nome]);
    }
    
    console.log(`Genres synced. Total in DB: ${(await dbInstance.get('SELECT COUNT(*) as c FROM generos')).c}`);

    // Tabela de eventos
    const createEventosQuery = `
      CREATE TABLE IF NOT EXISTS eventos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        data_evento TEXT NOT NULL,
        cor TEXT DEFAULT '#3b82f6'
      );
    `;
    await dbInstance.exec(createEventosQuery);

    console.log('Database initialized successfully.');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

const getJogos = async () => {
  if (!dbInstance) await initDatabase();
  
  // Busca todos os jogos
  const jogos = await dbInstance.all('SELECT * FROM jogos ORDER BY id DESC');
  
  if (jogos.length === 0) return [];

  // Busca todas as associações de jogos e gêneros em uma única consulta
  const allAssociations = await dbInstance.all(`
    SELECT jg.jogo_id, g.id, g.nome, g.cor
    FROM generos g
    JOIN jogos_generos jg ON g.id = jg.genero_id
    WHERE jg.jogo_id IN (${jogos.map(j => j.id).join(',')})
  `);

  // Agrupa as associações por jogo_id
  const genreMap = allAssociations.reduce((acc, assoc) => {
    if (!acc[assoc.jogo_id]) acc[assoc.jogo_id] = [];
    acc[assoc.jogo_id].push({
      id: assoc.id,
      nome: assoc.nome,
      cor: assoc.cor
    });
    return acc;
  }, {});

  // Atribui os gêneros aos jogos correspondentes
  return jogos.map(jogo => ({
    ...jogo,
    generos: genreMap[jogo.id] || []
  }));
};


const addJogo = async (jogo) => {
  if (!dbInstance) await initDatabase();
  
  const result = await dbInstance.run(`
    INSERT INTO jogos (
      titulo, plataforma, status, nota_pessoal, 
      tempo_jogo_minutos, percentual_conclusao, 
      data_lancamento, capa_caminho, banner_caminho,
      nota_metacritic, tempo_estimado_hltb,
      hltb_main_extra, hltb_completionist
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    jogo.titulo, jogo.plataforma || null, jogo.status,
    jogo.nota_pessoal || 0, jogo.tempo_jogo_minutos || 0,
    jogo.percentual_conclusao || 0, jogo.data_lancamento || null,
    jogo.capa_caminho || null, jogo.banner_caminho || null,
    jogo.nota_metacritic || 0, jogo.tempo_estimado_hltb || 0,
    jogo.hltb_main_extra || 0, jogo.hltb_completionist || 0
  ]);

  
  const jogoId = result.lastID;
  
  if (jogo.generos && Array.isArray(jogo.generos)) {
    for (const generoId of jogo.generos) {
      await dbInstance.run('INSERT INTO jogos_generos (jogo_id, genero_id) VALUES (?, ?)', [jogoId, generoId]);
    }
  }
  
  return jogoId;
};

const updateJogo = async (id, jogo) => {
  if (!dbInstance) await initDatabase();
  
  await dbInstance.run(`
    UPDATE jogos 
    SET titulo = ?, plataforma = ?, status = ?, 
        nota_pessoal = ?, tempo_jogo_minutos = ?, 
        percentual_conclusao = ?, data_lancamento = ?, 
        capa_caminho = ?, banner_caminho = ?,
        nota_metacritic = ?, tempo_estimado_hltb = ?,
        hltb_main_extra = ?, hltb_completionist = ?
    WHERE id = ?
  `, [
    jogo.titulo, jogo.plataforma || null, jogo.status,
    jogo.nota_pessoal || 0, jogo.tempo_jogo_minutos || 0,
    jogo.percentual_conclusao || 0, jogo.data_lancamento || null,
    jogo.capa_caminho || null, jogo.banner_caminho || null,
    jogo.nota_metacritic || 0, jogo.tempo_estimado_hltb || 0,
    jogo.hltb_main_extra || 0, jogo.hltb_completionist || 0, id
  ]);


  await dbInstance.run('DELETE FROM jogos_generos WHERE jogo_id = ?', id);
  if (jogo.generos && Array.isArray(jogo.generos)) {
    for (const item of jogo.generos) {
      // Se for um objeto (como vem do frontend após o join), pega o .id
      // Se for apenas o número, usa o valor direto
      const generoId = (typeof item === 'object' && item !== null) ? item.id : item;
      
      if (generoId) {
        await dbInstance.run('INSERT INTO jogos_generos (jogo_id, genero_id) VALUES (?, ?)', [id, generoId]);
      }
    }
  }

  
  return id;
};

const deleteJogo = async (id) => {
  if (!dbInstance) await initDatabase();
  await dbInstance.run('DELETE FROM jogos WHERE id = ?', id);
  return id;
};

const getGeneros = async () => {
  if (!dbInstance) await initDatabase();
  return dbInstance.all('SELECT id, nome, cor FROM generos ORDER BY nome ASC');
};

const addGenero = async (nome) => {
  if (!dbInstance) await initDatabase();
  const colors = ['#ef4444', '#10b981', '#8b5cf6', '#f59e0b', '#3b82f6', '#ec4899', '#14b8a6', '#f43f5e', '#06b6d4'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const result = await dbInstance.run('INSERT INTO generos (nome, cor) VALUES (?, ?)', [nome, randomColor]);
  return { id: result.lastID, nome, cor: randomColor };
};

const getEventos = async () => {
  if (!dbInstance) await initDatabase();
  return dbInstance.all('SELECT * FROM eventos ORDER BY data_evento ASC');
};

const addEvento = async (evento) => {
  if (!dbInstance) await initDatabase();
  const result = await dbInstance.run(`
    INSERT INTO eventos (titulo, data_evento, cor)
    VALUES (?, ?, ?)
  `, [evento.titulo, evento.data_evento, evento.cor || '#3b82f6']);
  return result.lastID;
};

const deleteEvento = async (id) => {
  if (!dbInstance) await initDatabase();
  await dbInstance.run('DELETE FROM eventos WHERE id = ?', id);
  return id;
};

const getAllData = async () => {
  if (!dbInstance) await initDatabase();
  return {
    jogos: await getJogos(),
    eventos: await getEventos(),
    generos: await dbInstance.all('SELECT id, nome, cor FROM generos')
  };
};

const importData = async (data) => {
  if (!dbInstance) await initDatabase();
  if (!data) throw new Error('Dados inválidos');

  const fs = require('fs');
  const backupPath = `${dbPath}.bak`;
  if (fs.existsSync(dbPath)) fs.copyFileSync(dbPath, backupPath);

  await dbInstance.exec('BEGIN TRANSACTION');
  try {
    await dbInstance.run('DELETE FROM jogos');
    await dbInstance.run('DELETE FROM eventos');
    await dbInstance.run('DELETE FROM generos');
    await dbInstance.run('DELETE FROM jogos_generos');
    
    const genMap = {};
    const sourceGeneros = data.generos || data.tags || []; // Suporte para backup com tags
    
    for (const gen of sourceGeneros) {
      const result = await dbInstance.run('INSERT INTO generos (nome) VALUES (?)', gen.nome);
      genMap[gen.id] = result.lastID;
    }

    if (data.jogos) {
      for (const jogo of data.jogos) {
        const result = await dbInstance.run(`
          INSERT INTO jogos (
            titulo, plataforma, status, nota_pessoal, 
            tempo_jogo_minutos, percentual_conclusao, 
            data_lancamento, capa_caminho, banner_caminho, 
            nota_metacritic, tempo_estimado_hltb,
            hltb_main_extra, hltb_completionist
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          jogo.titulo, jogo.plataforma || null, jogo.status, 
          jogo.nota_pessoal || 0, jogo.tempo_jogo_minutos || 0, 
          jogo.percentual_conclusao || 0, jogo.data_lancamento || null, 
          jogo.capa_caminho || null, jogo.banner_caminho || null,
          jogo.nota_metacritic || 0, jogo.tempo_estimado_hltb || 0,
          jogo.hltb_main_extra || 0, jogo.hltb_completionist || 0
        ]);

        
        const newJogoId = result.lastID;
        const sourceGens = jogo.generos || jogo.tags || [];
        
        for (const gen of sourceGens) {
          let newGenId = genMap[gen.id];
          if (!newGenId) {
            const existing = await dbInstance.get('SELECT id FROM generos WHERE nome = ?', gen.nome);
            if (existing) newGenId = existing.id;
          }
          if (newGenId) {
            await dbInstance.run('INSERT OR IGNORE INTO jogos_generos (jogo_id, genero_id) VALUES (?, ?)', [newJogoId, newGenId]);
          }
        }
      }
    }
    
    if (data.eventos) {
      for (const ev of data.eventos) {
        await dbInstance.run('INSERT INTO eventos (titulo, data_evento, cor) VALUES (?, ?, ?)', [ev.titulo, ev.data_evento, ev.cor || '#3b82f6']);
      }
    }
    
    await dbInstance.exec('COMMIT');
    if (fs.existsSync(backupPath)) fs.unlinkSync(backupPath);
    return true;
  } catch (error) {
    await dbInstance.exec('ROLLBACK');
    if (fs.existsSync(backupPath)) fs.copyFileSync(backupPath, dbPath);
    throw error;
  }
};

module.exports = {
  initDatabase, getJogos, addJogo, updateJogo, deleteJogo, 
  getGeneros, addGenero, getEventos, addEvento, deleteEvento, 
  getAllData, importData
};
