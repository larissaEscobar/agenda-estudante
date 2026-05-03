/**
 * js/main.js
 * Lógica principal da Agenda Estudantil.
 * Foco: Manipulação dinâmica do DOM, fluxo de navegação e UX do Calendário.
 */

/**
 * js/main.js
 * Versão Consolidada com Formatação de Data Brasileira
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

    // Atualiza o Cabeçalho com Padrão Brasileiro: "03 de Maio de 2026"
    spanAno.forEach(span => {
        if (diaSelecionado !== null && mesSelecionado !== null) {
            // Na tela de tarefa ou dia, o título principal já diz "Nova Tarefa" ou "Dia 03"
            // O subtítulo fica apenas com a data completa
            span.textContent = `${diaSelecionado.toString().padStart(2, '0')} de ${listaNomesMeses[mesSelecionado]} de ${anoAtual}`;
        } else if (mesSelecionado !== null) {
            // Na tela mensal, o título principal é o Nome do Mês. 
            // O subtítulo fica apenas com o ano para não repetir o mês
            span.textContent = anoAtual;
        } else {
            span.textContent = `Ano Letivo: ${anoAtual}`;
        }
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
        const nomeMesExibicao = document.getElementById('nome-mes');
        if (nomeMesExibicao) nomeMesExibicao.textContent = listaNomesMeses[mesSelecionado];

        const primeiroDiaSemana = new Date(anoAtual, mesSelecionado, 1).getDay();
        const diasNoMes = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        const totalDiasAtual = (mesSelecionado === 1 && (anoAtual % 4 === 0)) ? 29 : diasNoMes[mesSelecionado];
        const ultimoDiaMesAnterior = new Date(anoAtual, mesSelecionado, 0).getDate();

        containerDias.innerHTML = '';

        for (let j = primeiroDiaSemana - 1; j >= 0; j--) {
            const li = document.createElement('li');
            li.classList.add('dia-vazio');
            li.innerHTML = `<span>${ultimoDiaMesAnterior - j}</span>`;
            containerDias.appendChild(li);
        }

        for (let i = 1; i <= totalDiasAtual; i++) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `diario.html?mes=${mesSelecionado}&dia=${i}`;
            a.textContent = i;
            li.appendChild(a);
            containerDias.appendChild(li);
        }
    }

    // --- 4. LÓGICA DA TELA DIÁRIA (DIARIO.HTML) ---
    const containerHoras = document.getElementById('container-horas');
    const tituloDia = document.getElementById('titulo-dia');

    if (containerHoras && diaSelecionado !== null) {
        if (tituloDia) tituloDia.textContent = `Dia ${diaSelecionado.toString().padStart(2, '0')}`;

        const btnAdd = document.getElementById('link-adicionar');
        if (btnAdd) {
            btnAdd.href = `formulario.html?mes=${mesSelecionado}&dia=${diaSelecionado}`;
        }

        containerHoras.innerHTML = ''; 

        for (let h = 0; h <= 24; h++) {
            const divBloco = document.createElement('div');
            divBloco.classList.add('bloco-hora');
            
            const horaExibida = h === 24 ? "24:00" : `${h.toString().padStart(2, '0')}:00`;
            
            divBloco.innerHTML = `
                <span class="label-hora">${horaExibida}</span>
                <div class="conteudo-hora" id="hora-${h}"></div>
            `;
            containerHoras.appendChild(divBloco);
        }
    }

    // --- 5. LÓGICA DO FORMULÁRIO (FORMULARIO.HTML) ---
    const formTarefa = document.getElementById('form-tarefa');

    if (formTarefa) {
        formTarefa.addEventListener('submit', (e) => {
            e.preventDefault();
            // Pegando os valores para testar a captura
            const dados = {
                titulo: document.getElementById('titulo').value,
                local: document.getElementById('local').value,
                inicio: document.getElementById('hora-inicio').value,
                fim: document.getElementById('hora-fim').value,
                obs: document.getElementById('observacoes').value
            };
            
            console.log("Dados capturados:", dados);
            alert(`Tarefa "${dados.titulo}" capturada com sucesso!`);
            window.location.href = `diario.html?mes=${mesSelecionado}&dia=${diaSelecionado}`;
        });
    }
});