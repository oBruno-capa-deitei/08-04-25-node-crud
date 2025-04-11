document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const nomeInput = document.getElementById('txtNome');
    const loginInput = document.getElementById('txtLogin');
    const senhaInput = document.getElementById('txtSenha');
    const btnAtualizar = document.querySelector('button[type="submit"]');
    let usuarioAtual = null;

    // Função para verificar se a resposta é JSON
    async function parseJsonResponse(response) {
        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch (e) {
            console.error('Resposta não é JSON:', text);
            throw new Error('Resposta do servidor não é válida');
        }
    }

    // Buscar usuário ao digitar o nome
    nomeInput.addEventListener('input', async function() {
        const nome = this.value.trim();
        
        if (nome.length >= 2) { // Buscar com 2+ caracteres
            try {
                btnAtualizar.disabled = true;
                btnAtualizar.textContent = 'Buscando...';
                
                const response = await fetch('/api/buscar-usuario', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        campo: 'nome',
                        valor: nome
                    })
                });

                const data = await parseJsonResponse(response);
                
                if (data.success && data.usuarios && data.usuarios.length > 0) {
                    // Pega o primeiro usuário encontrado
                    usuarioAtual = data.usuarios[0];
                    loginInput.value = usuarioAtual.login || '';
                    senhaInput.value = usuarioAtual.senha || '';
                } else {
                    limparCampos();
                    showAlert(data.message || 'Usuário não encontrado!', 'warning');
                }
            } catch (error) {
                console.error('Erro na busca:', error);
                limparCampos();
                showAlert('Erro ao buscar usuário: ' + error.message, 'danger');
            } finally {
                btnAtualizar.disabled = false;
                btnAtualizar.textContent = 'Atualizar';
            }
        } else {
            limparCampos();
        }
    });

    // Enviar atualização
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!usuarioAtual) {
            showAlert('Por favor, busque um usuário válido primeiro', 'warning');
            return;
        }

        const dadosAtualizados = {
            nome_original: usuarioAtual.nome,
            login: loginInput.value.trim(),
            senha: senhaInput.value.trim()
        };

        try {
            btnAtualizar.disabled = true;
            btnAtualizar.textContent = 'Atualizando...';
            
            const response = await fetch('/api/atualizar-usuario', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadosAtualizados)
            });

            const data = await parseJsonResponse(response);
            
            if (data.success) {
                showAlert('Usuário atualizado com sucesso!', 'success');
                usuarioAtual = { ...usuarioAtual, ...dadosAtualizados };
            } else {
                throw new Error(data.message || 'Erro na atualização');
            }
        } catch (error) {
            console.error('Erro na atualização:', error);
            showAlert('Erro ao atualizar usuário: ' + error.message, 'danger');
        } finally {
            btnAtualizar.disabled = false;
            btnAtualizar.textContent = 'Atualizar';
        }
    });

    function limparCampos() {
        usuarioAtual = null;
        loginInput.value = '';
        senhaInput.value = '';
    }

    function showAlert(message, type) {
        const oldAlert = document.querySelector('.alert');
        if (oldAlert) oldAlert.remove();

        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} mt-3`;
        alertDiv.textContent = message;
        
        form.parentNode.insertBefore(alertDiv, form.nextSibling);
        
        setTimeout(() => alertDiv.remove(), 5000);
    }
});