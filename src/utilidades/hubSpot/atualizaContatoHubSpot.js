import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// Variáveis de acesso
const tokenHubSpot = process.env.TOKEN_HUBSPOT;

// URL base para as APIs
const urlHubSpot = "https://api.hubapi.com";

/**
 * Atualiza as propriedades dos contatos em Lote, necessário enviar um array de objetos com as propriedades dos contatos.
 * @param {Array} contatos
 * @returns
 */
export async function atualizaContatoHubSpot(contatos) {
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