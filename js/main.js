// js/main.js

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. CONFIGURAÇÕES E PARÂMETROS COM FALLBACK ---
    // Esta parte garante que, se abrir o arquivo direto, o sistema use a data de hoje.
    const params = new URLSearchParams(window.location.search);
    const dataHoje = new Date();

    let mesIdx = params.get('mes') !== null ? parseInt(params.get('mes')) : dataHoje.getMonth();
    let diaNum = params.get('dia') !== null ? parseInt(params.get('dia')) : dataHoje.getDate();
    const editId = params.get('editId'); 
    
    const spanAno = document.querySelectorAll('#ano-atual');
    const anoAtual = dataHoje.getFullYear();
    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const h1Principal = document.querySelector('header h1');

    // --- 2. CABEÇALHO DINÂMICO (AJUSTA TÍTULOS E SUBTÍTULOS) ---
    spanAno.forEach(span => {
        if (document.getElementById('container-horas') || document.getElementById('titulo-dia')) {
            // Tela de Diário
            if (h1Principal) h1Principal.textContent = `Dia ${diaNum.toString().padStart(2, '0')}`;
            span.textContent = `${meses[mesIdx]} de ${anoAtual}`;
        } 
        else if (document.getElementById('container-dias')) {
            // Tela Mensal
            if (h1Principal) h1Principal.textContent = meses[mesIdx];
            span.textContent = anoAtual;
        } 
        else if (document.getElementById('form-tarefa')) {
            // Tela de Formulário
            if (h1Principal && !editId) h1Principal.textContent = "Nova Tarefa";
            if (h1Principal && editId) h1Principal.textContent = "Editar Tarefa";
            span.textContent = `${diaNum.toString().padStart(2, '0')} de ${meses[mesIdx]}`;
        }
        else {
            // Tela Inicial (Index)
            if (h1Principal) h1Principal.textContent = "Agenda Estudantil";
            span.textContent = `Ano Letivo: ${anoAtual}`;
        }
    });

    // --- 3. TELA INICIAL (LÓGICA DE SEMESTRES) ---
    const containerMeses = document.getElementById('container-meses');
    if (containerMeses) {
        const btn1 = document.getElementById('btn-1sem');
        const btn2 = document.getElementById('btn-2sem');
        const semestres = [[0,1,2,3,4,5], [6,7,8,9,10,11]];

        const renderMeses = (indices) => {
            containerMeses.innerHTML = '';
            indices.forEach(i => {
                const li = document.createElement('li');
                li.innerHTML = `<a href="mensal.html?mes=${i}">${meses[i]}</a>`;
                containerMeses.appendChild(li);
            });
        };

        if(btn1) btn1.onclick = () => { btn1.classList.add('ativo'); btn2.classList.remove('ativo'); renderMeses(semestres[0]); };
        if(btn2) btn2.onclick = () => { btn2.classList.add('ativo'); btn1.classList.remove('ativo'); renderMeses(semestres[1]); };
        
        // Abre no semestre correspondente ao mês atual
        if (mesIdx > 5) {
            if(btn2) btn2.click();
        } else {
            if(btn1) btn1.click();
        }
    }

    // --- 4. CALENDÁRIO MENSAL (GERAÇÃO DOS DIAS) ---
    const containerDias = document.getElementById('container-dias');
    if (containerDias) {
        const primeiroDiaSemana = new Date(anoAtual, mesIdx, 1).getDay();
        const diasNoMes = new Date(anoAtual, mesIdx + 1, 0).getDate();
        const ultimoDiaMesAnterior = new Date(anoAtual, mesIdx, 0).getDate();
        const tarefas = buscarTodasTarefas();

        containerDias.innerHTML = '';

        // Dias do mês anterior (cinza)
        for (let j = primeiroDiaSemana - 1; j >= 0; j--) {
            const li = document.createElement('li');
            li.classList.add('dia-vazio');
            li.textContent = ultimoDiaMesAnterior - j;
            containerDias.appendChild(li);
        }

        // Dias do mês atual
        for (let i = 1; i <= diasNoMes; i++) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `diario.html?mes=${mesIdx}&dia=${i}`;
            a.textContent = i;
            if (tarefas.some(t => t.dia === i && t.mes === mesIdx)) li.classList.add('dia-com-tarefa');
            li.appendChild(a);
            containerDias.appendChild(li);
        }

        // Completa o grid (dias do próximo mês)
        const totalAteAgora = containerDias.children.length;
        const diasRestantes = (totalAteAgora > 35 ? 42 : 35) - totalAteAgora;
        for (let k = 1; k <= diasRestantes; k++) {
            const li = document.createElement('li');
            li.classList.add('dia-vazio');
            li.textContent = k;
            containerDias.appendChild(li);
        }
    }

    // --- 5. TIMELINE DIÁRIA (POSICIONAMENTO DOS CARDS) ---
    const containerHoras = document.getElementById('container-horas');
    if (containerHoras) {
        const ALTURA_HORA = 100; 
        const fatorEscala = ALTURA_HORA / 60;

        // Ajusta links de navegação
        const btnVoltar = document.getElementById('btn-voltar-mes');
        if (btnVoltar) btnVoltar.href = `mensal.html?mes=${mesIdx}`;

        const linkAdd = document.getElementById('link-adicionar');
        if (linkAdd) linkAdd.href = `formulario.html?mes=${mesIdx}&dia=${diaNum}`;

        containerHoras.innerHTML = '';
        const timelineContent = document.createElement('div');
        timelineContent.style.position = 'relative';
        timelineContent.style.width = '100%';
        timelineContent.style.height = `${24 * ALTURA_HORA}px`;

        // Gera as 24 linhas de horas
        for (let h = 0; h < 24; h++) {
            const div = document.createElement('div');
            div.classList.add('bloco-hora');
            div.style.height = `${ALTURA_HORA}px`; 
            div.innerHTML = `<span class="label-hora">${h.toString().padStart(2, '0')}:00</span>`;
            timelineContent.appendChild(div);
        }

        // Filtra e posiciona tarefas do dia
        const tarefasDoDia = buscarTodasTarefas().filter(t => t.dia === diaNum && t.mes === mesIdx);
        tarefasDoDia.forEach(t => {
            const [hIni, mIni] = t.inicio.split(':').map(Number);
            const [hFim, mFim] = t.fim.split(':').map(Number);
            
            const topo = ((hIni * 60) + mIni) * fatorEscala;
            const altura = (((hFim * 60) + mFim) * fatorEscala) - topo;

            const divT = document.createElement('div');
            divT.classList.add('tarefa-card');
            divT.style.top = `${topo + 2}px`;
            divT.style.height = `${Math.max(altura - 4, 70)}px`; // Espaço para texto e ícones

            divT.innerHTML = `
                <div class="info-tarefa">
                    <strong>${t.titulo}</strong>
                    <small>${t.inicio} - ${t.fim}</small>
                </div>
                <div class="acoes-tarefa">
                    <span class="btn-acao" onclick="editarTarefa(${t.id})">✏️</span>
                    <span class="btn-acao" onclick="excluirTarefa(${t.id})">🗑️</span>
                </div>
            `;
            timelineContent.appendChild(divT);
        });

        containerHoras.appendChild(timelineContent);
    }

    // --- 6. FORMULÁRIO (SALVAR / EDITAR) ---
    const form = document.getElementById('form-tarefa');
    if (form) {
        // Ajusta botão cancelar
        const btnCancelar = document.getElementById('btn-cancelar');
        if (btnCancelar) btnCancelar.href = `diario.html?mes=${mesIdx}&dia=${diaNum}`;

        const tarefas = buscarTodasTarefas();
        
        // Se for edição, preenche o formulário
        if (editId) {
            const tarefaParaEditar = tarefas.find(t => t.id == editId);
            if (tarefaParaEditar) {
                document.getElementById('titulo').value = tarefaParaEditar.titulo;
                document.getElementById('local').value = tarefaParaEditar.local;
                document.getElementById('hora-inicio').value = tarefaParaEditar.inicio;
                document.getElementById('hora-fim').value = tarefaParaEditar.fim;
                document.getElementById('observacoes').value = tarefaParaEditar.obs;
                document.querySelector('.btn-salvar').textContent = "Atualizar Tarefa";
            }
        }

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const hInicioNova = document.getElementById('hora-inicio').value;
            const hFimNova = document.getElementById('hora-fim').value;

            const paraMinutos = (hor) => hor.split(':').reduce((h, m) => h * 60 + +m);

            if (paraMinutos(hFimNova) <= paraMinutos(hInicioNova)) {
                alert("O horário de término deve ser posterior ao início.");
                return;
            }

            const dadosTarefa = {
                id: editId ? parseInt(editId) : Date.now(),
                mes: mesIdx, 
                dia: diaNum,
                titulo: document.getElementById('titulo').value,
                local: document.getElementById('local').value,
                inicio: hInicioNova,
                fim: hFimNova,
                obs: document.getElementById('observacoes').value
            };

            let todas = buscarTodasTarefas();
            if (editId) {
                const index = todas.findIndex(t => t.id == editId);
                todas[index] = dadosTarefa;
            } else {
                todas.push(dadosTarefa);
            }

            localStorage.setItem('minha_agenda_tarefas', JSON.stringify(todas));
            window.location.href = `diario.html?mes=${mesIdx}&dia=${diaNum}`;
        });
    }

    // --- 7. FUNÇÕES GLOBAIS ---
    window.excluirTarefa = (id) => {
        if (confirm("Deseja realmente apagar esta atividade?")) {
            let tarefas = buscarTodasTarefas();
            tarefas = tarefas.filter(t => t.id !== id);
            localStorage.setItem('minha_agenda_tarefas', JSON.stringify(tarefas));
            location.reload();
        }
    };

    window.editarTarefa = (id) => {
        window.location.href = `formulario.html?mes=${mesIdx}&dia=${diaNum}&editId=${id}`;
    };

    function buscarTodasTarefas() {
        const d = localStorage.getItem('minha_agenda_tarefas');
        return d ? JSON.parse(d) : [];
    }
});