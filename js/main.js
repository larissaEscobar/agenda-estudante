document.addEventListener('DOMContentLoaded', () => {

    // Lê os parâmetros da URL para saber qual mês/dia está sendo visualizado.
    // Se não houver parâmetro, usa a data atual como padrão.
    const params = new URLSearchParams(window.location.search);
    const dataHoje = new Date();

    let mesIdx = params.get('mes') !== null ? parseInt(params.get('mes')) : dataHoje.getMonth();
    let diaNum = params.get('dia') !== null ? parseInt(params.get('dia')) : dataHoje.getDate();
    const editId = params.get('editId');

    const spanAno = document.querySelectorAll('#ano-atual');
    const anoAtual = dataHoje.getFullYear();
    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const h1Principal = document.querySelector('header h1');

    // O mesmo main.js roda em todas as páginas. Aqui identificamos qual é a
    // página atual pelo elemento presente no DOM e ajustamos o cabeçalho.
    spanAno.forEach(span => {
        if (document.getElementById('container-horas') || document.getElementById('titulo-dia')) {
            if (h1Principal) h1Principal.textContent = `Dia ${diaNum.toString().padStart(2, '0')}`;
            span.textContent = `${meses[mesIdx]} de ${anoAtual}`;
        }
        else if (document.getElementById('container-dias')) {
            if (h1Principal) h1Principal.textContent = meses[mesIdx];
            span.textContent = anoAtual;
        }
        else if (document.getElementById('form-tarefa')) {
            if (h1Principal && !editId) h1Principal.textContent = "Nova Tarefa";
            if (h1Principal && editId) h1Principal.textContent = "Editar Tarefa";
            span.textContent = `${diaNum.toString().padStart(2, '0')} de ${meses[mesIdx]}`;
        }
        else {
            if (h1Principal) h1Principal.textContent = "Agenda Estudantil";
            span.textContent = `Ano Letivo: ${anoAtual}`;
        }
    });

    // Tela inicial: alterna entre 1º e 2º semestre e renderiza os meses correspondentes.
    // Ao carregar, abre automaticamente o semestre do mês atual.
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

        if (mesIdx > 5) {
            if(btn2) btn2.click();
        } else {
            if(btn1) btn1.click();
        }
    }

    // Calendário mensal: monta o grid de 35 ou 42 células (5 ou 6 semanas).
    // Preenche as células do início e do fim com dias do mês anterior/próximo.
    const containerDias = document.getElementById('container-dias');
    if (containerDias) {
        const primeiroDiaSemana = new Date(anoAtual, mesIdx, 1).getDay();
        const diasNoMes = new Date(anoAtual, mesIdx + 1, 0).getDate();
        const ultimoDiaMesAnterior = new Date(anoAtual, mesIdx, 0).getDate();
        const tarefas = buscarTodasTarefas();

        containerDias.innerHTML = '';

        // Dias do mês anterior para completar a primeira semana
        for (let j = primeiroDiaSemana - 1; j >= 0; j--) {
            const li = document.createElement('li');
            li.classList.add('dia-vazio');
            li.textContent = ultimoDiaMesAnterior - j;
            containerDias.appendChild(li);
        }

        // Dias do mês atual — dias com tarefas recebem destaque visual
        for (let i = 1; i <= diasNoMes; i++) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `diario.html?mes=${mesIdx}&dia=${i}`;
            a.textContent = i;
            if (tarefas.some(t => t.dia === i && t.mes === mesIdx)) li.classList.add('dia-com-tarefa');
            li.appendChild(a);
            containerDias.appendChild(li);
        }

        // Dias do próximo mês para completar a última semana
        const totalAteAgora = containerDias.children.length;
        const diasRestantes = (totalAteAgora > 35 ? 42 : 35) - totalAteAgora;
        for (let k = 1; k <= diasRestantes; k++) {
            const li = document.createElement('li');
            li.classList.add('dia-vazio');
            li.textContent = k;
            containerDias.appendChild(li);
        }
    }

    // Timeline diária: cada hora ocupa ALTURA_HORA pixels.
    // A posição e altura de cada card são calculadas convertendo o horário para minutos
    // e aplicando o fator de escala (px por minuto).
    const containerHoras = document.getElementById('container-horas');
    if (containerHoras) {
        const ALTURA_HORA = 100;
        const fatorEscala = ALTURA_HORA / 60;

        const btnVoltar = document.getElementById('btn-voltar-mes');
        if (btnVoltar) btnVoltar.href = `mensal.html?mes=${mesIdx}`;

        const linkAdd = document.getElementById('link-adicionar');
        if (linkAdd) linkAdd.href = `formulario.html?mes=${mesIdx}&dia=${diaNum}`;

        containerHoras.innerHTML = '';
        const timelineContent = document.createElement('div');
        timelineContent.style.position = 'relative';
        timelineContent.style.width = '100%';
        timelineContent.style.height = `${24 * ALTURA_HORA}px`;

        // Linhas de hora (00:00 – 23:00)
        for (let h = 0; h < 24; h++) {
            const div = document.createElement('div');
            div.classList.add('bloco-hora');
            div.style.height = `${ALTURA_HORA}px`;
            div.innerHTML = `<span class="label-hora">${h.toString().padStart(2, '0')}:00</span>`;
            timelineContent.appendChild(div);
        }

        const tarefasDoDia = buscarTodasTarefas().filter(t => t.dia === diaNum && t.mes === mesIdx);
        tarefasDoDia.forEach(t => {
            const [hIni, mIni] = t.inicio.split(':').map(Number);
            const [hFim, mFim] = t.fim.split(':').map(Number);

            const topo = ((hIni * 60) + mIni) * fatorEscala;
            const altura = (((hFim * 60) + mFim) * fatorEscala) - topo;

            const divT = document.createElement('div');
            divT.classList.add('tarefa-card');
            divT.style.top = `${topo + 2}px`;
            // O mínimo de 22px garante que cards muito curtos ainda sejam visíveis e clicáveis
            divT.style.height = `${Math.max(altura - 4, 22)}px`;
            divT.addEventListener('click', () => editarTarefa(t.id));

            // Tarefas com menos de ~45 min usam layout compacto de linha única
            // porque não há altura suficiente para empilhar título e horário
            if (altura < 75) {
                divT.innerHTML = `
                    <div class="card-linha-unica">
                        <strong class="card-titulo">${t.titulo}</strong>
                        <small class="card-horario">${t.inicio}–${t.fim}</small>
                    </div>
                `;
            } else {
                divT.innerHTML = `
                    <div class="info-tarefa">
                        <strong>${t.titulo}</strong>
                        <small>${t.inicio} – ${t.fim}</small>
                    </div>
                `;
            }
            timelineContent.appendChild(divT);
        });

        containerHoras.appendChild(timelineContent);
    }

    // Formulário de criação e edição de tarefas
    const form = document.getElementById('form-tarefa');
    if (form) {
        const btnCancelar = document.getElementById('btn-cancelar');
        if (btnCancelar) btnCancelar.href = `diario.html?mes=${mesIdx}&dia=${diaNum}`;

        const tarefas = buscarTodasTarefas();

        // Se editId existe, preenche o formulário com os dados da tarefa existente
        if (editId) {
            const tarefaParaEditar = tarefas.find(t => t.id == editId);
            if (tarefaParaEditar) {
                document.getElementById('titulo').value = tarefaParaEditar.titulo;
                document.getElementById('local').value = tarefaParaEditar.local;
                document.getElementById('hora-inicio').value = tarefaParaEditar.inicio;
                document.getElementById('hora-fim').value = tarefaParaEditar.fim;
                document.getElementById('observacoes').value = tarefaParaEditar.obs;
                document.querySelector('.btn-salvar').textContent = "Atualizar Tarefa";

                // Botão de exclusão só faz sentido no modo de edição
                const btnExcluir = document.getElementById('btn-excluir');
                if (btnExcluir) btnExcluir.style.display = 'block';
            }
        }

        const btnExcluir = document.getElementById('btn-excluir');
        if (btnExcluir) {
            btnExcluir.addEventListener('click', () => {
                if (confirm("Deseja realmente apagar esta atividade?")) {
                    let tarefas = buscarTodasTarefas();
                    tarefas = tarefas.filter(t => t.id != editId);
                    localStorage.setItem('minha_agenda_tarefas', JSON.stringify(tarefas));
                    window.location.href = `diario.html?mes=${mesIdx}&dia=${diaNum}`;
                }
            });
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

            // Verifica conflito com outras tarefas do mesmo dia.
            // Ao editar, ignora a própria tarefa na comparação.
            const tarefasDoDia = buscarTodasTarefas().filter(t => t.dia === diaNum && t.mes === mesIdx);
            const conflito = tarefasDoDia.some(t => {
                if (editId && t.id == editId) return false;
                const ini = paraMinutos(t.inicio);
                const fim = paraMinutos(t.fim);
                return paraMinutos(hInicioNova) < fim && paraMinutos(hFimNova) > ini;
            });

            if (conflito) {
                alert("Conflito de horário: já existe uma atividade nesse intervalo. Ajuste o horário e tente novamente.");
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

    // Funções expostas globalmente para serem chamadas via onclick no HTML gerado dinamicamente
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

    // Popula o localStorage com tarefas de exemplo na primeira vez que o app é aberto
    (function popularExemplos() {
        if (buscarTodasTarefas().length > 0) return;

        const hoje = new Date();
        const diaA = hoje.getDate();
        const mesA = hoje.getMonth();

        const registrosExemplo = [
            { id: 101, mes: mesA, dia: diaA, titulo: "Deslocamento", local: "Trajeto para Faculdade", inicio: "06:30", fim: "07:40", obs: "Ouvir podcast técnico." },
            { id: 102, mes: mesA, dia: diaA, titulo: "Aula de Cálculo", local: "Sala 17", inicio: "07:40", fim: "09:20", obs: "Revisar anotações da última aula." },
            { id: 103, mes: mesA, dia: diaA, titulo: "Aula de Programação JavaScript", local: "Laboratório 05", inicio: "09:30", fim: "11:10", obs: "Prática de manipulação de DOM." },
            { id: 104, mes: mesA, dia: diaA, titulo: "Aula de Sistemas Operacionais", local: "Laboratório 02", inicio: "11:20", fim: "13:00", obs: "Conteúdo sobre Kernel e Processos." },
            { id: 105, mes: mesA, dia: diaA, titulo: "Almoço", local: "Refeitório Central", inicio: "13:00", fim: "14:00", obs: "Intervalo para descanso." },
            { id: 106, mes: mesA, dia: diaA, titulo: "Estudo Individual - Revisão ADS", local: "Biblioteca", inicio: "14:30", fim: "17:00", obs: "Finalizar exercícios de algoritmos." },
            { id: 107, mes: mesA, dia: diaA, titulo: "Jantar", local: "Residência", inicio: "19:00", fim: "20:00", obs: "Momento de alimentação." }
        ];

        localStorage.setItem('minha_agenda_tarefas', JSON.stringify(registrosExemplo));
    })();
});