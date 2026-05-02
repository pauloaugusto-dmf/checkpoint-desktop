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
    dbInstance = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    await dbInstance.exec('PRAGMA foreign_keys = ON;');

    const createTableQuery = `
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
    `;
    await dbInstance.exec(createTableQuery);

    const createEventosQuery = `
      CREATE TABLE IF NOT EXISTS eventos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        data_evento TEXT NOT NULL,
        cor TEXT DEFAULT '#3b82f6'
      );
    `;
    await dbInstance.exec(createEventosQuery);

    // Migration to remove CHECK constraint if it exists in the old schema
    const tableDef = await dbInstance.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='jogos'");
    if (tableDef && tableDef.sql.includes("CHECK(status IN")) {
      console.log('Migrating database to remove CHECK constraint on status column...');
      await dbInstance.exec(`
        PRAGMA foreign_keys = OFF;
        
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
        
        INSERT INTO jogos_new SELECT * FROM jogos;
        DROP TABLE jogos;
        ALTER TABLE jogos_new RENAME TO jogos;
        
        PRAGMA foreign_keys = ON;
      `);
      console.log('Migration completed successfully.');
    }

    console.log('Database SQLite3 initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

const getJogos = async () => {
  if (!dbInstance) await initDatabase();
  return dbInstance.all('SELECT * FROM jogos ORDER BY id DESC');
};

const addJogo = async (jogo) => {
  if (!dbInstance) await initDatabase();
  const result = await dbInstance.run(`
    INSERT INTO jogos (titulo, plataforma, status, nota_pessoal, tempo_jogo_minutos, percentual_conclusao, data_lancamento, capa_caminho)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    jogo.titulo,
    jogo.plataforma || null,
    jogo.status,
    jogo.nota_pessoal || 0,
    jogo.tempo_jogo_minutos || 0,
    jogo.percentual_conclusao || 0,
    jogo.data_lancamento || null,
    jogo.capa_caminho || null
  ]);
  return result.lastID;
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
    jogo.titulo,
    jogo.plataforma || null,
    jogo.status,
    jogo.nota_pessoal || 0,
    jogo.tempo_jogo_minutos || 0,
    jogo.percentual_conclusao || 0,
    jogo.data_lancamento || null,
    jogo.capa_caminho || null,
    id
  ]);
  return id;
};

const deleteJogo = async (id) => {
  if (!dbInstance) await initDatabase();
  await dbInstance.run('DELETE FROM jogos WHERE id = ?', id);
  return id;
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
  if (!dbInstance) throw new Error('Database not initialized');
  const jogos = await dbInstance.all('SELECT * FROM jogos');
  const eventos = await dbInstance.all('SELECT * FROM eventos');
  return { jogos, eventos };
};

const importData = async (data) => {
  if (!dbInstance) await initDatabase();
  if (!dbInstance) throw new Error('Database not initialized');
  
  if (!data || (!data.jogos && !data.eventos)) {
    throw new Error('Dados de backup inválidos ou vazios');
  }

  // Criar backup de segurança antes de sobrescrever
  const fs = require('fs');
  const backupPath = `${dbPath}.bak`;
  try {
    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, backupPath);
      console.log('Backup de segurança criado em:', backupPath);
    }
  } catch (err) {
    console.error('Falha ao criar backup de segurança pré-importação:', err);
    throw new Error('Falha de segurança ao tentar preparar a importação.');
  }

  await dbInstance.exec('BEGIN TRANSACTION');
  try {
    await dbInstance.run('DELETE FROM jogos');
    await dbInstance.run('DELETE FROM eventos');
    
    if (data.jogos && Array.isArray(data.jogos)) {
      for (const jogo of data.jogos) {
        await dbInstance.run(`
          INSERT INTO jogos (titulo, plataforma, status, nota_pessoal, tempo_jogo_minutos, percentual_conclusao, data_lancamento, capa_caminho)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          jogo.titulo, 
          jogo.plataforma || null, 
          jogo.status, 
          jogo.nota_pessoal || 0, 
          jogo.tempo_jogo_minutos || 0, 
          jogo.percentual_conclusao || 0, 
          jogo.data_lancamento || null, 
          jogo.capa_caminho || null
        ]);
      }
    }
    
    if (data.eventos && Array.isArray(data.eventos)) {
      for (const evento of data.eventos) {
        await dbInstance.run(`
          INSERT INTO eventos (titulo, data_evento, cor)
          VALUES (?, ?, ?)
        `, [
          evento.titulo, 
          evento.data_evento, 
          evento.cor || '#3b82f6'
        ]);
      }
    }
    
    await dbInstance.exec('COMMIT');
    
    // Remover backup se deu tudo certo (opcional, mas bom para limpar espaço)
    if (fs.existsSync(backupPath)) {
      fs.unlinkSync(backupPath);
    }
    return true;
  } catch (error) {
    await dbInstance.exec('ROLLBACK');
    console.error('Erro na transação de importação, revertendo banco de dados:', error);
    
    // Restaurar do backup em caso de falha catastrófica no banco
    try {
      if (fs.existsSync(backupPath)) {
        fs.copyFileSync(backupPath, dbPath);
        console.log('Banco de dados restaurado do backup com sucesso.');
      }
    } catch (restoreError) {
      console.error('ERRO FATAL: Falha ao restaurar banco de dados após erro na importação!', restoreError);
    }
    
    throw error;
  }
};

module.exports = {
  initDatabase,
  getJogos,
  addJogo,
  updateJogo,
  deleteJogo,
  getEventos,
  addEvento,
  deleteEvento,
  getAllData,
  importData
};
