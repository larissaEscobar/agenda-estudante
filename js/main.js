document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. CONFIGURAÇÕES E PARÂMETROS ---
    const params = new URLSearchParams(window.location.search);
    const mesIdx = params.get('mes') !== null ? parseInt(params.get('mes')) : null;
    const diaNum = params.get('dia') !== null ? parseInt(params.get('dia')) : null;
    
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

    // --- 4. CALENDÁRIO MENSAL (CORRIGIDO: DIAS VIZINHOS) ---
    const containerDias = document.getElementById('container-dias');
    if (containerDias && mesIdx !== null) {
        const primeiroDiaSemana = new Date(anoAtual, mesIdx, 1).getDay();
        const diasNoMes = new Date(anoAtual, mesIdx + 1, 0).getDate();
        const ultimoDiaMesAnterior = new Date(anoAtual, mesIdx, 0).getDate();
        const tarefas = buscarTodasTarefas();

        containerDias.innerHTML = '';

        // Dias do mês anterior
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

        // Dias do próximo mês (para completar a grade de 42 espaços ou fechar a semana)
        const totalAteAgora = containerDias.children.length;
        const diasRestantes = (totalAteAgora > 35 ? 42 : 35) - totalAteAgora;
        for (let k = 1; k <= diasRestantes; k++) {
            const li = document.createElement('li');
            li.classList.add('dia-vazio');
            li.textContent = k;
            containerDias.appendChild(li);
        }
    }

    // --- 5. TIMELINE DIÁRIA (CORRIGIDO: ROLAGEM E POSIÇÃO) ---
    const containerHoras = document.getElementById('container-horas');
    if (containerHoras && diaNum) {
        const btnVoltar = document.getElementById('btn-voltar-mes');
        if (btnVoltar) btnVoltar.href = `mensal.html?mes=${mesIdx}`;

        const linkAdd = document.getElementById('link-adicionar');
        if (linkAdd) linkAdd.href = `formulario.html?mes=${mesIdx}&dia=${diaNum}`;

        containerHoras.innerHTML = '';
        
        // Criamos um wrapper relativo para as tarefas "ancorarem" nele
        const timelineContent = document.createElement('div');
        timelineContent.style.position = 'relative';
        timelineContent.style.width = '100%';
        timelineContent.style.height = `${24 * 60}px`; // Altura total: 1440px (24h * 60px)

        // Gera as linhas de fundo
        for (let h = 0; h < 24; h++) {
            const div = document.createElement('div');
            div.classList.add('bloco-hora');
            div.style.height = '60px';
            div.style.borderBottom = '1px solid #eee';
            div.innerHTML = `<span class="label-hora">${h.toString().padStart(2, '0')}:00</span>`;
            timelineContent.appendChild(div);
        }

        // Posiciona as tarefas
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
            divT.style.left = '60px';
            divT.style.right = '10px';
            divT.style.height = `${Math.max(altura, 25)}px`;
            divT.style.zIndex = '10';
            divT.innerHTML = `<strong>${t.titulo}</strong><br><small>${t.inicio} - ${t.fim}</small>`;
            timelineContent.appendChild(divT);
        });

        containerHoras.appendChild(timelineContent);
        
        // Garante que o container tenha rolagem e não quebre o layout
        containerHoras.style.maxHeight = '400px'; 
        containerHoras.style.overflowY = 'auto';
        containerHoras.style.position = 'relative';
    }

    // --- 6. FORMULÁRIO (SALVAR) ---
    const form = document.getElementById('form-tarefa');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const nova = {
                id: Date.now(), mes: mesIdx, dia: diaNum,
                titulo: document.getElementById('titulo').value,
                local: document.getElementById('local').value,
                inicio: document.getElementById('hora-inicio').value,
                fim: document.getElementById('hora-fim').value,
                obs: document.getElementById('observacoes').value
            };
            const atuais = buscarTodasTarefas();
            atuais.push(nova);
            localStorage.setItem('minha_agenda_tarefas', JSON.stringify(atuais));
            alert('Tarefa salva!');
            window.location.href = `diario.html?mes=${mesIdx}&dia=${diaNum}`;
        });
    }

    function buscarTodasTarefas() {
        const d = localStorage.getItem('minha_agenda_tarefas');
        return d ? JSON.parse(d) : [];
    }
});