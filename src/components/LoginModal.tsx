import React, { useState } from 'react';
import { X, Key, ShieldCheck, AlertTriangle } from 'lucide-react';
import { loginWithGoogle } from '../firebase';
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
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg('');
    playCyberSound('terminal', soundEnabled);

    try {
      await loginWithGoogle();
      playCyberSound('grant', soundEnabled);
      onLoginSuccess();
      onClose();
    } catch (err: unknown) {
      console.error(err);
      playCyberSound('deny', soundEnabled);
      setErrorMsg(
        err instanceof Error ? err.message : 'Falha na autenticação Google com Firebase.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      
      <div className="relative w-full max-w-md border-2 border-[var(--dedsec-primary)] bg-[var(--dedsec-surface)] clip-cyber-corner p-6 shadow-[0_0_40px_rgba(0,240,255,0.25)] space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2 text-white">
            <div className="p-1 bg-black border border-[var(--dedsec-primary)] text-[var(--dedsec-primary)]">
              <DedsecSkullIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-sm tracking-wider">
                AUTENTICAÇÃO FIREBASE // DEDSEC
              </h2>
              <p className="text-[10px] font-mono text-gray-400">
                ACESSO RESTRITO A OPERADORES AUTORIZADOS
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playCyberSound('click', soundEnabled);
              onClose();
            }}
            className="p-1 text-gray-400 hover:text-white border border-gray-800 hover:border-gray-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info Box */}
        <div className="p-3 bg-black/60 border border-gray-800 space-y-2 text-xs font-mono">
          <div className="flex items-center gap-2 text-[var(--dedsec-secondary)]">
            <ShieldCheck className="w-4 h-4" />
            <span className="font-bold">CONEXÃO SEGURA FIREBASE</span>
          </div>
          <p className="text-gray-400 leading-relaxed">
            Faça login com sua conta Google autorizada. O operador root e administradores têm acesso completo para publicar transmissões, editar temas e gerenciar a rede.
          </p>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="p-3 bg-red-950/60 border border-red-600 text-red-300 text-xs font-mono flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span className="leading-tight">{errorMsg}</span>
          </div>
        )}

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-black border-2 border-[var(--dedsec-primary)] text-white hover:bg-[var(--dedsec-primary)] hover:text-black font-display font-bold text-sm tracking-wider transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(0,240,255,0.15)] group"
        >
          {/* Google "G" SVG */}
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

        {/* Footer info */}
        <div className="text-center">
          <span className="text-[10px] font-mono text-gray-500">
            ctOS 2.0 ENCRYPTED TUNNEL • PROTOCOLO OAUTH 2.0
          </span>
        </div>

      </div>

    </div>
  );
};
