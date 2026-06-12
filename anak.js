document.addEventListener("DOMContentLoaded", function() {
    let storyAtual = 1;
    const totalStories = 5; // Atualizado para 5 stories
    let musicaIniciada = false;
    let jogoConcluido = false;

    // Configuração das fotos do jogo (4 fotos que duplicadas viram 8 cartas)
    const fotosCasal = ['ana02.jpeg', 'ana03.jpeg', 'ana04.jpeg', 'ana05.jpeg'];
    let cartasDuplicadas = [...fotosCasal, ...fotosCasal];
    let primeiraCarta = null, segundaCarta = null;
    let jogoBloqueado = false, paresEncontrados = 0;

    // Função para dar o play na música após o primeiro clique na tela
    function tocarMusica() {
        const musica = document.getElementById('musica-wrapped');
        if (musica && !musicaIniciada) {
            musica.play()
                .then(() => { musicaIniciada = true; })
                .catch(e => console.log("Áudio aguardando clique físico do usuário."));
        }
    }

    // Captura o clique no container principal para passar os stories
    const container = document.querySelector('.wrapped-container');
    if (container) {
        container.addEventListener('click', function(event) {
            // Se estiver na tela inicial, qualquer clique (inclusive no botão) liga a música
            if (storyAtual === 1) {
                tocarMusica();
            }
            
            // Se estiver no último story (jogo - Story 5) e o jogo não acabou, trava o clique na tela
            if (storyAtual === 5 && !jogoConcluido) {
                return; 
            }
            
            // Avança o story
            proximoStory();
        });
    }

    // Função que avança para o próximo slide
    function proximoStory() {
        if (storyAtual < totalStories) {
            const storyAntigo = document.getElementById(`story-${storyAtual}`);
            if (storyAntigo) storyAntigo.classList.remove('ativo');
            
            const barras = document.querySelectorAll('.preenchimento');
            if (barras[storyAtual - 1]) barras[storyAtual - 1].style.width = '100%';

            storyAtual++;
            
            const novoStory = document.getElementById(`story-${storyAtual}`);
            if (novoStory) novoStory.classList.add('ativo');

            // Inicia o jogo automaticamente no story 5
            if (storyAtual === 5 && !jogoConcluido) {
                iniciarJogo();
            }
        } else {
            resetarStories();
        }
    }

    // Inicialização do Jogo da Memória
    function iniciarJogo() {
        const tab = document.getElementById('tabuleiro-jogo');
        if (!tab) return;
        
        tab.style.display = 'grid';
        
        const tit = document.getElementById('titulo-jogo');
        if (tit) tit.style.display = 'block';
        
        const vit = document.getElementById('tela-vitoria');
        if (vit) vit.style.display = 'none';
        
        tab.innerHTML = '';
        paresEncontrados = 0;
        [primeiraCarta, segundaCarta, jogoBloqueado] = [null, null, false];
        
        cartasDuplicadas.sort(() => Math.random() - 0.5);
        
        cartasDuplicadas.forEach(foto => {
            const card = document.createElement('div');
            card.classList.add('memory-card');
            card.dataset.foto = foto;
            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-front">❤️</div>
                    <div class="card-back">
                        <img src="${foto}" alt="Memória" onerror="this.style.display='none'; this.parentNode.innerHTML='🖼️❌';">
                    </div>
                </div>
            `;
            
            card.addEventListener('click', function(e) {
                e.stopPropagation(); // Impede o clique na carta de resetar o story
                virarCarta(card);
            });
            tab.appendChild(card);
        });
    }

    // Lógica para virar as cartas
    function virarCarta(card) {
        if (jogoBloqueado || card.classList.contains('virada') || card === primeiraCarta) return;

        card.classList.add('virada');

        if (!primeiraCarta) {
            primeiraCarta = card;
            return;
        }

        segundaCarta = card;
        jogoBloqueado = true;
        
        if (primeiraCarta.dataset.foto === segundaCarta.dataset.foto) {
            paresEncontrados++;
            [primeiraCarta, segundaCarta] = [null, null];
            jogoBloqueado = false;
            
            if (paresEncontrados === fotosCasal.length) {
                setTimeout(finalizarJogo, 500);
            }
        } else {
            setTimeout(() => {
                primeiraCarta.classList.remove('virada');
                segundaCarta.classList.remove('virada');
                [primeiraCarta, segundaCarta] = [null, null];
                jogoBloqueado = false;
            }, 800);
        }
    }

    // Efeito de vitória com flores
    function explodirTulipas() {
        const chuvaContainer = document.createElement('div');
        chuvaContainer.style.position = 'fixed';
        chuvaContainer.style.top = '0';
        chuvaContainer.style.left = '0';
        chuvaContainer.style.width = '100vw';
        chuvaContainer.style.height = '100vh';
        chuvaContainer.style.pointerEvents = 'none';
        chuvaContainer.style.zIndex = '99999';
        document.body.appendChild(chuvaContainer);

        for (let i = 0; i < 50; i++) {
            const tulipa = document.createElement('div');
            tulipa.classList.add('tulipa-particula');
            tulipa.innerText = Math.random() > 0.5 ? '🌷' : '🌹';
            tulipa.style.left = Math.random() * 100 + 'vw';
            tulipa.style.top = '100vh';
            tulipa.style.fontSize = Math.random() * 25 + 15 + 'px';
            tulipa.style.animationDelay = Math.random() * 0.5 + 's';
            tulipa.style.setProperty('--trajetoria-x', (Math.random() * 400 - 200) + 'px');
            
            chuvaContainer.appendChild(tulipa);
        }
        
        setTimeout(() => chuvaContainer.remove(), 3000);
    }

    // Finaliza o jogo e mostra contadores
    function finalizarJogo() {
        jogoConcluido = true;
        const tab = document.getElementById('tabuleiro-jogo');
        const tit = document.getElementById('titulo-jogo');
        const vit = document.getElementById('tela-vitoria');
        
        if (tab) tab.style.display = 'none';
        if (tit) tit.style.display = 'none';
        if (vit) vit.style.display = 'block';
        
        explodirTulipas();
        animarContadores();
    }

    // Animação crescente dos números
    function animarContadores() {
        const contadores = document.querySelectorAll('.contador');
        contadores.forEach(contador => {
            contador.innerText = '0';
            const alvo = +contador.getAttribute('data-target');
            const velocidade = alvo / 30;

            const atualizarContagem = () => {
                const valorAtual = +contador.innerText.replace(/\./g, '');
                if (valorAtual < alvo) {
                    const realProximo = valorAtual + velocidade;
                    const finalNum = Math.ceil(realProximo);
                    contador.innerText = (finalNum >= alvo ? alvo : finalNum).toLocaleString('pt-BR');
                    if (finalNum < alvo) setTimeout(atualizarContagem, 25);
                }
            };
            atualizarContagem();
        });
    }

    // Reseta o fluxo
    function resetarStories() {
        const barras = document.querySelectorAll('.preenchimento');
        barras.forEach(b => b.style.width = '0%');
        const storyVelho = document.getElementById(`story-${storyAtual}`);
        if (storyVelho) storyVelho.classList.remove('ativo');
        storyAtual = 1;
        jogoConcluido = false;
        const storyNovo = document.getElementById(`story-${storyAtual}`);
        if (storyNovo) storyNovo.classList.add('ativo');
    }
});