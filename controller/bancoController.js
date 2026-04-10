export class BancoController {
  constructor() {
    this.url = 'http://localhost:5500/assets/bancos.json';
    this.usuarios = []; // Criamos um array para guardar os dados
  }

  // Método para carregar os dados assim que a classe for instanciada
  async carregarDados() {
    try {
      const resp = await fetch(this.url);
      if (!resp.ok) throw new Error('Não funcionou a leitura de dados');

      this.usuarios = await resp.json();
    } catch (e) {
      console.error("Erro na requisição:", e.message);
    }
  }

  __Logar(inputCPF, inputSenha, buttonLogar) {
    function login()
    buttonLogar.addEventListener("click", () => {
      const cpf = inputCPF.value;
      const senha = inputSenha.value;

      // Buscamos dentro de this.usuarios carregado anteriormente
      const user = this.usuarios.find(u => u.cpf === cpf && u.senha === senha);

      if (user) {
        mostrarPainel(user.nome, user.saldo);
      } else {
        this.exibirErro("CPF ou Senha incorretos.");
      }
    });
  }

  exibirErro(mensagem) {
    // Você pode criar uma div de erro no HTML e preencher aqui
    alert(mensagem);
  }
}