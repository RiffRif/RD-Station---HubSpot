import moment from "moment";
import { listaContatosRdStation } from "./utilidades/rdStation/listaContatosRdStation.js"
import { verificaContatoHubSpot } from "./utilidades/hubSpot/verificaContatoHubSpot.js"
import { atualizaContatoHubSpot } from "./utilidades/hubSpot/atualizaContatoHubSpot.js"
import { criaContatoHubSpot } from "./utilidades/hubSpot/criaContatoHubSpot.js"
import { converteDataISO } from "./utilidades/funcionalidades/converteDataISO.js"
import { separaNomeSobrenome } from "./utilidades/funcionalidades/separaNomeSobrenome.js"
import { criaArquivoLog } from "./utilidades/funcionalidades/criaArquivoLog.js"

moment().format();

/**
 * Função para agrupar todos os contatos e retornar erro
 * @returns
 */
async function todosContatosRdStation() {
 let todosContatos = [];
 let erros = [];
 let temMais = false;
 let pagina = 1;

 do {
  const retorno = await listaContatosRdStation(pagina);

  if (retorno.status_code == 200) {
   const data = retorno.data;

   todosContatos = [...todosContatos, ...data.contacts];

   temMais = data.has_more;
   pagina += 1;
  } else {
   erros.push(retorno);
  }
 } while (temMais);

 if (todosContatos.length > 0) {
  const retornoContatos = {
   mensagem: "Sucesso!",
   data: todosContatos,
  };

  return retornoContatos;
 } else {
  if (erros.length > 0) {
   const retornoErro = {
    mensagem: "Ocorreu um erro ao listar todos os contatos do RD Station.",
    erros,
   };

   return retornoErro;
  } else {
   const retornoErro = {
    mensagem: "O RD Station não possui nenhum contato!",
   };

   return retornoErro;
  }
 }
}

/**
 * Afere se o contato existe ou não no hubspot.
 * Se existir: Retorna o status 200, adiciona ao array contatosAtualizar os contatos em que a data da ultima atualização do RD Station é maior que a do HubSpot.
 * Se não existir: Retorna o status 404, é adicionada a variavel contatosCriar para criar o contato no HubSpot.
 * @returns
 */
async function afereContatoNoHubSpot() {
 const contatosRdStation = await todosContatosRdStation();
 const contatosCriar = [];
 const contatosAtualizar = [];
 const erroVerificaHubSpot = [];
 let retornoContatosAtualizar;
 let retornoContatosCriados;
 let retornoErros;

 if (contatosRdStation.mensagem === "Sucesso!") {
  const quantidadeContatos = contatosRdStation.data.length;

  for (let i = 0; i < quantidadeContatos; i++) {
   const contato = contatosRdStation.data[i];
   let emailContato = "Contato sem e-mail!";
   let status = "";
   let contatoHubspot;
   let telefone = "";

   if (contato.emails.length > 0) {
    emailContato = contato.emails[0].email;

    contatoHubspot = await verificaContatoHubSpot(emailContato);
    status = contatoHubspot.status_code;
   }

   const nomeSeparado = separaNomeSobrenome(contato.name);

   if (contato.phones.length > 0) {
    telefone = contato.phones[0].phone;
   } else if (status === "") {
    telefone = "Contato sem telefone!";
   }

   const retornoContato = {
    properties: {
     firstname: nomeSeparado[0],
     lastname: nomeSeparado[1],
     email: emailContato,
     phone: telefone,
    },
   };

   if (status === 404) {
    contatosCriar.push(retornoContato);
   } else if (status === 200) {
    const dataAtualizacaoHub = converteDataISO(contatoHubspot.data.updatedAt);
    const dataAtualizacaoSd = converteDataISO(contato.updated_at);

    const atualizaContato = moment(dataAtualizacaoSd).isAfter(dataAtualizacaoHub);

    if (atualizaContato) {
     retornoContato.id = contatoHubspot.data.id;

     contatosAtualizar.push(retornoContato);
    }
   } else {
    erroVerificaHubSpot.push(retornoContato);
   }
  }

  if (erroVerificaHubSpot.length > 0) {
   retornoErros = erroVerificaHubSpot;
  } else {
   retornoErros = "Não houve erros ao Atualizar e/ou Criar novos contatos no HubSpot!";
  }

  if (contatosCriar.length > 0) {
   retornoContatosCriados = await criaContatoHubSpot(contatosCriar);
  } else {
   retornoContatosCriados = "Não existe novos contatos a serem criados!";
  }

  if (contatosAtualizar.length > 0) {
   retornoContatosAtualizar = await atualizaContatoHubSpot(contatosAtualizar);
  } else {
   retornoContatosAtualizar = "Não existe contatos para atualizar!";
  }

  const retorno = {
   retornoContatosAtualizar,
   retornoContatosCriados,
   retornoErros,
  };

  criaArquivoLog(retorno);
 } else {
  criaArquivoLog(contatosRdStation);
 }
}



afereContatoNoHubSpot();
