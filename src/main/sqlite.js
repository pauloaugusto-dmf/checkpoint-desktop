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
        capa_caminho TEXT
      );
    `);

    // Tabela de gêneros
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS generos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL UNIQUE
      );
    `);

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
            capa_caminho TEXT
          );
          INSERT INTO jogos_new SELECT id, titulo, plataforma, status, nota_pessoal, tempo_jogo_minutos, percentual_conclusao, data_lancamento, capa_caminho FROM jogos;
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

    // Sincronizar gêneros principais
    console.log('Syncing main genres...');
    const mainGeneros = [
      'Ação', 'Aventura', 'RPG', 'FPS', 'TPS', 'Shooter', 'Estratégia', 
      'Simulação', 'Esportes', 'Corrida', 'Terror', 'Horror', 'Plataforma', 
      'Puzzle', 'Luta', 'Mundo Aberto', 'Indie', 'Soulslike', 
      'Metroidvania', 'Roguelike', 'Survival', 'Sandbox', 'MOBA', 
      'Battle Royale', 'MMO', 'MMORPG', 'Hack and Slash', 'Ritmo',
      'Point and Click', 'Visual Novel', 'Casual', 'Estratégia em Tempo Real (RTS)',
      'Estratégia por Turnos', 'Card Game', 'Party Game', 'Ficção Científica',
      'Fantasia', 'Cyberpunk', 'Pós-Apocalíptico', 'Mistério', 'Investigação',
      'Simulador de Vida', 'Simulador de Voo', 'Simulador de Fazenda', 'Stealth',
      'Bullet Hell', 'Dungeon Crawler', 'JRPG', 'WRPG', 'Tático', 'Educativo'
    ];
    
    for (const gen of mainGeneros) {
      await dbInstance.run('INSERT OR IGNORE INTO generos (nome) VALUES (?)', gen);
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
  const jogos = await dbInstance.all('SELECT * FROM jogos ORDER BY id DESC');
  
  for (let jogo of jogos) {
    const generos = await dbInstance.all(`
      SELECT g.id, g.nome 
      FROM generos g
      JOIN jogos_generos jg ON g.id = jg.genero_id
      WHERE jg.jogo_id = ?
    `, jogo.id);
    jogo.generos = generos;
  }
  
  return jogos;
};

const addJogo = async (jogo) => {
  if (!dbInstance) await initDatabase();
  
  const result = await dbInstance.run(`
    INSERT INTO jogos (titulo, plataforma, status, nota_pessoal, tempo_jogo_minutos, percentual_conclusao, data_lancamento, capa_caminho)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    jogo.titulo, jogo.plataforma || null, jogo.status,
    jogo.nota_pessoal || 0, jogo.tempo_jogo_minutos || 0,
    jogo.percentual_conclusao || 0, jogo.data_lancamento || null,
    jogo.capa_caminho || null
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
        capa_caminho = ?
    WHERE id = ?
  `, [
    jogo.titulo, jogo.plataforma || null, jogo.status,
    jogo.nota_pessoal || 0, jogo.tempo_jogo_minutos || 0,
    jogo.percentual_conclusao || 0, jogo.data_lancamento || null,
    jogo.capa_caminho || null, id
  ]);

  await dbInstance.run('DELETE FROM jogos_generos WHERE jogo_id = ?', id);
  if (jogo.generos && Array.isArray(jogo.generos)) {
    for (const generoId of jogo.generos) {
      await dbInstance.run('INSERT INTO jogos_generos (jogo_id, genero_id) VALUES (?, ?)', [id, generoId]);
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
  return dbInstance.all('SELECT * FROM generos ORDER BY nome ASC');
};

const addGenero = async (nome) => {
  if (!dbInstance) await initDatabase();
  const result = await dbInstance.run('INSERT INTO generos (nome) VALUES (?)', nome);
  return { id: result.lastID, nome };
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
  const jogos = await getJogos();
  const eventos = await dbInstance.all('SELECT * FROM eventos');
  const generos = await dbInstance.all('SELECT * FROM generos');
  return { jogos, eventos, generos };
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
          INSERT INTO jogos (titulo, plataforma, status, nota_pessoal, tempo_jogo_minutos, percentual_conclusao, data_lancamento, capa_caminho)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          jogo.titulo, jogo.plataforma || null, jogo.status, 
          jogo.nota_pessoal || 0, jogo.tempo_jogo_minutos || 0, 
          jogo.percentual_conclusao || 0, jogo.data_lancamento || null, 
          jogo.capa_caminho || null
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
