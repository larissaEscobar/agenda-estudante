// js/main.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Seleciona os elementos que vamos manipular (DOM)
    const botoesSemestre = document.querySelectorAll('.btn-semestre');
    const containerMeses = document.getElementById('container-meses');
    const spanAno = document.getElementById('ano-atual');

    // 2. Define o ano atual dinamicamente
    if (spanAno) {
        spanAno.textContent = `Ano Letivo: ${new Date().getFullYear()}`;
    }

    // 3. Dados dos meses para cada semestre
    const meses = {
        primeiro: [
            { nome: 'Janeiro', valor: 0 },
            { nome: 'Fevereiro', valor: 1 },
            { nome: 'Março', valor: 2 },
            { nome: 'Abril', valor: 3 },
            { nome: 'Maio', valor: 4 },
            { nome: 'Junho', valor: 5 }
        ],
        segundo: [
            { nome: 'Julho', valor: 6 },
            { nome: 'Agosto', valor: 7 },
            { nome: 'Setembro', valor: 8 },
            { nome: 'Outubro', valor: 9 },
            { nome: 'Novembro', valor: 10 },
            { nome: 'Dezembro', valor: 11 }
        ]
    };

    // 4. Função para renderizar os meses na grade
    function renderizarMeses(lista) {
        containerMeses.innerHTML = ''; // Limpa a grade atual[cite: 1]
        
        lista.forEach(mes => {
            const li = document.createElement('li'); // Cria o elemento da lista[cite: 1]
            const a = document.createElement('a');   // Cria o link[cite: 1]
            
            a.href = `mensal.html?mes=${mes.valor}`;
            a.textContent = mes.nome;
            
            li.appendChild(a);
            containerMeses.appendChild(li); // Adiciona na tela[cite: 1]
        });
    }

    // 5. Escutador de Eventos para os botões de semestre[cite: 1]
    botoesSemestre.forEach((botao, index) => {
        botao.addEventListener('click', () => {
            // Remove a classe 'ativo' de todos e adiciona no clicado
            botoesSemestre.forEach(b => b.classList.remove('ativo'));
            botao.classList.add('ativo');

            // Troca os meses baseado no índice do botão (0 = 1º sem, 1 = 2º sem)
            if (index === 0) {
                renderizarMeses(meses.primeiro);
            } else {
                renderizarMeses(meses.segundo);
            }
        });
    });
});