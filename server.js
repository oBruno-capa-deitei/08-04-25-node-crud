// server.js
import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'senac@02',
    database: 'bruno'
});

// Rota principal para operações CRUD
app.post('/api/mysql', async (req, res) => {
    const { nome, login, senha, tipo } = req.body;
    try {
        switch (tipo) {
            case 'cadastro':
                var [rows, fields] = await pool.query(
                    "insert into `bruno`.`tbl_login` (`nome`, `login`, `senha`) values (?, ?, ?);",
                    [nome, login, senha]
                );
                if (rows.affectedRows > 0) {
                    res.json({ success: true, message: 'Usuário cadastrado com sucesso!' });
                } else {
                    throw new Error('Não foi possível cadastrar o usuário!');
                }
                break;
            case 'login':
                var [rows, fields] = await pool.query(
                    "select * from `bruno`.`tbl_login` where `nome` = ? and `login` = ? and `senha` = ?;",
                    [nome, login, senha]
                );
                if (rows.length == 1) {
                    res.json({ success: true, message: 'Usuário logado com sucesso' });
                } else {
                    throw new Error("Não foi possível logar o usuário!");
                }
                break;
            default:
                throw new Error("Não foi possível identificar o tipo!");
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Nova rota para buscar usuários
app.post('/api/buscar-usuario', async (req, res) => {
    const { campo, valor } = req.body;
    
    try {
        // Validar campo de busca
        const camposPermitidos = ['nome', 'login'];
        if (!camposPermitidos.includes(campo)) {
            throw new Error('Campo de busca inválido');
        }

        const [rows] = await pool.query(
            `SELECT nome, login FROM \`bruno\`.\`tbl_login\` WHERE \`${campo}\` LIKE ?`,
            [`%${valor}%`]
        );

        res.json({ 
            success: true, 
            usuarios: rows,
            message: rows.length > 0 ? 'Usuário(s) encontrado(s)' : 'Nenhum usuário encontrado'
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    }
});


// Nova rota para remover usuário
app.post('/api/remover-usuario', async (req, res) => {
    const { login } = req.body;
    
    try {
        if (!login) {
            throw new Error('Login não fornecido');
        }

        // Verificar se o usuário existe
        const [checkRows] = await pool.query(
            "SELECT * FROM `bruno`.`tbl_login` WHERE `login` = ?",
            [login]
        );

        if (checkRows.length === 0) {
            throw new Error('Usuário não encontrado');
        }

        // Remover o usuário
        const [result] = await pool.query(
            "DELETE FROM `bruno`.`tbl_login` WHERE `login` = ?",
            [login]
        );

        if (result.affectedRows > 0) {
            res.json({ 
                success: true, 
                message: 'Usuário removido com sucesso' 
            });
        } else {
            throw new Error('Nenhum usuário foi removido');
        }
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});