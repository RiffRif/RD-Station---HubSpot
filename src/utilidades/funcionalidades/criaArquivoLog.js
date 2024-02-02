import moment from "moment";
import fs from "node:fs";
import { exec } from "child_process";

moment().format();

/**
 * Cria um arquivo TXT de log e abre para o usuario em seguida, ficando salvo na pasta /log.
 * @param {*} conteudo
 */
export function criaArquivoLog(conteudo) {
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
