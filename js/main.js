document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. CONFIGURAÇÕES E PARÂMETROS ---
    const params = new URLSearchParams(window.location.search);
    const mesIdx = params.get('mes') !== null ? parseInt(params.get('mes')) : null;
    const diaNum = params.get('dia') !== null ? parseInt(params.get('dia')) : null;
    const editId = params.get('editId'); // Parâmetro para edição
    
    const spanAno = document.querySelectorAll('#ano-atual');
    const anoAtual = new Date().getFullYear();
    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const h1Principal = document.querySelector('header h1');

    // --- 2. CABEÇALHO ---
    spanAno.forEach(span => {
        if (diaNum && mesIdx !== null) {
            if (h1Principal) h1Principal.textContent = `Dia ${diaNum.toString().padStart(2, '0')}`;
            span.textContent = `${meses[mesIdx]} de ${anoAtual}`;
        } else if (mesIdx !== null) {
            if (h1Principal) h1Principal.textContent = meses[mesIdx];
            span.textContent = anoAtual;
        } else {
            if (h1Principal) h1Principal.textContent = "Agenda Estudantil";
            span.textContent = `Ano Letivo: ${anoAtual}`;
        }
    });

    // --- 3. TELA INICIAL (SEMESTRES) ---
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
        renderMeses(semestres[0]);
    }

    // --- 4. CALENDÁRIO MENSAL (DIAS VIZINHOS) ---
    const containerDias = document.getElementById('container-dias');
    if (containerDias && mesIdx !== null) {
        const primeiroDiaSemana = new Date(anoAtual, mesIdx, 1).getDay();
        const diasNoMes = new Date(anoAtual, mesIdx + 1, 0).getDate();
        const ultimoDiaMesAnterior = new Date(anoAtual, mesIdx, 0).getDate();
        const tarefas = buscarTodasTarefas();

        containerDias.innerHTML = '';

        for (let j = primeiroDiaSemana - 1; j >= 0; j--) {
            const li = document.createElement('li');
            li.classList.add('dia-vazio');
            li.textContent = ultimoDiaMesAnterior - j;
            containerDias.appendChild(li);
        }

        for (let i = 1; i <= diasNoMes; i++) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `diario.html?mes=${mesIdx}&dia=${i}`;
            a.textContent = i;
            if (tarefas.some(t => t.dia === i && t.mes === mesIdx)) li.classList.add('dia-com-tarefa');
            li.appendChild(a);
            containerDias.appendChild(li);
        }

        const totalAteAgora = containerDias.children.length;
        const diasRestantes = (totalAteAgora > 35 ? 42 : 35) - totalAteAgora;
        for (let k = 1; k <= diasRestantes; k++) {
            const li = document.createElement('li');
            li.classList.add('dia-vazio');
            li.textContent = k;
            containerDias.appendChild(li);
        }
    }

    // --- 5. TIMELINE DIÁRIA (COM EDIÇÃO E EXCLUSÃO) ---
    const containerHoras = document.getElementById('container-horas');
    if (containerHoras && diaNum) {
        const btnVoltar = document.getElementById('btn-voltar-mes');
        if (btnVoltar) btnVoltar.href = `mensal.html?mes=${mesIdx}`;

        const linkAdd = document.getElementById('link-adicionar');
        if (linkAdd) linkAdd.href = `formulario.html?mes=${mesIdx}&dia=${diaNum}`;

        containerHoras.innerHTML = '';
        const timelineContent = document.createElement('div');
        timelineContent.style.position = 'relative';
        timelineContent.style.width = '100%';
        timelineContent.style.height = `${24 * 60}px`;

        for (let h = 0; h < 24; h++) {
            const div = document.createElement('div');
            div.classList.add('bloco-hora');
            div.style.height = '60px';
            div.innerHTML = `<span class="label-hora">${h.toString().padStart(2, '0')}:00</span>`;
            timelineContent.appendChild(div);
        }

        const tarefasDoDia = buscarTodasTarefas().filter(t => t.dia === diaNum && t.mes === mesIdx);
        tarefasDoDia.forEach(t => {
            const [hIni, mIni] = t.inicio.split(':').map(Number);
            const [hFim, mFim] = t.fim.split(':').map(Number);
            const topo = (hIni * 60) + mIni;
            const altura = ((hFim * 60) + mFim) - topo;

            const divT = document.createElement('div');
            divT.classList.add('tarefa-card');
            divT.style.position = 'absolute';
            divT.style.top = `${topo}px`;
            divT.style.height = `${Math.max(altura, 35)}px`;

            divT.innerHTML = `
                <div class="acoes-tarefa">
                    <span class="btn-acao" onclick="editarTarefa(${t.id})">✏️</span>
                    <span class="btn-acao" onclick="excluirTarefa(${t.id})">🗑️</span>
                </div>
                <strong>${t.titulo}</strong>
                <small>${t.inicio} - ${t.fim}</small>
            `;
            timelineContent.appendChild(divT);
        });

        containerHoras.appendChild(timelineContent);
        containerHoras.style.maxHeight = '400px'; 
        containerHoras.style.overflowY = 'auto';
    }

    // --- 6. FORMULÁRIO (SALVAR / ATUALIZAR COM VALIDAÇÃO DE CONFLITO) ---
    const form = document.getElementById('form-tarefa');
    
    if (form && editId) {
        const tarefas = buscarTodasTarefas();
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

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const hInicioNova = document.getElementById('hora-inicio').value;
            const hFimNova = document.getElementById('hora-fim').value;
            const tituloNova = document.getElementById('titulo').value;

            // Função auxiliar para converter "HH:MM" em minutos totais
            const paraMinutos = (horario) => {
                const [h, m] = horario.split(':').map(Number);
                return (h * 60) + m;
            };

            const inicioNovo = paraMinutos(hInicioNova);
            const fimNovo = paraMinutos(hFimNova);

            // Validação 1: Ordem cronológica
            if (fimNovo <= inicioNovo) {
                alert("O horário de término deve ser posterior ao início.");
                return;
            }

            let tarefas = buscarTodasTarefas();

            // Validação 2: Verificar conflitos no mesmo dia
            const temConflito = tarefas.find(t => {
                // Só checa tarefas do mesmo dia/mês, ignorando a própria se for edição
                if (t.dia !== diaNum || t.mes !== mesIdx) return false;
                if (editId && t.id == editId) return false;

                const inicioEx = paraMinutos(t.inicio);
                const fimEx = paraMinutos(t.fim);

                // Lógica de colisão de intervalos
                return (inicioNovo < fimEx && fimNovo > inicioEx);
            });

            if (temConflito) {
                alert(`Conflito de Horário!\nJá existe a tarefa "${temConflito.titulo}" das ${temConflito.inicio} às ${temConflito.fim}.`);
                return;
            }

            const dadosTarefa = {
                id: editId ? parseInt(editId) : Date.now(),
                mes: mesIdx, dia: diaNum,
                titulo: tituloNova,
                local: document.getElementById('local').value,
                inicio: hInicioNova,
                fim: hFimNova,
                obs: document.getElementById('observacoes').value
            };

            if (editId) {
                const index = tarefas.findIndex(t => t.id == editId);
                tarefas[index] = dadosTarefa;
            } else {
                tarefas.push(dadosTarefa);
            }

            localStorage.setItem('minha_agenda_tarefas', JSON.stringify(tarefas));
            alert(editId ? 'Tarefa atualizada!' : 'Tarefa salva!');
            window.location.href = `diario.html?mes=${mesIdx}&dia=${diaNum}`;
        });
    }

    // --- 7. FUNÇÕES GLOBAIS (WINDOW) PARA AÇÕES ---
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