/* js/main.js */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. CAPTURA DE PARÂMETROS DA URL ---
    const params = new URLSearchParams(window.location.search);
    const mesIdx = params.get('mes') !== null ? parseInt(params.get('mes')) : null;
    const diaNum = params.get('dia') !== null ? parseInt(params.get('dia')) : null;
    
    const spanAno = document.querySelectorAll('#ano-atual');
    const anoAtual = new Date().getFullYear(); // 2026 conforme seu projeto
    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    // --- 2. LÓGICA DE TEXTO DO CABEÇALHO (UX) ---
    const h1Principal = document.querySelector('header h1');

    spanAno.forEach(span => {
        if (diaNum !== null && mesIdx !== null) {
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

    // --- 3. LÓGICA DA TELA INICIAL (BOTÕES DE SEMESTRE) ---
    const containerMeses = document.getElementById('container-meses');
    const btn1 = document.getElementById('btn-1sem');
    const btn2 = document.getElementById('btn-2sem');

    const primeiroSemestre = [
        { nome: 'Janeiro', v: 0 }, { nome: 'Fevereiro', v: 1 }, { nome: 'Março', v: 2 },
        { nome: 'Abril', v: 3 }, { nome: 'Maio', v: 4 }, { nome: 'Junho', v: 5 }
    ];
    const segundoSemestre = [
        { nome: 'Julho', v: 6 }, { nome: 'Agosto', v: 7 }, { nome: 'Setembro', v: 8 },
        { nome: 'Outubro', v: 9 }, { nome: 'Novembro', v: 10 }, { nome: 'Dezembro', v: 11 }
    ];

    function mostrarMeses(lista) {
        if (!containerMeses) return;
        containerMeses.innerHTML = '';
        lista.forEach(m => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="mensal.html?mes=${m.v}">${m.nome}</a>`;
            containerMeses.appendChild(li);
        });
    }

    if (btn1 && btn2) {
        btn1.addEventListener('click', () => {
            btn1.classList.add('ativo');
            btn2.classList.remove('ativo');
            mostrarMeses(primeiroSemestre);
        });
        btn2.addEventListener('click', () => {
            btn2.classList.add('ativo');
            btn1.classList.remove('ativo');
            mostrarMeses(segundoSemestre);
        });
        mostrarMeses(primeiroSemestre);
    }

    // --- 4. RENDERIZAÇÃO DO CALENDÁRIO MENSAL (MENSAL.HTML) ---
    const containerDias = document.getElementById('container-dias');
    if (containerDias && mesIdx !== null) {
        const primeiroDia = new Date(anoAtual, mesIdx, 1).getDay();
        const diasNoMes = new Date(anoAtual, mesIdx + 1, 0).getDate();
        const ultimoDiaAnterior = new Date(anoAtual, mesIdx, 0).getDate();

        containerDias.innerHTML = '';

        for (let j = primeiroDia - 1; j >= 0; j--) {
            const li = document.createElement('li');
            li.classList.add('dia-vazio');
            li.textContent = ultimoDiaAnterior - j;
            containerDias.appendChild(li);
        }

        for (let i = 1; i <= diasNoMes; i++) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `diario.html?mes=${mesIdx}&dia=${i}`;
            a.textContent = i;
            li.appendChild(a);
            containerDias.appendChild(li);
        }
    }

    // --- 5. RENDERIZAÇÃO DA TIMELINE (DIARIO.HTML) ---
    const containerHoras = document.getElementById('container-horas');
    if (containerHoras && diaNum !== null) {
        // Link para adicionar tarefa levando os dados da URL
        const linkAdd = document.getElementById('link-adicionar');
        if (linkAdd) linkAdd.href = `formulario.html?mes=${mesIdx}&dia=${diaNum}`;

        containerHoras.innerHTML = '';
        for (let h = 0; h <= 23; h++) {
            const horaTxt = `${h.toString().padStart(2, '0')}:00`;
            const div = document.createElement('div');
            div.classList.add('bloco-hora');
            div.innerHTML = `<span class="label-hora">${horaTxt}</span><div class="conteudo-hora" id="hora-${h}"></div>`;
            containerHoras.appendChild(div);
        }
    }

    // --- 6. LÓGICA DO FORMULÁRIO (SALVAR TAREFA) ---
    const form = document.getElementById('form-tarefa');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault(); // Impede a página de recarregar

            // Criamos o objeto da tarefa com os dados dos campos
            const novaTarefa = {
            id: Date.now(),
            mes: mesIdx,
            dia: diaNum,
            titulo: document.getElementById('titulo').value,
            local: document.getElementById('local').value,
            inicio: document.getElementById('hora-inicio').value, // ID corrigido
            fim: document.getElementById('hora-fim').value,       // ID corrigido
            obs: document.getElementById('observacoes').value    // ID corrigido
            };

            salvarNovaTarefa(novaTarefa);
            
            alert('Tarefa salva com sucesso!');
            // Volta para a tela do dia após salvar
            window.location.href = `diario.html?mes=${mesIdx}&dia=${diaNum}`;
        });
    }

    // --- FUNÇÕES DE PERSISTÊNCIA (MOTOR DA FASE 2) ---
    function buscarTodasTarefas() {
        const dados = localStorage.getItem('minha_agenda_tarefas');
        return dados ? JSON.parse(dados) : [];
    }

    function salvarNovaTarefa(novaTarefa) {
        const tarefasAtuais = buscarTodasTarefas();
        tarefasAtuais.push(novaTarefa);
        localStorage.setItem('minha_agenda_tarefas', JSON.stringify(tarefasAtuais));
    }

    // --- 7. EXIBIÇÃO DE TAREFAS NA TIMELINE (NOVO - FASE 2) ---
    if (containerHoras && diaNum !== null && mesIdx !== null) {
        const todasTarefas = buscarTodasTarefas();
        
        // Filtramos apenas as tarefas deste dia e mês específico
        const tarefasDoDia = todasTarefas.filter(t => t.dia === diaNum && t.mes === mesIdx);

        tarefasDoDia.forEach(tarefa => {
            // Pega a hora de início (ex: "14:30" -> pega o "14")
            const horaInicio = parseInt(tarefa.inicio.split(':')[0]);
            const blocoDestino = document.getElementById(`hora-${horaInicio}`);

            if (blocoDestino) {
                const divTarefa = document.createElement('div');
                divTarefa.style.backgroundColor = '#4a90e2';
                divTarefa.style.color = 'white';
                divTarefa.style.padding = '5px';
                divTarefa.style.borderRadius = '4px';
                divTarefa.style.fontSize = '0.75rem';
                divTarefa.style.marginTop = '2px';
                divTarefa.innerHTML = `<strong>${tarefa.titulo}</strong><br>${tarefa.inicio} - ${tarefa.fim}`;
                
                blocoDestino.appendChild(divTarefa);
            }
        });
    }
});