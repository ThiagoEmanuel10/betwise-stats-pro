
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const Documentation = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementação futura: sistema de busca na documentação
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)} 
        className="mb-4"
        aria-label="Voltar para a página anterior"
      >
        ← Voltar
      </Button>

      <h1 className="text-4xl font-bold mb-6">Documentação</h1>
      
      <div className="mb-8">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-10 w-full"
            placeholder="Buscar na documentação..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Buscar na documentação"
          />
        </form>
      </div>

      <Tabs defaultValue="user" className="w-full">
        <TabsList className="mb-6 w-full md:w-auto">
          <TabsTrigger value="user">Guia do Usuário</TabsTrigger>
          <TabsTrigger value="developer">Documentação Técnica</TabsTrigger>
        </TabsList>
        
        <TabsContent value="user" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Introdução</CardTitle>
              <CardDescription>
                Bem-vindo à documentação do usuário da nossa plataforma de previsões de futebol.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Nossa plataforma foi projetada para ajudar os entusiastas de futebol a fazer e acompanhar previsões de jogos, 
                analisar estatísticas e compartilhar suas previsões com outros usuários.
              </p>
              <p>
                Use o menu à esquerda para navegar pelas diferentes seções da documentação ou use a barra de busca 
                para encontrar informações específicas.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Primeiros Passos</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Criando uma conta</AccordionTrigger>
                  <AccordionContent>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Clique no botão "Entrar" no canto superior direito da tela inicial.</li>
                      <li>Selecione "Criar uma conta" na página de autenticação.</li>
                      <li>Preencha o formulário com seu e-mail e senha.</li>
                      <li>Clique em "Registrar" para criar sua conta.</li>
                      <li>Verifique seu e-mail para confirmar sua conta.</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>Fazendo sua primeira previsão</AccordionTrigger>
                  <AccordionContent>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Após fazer login, navegue até a página "Previsões".</li>
                      <li>Navegue pela lista de jogos disponíveis.</li>
                      <li>Clique em um jogo para visualizar os detalhes.</li>
                      <li>Insira sua previsão para o placar do jogo.</li>
                      <li>Clique em "Salvar Previsão" para registrar sua previsão.</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recursos Principais</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Previsões de Jogos</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-3">A plataforma permite que você faça previsões para jogos de futebol em diversas ligas ao redor do mundo.</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Veja a lista de jogos disponíveis para previsão.</li>
                      <li>Insira sua previsão para o resultado de cada jogo.</li>
                      <li>Acompanhe o resultado das suas previsões após os jogos terminarem.</li>
                      <li>Ganhe pontos com base na precisão das suas previsões.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>Estatísticas e Análises</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-3">Nossa plataforma oferece diversas ferramentas de análise estatística para ajudar você a fazer previsões mais precisas.</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Visualize estatísticas detalhadas dos times.</li>
                      <li>Acesse históricos de confrontos diretos.</li>
                      <li>Acompanhe tendências de desempenho dos times.</li>
                      <li>Configure suas preferências de visualização de dados.</li>
                      <li>Acesse métricas avançadas para análises mais profundas.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>Jogos com Alta Probabilidade</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-3">
                      A seção de Jogos com Alta Probabilidade destaca partidas onde nosso algoritmo identificou 
                      oportunidades com maior chance de acerto.
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Acesse jogos com padrões estatísticos favoráveis.</li>
                      <li>Veja a porcentagem de probabilidade para cada resultado sugerido.</li>
                      <li>Filtre por liga ou tipo de aposta.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>Chat e Comunidade</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-3">
                      Interaja com outros usuários da plataforma no chat comunitário.
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Discuta sobre jogos e previsões com outros usuários.</li>
                      <li>Compartilhe suas análises e insights.</li>
                      <li>Receba notificações sobre eventos importantes.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Planos de Assinatura</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Plano Básico (Gratuito)</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Acesso a previsões básicas.</li>
                      <li>Estatísticas limitadas.</li>
                      <li>Participação no chat comunitário.</li>
                      <li>Histórico de previsões limitado a 30 dias.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>Plano Premium</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Acesso a todas as estatísticas e análises.</li>
                      <li>Visualização de jogos com alta probabilidade.</li>
                      <li>Histórico completo de previsões.</li>
                      <li>Notificações personalizadas.</li>
                      <li>Suporte prioritário.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>Plano Ultra</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Todos os recursos do plano Premium.</li>
                      <li>Acesso a métricas avançadas e insights exclusivos.</li>
                      <li>Análises exclusivas de especialistas.</li>
                      <li>Recomendações personalizadas.</li>
                      <li>Acesso antecipado a novos recursos.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Perguntas Frequentes</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Como são calculados os pontos das previsões?</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      Os pontos são calculados com base na precisão da sua previsão. Você ganha pontos por acertar 
                      o resultado (vitória, empate ou derrota) e pontos adicionais por acertar o placar exato do jogo.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>Posso alterar minha previsão depois de salvá-la?</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      Sim, você pode alterar sua previsão até o início do jogo. Após o início do jogo, as previsões
                      são bloqueadas e não podem mais ser alteradas.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>Como funciona o algoritmo de Jogos com Alta Probabilidade?</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      Nosso algoritmo analisa diversos fatores, como histórico de confrontos diretos, desempenho recente dos times,
                      estatísticas de jogos em casa e fora, lesões de jogadores, entre outros dados. Com base nessas análises, 
                      o algoritmo identifica jogos onde há uma maior probabilidade estatística de acertar o resultado.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>Como posso instalar o aplicativo no meu celular?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-3">
                      Nosso aplicativo é uma Progressive Web App (PWA), o que significa que você pode instalá-lo diretamente do seu navegador:
                    </p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Acesse o site pelo navegador do seu dispositivo móvel.</li>
                      <li>No iOS, toque no ícone de compartilhamento e depois em "Adicionar à Tela de Início".</li>
                      <li>No Android, você verá um banner ou um ícone de instalação na barra de endereço. Alternativamente, clique no botão de instalação disponível no site.</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="developer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Documentação Técnica</CardTitle>
              <CardDescription>
                Informações para desenvolvedores e contribuidores do projeto.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Esta seção contém informações técnicas sobre a arquitetura, tecnologias utilizadas e guias
                para desenvolvedores que desejam contribuir com o projeto.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tecnologias Utilizadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Frontend</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>React - Biblioteca JavaScript para construção de interfaces</li>
                    <li>TypeScript - Superset tipado de JavaScript</li>
                    <li>Vite - Ferramenta de build e desenvolvimento</li>
                    <li>Tailwind CSS - Framework CSS utilitário</li>
                    <li>shadcn/ui - Componentes UI reutilizáveis</li>
                    <li>Recharts - Biblioteca de visualização de dados</li>
                    <li>React Router - Roteamento para aplicações React</li>
                    <li>Tanstack Query - Gerenciamento de estado e dados</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Backend</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Supabase - Plataforma de backend como serviço</li>
                    <li>PostgreSQL - Sistema de gerenciamento de banco de dados</li>
                    <li>Edge Functions - Funções serverless</li>
                    <li>Autenticação e autorização integradas</li>
                    <li>Webhooks para notificações</li>
                    <li>Integração com API de futebol</li>
                    <li>Integração com Stripe para pagamentos</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Arquitetura do Projeto</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Estrutura de Pastas</AccordionTrigger>
                  <AccordionContent>
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
{`project-root/
├── public/             # Arquivos estáticos
├── src/
│   ├── components/     # Componentes React reutilizáveis
│   │   ├── ui/         # Componentes de UI básicos
│   │   ├── dashboard/  # Componentes específicos do dashboard
│   │   └── statistics/ # Componentes de visualização estatística
│   ├── hooks/          # Hooks personalizados React
│   ├── integrations/   # Integrações com serviços externos
│   │   └── supabase/   # Cliente e tipos do Supabase
│   ├── lib/            # Funções utilitárias
│   ├── pages/          # Componentes de página
│   └── tests/          # Testes
└── supabase/
    └── functions/      # Edge Functions do Supabase`}
                    </pre>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>Fluxo de Dados</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4">
                      O aplicativo segue um padrão de fluxo de dados unidirecional, onde:
                    </p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Os componentes solicitam dados através de hooks personalizados usando React Query</li>
                      <li>Os hooks acessam os dados do Supabase ou APIs externas</li>
                      <li>Os dados são armazenados no cache do React Query</li>
                      <li>Os componentes são renderizados com os dados obtidos</li>
                      <li>As ações do usuário disparam mutations que atualizam os dados</li>
                      <li>React Query invalida automaticamente o cache quando necessário</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>Autenticação e Autorização</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-3">
                      O sistema de autenticação é gerenciado pelo Supabase Authentication:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Autenticação por e-mail/senha</li>
                      <li>Rotas protegidas usando o componente PrivateRoute</li>
                      <li>Políticas de segurança RLS (Row Level Security) no banco de dados</li>
                      <li>Armazenamento de sessão em localStorage com refresh automático</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Guia de Contribuição</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Configuração do Ambiente de Desenvolvimento</AccordionTrigger>
                  <AccordionContent>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Clone o repositório: <code className="bg-muted px-1 py-0.5 rounded">git clone [URL_DO_REPOSITÓRIO]</code></li>
                      <li>Instale as dependências: <code className="bg-muted px-1 py-0.5 rounded">npm install</code></li>
                      <li>Configure as variáveis de ambiente: Copie o arquivo <code className="bg-muted px-1 py-0.5 rounded">.env.example</code> para <code className="bg-muted px-1 py-0.5 rounded">.env</code> e preencha com suas credenciais</li>
                      <li>Inicie o servidor de desenvolvimento: <code className="bg-muted px-1 py-0.5 rounded">npm run dev</code></li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>Fluxo de Trabalho Git</AccordionTrigger>
                  <AccordionContent>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Crie uma branch a partir da <code className="bg-muted px-1 py-0.5 rounded">main</code>: <code className="bg-muted px-1 py-0.5 rounded">git checkout -b feature/nome-da-feature</code></li>
                      <li>Faça suas alterações seguindo as convenções de código</li>
                      <li>Adicione testes para suas alterações quando aplicável</li>
                      <li>Execute os testes: <code className="bg-muted px-1 py-0.5 rounded">npm test</code></li>
                      <li>Faça commit das suas alterações: <code className="bg-muted px-1 py-0.5 rounded">git commit -m "feat: descrição da feature"</code></li>
                      <li>Envie para o repositório remoto: <code className="bg-muted px-1 py-0.5 rounded">git push origin feature/nome-da-feature</code></li>
                      <li>Abra um Pull Request para a branch <code className="bg-muted px-1 py-0.5 rounded">main</code></li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>Padrões e Convenções</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-2">
                      <li><strong>Convenção de Commits:</strong> Seguimos o padrão Conventional Commits (feat, fix, docs, style, refactor, test, chore)</li>
                      <li><strong>Estilo de Código:</strong> Utilizamos ESLint e Prettier para garantir consistência no código</li>
                      <li><strong>Componentes:</strong> Criamos componentes pequenos e focados, seguindo o princípio de responsabilidade única</li>
                      <li><strong>TypeScript:</strong> Utilizamos tipos explícitos e evitamos o uso de <code className="bg-muted px-1 py-0.5 rounded">any</code></li>
                      <li><strong>Testes:</strong> Escrevemos testes unitários para funções e componentes críticos</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API e Integração</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>API de Futebol</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-3">
                      Utilizamos a API-Football para obter dados sobre jogos, times e ligas. A integração é feita através de Edge Functions do Supabase.
                    </p>
                    <p className="mb-3">
                      Endpoints principais:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li><code className="bg-muted px-1 py-0.5 rounded">/fixtures</code> - Obter informações sobre jogos</li>
                      <li><code className="bg-muted px-1 py-0.5 rounded">/leagues</code> - Obter informações sobre ligas</li>
                      <li><code className="bg-muted px-1 py-0.5 rounded">/teams</code> - Obter informações sobre times</li>
                      <li><code className="bg-muted px-1 py-0.5 rounded">/statistics</code> - Obter estatísticas de jogos</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>Integração com Supabase</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-3">
                      O Supabase é utilizado como backend para armazenamento de dados, autenticação e funções serverless.
                    </p>
                    <p className="mb-3">
                      Principais tabelas:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li><code className="bg-muted px-1 py-0.5 rounded">profiles</code> - Informações dos usuários</li>
                      <li><code className="bg-muted px-1 py-0.5 rounded">match_predictions</code> - Previsões de jogos</li>
                      <li><code className="bg-muted px-1 py-0.5 rounded">favorite_teams</code> - Times favoritos dos usuários</li>
                      <li><code className="bg-muted px-1 py-0.5 rounded">favorite_matches</code> - Jogos favoritados pelos usuários</li>
                      <li><code className="bg-muted px-1 py-0.5 rounded">user_notifications</code> - Notificações dos usuários</li>
                      <li><code className="bg-muted px-1 py-0.5 rounded">user_rankings</code> - Classificação dos usuários</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>Integração com Stripe</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-3">
                      O Stripe é utilizado para processar pagamentos e gerenciar assinaturas. A integração é feita através de Edge Functions do Supabase.
                    </p>
                    <p className="mb-3">
                      Fluxo de pagamento:
                    </p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>O usuário seleciona um plano de assinatura</li>
                      <li>O frontend solicita a criação de uma sessão de checkout ao Stripe</li>
                      <li>O usuário é redirecionado para a página de checkout do Stripe</li>
                      <li>Após o pagamento, o Stripe envia um webhook para a Edge Function <code className="bg-muted px-1 py-0.5 rounded">webhook-handler</code></li>
                      <li>A Edge Function atualiza o status da assinatura do usuário no banco de dados</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Documentation;
