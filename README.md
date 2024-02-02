# RD-Station---HubSpot 🧾
Integração que sincroniza todos os dados dos contatos do RD Station para o HubSpot.

---

Para utilizar essa integração é necessário ter o Token de acesso do RD-Station e do Aplicativo Privado do Hubspot, para isso basta seguir os tutoriais abaixo:
### [Token RD-Station:](https://ajuda.rdstation.com/s/article/Gerar-e-visualizar-Token?language=pt_BR)
	1.Acesse sua conta no RD Station CRM;
	2.Clique em seu nome de usuário, localizado no canto superior direito da página;
	3.No menu suspenso que será exibido, clique em Perfil;
	4.Caso o token tenha sido gerado anteriormente, não será preciso refazê-lo. Ele será exibido no campo Token da instância;
	5.Caso o código não conste na tela, clique no botão Gerar Token;

### [Token aplicativo privado HubSpot:](https://br.developers.hubspot.com/docs/api/private-apps)
#### Criando um aplicativo privado:
	1.Na sua conta da HubSpot, clique no ícone de configurações na barra de navegação principal.
	2.No menu lateral esquerdo, acesse Integrações > Aplicativos privados > Criar aplicativo privado.
	3.Na guia Informações básicas insira o nome do aplicativo e uma descrição.
	4.Já na guia Escopos para essa integração é necessário marcar as opções abaixo na aba CRM, todas com a opção de Leitura e Escrita:
	    • objects.contacts;
	    • schemas.contacts;
	    • lists;
    5.Clique em Criar aplicativo e pronto.

#### Pegar o Token:
	1.Na sua conta da HubSpot, clique no ícone de configurações na barra de navegação principal.
	2.No menu lateral esquerdo, acesse Integrações > Aplicativos privados > Visualizar token de acesso.

Ambos os acessos vão ser utilizados no arquivo .env.
## Instalação 🚀

Clone o projeto:

```bash
  git clone https://github.com/RiffRif/RD-Station---HubSpot.git
```
Atualize os tokens do arquivo .env nos respectivos nomes:

```bash
TOKEN_HUBSPOT = seu token do aplicativo privado do Hubspot
TOKEN_RD_STATION = seu token do RD-Station
```

Instale as dependências:

```bash
  npm install
```
Rode o projeto:

```bash
  cd src

  node index.js
```
