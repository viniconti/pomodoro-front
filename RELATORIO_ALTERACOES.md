# Relatório de Alterações — Autenticação e Cadastro de Usuários

**Projeto:** `pomodoro-front`
**Stack:** Next.js 16.2.6 (App Router) + React 19.2.4 + TypeScript
**Backend integrado:** `pomodoro-back` (NestJS + Prisma + PostgreSQL)
**Data:** 12/11/2026
**Base de comparação:** commit `a72189c` (`Adição da biblioteca React Toastify...`)
**Escopo:** finalização do fluxo de cadastro, login, sessão autenticada, persistência de token, "Lembrar-me", proteção da home e logout.

> **Observação metodológica:** este relatório foi escrito a partir da leitura do código final e do `git diff` real, não apenas do histórico da conversa. O backend não foi alterado nesta sessão; ele é citado apenas como contraparte das chamadas HTTP.

> **Atualização pós-merge:** após os commits `82b356a` e `6d0ce94`, a aplicação foi migrada de `app/` para `src/app/`. Os caminhos `app/...` citados neste documento refletem a estrutura da época em que o relatório foi escrito; o código atual está em `src/`.

---

## 1. Resumo geral

### Objetivo

O projeto já possuía:

- Tela de cadastro (`/register`) chamando `POST /users`;
- Tela de login (`/login`) chamando `POST /auth/login`;
- Um backend NestJS com JWT, bcrypt, Prisma e PostgreSQL;
- Um começo de Context API (`app/context/auth.tsx`) com `signIn` inacabado;
- Uma instância Axios sem envio do token.

O objetivo desta sessão foi **fechar o ciclo de autenticação no frontend**:

1. Completar o `signIn` do Context API;
2. Ler e validar o JWT retornado pelo backend;
3. Persistir a sessão e restaurá-la ao recarregar a página;
4. Enviar automaticamente o token nas requisições protegidas;
5. Fazer o login usar o token;
6. Fazer o cadastro redirecionar para o login;
7. Proteger a home e disponibilizar logout;
8. Implementar o comportamento do checkbox "Lembrar-me".

### O que já funciona ao final

- Cadastro de usuário no PostgreSQL via NestJS/Prisma, com senha hasheada no backend;
- Tratamento de e-mail duplicado (`409`) e de campos vazios no frontend;
- Login com validação de credenciais no backend e emissão de JWT;
- Sessão restaurada após recarregar a página;
- Token enviado automaticamente como `Authorization: Bearer <token>`;
- Home acessível apenas com sessão válida;
- Logout limpando a sessão;
- "Lembrar-me" marcado → `localStorage`; desmarcado → `sessionStorage`.

### O que ainda não está implementado

- Proteção de rota no servidor (middleware/proxy) ou cookies `httpOnly`;
- Refresh token, renovação automática ou tratamento global de `401`;
- Recuperação de senha (o botão "Esqueceu a senha?" existe, mas não tem ação);
- Página de perfil (o ícone de perfil aponta para `#perfil`);
- Exibição do nome do usuário na sessão (o JWT contém apenas `sub` e `email`);
- Testes automatizados;
- Validação robusta de formulário (tamanho mínimo de senha, formato de e-mail, etc.);
- Envio do formulário com Enter (os botões são `type="button"`);
- Correções no backend (DTOs sem validação, hash de senha retornado no cadastro, `PUT` sem hash de senha).

---

## 2. Arquivos criados

> **Importante:** durante esta sessão **nenhum arquivo-fonte novo foi criado**. Os arquivos `app/context/auth.tsx`, `app/context/index.tsx` e `app/interfaces/IAuthUser.ts` já existiam no diretório de trabalho quando a sessão começou (aparecem como `untracked` no Git porque ainda não foram commitados) e foram aproveitados/completados. O único arquivo novo desta etapa é o próprio relatório.

| Arquivo | Situação | Finalidade |
|---|---|---|
| `RELATORIO_ALTERACOES.md` | **Criado nesta sessão** | Documentar todas as alterações, decisões técnicas e o funcionamento da autenticação. |
| `app/context/auth.tsx` | Já existia (untracked); foi completado | Define o `AuthContext`, o `AuthProvider`, o estado da sessão, `signIn`, `signOut` e o hook `useAuth`. |
| `app/context/index.tsx` | Já existia (untracked); **não foi alterado** | Agrega providers da aplicação. Hoje encapsula apenas o `AuthProvider` e é exportado como `AppProvider`. |
| `app/interfaces/IAuthUser.ts` | Já existia (untracked); foi ajustado | Define os tipos `IAuthUser` e `IAuthTokenPayload`, alinhados ao payload real do JWT. |

### 2.1 `app/context/index.tsx`

```tsx
import { AuthProvider } from "./auth";

type AppProviderProps = {
  children: React.ReactNode;
};

export default function AppProvider({ children }: AppProviderProps) {
  return <AuthProvider>{children}</AuthProvider>;
}
```

**Finalidade:** ponto único de composição de providers globais. Se amanhã existir um `ThemeProvider` ou `TimerProvider`, ele pode ser adicionado aqui sem alterar o `layout.tsx`.

**Por que não tem `"use client"`?** O arquivo é um Server Component que renderiza um Client Component (`AuthProvider`). Isso é permitido no App Router: o servidor renderiza o pai e delega a fronteira de cliente para o filho. Os `children` continuam podendo ser Server Components, pois são passados como slot.

---

## 3. Arquivos modificados

| Arquivo | Principais alterações |
|---|---|
| `app/context/auth.tsx` | Implementação completa da sessão com `useSyncExternalStore`, validação do JWT, persistência, restauração, `isLoading`, `useAuth`, `signIn(token, remember)` e `signOut`. |
| `app/services/api.ts` | Constante da chave do token, funções `getStoredToken`, `storeToken`, `clearStoredToken` e interceptor de requisição que injeta o Bearer. |
| `app/interfaces/IAuthUser.ts` | Interface alinhada ao JWT (`id`, `email`) e novo tipo `IAuthTokenPayload`; removido `password`. |
| `app/layout.tsx` | `AppProvider` movido para dentro do `<body>` e aplicado a toda a árvore. |
| `app/components/LoginForm.tsx` | Captura do `access_token`, chamada ao `signIn`, estado `isSubmitting`, validação, toasts, redirecionamento de usuário já logado e passagem do `remember`. |
| `app/register/page.tsx` | Validação de campos, `isSubmitting`, mensagem específica para `409`, redirecionamento para `/login` e centralização das opções de toast. |
| `app/page.tsx` | Proteção da home, redirecionamento para `/login`, botão de logout e remoção de variáveis não usadas do timer. |
| `app/styles/home.css` | Estilo do botão `.logout-home`. |

> `package.json` e `package-lock.json` aparecem modificados em relação ao commit, mas a inclusão do `jwt-decode` já estava no diretório de trabalho antes desta sessão. Nenhum `npm install` foi executado durante as alterações.

---

## 4. Explicação técnica

### 4.1 Tipagem — `app/interfaces/IAuthUser.ts`

```ts
export interface IAuthUser {
  id: number;
  email: string;
}

export interface IAuthTokenPayload {
  sub: string | number;
  email: string;
  iat?: number;
  exp?: number;
}
```

- `IAuthUser` representa o usuário **que o frontend consegue montar a partir do token**. O backend assina o JWT com `{ sub: user.id, email: user.email }`; portanto, não existem `password` nem `name` no token.
- `sub` é o "subject" do JWT. No backend ele é o `id` numérico do usuário; na tipagem foi aceito `string | number` porque, dependendo da serialização, o valor pode chegar como número ou string. A conversão é feita com `Number(payload.sub)`.
- `exp` é o timestamp de expiração em **segundos** (padrão JWT). Por isso a comparação multiplica por 1000.
- `iat` é o timestamp de emissão, mantido apenas para tipagem.

**Por que remover `password`?** A interface anterior (`id`, `userName`, `email`, `password`) não correspondia ao JWT e carregava um campo sensível que nunca deveria circular no cliente.

### 4.2 Cliente HTTP — `app/services/api.ts`

```ts
export const TOKEN_STORAGE_KEY = "pomodoro.token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    localStorage.getItem(TOKEN_STORAGE_KEY) ??
    sessionStorage.getItem(TOKEN_STORAGE_KEY)
  );
}
```

- `TOKEN_STORAGE_KEY` centraliza a chave usada nos dois storages, evitando strings duplicadas.
- `typeof window === "undefined"` protege contra execução no servidor (SSR/prerender), onde `localStorage` e `sessionStorage` não existem.
- O operador `??` prioriza o `localStorage`; se não houver token persistente, tenta o `sessionStorage`.

```ts
export function storeToken(token: string, remember: boolean) {
  if (remember) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    return;
  }

  sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}
```

- `remember === true`: grava no `localStorage` e remove do `sessionStorage`, garantindo que exista apenas uma cópia.
- `remember === false`: grava no `sessionStorage` e remove do `localStorage`. O `sessionStorage` é isolado por aba e apagado quando a aba/navegador é fechado.

```ts
export function clearStoredToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
}
```

- Remove o token dos dois storages no logout, independentemente de onde ele estava.

```ts
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  return config;
});
```

- `baseURL` vem de `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:3333`.
- O interceptor de **requisição** roda antes de cada chamada. Se houver token, adiciona o cabeçalho `Authorization`.
- `config.headers.set(...)` é a API do Axios 1.x para manipular headers com segurança de tipo.
- **Não existe** interceptor de resposta para tratar `401`; isso é uma melhoria futura.

### 4.3 Context API — `app/context/auth.tsx`

#### Estrutura do contexto

```ts
type AuthContextProps = {
  user: IAuthUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  token: string | null;
  signIn: (token: string, remember?: boolean) => void;
  signOut: () => void;
};

export const AuthContext = createContext<AuthContextProps | undefined>(
  undefined,
);
```

- `user`: dados decodificados do JWT;
- `isLoggedIn`: indica se existe uma sessão válida;
- `isLoading`: diferencia "ainda não sei se há sessão" de "não há sessão". Isso evita redirecionar o usuário para `/login` antes da leitura do storage;
- `token`: o JWT bruto;
- `signIn`: recebe o token e, opcionalmente, `remember`;
- `signOut`: encerra a sessão.

O contexto inicia como `undefined` (e não como `{}`), o que permite ao hook detectar uso fora do provider.

#### Hook `useAuth`

```ts
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider.");
  }

  return context;
}
```

- Encapsula `useContext` e dá uma mensagem clara de erro;
- Evita que cada componente importe `AuthContext` e `useContext` diretamente;
- Mantém a API do contexto pequena e legível.

#### Validação do JWT

```ts
function decodeUserFromToken(token: string): IAuthUser | null {
  try {
    const payload = jwtDecode<IAuthTokenPayload>(token);

    if (payload.exp && payload.exp * 1000 <= Date.now()) {
      return null;
    }

    if (!payload.sub || !payload.email) {
      return null;
    }

    return {
      id: Number(payload.sub),
      email: payload.email,
    };
  } catch {
    return null;
  }
}
```

- `jwtDecode` apenas **decodifica** o payload; ele **não valida a assinatura**. A validação real da assinatura é feita pelo backend com o `JWT_SECRET`.
- A função verifica expiração (`exp`) antes de considerar a sessão válida.
- Verifica a existência de `sub` e `email`.
- `try/catch` cobre token malformado.
- Retorna `null` para qualquer token inválido/expirado.

#### Sincronização com o storage: `useSyncExternalStore`

```ts
const session = useSyncExternalStore(
  subscribeToAuthChanges,
  getSessionSnapshot,
  getServerSnapshot,
);
```

`useSyncExternalStore` é o hook do React para ler **estado externo** (aqui, `localStorage`/`sessionStorage`) de forma segura para SSR e hidratação.

- No servidor, React usa `getServerSnapshot` → `SERVER_SESSION` com `isLoading: true`.
- No cliente, após a hidratação, React usa `getSessionSnapshot` e re-renderiza com o estado real.
- O hook se inscreve via `subscribeToAuthChanges` e é notificado quando o storage muda.

**Por que não usar `useState` + `useEffect`?**

A primeira versão da implementação usava `useEffect` para ler o storage e chamar `setToken`, `setUser` e `setIsLoggedIn`. O ESLint do Next 16 (`react-hooks/set-state-in-effect`) acusou erro:

> "Calling setState synchronously within an effect can trigger cascading renders."

Além do lint, sincronizar estado derivado de uma fonte externa com `useEffect` provoca um render extra e pode gerar inconsistências. `useSyncExternalStore` é a solução recomendada pelo React para esse cenário.

#### Cache dos snapshots

```ts
let cachedToken: string | null | undefined;
let cachedSession: AuthSession = SERVER_SESSION;

function getSessionSnapshot(): AuthSession {
  const token = getStoredToken();

  if (token === cachedToken) {
    return cachedSession;
  }

  cachedToken = token;

  if (!token) {
    cachedSession = {
      user: null,
      isLoggedIn: false,
      isLoading: false,
      token: null,
    };

    return cachedSession;
  }

  const user = decodeUserFromToken(token);

  cachedSession = {
    user,
    isLoggedIn: Boolean(user),
    isLoading: false,
    token,
  };

  return cachedSession;
}
```

- `useSyncExternalStore` exige que `getSnapshot` retorne um valor **estável por referência** enquanto nada mudou. Se retornasse um objeto novo a cada chamada, o React entraria em loop de renderização.
- Por isso existe o cache `cachedToken`/`cachedSession`: só recalcula quando o token muda.
- Quando não há token, `isLoading` vira `false` e `isLoggedIn` fica `false`.
- Quando há token válido, `user` é preenchido e `isLoggedIn` vira `true`.
- Quando há token inválido/expirado, `user` é `null`, `isLoggedIn` é `false`, mas o valor bruto de `token` permanece no snapshot até um próximo login/logout. A sessão é corretamente tratada como inválida.

#### Inscrição em mudanças

```ts
function subscribeToAuthChanges(onStoreChange: () => void) {
  function handleStorage(event: StorageEvent) {
    if (event.key === TOKEN_STORAGE_KEY) {
      onStoreChange();
    }
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener(AUTH_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(AUTH_CHANGE_EVENT, onStoreChange);
  };
}
```

- O evento nativo `storage` dispara quando **outra aba** altera o storage. Ele cobre `localStorage` e `sessionStorage`.
- O evento customizado `pomodoro:auth-change` cobre mudanças feitas na **mesma aba**, porque o evento `storage` não dispara na própria aba que alterou o valor.
- A função retorna a função de limpeza (cleanup) exigida pelo React.

```ts
function notifyAuthChange() {
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}
```

- Disparado após `signIn` e `signOut` para forçar o `useSyncExternalStore` a reler o snapshot.

#### `signIn`

```ts
function signIn(accessToken: string, remember = false) {
  const decodedUser = decodeUserFromToken(accessToken);

  if (!decodedUser) {
    throw new Error("Token de autenticação inválido ou expirado.");
  }

  storeToken(accessToken, remember);
  notifyAuthChange();
}
```

- Valida o token **antes** de salvar;
- Delega a escolha do storage para `storeToken`;
- Notifica o contexto para atualizar `user`, `isLoggedIn` e `token`;
- Não navega: quem decide o destino é o formulário de login. Essa separação mantém o contexto reutilizável.
- Lança `Error` para token inválido. No `LoginForm`, o `catch` trata como erro genérico de login.

#### `signOut`

```ts
function signOut() {
  clearStoredToken();
  notifyAuthChange();
  router.push("/login");
}
```

- Remove o token dos dois storages;
- Atualiza o contexto;
- Redireciona para `/login`.
- A home também possui uma guarda que redireciona ao detectar `isLoggedIn === false`; ambas as navegações levam ao mesmo destino.

#### Provider

```tsx
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const session = useSyncExternalStore(
    subscribeToAuthChanges,
    getSessionSnapshot,
    getServerSnapshot,
  );
  const router = useRouter();

  // ...

  return (
    <AuthContext.Provider value={{ ...session, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
```

- O `value` combina o snapshot (dados) com as ações (`signIn`/`signOut`);
- `router` vem de `next/navigation` e só pode ser usado em Client Component — o arquivo tem `"use client"`.

#### `getServerSnapshot`

```ts
const SERVER_SESSION: AuthSession = {
  user: null,
  isLoggedIn: false,
  isLoading: true,
  token: null,
};
```

- No servidor não existe storage. O snapshot do servidor representa "carregando";
- Isso garante que o HTML inicial não mostre o usuário logado nem redirecione indevidamente;
- Após a hidratação, o snapshot real do cliente assume.

### 4.4 Layout — `app/layout.tsx`

```tsx
<html lang="pt-br" className={`${allerta.variable} ${anuphan.variable}`}>
  <body>
    <AppProvider>{children}</AppProvider>
  </body>
</html>
```

- O provider foi movido para **dentro** do `<body>`, seguindo a recomendação da documentação do Next 16 para Context Providers;
- Antes ele ficava entre `<html>` e `<body>`, o que colocava o `<body>` como filho de um Client Component e podia gerar avisos de hidratação;
- Todos os `children` (pages) passam a ter acesso ao contexto.

### 4.5 Login — `app/components/LoginForm.tsx`

#### Estados

```tsx
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [remember, setRemember] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);
```

- `email`, `password`: inputs controlados;
- `remember`: valor do checkbox "Lembrar-me";
- `isSubmitting`: evita cliques repetidos e permite feedback visual ("Entrando...").

#### Redirecionamento de usuário já logado

```tsx
useEffect(() => {
  if (!isLoading && isLoggedIn) {
    router.replace("/");
  }
}, [isLoading, isLoggedIn, router]);
```

- Se o usuário já tem sessão válida e visita `/login`, ele é levado para a home;
- `replace` evita empilhar `/login` no histórico;
- `isLoading` impede o redirecionamento antes da leitura do storage.

#### Envio

```tsx
async function handleSubmitLogin() {
  if (!email || !password) {
    toast.error("Preencha o e-mail e a senha!", toastOptions);
    return;
  }

  setIsSubmitting(true);

  try {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    signIn(response.data.access_token, remember);
    router.push("/");
  } catch (error) {
    const status = axios.isAxiosError(error)
      ? error.response?.status
      : undefined;

    const message =
      status === 401 || status === 404
        ? "E-mail ou senha incorretos!"
        : "Erro ao fazer login. Tente novamente!";

    toast.error(message, toastOptions);
  } finally {
    setIsSubmitting(false);
  }
}
```

- Validação mínima de campos vazios;
- `api.post` usa a instância central, portanto já passa pelo interceptor;
- `response.data.access_token` é o campo retornado pelo backend;
- `signIn(token, remember)` grava no storage correto e atualiza o contexto;
- `router.push("/")` navega para a home;
- `axios.isAxiosError` permite diferenciar erro de credenciais (`401`/`404`) de erro de rede/servidor;
- `finally` sempre libera o botão.

#### Toasts

```tsx
const toastOptions: ToastOptions = {
  position: "bottom-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: false,
  pauseOnHover: true,
  draggable: true,
  theme: "colored",
  transition: Bounce,
};
```

- Centraliza a configuração usada nas mensagens de erro;
- `ToastContainer` foi incluído no próprio `LoginForm` (Client Component), pois a página `/login` é Server Component;
- Antes, o login usava `alert()`; agora usa o mesmo padrão visual do cadastro.

#### Botão

```tsx
<button
  className="button-enter"
  onClick={handleSubmitLogin}
  disabled={isSubmitting}
>
  {isSubmitting ? "Entrando..." : "Entrar"}
  <ArrowRight size={20} color="#FFFFFF" />
</button>
```

- `disabled` evita múltiplos envios;
- O texto muda durante a requisição.

### 4.6 Cadastro — `app/register/page.tsx`

#### Estados e validações

```tsx
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [name, setName] = useState("");
const [isSubmitting, setIsSubmitting] = useState(false);

const router = useRouter();

async function handleSubmit() {
  if (!name || !email || !password || !confirmPassword) {
    toast.error("Preencha todos os campos!", toastOptions);
    return;
  }

  if (password !== confirmPassword) {
    toast.error("As senhas devem ser iguais!", toastOptions);
    return;
  }

  setIsSubmitting(true);

  try {
    await api.post("/users", {
      email,
      password,
      name,
    });

    toast.success("Cadastro realizado com sucesso!", toastOptions);
    router.push("/login");
  } catch (error) {
    const status = axios.isAxiosError(error)
      ? error.response?.status
      : undefined;

    const message =
      status === 409
        ? "Este e-mail já está cadastrado!"
        : "Erro ao cadastrar o usuário!";

    toast.error(message, toastOptions);
  } finally {
    setIsSubmitting(false);
  }
}
```

- `POST /users` envia exatamente os campos esperados pelo backend (`name`, `email`, `password`);
- O backend retorna `409 Conflict` quando o e-mail já existe (`ConflictException('User already exists!')`);
- A resposta de sucesso é ignorada de propósito: ela contém o usuário criado (e, atualmente, o hash da senha);
- Após sucesso, o usuário é levado para `/login`;
- O botão fica desabilitado durante o envio e mostra "Cadastrando...".

**Limitação conhecida:** como o `ToastContainer` está na página de cadastro, o toast de sucesso pode desaparecer rapidamente ao navegar para `/login`. Uma melhoria seria exibir a mensagem na página de login (via query param) ou atrasar a navegação.

**Validação nativa:** o botão é `type="button"`, então o navegador não executa a validação nativa do formulário (o e-mail é `type="email"`, mas não há submit). A validação atual é apenas manual (campos vazios e senhas iguais).

### 4.7 Home — `app/page.tsx`

#### Guarda de rota no cliente

```tsx
const { isLoggedIn, isLoading, signOut } = useAuth();
const router = useRouter();

useEffect(() => {
  if (!isLoading && !isLoggedIn) {
    router.replace("/login");
  }
}, [isLoading, isLoggedIn, router]);

// ...

if (isLoading || !isLoggedIn) {
  return null;
}
```

- Enquanto a sessão está sendo lida, retorna `null` (evita renderizar conteúdo protegido e evita redirecionar cedo);
- Sem sessão, redireciona para `/login` com `replace`;
- A guarda é **client-side**. Ela melhora a UX, mas não é uma barreira de segurança: o backend continua sendo a fonte real de autorização.

#### Logout

```tsx
<button
  className="logout-home"
  type="button"
  onClick={signOut}
  title="Sair da conta"
  aria-label="Sair da conta"
>
  <LogOut size={32} strokeWidth={1.5} />
</button>
```

- Usa o ícone `LogOut` do `lucide-react`;
- `aria-label` e `title` melhoram acessibilidade;
- Chama o `signOut` do contexto.

#### Timer

- O timer existente não foi alterado funcionalmente;
- Apenas as variáveis não usadas `isRunning` e `pause` foram removidas da desestruturação do `useTimer`, eliminando avisos de lint;
- Os hooks continuam sendo chamados antes do `return null`, respeitando as regras dos hooks.

### 4.8 Estilo — `app/styles/home.css`

```css
.logout-home {
  position: absolute;
  right: 118px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--color11);
  cursor: pointer;
  transition: color 0.2s ease;
}

.logout-home:hover {
  color: var(--color7);
}
```

- Posiciona o botão à esquerda do ícone de perfil (`.perfil-home`, que fica em `right: 48px`);
- Remove fundo/borda padrão do `<button>`;
- Usa as variáveis de cor já existentes no projeto.

---

## 5. Fluxo de funcionamento

### 5.1 Cadastro

```
Usuário preenche nome/e-mail/senha/confirmação
        │
        ▼
handleSubmit() valida campos vazios e senhas iguais
        │
        ▼
api.post("/users", { name, email, password })
        │
        ▼
Interceptor de requisição (não há token ainda; segue sem Authorization)
        │
        ▼
NestJS: UsersController.register → UsersService.register
        │
        ├─ verifica e-mail duplicado (Prisma) → 409
        ├─ bcrypt.hash(password, 10)
        └─ prisma.user.create(...)
        │
        ▼
PostgreSQL (tabela "users")
        │
        ▼
Resposta 201 (atualmente com o usuário completo)
        │
        ▼
Frontend: toast de sucesso → router.push("/login")
```

### 5.2 Login

```
Usuário informa e-mail/senha (e marca ou não "Lembrar-me")
        │
        ▼
api.post("/auth/login", { email, password })
        │
        ▼
NestJS: AuthController.signIn → AuthService.signIn
        │
        ├─ usersService.findOne(email) → se não existir: 404
        ├─ bcrypt.compare(password, user.password) → se falhar: 401
        └─ jwtService.signAsync({ sub: user.id, email })
        │
        ▼
Resposta { access_token }
        │
        ▼
signIn(access_token, remember)
        │
        ├─ jwtDecode → valida exp/sub/email
        ├─ storeToken:
        │    ├─ remember=true  → localStorage
        │    └─ remember=false → sessionStorage
        └─ notifyAuthChange()
        │
        ▼
useSyncExternalStore relê o snapshot
        │
        ▼
Contexto passa a ter user, token, isLoggedIn=true
        │
        ▼
router.push("/") → Home renderiza
```

### 5.3 Restauração da sessão (recarregar a página)

```
Servidor renderiza com SERVER_SESSION (isLoading=true)
        │
        ▼
Hidratação no cliente
        │
        ▼
useSyncExternalStore chama getSessionSnapshot()
        │
        ▼
getStoredToken(): localStorage ?? sessionStorage
        │
        ├─ sem token → isLoggedIn=false, isLoading=false
        └─ com token → decodeUserFromToken()
                          ├─ expirado/inválido → isLoggedIn=false
                          └─ válido → user preenchido, isLoggedIn=true
        │
        ▼
Home: se isLoading=false e isLoggedIn=false → router.replace("/login")
      se isLoggedIn=true → renderiza o conteúdo
```

### 5.4 Requisição autenticada

```
Componente chama api.get("/users") (ou outra rota protegida)
        │
        ▼
Interceptor de requisição
        │
        ▼
getStoredToken()
        │
        ▼
config.headers.set("Authorization", `Bearer <token>`)
        │
        ▼
NestJS AuthGuard (APP_GUARD)
        │
        ├─ rota @Public() → libera
        └─ demais rotas → verifyAsync(token, JWT_SECRET)
                              ├─ inválido/ausente → 401
                              └─ válido → request.user = payload
        │
        ▼
Controller/Service → Prisma → PostgreSQL
```

> Nenhuma tela nova consome rotas protegidas neste momento, mas a infraestrutura está pronta para isso.

### 5.5 Logout

```
Usuário clica no ícone de logout
        │
        ▼
signOut()
        │
        ├─ clearStoredToken() → remove localStorage e sessionStorage
        ├─ notifyAuthChange() → contexto atualiza
        └─ router.push("/login")
        │
        ▼
Home (se ainda montada) detecta isLoggedIn=false e também redireciona
```

### 5.6 "Lembrar-me"

| Checkbox | Storage | Sobrevive a recarregar? | Sobrevive a fechar a aba/navegador? |
|---|---|---|---|
| ✅ Marcado | `localStorage` | Sim | Sim |
| ⬜ Desmarcado | `sessionStorage` | Sim (na mesma aba) | Não |

- O valor do checkbox **não** é persistido; apenas o token é gravado no storage correspondente.
- `storeToken` remove o token do outro storage, evitando duplicidade.
- O evento `storage` sincroniza o estado entre abas quando o token persistente muda.

---

## 6. Integrações

### 6.1 Mapa de dependências internas

```
app/layout.tsx
└── app/context/index.tsx  (AppProvider)
    └── app/context/auth.tsx  (AuthProvider)
        ├── app/interfaces/IAuthUser.ts
        ├── app/services/api.ts
        │   ├── TOKEN_STORAGE_KEY
        │   ├── getStoredToken()
        │   ├── storeToken()
        │   ├── clearStoredToken()
        │   └── api (Axios + interceptor)
        └── next/navigation (useRouter)

Consumidores do contexto:
├── app/components/LoginForm.tsx
│   ├── useAuth() → signIn, isLoggedIn, isLoading
│   └── api.post("/auth/login")
├── app/page.tsx
│   ├── useAuth() → isLoggedIn, isLoading, signOut
│   └── useRouter()
└── (futuros componentes podem usar useAuth)

app/register/page.tsx
└── api.post("/users")
```

### 6.2 Comunicação com o backend

| Ação no frontend | Endpoint | Autenticação | Comportamento |
|---|---|---|---|
| Cadastro | `POST /users` | Pública (`@Public`) | Cria usuário com bcrypt + Prisma |
| Login | `POST /auth/login` | Pública (`@Public`) | Valida senha e retorna `{ access_token }` |
| Perfil | `GET /auth/profile` | Protegida | Existe no backend, mas **não é usada** pelo frontend |
| Listar usuários | `GET /users` | Protegida | Não usada pelo frontend |
| Atualizar usuário | `PUT /users/:id` | Protegida | Não usada pelo frontend |
| Excluir usuário | `DELETE /users/:id` | Protegida | Não usada pelo frontend |

- O backend roda em `http://localhost:3333`;
- O CORS libera `http://localhost:3000` (`app.enableCors`);
- O JWT expira em `45d` e usa `JWT_SECRET` do `.env` do backend;
- O banco é PostgreSQL, acessado via Prisma 7 com `@prisma/adapter-pg`;
- Tabela `users`: `id`, `name`, `email` (único), `password`, `createdAt`, `updatedAt`.

### 6.3 Por que o interceptor não cria dependência circular

- `auth.tsx` importa funções de `api.ts`;
- `api.ts` **não** importa `auth.tsx`;
- O interceptor lê o storage diretamente, sem precisar do contexto;
- Assim, qualquer módulo pode usar `api` sem depender do React.

---

## 7. Dependências

| Dependência | Versão | Situação | Uso |
|---|---|---|---|
| `next` | 16.2.6 | Já existia | App Router, `useRouter`, build. |
| `react` / `react-dom` | 19.2.4 | Já existia | Componentes, hooks, `useSyncExternalStore`. |
| `axios` | ^1.20.0 | Já existia | Cliente HTTP; agora com interceptor de requisição. |
| `jwt-decode` | ^4.0.0 | Já estava no working tree antes desta sessão | Decodificar o payload do JWT no cliente. |
| `react-toastify` | ^11.1.0 | Já existia | Toasts de sucesso/erro; passou a ser usado também no login. |
| `lucide-react` | ^1.17.0 | Já existia | Ícones; foi adicionado o uso de `LogOut`. |
| `react-icons` | ^5.7.0 | Já existia | Ícone `FaPlay` do timer. |
| `react-timer-hook` | ^4.0.6 | Já existia | Timer da home. |

- **Nenhuma biblioteca nova foi instalada durante esta sessão.**
- `package.json` e `package-lock.json` aparecem alterados em relação ao commit porque o `jwt-decode` foi adicionado antes do início desta sessão.
- A variável `NEXT_PUBLIC_API_URL` já existia em `.env.local`.

---

## 8. Pontos importantes

### 8.1 Decisões técnicas

1. **`useSyncExternalStore` em vez de `useState` + `useEffect`**
   - Evita o erro `react-hooks/set-state-in-effect` do Next 16;
   - Evita renderizações em cascata;
   - É a API recomendada para ler estado externo (storage) de forma segura para SSR.

2. **Cache do snapshot**
   - Obrigatório para `useSyncExternalStore`;
   - Sem ele, um novo objeto a cada chamada causaria loop de renderização.

3. **`isLoading` separado de `isLoggedIn`**
   - Sem esse estado, a home redirecionaria para `/login` antes de o storage ser lido, mesmo com o usuário logado.

4. **Token no storage, não no contexto apenas**
   - O contexto é volátil (recarregar a página o reinicia);
   - O storage garante persistência;
   - O contexto é a interface reativa para os componentes.

5. **Interceptor no Axios, não em cada chamada**
   - Centraliza o envio do Bearer;
   - Evita duplicação e esquecimento em novas requisições.

6. **`signIn` não navega**
   - Mantém o contexto independente de fluxo de UI;
   - Login decide ir para `/`; um futuro cadastro automático poderia decidir outro destino.

7. **Provider dentro do `<body>`**
   - Alinhado à documentação do Next 16;
   - Evita problemas de hidratação com `<body>` dentro de Client Component.

### 8.2 Cuidados e limitações

1. **A proteção da home é apenas client-side**
   - Qualquer pessoa pode alterar o `localStorage` ou chamar a API diretamente;
   - A segurança real está no `AuthGuard` do NestJS;
   - Para produção, o ideal é cookie `httpOnly` + validação no servidor.

2. **`localStorage` é vulnerável a XSS**
   - Scripts injetados podem ler o token;
   - Cookies `httpOnly`, `Secure` e `SameSite` reduziriam esse risco, mas exigiriam mudanças no backend.

3. **`jwtDecode` não valida assinatura**
   - Ele apenas lê o payload;
   - A validação criptográfica é feita no backend com `JWT_SECRET`;
   - O frontend usa a decodificação apenas para montar o estado da UI.

4. **Expiração do token**
   - A expiração é verificada na leitura do snapshot (login, recarga, mudança de storage);
   - Se o token expirar com a aplicação aberta, `isLoggedIn` não muda sozinho;
   - A próxima requisição protegida receberá `401`, mas não há interceptor de resposta para deslogar automaticamente.

5. **Token inválido pode permanecer no storage**
   - `getSessionSnapshot` não remove o token inválido; ele apenas marca a sessão como inválida;
   - O valor é sobrescrito no próximo login ou removido no logout;
   - Uma melhoria seria limpar tokens inválidos de forma controlada.

6. **JWT sem `name`**
   - O backend assina `{ sub, email }`;
   - Por isso o contexto não tem o nome do usuário;
   - Para exibir o nome, seria necessário incluir no JWT ou buscar `GET /auth/profile`.

7. **Toast de sucesso do cadastro + navegação**
   - O `ToastContainer` está na página de cadastro;
   - Ao navegar para `/login`, o toast pode desaparecer;
   - Melhoria: mensagem na tela de login via query param ou atraso na navegação.

8. **Formulários sem submit nativo**
   - Os botões usam `type="button"` e `onClick`;
   - Enter não envia o formulário;
   - A validação nativa do HTML não é executada (exceto a checagem manual implementada).

9. **Backend — pontos fora do escopo desta sessão**
   - `POST /users` retorna o usuário completo, incluindo o hash da senha; o `ResponseUserDto` existe, mas não é usado;
   - `PUT /users/:id` grava `password` sem hash;
   - Não há `ValidationPipe`/`class-validator`, então os DTOs não são validados;
   - `AuthController` usa `Record<string, any>` em vez de `SignInDto`;
   - `findOne` inexistente retorna `404`, quando o mais comum seria `401` para não revelar se o e-mail existe.

### 8.3 Possíveis melhorias

- Migrar a sessão para cookie `httpOnly` definido pelo backend;
- Criar `middleware.ts`/`proxy.ts` para proteger rotas no servidor (se a sessão for para cookie);
- Interceptor de resposta para `401` → `signOut()` automático;
- Refresh token e renovação de sessão;
- Buscar `GET /auth/profile` para obter nome/e-mail atualizados;
- Validação mais forte no cadastro (tamanho mínimo, complexidade, e-mail);
- Desabilitar visualmente os botões com CSS (`:disabled`);
- Centralizar `toastOptions` em um módulo compartilhado;
- Adicionar testes unitários do `decodeUserFromToken`, `getStoredToken`/`storeToken` e do fluxo de login;
- Corrigir o backend para não retornar hash de senha e para hashear senha no `PUT`;
- Adicionar feedback de carregamento na home em vez de `return null`;
- Implementar "Esqueceu a senha?" e a página de perfil.

---

## 9. Validações executadas

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` | Sem erros de TypeScript. |
| `npm run lint` | Sem erros e sem avisos. |
| `npm run build` | Build de produção concluído com sucesso. |

Rotas geradas no build:

```
┌ ○ /
├ ○ /_not-found
├ ○ /login
└ ○ /register
```

(`○` = página estática/prerenderizada.)

---

## 10. Checklist final

### Funciona

- [x] Cadastro gravando no PostgreSQL;
- [x] Hash de senha no cadastro (backend);
- [x] Login retornando JWT;
- [x] `signIn` decodificando e validando o token;
- [x] Sessão restaurada ao recarregar;
- [x] "Lembrar-me" escolhendo `localStorage` ou `sessionStorage`;
- [x] Bearer token automático nas requisições;
- [x] Home protegida no cliente;
- [x] Logout;
- [x] Toasts e estados de envio;
- [x] Redirecionamento após cadastro e login;
- [x] TypeScript, lint e build.

### Incompleto / não implementado

- [ ] Proteção server-side de rotas;
- [ ] Cookie `httpOnly`;
- [ ] Refresh token / renovação;
- [ ] Tratamento global de `401`;
- [ ] Recuperação de senha;
- [ ] Página de perfil;
- [ ] Nome do usuário no contexto;
- [ ] Validação robusta de formulário;
- [ ] Envio com Enter;
- [ ] Testes automatizados;
- [ ] Correções de segurança/validação no backend.

---

**Conclusão:** o frontend passou a ter um ciclo de autenticação completo e reutilizável, aproveitando a arquitetura existente (Context API + Axios + Next App Router). O fluxo cobre cadastro, login, persistência, restauração, requisições autenticadas, proteção de UI e logout. As pendências listadas são, em sua maioria, melhorias de segurança e robustez que exigem decisões de arquitetura (especialmente cookie `httpOnly` e validação no backend).
