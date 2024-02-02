import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// Variáveis de acesso
const tokenRdStation = process.env.TOKEN_RD_STATION;

// URL base para as APIs
const urlRdStation = "https://crm.rdstation.com/api";

/**
 * Função para listar os contatos do RD Station, lista no máximo 200 por página
 * @param {number} pagina
 * @returns
 */
export async function listaContatosRdStation(pagina) {
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