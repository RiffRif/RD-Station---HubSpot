import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// Variáveis de acesso
const tokenHubSpot = process.env.TOKEN_HUBSPOT;

// URL base para as APIs
const urlHubSpot = "https://api.hubapi.com";

/**
 * Função para verificar se o contato já existe no HubSpot, retorna '404 - Not Found' caso não exista
 * @param {string} email
 * @returns
 */
export async function verificaContatoHubSpot(email) {
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