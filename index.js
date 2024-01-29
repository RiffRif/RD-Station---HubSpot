import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

//Variáveis de acesso
const tokenHubSpot = process.env.TOKEN_HUBSPOT;
const tokenRdStation = process.env.TOKEN_RD_STATION;

//URL base para as APIs
const urlHubSpot = "https://api.hubapi.com";
const urlRdStation = "https://crm.rdstation.com/api";

async function listaContatosRdStation(pagina) {
 try {
  const retorno = await axios.get(`${urlRdStation}/v1/contacts`, { params: { token: tokenRdStation, page: pagina, limit: "200" } });
  const statusCode = retorno.status;

  let objRetorno = {
   status_code: statusCode,
   data: retorno.data,
  };

  return objRetorno;
 } catch (error) {
  const statusErro = error.response.status;
  const textoErro = error.response.data.error;

  let objErro = {
   page: pagina,
   status_code: statusErro,
   texto_erro: textoErro,
   erro: statusErro + " - " + textoErro,
  };

  return objErro;
 }
}

async function verificaContatoHubSpot() {
 try {
  const retorno = await axios.get(`${urlHubSpot}/v1/contacts`, { params: { token: tokenRdStation } });

  console.log(retorno.data);
 } catch (error) {
  console.log(error.response.status + " - " + error.response.data.error);
 }
}

async function todosContatosRdStation() {
 let todosContatos = [];
 let erros = [];
 let temMais = false;
 let pagina = 1;

 do {
  const retorno = await listaContatosRdStation(pagina);

  if (retorno.status_code == 200) {
   const data = retorno.data;

   todosContatos.push(data.contacts);

   temMais = data.has_more;
   pagina += 1;
  } else {
   erros.push(retorno);
  }
 } while (temMais);

 if (todosContatos.length > 0) {
  console.log(todosContatos);
 } else {
  if (erros.length > 0) {
   console.log("Ocorreu um erro ao listar todos os contatos do RD Station:", erros);
  } else {
   console.log("O RD Station não possui nenhum contato!");
  }
 }
}

todosContatosRdStation();
