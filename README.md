# Psych Admin — Juliana Maranho

PWA administrativo para o consultório da psicóloga Juliana Maranho. A V1 reúne pacientes, agenda, pagamentos, indicadores, relatórios básicos e configurações — sem prontuário, anotações de sessão ou qualquer conteúdo clínico.

O visual parte do cartão atual da profissional: fundo branco, traço botânico dourado e verde-musgo. A interface é responsiva, instalável e prioriza desktop sem perder os fluxos essenciais no celular.

## Arquitetura

```text
GitHub Pages / navegador
        ↓ HTTPS / JSON
Google Apps Script Web App
        ↓
Google Sheets
```

- `dist/`: frontend estático publicado.
- `dist/js/api.js`: único ponto de configuração e comunicação da API.
- `backend/`: código do Google Apps Script, separado por responsabilidade.
- `.github/workflows/pages.yml`: publicação automática no GitHub Pages.
- `.openai/hosting.json`: configuração da prévia privada deste projeto.

O frontend nunca acessa a planilha diretamente. Escritas só acontecem quando uma URL válida do Apps Script foi configurada. Sem API, a interface entra em **modo de demonstração**, exibe dados fictícios e bloqueia gravações — não simula persistência local.

## Estrutura da planilha

Crie uma planilha Google vazia. O backend prepara as abas e cabeçalhos automaticamente, mas a estrutura final será:

- `PACIENTES`: `patient_id`, dados cadastrais e administrativos, tipo, modalidade, valor, frequência e status.
- `ATENDIMENTOS`: `appointment_id`, `patient_id`, data, horários, modalidade, valor e situações do atendimento/pagamento.
- `PAGAMENTOS`: `payment_id`, referências ao atendimento e paciente, data, valor, forma e status.
- `CONFIG`: pares `key`/`value` para preferências do consultório.
- `LOG`: timestamp, ação, entidade, ID e detalhes técnicos da operação.

Dados derivados, como idade, receita do mês, ticket médio e taxa de comparecimento, não precisam ser mantidos manualmente.

## Configuração do Google Apps Script

1. Na planilha, abra **Extensões → Apps Script**.
2. Crie arquivos com os mesmos nomes existentes em `backend/` e copie o conteúdo de cada `.gs`.
3. Em **Configurações do projeto → Propriedades do script**, crie `SPREADSHEET_ID` com o ID da planilha. Ele é o trecho entre `/d/` e `/edit` na URL.
4. No editor, selecione e execute `setupSpreadsheet` uma vez.
5. Autorize o acesso solicitado. Confirme que as cinco abas foram criadas.
6. Em **Implantar → Nova implantação**, escolha **Aplicativo da Web**.
7. Execute como **você**. Para o frontend público funcionar, permita acesso a **qualquer pessoa com o link**. Use uma conta Google dedicada ao consultório e revise esta decisão com cuidado.
8. Copie a URL terminada em `/exec`. Não use a URL de teste terminada em `/dev`.

Ao atualizar o backend, crie uma nova versão da implantação. O Apps Script mantém a mesma URL pública quando a implantação existente é editada.

## Conectar o frontend

1. Abra o Psych Admin.
2. Entre em **Configurações**.
3. Cole a URL `/exec` em **URL da API**.
4. Salve.

A URL é guardada no `localStorage` daquele dispositivo. Ela não fica versionada no repositório. O indicador no topo muda de “Modo de demonstração” para “API configurada”.

## Regras financeiras centralizadas

- `REALIZADO`: faturável.
- `CANCELADO`, `REMARCADO` e `FALTOU`: não faturáveis por padrão.
- `AGENDADO`: entra na previsão.
- pagamento `PAGO`: entra na receita recebida.
- pagamento `PENDENTE`: não entra na receita recebida.
- valores são arredondados para centavos no backend.

As regras estão concentradas em `backend/Finance.gs`, facilitando ajustes futuros.

## Publicação no GitHub Pages

1. Crie o repositório `psych-admin-pwa` no GitHub.
2. Envie estes arquivos para a branch `main`.
3. Em **Settings → Pages → Build and deployment**, selecione **GitHub Actions**.
4. Execute o workflow **Publicar Psych Admin** ou faça um novo push.
5. Aguarde a URL do Pages aparecer no resumo da execução.

O workflow publica apenas `dist/`; o backend e a documentação continuam no repositório, mas não são expostos como parte do site.

## Instalar como PWA

- No Chrome/Edge para desktop, abra o menu do navegador e escolha **Instalar Psych Admin**.
- No Android, use **Adicionar à tela inicial**.
- No iPhone/iPad, abra no Safari, toque em **Compartilhar** e escolha **Adicionar à Tela de Início**.

O service worker mantém o shell estático disponível. Operações que dependem da API continuam exigindo internet e mostram um aviso quando a conexão cai.

## Privacidade e segurança

- Não inserir diagnósticos, conteúdo de sessão, testes, documentos ou observações clínicas.
- `notes_admin` aceita somente lembretes administrativos simples.
- Não versionar IDs de planilha, tokens, credenciais ou URLs privadas.
- O backend valida tipos, formatos, relações e IDs antes de escrever.
- Operações relevantes registram LOG, sem copiar o texto de observações administrativas.
- Exclusões silenciosas não fazem parte desta V1.
- Antes do uso real, revisar compartilhamento da planilha e da implantação do Apps Script.

## Checklist de testes

### Pacientes

- [ ] Criar um paciente particular e outro de plano.
- [ ] Validar nome obrigatório, e-mail, telefone e valor.
- [ ] Editar cadastro e conferir o LOG.
- [ ] Testar busca e todos os filtros.
- [ ] Abrir o detalhe e conferir histórico administrativo e resumo financeiro.

### Agenda

- [ ] Criar atendimento e confirmar preenchimento automático de modalidade/valor.
- [ ] Testar mês, semana e dia em desktop e celular.
- [ ] Marcar como realizado, cancelado, falta e remarcado.
- [ ] Confirmar que horários inválidos são bloqueados.

### Financeiro

- [ ] Registrar pagamento e confirmar criação em `PAGAMENTOS`.
- [ ] Conferir atualização de `payment_status` no atendimento.
- [ ] Confirmar que cancelados/faltas não entram no faturamento.
- [ ] Comparar recebido, pendente e previsto com a planilha.

### PWA e responsividade

- [ ] Instalar em desktop e celular.
- [ ] Navegar com 320 px, 768 px e 1440 px de largura.
- [ ] Testar teclado, foco, tecla Escape e zoom de texto em 200%.
- [ ] Desligar a internet e confirmar que escritas são impedidas.
- [ ] Atualizar a versão do cache em `dist/sw.js` a cada publicação relevante.

## Manutenção futura

Recorrência avançada, autenticação, anexos e sincronização offline não fazem parte desta V1. A separação entre interface, API, regras financeiras e persistência permite adicioná-los sem misturar conteúdo clínico ao sistema administrativo.
