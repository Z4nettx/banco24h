import { BancoController } from "./controller/bancoController.js";

const controller = new BancoController();

// --- REFERÊNCIAS DO DOM ---
const secaoLogin = document.getElementById('secao-login');
const h2Login = document.getElementById('h2-login');
const secaoPainel = document.getElementById('secao-painel');
const secaoAcoes = document.getElementById('secao-acoes');
const secaoExtrato = document.getElementById('secao-extrato');
const inputCPF = document.getElementById('input-cpf');
const inputSenha = document.getElementById('input-senha');
const headerBanco = document.getElementById('header-banco');
const saldoDisplay = document.getElementById('saldo-display');
const extratoCorpo = document.getElementById('extrato-corpo');
const modalOverlay = document.getElementById('modal-overlay');
const modalBox = document.getElementById('modal-box');
const inputRadios = document.getElementsByName('bancos');
const secaoMain = document.getElementById('container-main');
const buttonLogar = document.getElementById('buttonLogar');
const btnToggleSaldo = document.getElementById('btn-toggle-saldo');

const btnTransferencia = document.getElementById('btn-transferencia');
const btnDeposito = document.getElementById('btn-deposito');
const btnSaque = document.getElementById('btn-saque');
const btnSenha = document.getElementById('btn-senha');

const imgBancoAtual = document.querySelector(".container-main img");
const containerH2 = document.querySelector(".container-main h2");

let usuarioAtual = null;
let ultimaClasse = "";

// --- REGEX PATTERNS ---
const regexDinheiro = /^\d+(\.\d{1,2})?$/; // Apenas números e ponto decimal opcional
const regexTexto = /^[a-zA-ZÀ-ÿ\s]{3,}$/;    // Letras e espaços, mín 3 caracteres
const regexSenha = /^[a-zA-Z0-9]{4,8}$/;    // Alfanumérico, 4 a 8 caracteres

// --- FUNÇÕES DE INTERFACE ---

export function homepage() {
    secaoLogin.classList.add('oculto');
    secaoPainel.classList.add('oculto');
    h2Login.classList.remove('oculto');
    secaoAcoes.classList.add('oculto');
    secaoExtrato.classList.add('oculto');
}

export function mostrarLogin() {
    secaoLogin.classList.remove('oculto');
    h2Login.classList.add('oculto');
    secaoPainel.classList.add('oculto');
}

export function mostrarPainel(nome, saldo, cpf, user) {
    usuarioAtual = user;
    secaoLogin.classList.add('oculto');
    h2Login.classList.add('oculto');
    secaoPainel.classList.remove('oculto');
    secaoAcoes.classList.remove('oculto');
    secaoExtrato.classList.remove('oculto');
    headerBanco.innerHTML = `<h2>Bem vindo de volta, ${nome}!</h2>`;
    atualizarTudo();
}

function atualizarTudo() {
    if (btnToggleSaldo.checked) {
        saldoDisplay.textContent = usuarioAtual.saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    } else {
        saldoDisplay.textContent = "••••••";
    }
    desenharExtrato();
}

function desenharExtrato() {
    extratoCorpo.innerHTML = "";
    if (!usuarioAtual.extrato.length) {
        extratoCorpo.innerHTML = `<tr><td colspan="5" class="extrato-vazio">Sem transações.</td></tr>`;
        return;
    }
    [...usuarioAtual.extrato].reverse().forEach(t => {
        extratoCorpo.innerHTML += `
            <tr>
                <td>${t.data}</td>
                <td>${t.tipo}</td>
                <td>${t.obs}</td>
                <td style="color: ${t.tipo === 'Depósito' ? '#11C76F' : '#E21E25'}">R$ ${t.valor}</td>
                <td>R$ ${t.saldoApos.toFixed(2)}</td>
            </tr>`;
    });
}

// --- MODAL COM DO...WHILE E REGEX ---

function abrirModalValidado(titulo, campos, callbackSucesso) {
    modalOverlay.classList.remove('oculto');
    modalBox.innerHTML = `
        <h3>${titulo}</h3>
        ${campos.map(c => `<input type="${c.type}" id="${c.id}" placeholder="${c.placeholder}">`).join('')}
        <div class="modal-buttons">
            <button id="conf-modal" style="background:#11C76F; color:white;">Confirmar</button>
            <button id="canc-modal" style="background:#666; color:white;">Cancelar</button>
        </div>
    `;

    document.getElementById('canc-modal').onclick = () => modalOverlay.classList.add('oculto');

    document.getElementById('conf-modal').onclick = () => {
        let erros = [];
        let index = 0;

        // Uso do DO...WHILE para percorrer e validar os campos com REGEX
        do {
            const campoConfig = campos[index];
            const valorInput = document.getElementById(campoConfig.id).value;

            if (!campoConfig.regex.test(valorInput)) {
                erros.push(`Campo ${campoConfig.placeholder} inválido!`);
            }
            index++;
        } while (index < campos.length);

        if (erros.length === 0) {
            const valoresFinais = {};
            campos.forEach(c => valoresFinais[c.id] = document.getElementById(c.id).value);
            callbackSucesso(valoresFinais);
            modalOverlay.classList.add('oculto');
            atualizarTudo();
        } else {
            alert(erros.join("\n"));
        }
    };
}

// --- CONFIGURAÇÃO DOS BOTÕES ---

btnSaque.onclick = () => abrirModalValidado("Sacar",
    [{ id: 'val', type: 'text', placeholder: 'Valor', regex: regexDinheiro }],
    (d) => {
        const r = controller.realizarTransacao(usuarioAtual, 'Saque', d.val);
        if (!r.sucesso) alert(r.msg);
    }
);

btnDeposito.onclick = () => abrirModalValidado("Depositar",
    [{ id: 'val', type: 'text', placeholder: 'Valor', regex: regexDinheiro }],
    (d) => controller.realizarTransacao(usuarioAtual, 'Depósito', d.val)
);

btnTransferencia.onclick = () => abrirModalValidado("Transferir",
    [
        { id: 'bnc', type: 'text', placeholder: 'Banco Destino', regex: regexTexto },
        { id: 'val', type: 'text', placeholder: 'Valor', regex: regexDinheiro }
    ],
    (d) => {
        const r = controller.realizarTransacao(usuarioAtual, 'Transferência', d.val, `Para: ${d.bnc}`);
        if (!r.sucesso) alert(r.msg);
    }
);

btnSenha.onclick = () => abrirModalValidado("Nova Senha",
    [{ id: 'psw', type: 'password', placeholder: '4 a 8 dígitos', regex: regexSenha }],
    (d) => {
        controller.alterarSenha(usuarioAtual, d.psw);
        alert("Senha trocada!");
    }
);

btnToggleSaldo.addEventListener("change", atualizarTudo);

// --- SEU FOREACH (MANTIDO INTACTO) ---

inputRadios.forEach(banco => {
    let bancoClicado = banco.addEventListener("change", (event) => {
        let nomeBanco = event.target.value;

        if (nomeBanco) {

            if (ultimaClasse) {
                secaoMain.classList.remove(ultimaClasse);
            }

            mostrarLogin();
            secaoMain.classList.add(nomeBanco);
            imgBancoAtual.setAttribute("src", `./assets/images/${nomeBanco}.png`);
            ultimaClasse = nomeBanco;
            return true;
            
        }
    });
    if (bancoClicado != true) {
        homepage();

    }
});