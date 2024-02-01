import dotenv from "dotenv";
import axios from "axios";
import moment from "moment";
import fs from "node:fs";
import { exec } from "child_process";

moment().format();
dotenv.config();

// Variáveis de acesso
const tokenHubSpot = process.env.TOKEN_HUBSPOT;
const tokenRdStation = process.env.TOKEN_RD_STATION;

// URL base para as APIs
const urlHubSpot = "https://api.hubapi.com";
const urlRdStation = "https://crm.rdstation.com/api";

/**
 * Função para listar os contatos do RD Station, lista no máximo 200 por página
 * @param {number} pagina
 * @returns
 */
async function listaContatosRdStation(pagina) {
 try {
  const retorno = await axios.get(`${urlRdStation}/v1/contacts`, { params: { token: tokenRdStation, page: pagina, limit: "200" } });

  const statusCode = retorno.status;

  const objRetorno = {
   status_code: statusCode,
   data: retorno.data,
  };

  return objRetorno;
 } catch (error) {
  const statusErro = error.response.status;
  const textoErro = error.response.data.error;

  const objErro = {
   page: pagina,
   status_code: statusErro,
   texto_erro: textoErro,
   erro: statusErro + " - " + textoErro,
  };

  return objErro;
 }
}

/**
 * Função para verificar se o contato já existe no HubSpot, retorna '404 - Not Found' caso não exista
 * @param {string} email
 * @returns
 */
async function verificaContatoHubSpot(email) {
 try {
  const options = {
   method: "GET",
   url: `${urlHubSpot}/crm/v3/objects/contacts/${email}`,
   params: { idProperty: "email" },
   headers: {
    Authorization: `Bearer ${tokenHubSpot}`,
   },
  };

  const retorno = await axios.request(options);

  const objRetorno = {
   status_code: retorno.status,
   data: retorno.data,
  };

  return objRetorno;
 } catch (error) {
  const statusErro = error.response.status;
  const textoErro = error.response.statusText;

  const objErro = {
   status_code: statusErro,
   texto_erro: textoErro,
   erro: statusErro + " - " + textoErro,
  };

  return objErro;
 }
}

/**
 * Atualiza as propriedades dos contatos em Lote, necessário enviar um array de objetos com as propriedades dos contatos.
 * @param {Array} contatos
 * @returns
 */
async function atualizaContatoHubSpot(contatos) {
 try {
  const options = {
   method: "POST",
   url: `${urlHubSpot}/crm/v3/objects/contacts/batch/update`,
   headers: {
    Authorization: `Bearer ${tokenHubSpot}`,
    "Content-Type": "application/json",
   },
   data: {
    inputs: contatos,
   },
  };

  const retorno = await axios.request(options);

  const objRetorno = {
   status_code: retorno.status,
   data: retorno.data.results,
  };

  return objRetorno;
 } catch (error) {
  const statusErro = error.response.status;
  const textoErro = error.response.statusText;

  const objErro = {
   status_code: statusErro,
   texto_erro: textoErro,
   erro: statusErro + " - " + textoErro,
  };

  return objErro;
 }
}

/**
 * Cria contato em Lote, necessário enviar um array de objetos com as propriedades dos contatos.
 * @param {Array} contatos
 * @returns
 */
async function criaContatoHubSpot(contatos) {
 try {
  const options = {
   method: "POST",
   url: `${urlHubSpot}/crm/v3/objects/contacts/batch/create`,
   headers: {
    Authorization: `Bearer ${tokenHubSpot}`,
    "Content-Type": "application/json",
   },
   data: {
    inputs: contatos,
   },
  };

  const retorno = await axios.request(options);

  const objRetorno = {
   status_code: retorno.status,
   data: retorno.data,
  };

  return objRetorno;
 } catch (error) {
  const statusErro = error.response.status;
  const textoErro = error.response.statusText;

  const objErro = {
   status_code: statusErro,
   texto_erro: textoErro,
   erro: statusErro + " - " + textoErro,
  };

  return objErro;
 }
}

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

/**
 * Converte a data para o padrão ISO/UTC
 * @param {Date} dataString
 * @returns
 */
function converteDataISO(dataString) {
 return moment.utc(dataString).toDate();
}

/**
 * Separa o primeiro nome do restante, retornando um array, onde a posição [0] é o nome e a [1] os sobrenomes
 * @param {string} nomeCompleto
 * @returns
 */
function separaNomeSobrenome(nomeCompleto) {
 let nomeSeparado = nomeCompleto.split(" ");
 let sobrenome = nomeSeparado.slice(1, nomeSeparado.length).join(" ");
 let nome = nomeSeparado[0];

 return [nome, sobrenome];
}

/**
 * Cria um arquivo TXT de log e abre para o usuario em seguida, ficando salvo na pasta /log.
 * @param {*} conteudo
 */
function criaArquivoLog(conteudo) {
 conteudo = JSON.stringify(conteudo, null, 2);
 const dataAtual = moment().format("DD/MM/YYYY HH:MM");
 const mensagemFinal = `Integração finalizada: ${dataAtual}.\n${conteudo}`;

 const nomeArquivo = `integracao-${moment().format("DD-MM-YY")}-${Date.now()}`;
 const arquivo = `log/${nomeArquivo}.txt`;

 fs.writeFile(arquivo, mensagemFinal, (err) => {
  if (err) {
   console.error(err);
  } else {
   exec(`start ${arquivo}`);
  }
 });
}

afereContatoNoHubSpot();
