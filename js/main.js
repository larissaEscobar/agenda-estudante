/**
 * js/main.js
 * Lógica principal da Agenda Estudantil.
 * Foco: Manipulação dinâmica do DOM, fluxo de navegação e UX do Calendário.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. CONFIGURAÇÕES GERAIS E DATA ---
    // Seleciona todos os elementos que exibem o ano letivo para atualização automática
    const spanAno = document.querySelectorAll('#ano-atual');
    const anoAtual = new Date().getFullYear();

    spanAno.forEach(span => {
        span.textContent = `Ano Letivo: ${anoAtual}`;
    });

    // --- 2. LÓGICA DA TELA INICIAL (INDEX.HTML) ---
    const containerMeses = document.getElementById('container-meses');
    const botoesSemestre = document.querySelectorAll('.btn-semestre');

    // Estrutura de dados para os meses do semestre (Fase 1, item 5)
    const meses = {
        primeiro: [
            { nome: 'Janeiro', valor: 0 }, { nome: 'Fevereiro', valor: 1 },
            { nome: 'Março', valor: 2 }, { nome: 'Abril', valor: 3 },
            { nome: 'Maio', valor: 4 }, { nome: 'Junho', valor: 5 }
        ],
        segundo: [
            { nome: 'Julho', valor: 6 }, { nome: 'Agosto', valor: 7 },
            { nome: 'Setembro', valor: 8 }, { nome: 'Outubro', valor: 9 },
            { nome: 'Novembro', valor: 10 }, { nome: 'Dezembro', valor: 11 }
        ]
    };

    /**
     * Renderiza a grade de meses na tela inicial (Fase 1, item 9 e 10)
     */
    function renderizarMeses(lista) {
        if (!containerMeses) return;
        
        containerMeses.innerHTML = ''; 
        lista.forEach(mes => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `mensal.html?mes=${mes.valor}`;
            a.textContent = mes.nome;
            li.appendChild(a);
            containerMeses.appendChild(li);
        });
    }

    // Gerencia a troca de semestres via botões (Eventos)
    botoesSemestre.forEach((botao, index) => {
        botao.addEventListener('click', () => {
            botoesSemestre.forEach(b => b.classList.remove('ativo'));
            botao.classList.add('ativo');
            index === 0 ? renderizarMeses(meses.primeiro) : renderizarMeses(meses.segundo);
        });
    });

    // Inicialização da tela inicial
    if (containerMeses) renderizarMeses(meses.primeiro);


    // --- 3. LÓGICA DA TELA MENSAL (MENSAL.HTML) ---
    const containerDias = document.getElementById('container-dias');
    const params = new URLSearchParams(window.location.search);
    const mesSelecionado = parseInt(params.get('mes'));

    if (containerDias && !isNaN(mesSelecionado)) {
        
        const listaNomesMeses = [
            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ];
        const diasNoMes = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        // Atualiza o nome do mês no cabeçalho (Fase 1, item 6)
        document.getElementById('nome-mes').textContent = listaNomesMeses[mesSelecionado];

        // CÁLCULO PARA ALINHAMENTO DA GRADE (UX Avançada)
        const primeiroDiaSemana = new Date(anoAtual, mesSelecionado, 1).getDay();
        const totalDiasAtual = diasNoMes[mesSelecionado];
        const ultimoDiaMesAnterior = new Date(anoAtual, mesSelecionado, 0).getDate();

        containerDias.innerHTML = '';

        // PASSO A: Preencher com dias do mês anterior (Inativos/Fantasmas)
        // Melhora a visualização sem permitir a seleção (UX)[cite: 1]
        for (let j = primeiroDiaSemana - 1; j >= 0; j--) {
            const li = document.createElement('li');
            li.classList.add('dia-vazio'); // Classe para transparência no CSS
            const span = document.createElement('span');
            span.textContent = ultimoDiaMesAnterior - j;
            li.appendChild(span);
            containerDias.appendChild(li);
        }

        // PASSO B: Gerar dias do mês atual (Ativos)
        // Cada dia é um link para a visualização diária (Fase 1, item 7)[cite: 1]
        for (let i = 1; i <= totalDiasAtual; i++) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `diario.html?mes=${mesSelecionado}&dia=${i}`;
            a.textContent = i;
            li.appendChild(a);
            containerDias.appendChild(li);
        }

        // PASSO C: Preencher com dias do próximo mês até completar a grade (42 espaços)
        // Garante que o layout de 320px fique sempre simétrico[cite: 1]
        const preenchidos = containerDias.children.length;
        const restante = 42 - preenchidos;

        for (let k = 1; k <= restante; k++) {
            const li = document.createElement('li');
            li.classList.add('dia-vazio');
            const span = document.createElement('span');
            span.textContent = k;
            li.appendChild(span);
            containerDias.appendChild(li);
        }
    }
});