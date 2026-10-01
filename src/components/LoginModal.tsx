import React, { useState } from 'react';
import { 
  X, 
  Key, 
  ShieldCheck, 
  AlertTriangle, 
  Lock, 
  Mail, 
  Terminal, 
  Check, 
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  loginWithGoogle, 
  loginWithEmail, 
  registerWithEmail, 
  loginOrRegisterWithEmail 
} from '../firebase';
import { DedsecSkullIcon } from './DedsecAscii';
import { playCyberSound } from '../utils/audio';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  onLoginSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  soundEnabled,
  onLoginSuccess
}) => {
  const [authMethod, setAuthMethod] = useState<'password' | 'google'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showFirebaseConsoleHelp, setShowFirebaseConsoleHelp] = useState(false);

  if (!isOpen) return null;

  const handleEmailAuth = async (action: 'auto' | 'login' | 'register') => {
    if (!email.trim() || !password) {
      setErrorMsg('Informe o email e a senha para acessar.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    setShowFirebaseConsoleHelp(false);
    playCyberSound('terminal', soundEnabled);

    try {
      if (action === 'login') {
        await loginWithEmail(email, password);
        setSuccessMsg(`Autenticado com sucesso!`);
      } else if (action === 'register') {
        await registerWithEmail(email, password);
        setSuccessMsg(`Conta registrada no Firebase com sucesso!`);
      } else {
        // Auto: try login, if not found try register
        const res = await loginOrRegisterWithEmail(email, password);
        setSuccessMsg(
          res.created 
            ? `Credenciais cadastradas no Firebase e sessão iniciada!` 
            : `Sessão iniciada com sucesso!`
        );
      }

      playCyberSound('grant', soundEnabled);
      setTimeout(() => {
        onLoginSuccess();
        onClose();
      }, 700);
    } catch (err: unknown) {
      console.error(err);
      playCyberSound('deny', soundEnabled);
      const fbErr = err as { code?: string; message?: string };

      if (fbErr?.code === 'auth/operation-not-allowed') {
        setShowFirebaseConsoleHelp(true);
        setErrorMsg('O provedor de autenticação por Email/Senha não está ativado no seu projeto Firebase.');
      } else if (fbErr?.code === 'auth/configuration-not-found') {
        setShowFirebaseConsoleHelp(true);
        setErrorMsg('O Firebase Authentication ainda não foi inicializado no console. Acesse Authentication e clique em "Começar" (Get Started).');
      } else if (fbErr?.code === 'auth/unauthorized-domain') {
        setErrorMsg(`Domínio não autorizado: adicione "${typeof window !== 'undefined' ? window.location.hostname : ''}" em Domínios Autorizados no console Firebase.`);
      } else if (fbErr?.code === 'auth/email-already-in-use') {
        setErrorMsg('Este email já está cadastrado no Firebase. Use a opção "Entrar com Senha".');
      } else if (fbErr?.code === 'auth/wrong-password' || fbErr?.code === 'auth/invalid-credential') {
        setErrorMsg('Senha incorreta ou credenciais inválidas. Verifique os dados digitados.');
      } else if (fbErr?.code === 'auth/weak-password') {
        setErrorMsg('A senha deve ter pelo menos 6 caracteres.');
      } else if (fbErr?.code === 'auth/invalid-email') {
        setErrorMsg('Formato de email inválido.');
      } else {
        setErrorMsg(fbErr?.message || (err instanceof Error ? err.message : 'Falha na autenticação Firebase.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg('');
    setShowFirebaseConsoleHelp(false);
    playCyberSound('terminal', soundEnabled);

    try {
      await loginWithGoogle();
      playCyberSound('grant', soundEnabled);
      onLoginSuccess();
      onClose();
    } catch (err: unknown) {
      console.error(err);
      playCyberSound('deny', soundEnabled);
      const fbErr = err as { code?: string; message?: string };
      if (fbErr?.code === 'auth/unauthorized-domain') {
        const host = typeof window !== 'undefined' ? window.location.hostname : '';
        setErrorMsg(`Domínio não autorizado: adicione "${host}" em Authentication > Settings > Domínios autorizados no Firebase.`);
      } else {
        setErrorMsg(
          err instanceof Error ? err.message : 'Falha na autenticação Google com Firebase.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      
      <div className="relative w-full max-w-md my-6 border-2 border-[var(--dedsec-primary)] bg-[var(--dedsec-surface)] clip-cyber-corner p-6 shadow-[0_0_40px_rgba(0,240,255,0.25)] space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2.5 text-white">
            <div className="p-1.5 bg-black border border-[var(--dedsec-primary)] text-[var(--dedsec-primary)]">
              <DedsecSkullIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-sm tracking-wider">
                AUTENTICAÇÃO FIREBASE // DEDSEC
              </h2>
              <p className="text-[10px] font-mono text-gray-400">
                ACESSO RESTRITO A OPERADORES // ROOT & ADMIN
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playCyberSound('click', soundEnabled);
              onClose();
            }}
            className="p-1 text-gray-400 hover:text-white border border-gray-800 hover:border-gray-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Auth Method Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 border border-gray-800 bg-black/60 p-1">
          <button
            type="button"
            onClick={() => {
              setAuthMethod('password');
              playCyberSound('click', soundEnabled);
            }}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-3 font-mono text-xs font-bold transition-all cursor-pointer ${
              authMethod === 'password'
                ? 'bg-[var(--dedsec-primary)] text-black shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>EMAIL & SENHA</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMethod('google');
              playCyberSound('click', soundEnabled);
            }}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-3 font-mono text-xs font-bold transition-all cursor-pointer ${
              authMethod === 'google'
                ? 'bg-[var(--dedsec-primary)] text-black shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
            </svg>
            <span>LOGIN GOOGLE</span>
          </button>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="p-3 bg-red-950/70 border border-red-600 text-red-300 text-xs font-mono flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span className="leading-tight">{errorMsg}</span>
          </div>
        )}

        {/* Success Message */}
        {successMsg && (
          <div className="p-3 bg-green-950/70 border border-green-500 text-green-300 text-xs font-mono flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400 shrink-0" />
            <span className="leading-tight">{successMsg}</span>
          </div>
        )}

        {/* Guide when Email/Password is not enabled in Firebase Console */}
        {showFirebaseConsoleHelp && (
          <div className="p-3.5 bg-amber-950/40 border border-amber-600 text-amber-200 text-xs font-mono space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-400">
              <Terminal className="w-4 h-4" />
              <span>COMO HABILITAR EMAIL/SENHA NO FIREBASE CONSOLE:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-gray-300 leading-relaxed">
              <li>Acesse o <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-[var(--dedsec-primary)] underline font-bold">Firebase Console</a></li>
              <li>Selecione o projeto do seu aplicativo</li>
              <li>No menu lateral, vá em <strong>Build &gt; Authentication</strong></li>
              <li>Clique na aba <strong>Sign-in method</strong></li>
              <li>Em <em>Provedores nativos</em>, clique em <strong>E-mail/senha</strong></li>
              <li>Ative o botão <strong>Ativar (Permitir que os usuários façam login usando o endereço de e-mail e a senha)</strong></li>
              <li>Clique em <strong>Salvar</strong></li>
            </ol>
          </div>
        )}

        {authMethod === 'password' ? (
          /* EMAIL & PASSWORD AUTH FORM */
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleEmailAuth('auto');
            }} 
            className="space-y-4"
          >
            {/* Email Input */}
            <div className="space-y-1">
              <label className="text-xs font-mono text-gray-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[var(--dedsec-primary)]" />
                <span>EMAIL DO OPERADOR:</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operador@dedsec.org"
                autoComplete="email"
                className="w-full px-3 py-2 bg-black border border-gray-700 text-white font-mono text-xs focus:border-[var(--dedsec-primary)] focus:outline-none"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="text-xs font-mono text-gray-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[var(--dedsec-primary)]" />
                <span>SENHA:</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full px-3 py-2 pr-10 bg-black border border-gray-700 text-white font-mono text-xs focus:border-[var(--dedsec-primary)] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[var(--dedsec-primary)] text-black font-display font-bold text-sm tracking-wider hover:bg-cyan-300 transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.3)] clip-cyber-badge"
            >
              <Key className="w-4 h-4" />
              <span>{isLoading ? 'CONECTANDO AO FIREBASE...' : 'ENTRAR NO SISTEMA'}</span>
            </button>

            {/* Secondary actions: Specific Login or Register */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleEmailAuth('login')}
                disabled={isLoading}
                className="py-2 px-3 bg-black border border-gray-700 hover:border-white text-gray-300 hover:text-white font-mono text-xs transition-all cursor-pointer disabled:opacity-50 text-center"
                title="Fazer login com credenciais existentes"
              >
                Entrar com Senha
              </button>

              <button
                type="button"
                onClick={() => handleEmailAuth('register')}
                disabled={isLoading}
                className="py-2 px-3 bg-black border border-[var(--dedsec-secondary)]/50 hover:border-[var(--dedsec-secondary)] text-[var(--dedsec-secondary)] font-mono text-xs transition-all cursor-pointer disabled:opacity-50 text-center font-bold"
                title="Cadastrar nova conta com este email e senha no Firebase"
              >
                Cadastrar no Firebase
              </button>
            </div>

          </form>
        ) : (
          /* GOOGLE OAUTH FORM */
          <div className="space-y-4">
            <div className="p-3 bg-black/60 border border-gray-800 space-y-2 text-xs font-mono">
              <div className="flex items-center gap-2 text-[var(--dedsec-secondary)]">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-bold">CONEXÃO SEGURA GOOGLE OAUTH</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Faça login com sua conta Google autorizada para autenticar no sistema.
              </p>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-black border-2 border-[var(--dedsec-primary)] text-white hover:bg-[var(--dedsec-primary)] hover:text-black font-display font-bold text-sm tracking-wider transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(0,240,255,0.15)] group cursor-pointer"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoading ? 'CONECTANDO AO GOOGLE...' : 'ENTRAR COM CONTA GOOGLE'}</span>
            </button>
          </div>
        )}

        {/* Footer info */}
        <div className="text-center pt-1 border-t border-gray-800">
          <span className="text-[10px] font-mono text-gray-500">
            ctOS 2.0 ENCRYPTED TUNNEL • PROTOCOLO SHA-256 / FIREBASE AUTH
          </span>
        </div>

      </div>

    </div>
  );
};
