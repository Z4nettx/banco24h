import usuariosJSON from '../assets/bancos.json' with {type: 'json'};
import { mostrarPainel } from '../main.js';

export class BancoController {
  constructor() {
    this.usuarios = usuariosJSON.map(u => ({ ...u, extrato: [] }));
  }

  Login(inputCPF, inputSenha, buttonLogar) {
    const novoBotao = buttonLogar.cloneNode(true);
    buttonLogar.parentNode.replaceChild(novoBotao, buttonLogar);

    novoBotao.addEventListener("click", () => {
      const cpf = inputCPF.value.trim();
      const senha = inputSenha.value.trim();
      const user = this.usuarios.find(u => u.cpf == cpf && u.senha == senha);

      if (user) {
        mostrarPainel(user.nome, user.saldo, user.cpf, user);
      } else {
        alert('CPF ou senha incorretos');
      }
    });
  }

  realizarTransacao(user, tipo, valor, obs = "") {
    valor = parseFloat(valor);
    if (tipo === 'Saque' || tipo === 'Transferência') {
      if (user.saldo < valor) return { sucesso: false, msg: "Saldo insuficiente!" };
      user.saldo -= valor;
    } else if (tipo === 'Depósito') {
      user.saldo += valor;
    }

    user.extrato.push({
      data: new Date().toLocaleString('pt-BR'),
      tipo: tipo,
      obs: obs,
      valor: valor,
      saldoApos: user.saldo
    });
    return { sucesso: true };
  }

  alterarSenha(user, novaSenha) {
    user.senha = novaSenha;
    return true;
  }
}