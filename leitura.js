// leitura.js - Script para consultar cadastros existentes

const fs = require('fs');
const path = require('path');

// Configurações
const ARQUIVO_CADASTROS = path.join(__dirname, 'cadastros.json');

// Função para carregar os cadastros
function carregarCadastros() {
    try {
        if (!fs.existsSync(ARQUIVO_CADASTROS)) {
            fs.writeFileSync(ARQUIVO_CADASTROS, '[]', 'utf-8');
            return [];
        }
        
        const dados = fs.readFileSync(ARQUIVO_CADASTROS, 'utf-8');
        return JSON.parse(dados);
    } catch (erro) {
        console.error('Erro ao carregar cadastros:', erro.message);
        return [];
    }
}

// Função para listar todos os cadastros
function listarTodos() {
    const cadastros = carregarCadastros();
    
    console.log('\n=== TODOS OS CADASTRADOS ===');
    if (cadastros.length === 0) {
        console.log('Nenhum cadastro encontrado.');
    } else {
        cadastros.forEach((cadastro, index) => {
            console.log(`\nCadastro #${index + 1}`);
            exibirCadastro(cadastro);
        });
    }
    console.log('===========================\n');
}

// Função para exibir um cadastro individual
function exibirCadastro(cadastro) {
    for (const [chave, valor] of Object.entries(cadastro)) {
        console.log(`${chave}: ${valor}`);
    }
}

// Função para buscar cadastro por campo específico
function buscarPorCampo(campo, valor) {
    const cadastros = carregarCadastros();
    const resultados = cadastros.filter(cadastro => 
        String(cadastro[campo]).toLowerCase().includes(String(valor).toLowerCase())
    );
    
    console.log(`\n=== RESULTADOS PARA ${campo}: "${valor}" ===`);
    if (resultados.length === 0) {
        console.log('Nenhum cadastro encontrado com esses critérios.');
    } else {
        resultados.forEach((cadastro, index) => {
            console.log(`\nResultado #${index + 1}`);
            exibirCadastro(cadastro);
        });
    }
    console.log('===========================\n');
}

// Função principal
function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        // Se não houver argumentos, lista todos
        listarTodos();
    } else if (args.length === 2) {
        // Se houver dois argumentos, assume que é campo e valor para busca
        const [campo, valor] = args;
        buscarPorCampo(campo, valor);
    } else {
        console.log('Uso:');
        console.log('node leitura.js - lista todos os cadastros');
        console.log('node leitura.js [campo] [valor] - busca por campo específico');
        console.log('\nExemplo:');
        console.log('node leitura.js nome João');
        console.log('node leitura.js email exemplo@dominio.com');
    }
}

// Executa o script
main();