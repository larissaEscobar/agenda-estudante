/**
 * js/main.js
 * Lógica principal da Agenda Estudantil.
 * Foco: Manipulação dinâmica do DOM, fluxo de navegação e UX do Calendário.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. CONFIGURAÇÕES GERAIS E CAPTURA DE PARÂMETROS ---
    const params = new URLSearchParams(window.location.search);
    const mesSelecionado = params.get('mes') !== null ? parseInt(params.get('mes')) : null;
    const diaSelecionado = params.get('dia') !== null ? parseInt(params.get('dia')) : null;
    
    const spanAno = document.querySelectorAll('#ano-atual');
    const anoAtual = new Date().getFullYear();
    const listaNomesMeses = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    // Atualiza o Ano Letivo e inclui o Mês (Melhoria de UX solicitada)
    spanAno.forEach(span => {
        let textoExibicao = `Ano Letivo: ${anoAtual}`;
        if (mesSelecionado !== null) {
            textoExibicao += ` - ${listaNomesMeses[mesSelecionado]}`;
        }
        span.textContent = textoExibicao;
    });

    // --- 2. LÓGICA DA TELA INICIAL (INDEX.HTML) ---
    const containerMeses = document.getElementById('container-meses');
    const botoesSemestre = document.querySelectorAll('.btn-semestre');

    const mesesDados = {
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

    function renderizarMeses(lista) {
        if (!containerMeses) return;
        containerMeses.innerHTML = ''; 
        lista.forEach(m => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `mensal.html?mes=${m.valor}`;
            a.textContent = m.nome;
            li.appendChild(a);
            containerMeses.appendChild(li);
        });
    }

    if (botoesSemestre.length > 0) {
        botoesSemestre.forEach((botao, index) => {
            botao.addEventListener('click', () => {
                botoesSemestre.forEach(b => b.classList.remove('ativo'));
                botao.classList.add('ativo');
                index === 0 ? renderizarMeses(mesesDados.primeiro) : renderizarMeses(mesesDados.segundo);
            });
        });
        renderizarMeses(mesesDados.primeiro);
    }

    // --- 3. LÓGICA DA TELA MENSAL (MENSAL.HTML) ---
    const containerDias = document.getElementById('container-dias');

    if (containerDias && mesSelecionado !== null) {
        document.getElementById('nome-mes').textContent = listaNomesMeses[mesSelecionado];

        const primeiroDiaSemana = new Date(anoAtual, mesSelecionado, 1).getDay();
        const diasNoMes = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        const totalDiasAtual = diasNoMes[mesSelecionado];
        const ultimoDiaMesAnterior = new Date(anoAtual, mesSelecionado, 0).getDate();

        containerDias.innerHTML = '';

        // Dias do mês anterior
        for (let j = primeiroDiaSemana - 1; j >= 0; j--) {
            const li = document.createElement('li');
            li.classList.add('dia-vazio');
            li.innerHTML = `<span>${ultimoDiaMesAnterior - j}</span>`;
            containerDias.appendChild(li);
        }

        // Dias do mês atual
        for (let i = 1; i <= totalDiasAtual; i++) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `diario.html?mes=${mesSelecionado}&dia=${i}`;
            a.textContent = i;
            li.appendChild(a);
            containerDias.appendChild(li);
        }

        // Dias do próximo mês
        const restante = 42 - containerDias.children.length;
        for (let k = 1; k <= restante; k++) {
            const li = document.createElement('li');
            li.classList.add('dia-vazio');
            li.innerHTML = `<span>${k}</span>`;
            containerDias.appendChild(li);
        }
    }

    // --- 4. LÓGICA DA TELA DIÁRIA (DIARIO.HTML) ---
    const containerHoras = document.getElementById('container-horas');
    const tituloDia = document.getElementById('titulo-dia');

    if (containerHoras && diaSelecionado !== null) {
        tituloDia.textContent = `Dia ${diaSelecionado.toString().padStart(2, '0')}`;

        const btnAdd = document.getElementById('link-adicionar');
        if (btnAdd) {
            btnAdd.href = `formulario.html?mes=${mesSelecionado}&dia=${diaSelecionado}`;
        }

        containerHoras.innerHTML = ''; // Limpa para evitar duplicatas

        // Loop vai até 24 para mostrar o fechamento do dia (00:00 às 24:00)
        for (let h = 0; h <= 24; h++) {
            const divBloco = document.createElement('div');
            divBloco.classList.add('bloco-hora');
            
            // Formata a hora (se for 24, exibe 00:00 ou mantém 24:00 conforme preferir)
            const horaExibida = h === 24 ? "24:00" : `${h.toString().padStart(2, '0')}:00`;
            
            divBloco.innerHTML = `
                <span class="label-hora">${horaExibida}</span>
                <div class="conteudo-hora" id="hora-${h}"></div>
            `;
            containerHoras.appendChild(divBloco);
        }
    }
});