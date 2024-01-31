import dotenv from "dotenv";
import axios from "axios";
import moment from 'moment';

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


async function atualizaContatoHubSpot() {}

async function criaContatoHubSpot() {}

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

 if (contatosRdStation.mensagem === "Sucesso!") {
  const quantidadeContatos = contatosRdStation.data.length;

  for (let i = 0; i < quantidadeContatos; i++) {
   const contato = contatosRdStation.data[i];
   const emailContato = contato.emails[0].email;

   const contatoHubspot = await verificaContatoHubSpot(emailContato);
   const status = contatoHubspot.status_code;

   const retornoContato = {
    status_code: status,
    nome: contato.name,
    email: emailContato,
    telefone: contato.phones[0].phone,
   };

   if (status === 404) {
    contatosCriar.push(retornoContato);
   } else if (status === 200) {
    const dataAtualizacaoHub = converteDataISO(contatoHubspot.data.updatedAt);
    const dataAtualizacaoSd = converteDataISO(contato.updated_at);

    const atualizaContato = moment(dataAtualizacaoSd).isAfter(dataAtualizacaoHub);

    console.log(contatoHubspot.data.updatedAt, contato.updated_at);
   
    console.log(atualizaContato)
    if(atualizaContato) {        
        contatosAtualizar.push(retornoContato);
    }
   }
  }
 } else {
  return contatosRdStation;
 }

 console.log(contatosCriar, contatosAtualizar);
}

function converteDataISO(dataString) {
    return moment.utc(dataString).toDate()
}


afereContatoNoHubSpot();
// const teste = await verificaContatoHubSpot("bh@hubspot.com");

// console.log(teste);