/**
 * Separa o primeiro nome do restante, retornando um array, onde a posição [0] é o nome e a [1] os sobrenomes
 * @param {string} nomeCompleto
 * @returns
 */
export function separaNomeSobrenome(nomeCompleto) {
    let nomeSeparado = nomeCompleto.split(" ");
    let sobrenome = nomeSeparado.slice(1, nomeSeparado.length).join(" ");
    let nome = nomeSeparado[0];
   
    return [nome, sobrenome];
   }