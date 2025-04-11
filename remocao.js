document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formRemocao');
    const campoBusca = document.getElementById('campoBusca');
    const valorBusca = document.getElementById('valorBusca');
    const dadosUsuario = document.getElementById('dadosUsuario');
    const btnRemover = document.getElementById('btnRemover');
    const mensagem = document.getElementById('mensagem');
    const confirmacaoModal = new bootstrap.Modal(document.getElementById('confirmacaoModal'));
    
    // Elementos de exibição dos dados
    const infoNome = document.getElementById('infoNome');
    const infoLogin = document.getElementById('infoLogin');
    
    // Evento de busca
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        buscarUsuario();
    });
    
    // Evento de confirmação de remoção
    document.getElementById('btnConfirmarRemocao').addEventListener('click', function() {
        removerUsuario();
        confirmacaoModal.hide();
    });
    
    async function buscarUsuario() {
        const campo = campoBusca.value;
        const valor = valorBusca.value.trim();
        
        if (!valor) {
            mostrarMensagem('Por favor, insira um valor para busca.', 'danger');
            return;
        }
        
        try {
            const response = await fetch('/buscar-usuario', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ campo, valor })
            });
            
            const data = await response.json();
            
            if (data.success) {
                if (data.usuario) {
                    // Preencher os dados do usuário
                    infoNome.textContent = data.usuario.nome || 'N/A';
                    infoLogin.textContent = data.usuario.login || 'N/A';
                    
                    // Mostrar os dados e habilitar o botão de remoção
                    dadosUsuario.classList.remove('d-none');
                    btnRemover.disabled = false;
                    mostrarMensagem('Usuário encontrado. Verifique os dados antes de remover.', 'success');
                } else {
                    dadosUsuario.classList.add('d-none');
                    btnRemover.disabled = true;
                    mostrarMensagem('Nenhum usuário encontrado com esses critérios.', 'warning');
                }
            } else {
                throw new Error(data.message || 'Erro ao buscar usuário');
            }
        } catch (error) {
            console.error('Erro:', error);
            mostrarMensagem('Erro ao buscar usuário: ' + error.message, 'danger');
        }
    }
    
    function mostrarMensagem(texto, tipo) {
        mensagem.innerHTML = `<div class="alert alert-${tipo}">${texto}</div>`;
    }
    
    function removerUsuario() {
        const loginUsuario = infoLogin.textContent;
        
        if (loginUsuario === 'N/A') {
            mostrarMensagem('Login do usuário inválido.', 'danger');
            return;
        }
        
        fetch('/remover-usuario', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ login: loginUsuario })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarMensagem('Usuário removido com sucesso!', 'success');
                // Limpar o formulário
                form.reset();
                dadosUsuario.classList.add('d-none');
                btnRemover.disabled = true;
            } else {
                throw new Error(data.message || 'Erro ao remover usuário');
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            mostrarMensagem('Erro ao remover usuário: ' + error.message, 'danger');
        });
    }
    
    // Mostrar modal de confirmação ao clicar em remover
    btnRemover.addEventListener('click', function(e) {
        e.preventDefault();
        confirmacaoModal.show();
    });
});