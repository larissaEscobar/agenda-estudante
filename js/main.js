/* js/main.js */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. CAPTURA DE PARÂMETROS DA URL ---
    const params = new URLSearchParams(window.location.search);
    const mesIdx = params.get('mes') !== null ? parseInt(params.get('mes')) : null;
    const diaNum = params.get('dia') !== null ? parseInt(params.get('dia')) : null;
    
    const spanAno = document.querySelectorAll('#ano-atual');
    const anoAtual = new Date().getFullYear();
    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    // --- 2. LÓGICA DE TEXTO DO CABEÇALHO (UX) ---
    // Captura o H1 principal para garantir que podemos mudar o texto dele em qualquer tela
    const h1Principal = document.querySelector('header h1');

    spanAno.forEach(span => {
        if (diaNum !== null && mesIdx !== null) {
            // Na tela Diária: Mantém "Dia XX" em cima e coloca "Mês de Ano" embaixo[cite: 2]
            if (h1Principal) h1Principal.textContent = `Dia ${diaNum.toString().padStart(2, '0')}`;
            span.textContent = `${meses[mesIdx]} de ${anoAtual}`;
        } else if (mesIdx !== null) {
            // Na tela Mensal: Nome do mês em cima e apenas o ano embaixo[cite: 2]
            if (h1Principal) h1Principal.textContent = meses[mesIdx];
            span.textContent = anoAtual;
        } else {
            // Na tela Inicial[cite: 2]
            if (h1Principal) h1Principal.textContent = "Agenda Estudantil";
            span.textContent = `Ano Letivo: ${anoAtual}`;
        }
    });

    // --- LÓGICA DA TELA INICIAL (RESTURAÇÃO) ---
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
        // Inicia com o primeiro semestre visível[cite: 2]
        mostrarMeses(primeiroSemestre);
    }

    // --- 3. RENDERIZAÇÃO DO CALENDÁRIO MENSAL (MENSAL.HTML) ---
    const containerDias = document.getElementById('container-dias');
    if (containerDias && mesIdx !== null) {
        const h1Mes = document.getElementById('nome-mes');
        if (h1Mes) h1Mes.textContent = meses[mesIdx];

        const primeiroDia = new Date(anoAtual, mesIdx, 1).getDay();
        const diasNoMes = new Date(anoAtual, mesIdx + 1, 0).getDate();
        const ultimoDiaAnterior = new Date(anoAtual, mesIdx, 0).getDate();

        containerDias.innerHTML = '';

        // Dias do mês anterior (cinzas e centralizados)[cite: 2]
        for (let j = primeiroDia - 1; j >= 0; j--) {
            const li = document.createElement('li');
            li.classList.add('dia-vazio');
            li.textContent = ultimoDiaAnterior - j;
            containerDias.appendChild(li);
        }

        // Dias do mês atual
        for (let i = 1; i <= diasNoMes; i++) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `diario.html?mes=${mesIdx}&dia=${i}`;
            a.textContent = i;
            li.appendChild(a);
            containerDias.appendChild(li);
        }
    }

    // --- 4. RENDERIZAÇÃO DA TIMELINE (DIARIO.HTML) ---
    const containerHoras = document.getElementById('container-horas');
    if (containerHoras && diaNum !== null) {
        const h1Dia = document.getElementById('titulo-dia');
        if (h1Dia) h1Dia.textContent = `Dia ${diaNum.toString().padStart(2, '0')}`;

        document.getElementById('link-adicionar').href = `formulario.html?mes=${mesIdx}&dia=${diaNum}`;

        containerHoras.innerHTML = '';
        for (let h = 0; h <= 24; h++) {
            const horaTxt = h === 24 ? "24:00" : `${h.toString().padStart(2, '0')}:00`;
            const div = document.createElement('div');
            div.classList.add('bloco-hora');
            div.innerHTML = `<span class="label-hora">${horaTxt}</span><div class="conteudo-hora"></div>`;
            containerHoras.appendChild(div);
        }
    }
});