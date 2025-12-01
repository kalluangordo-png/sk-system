import React, { useState, useEffect } from "react";
import { ArrowRight, Clock, Lock, Utensils, Bike } from "lucide-react";

export default function LoginScreen({
  setView,
  setCurrentUser,
  appConfig,
  motoboys,
  themeStyle,
  textThemeStyle,
}) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  const SENHA_ADMIN = "sk2024";

  // Proteção contra falha no carregamento da config
  const config = appConfig || {
    openHour: 18,
    closeHour: 23,
    forceClose: false,
    storeName: "SK System",
  };
  const currentHour = new Date().getHours();
  const isOpen =
    !config.forceClose &&
    currentHour >= config.openHour &&
    currentHour < config.closeHour;

  useEffect(() => {
    if (login.trim().toLowerCase() === "admin") {
      setShowPasswordInput(true);
    } else {
      setShowPasswordInput(false);
      setPassword("");
    }
  }, [login]);

  // --- LOGIN PADRÃO (Botão Entrar) ---
  const handleLogin = () => {
    const term = login.trim().toLowerCase();

    if (term === "admin") {
      if (password === SENHA_ADMIN) {
        setCurrentUser({ name: "Dono", role: "admin" });
        setView("admin");
      } else {
        alert("Senha incorreta!");
      }
      return;
    }
    performUserLogin(term);
  };

  // --- LOGIN RÁPIDO (Clicou na lista, entrou) ---
  const handleQuickLogin = (term) => {
    setLogin(term); // Preenche visualmente
    performUserLogin(term); // Executa a ação
  };

  // Lógica compartilhada de validação
  const performUserLogin = (term) => {
    if (term === "cozinha") {
      setCurrentUser({ name: "Cozinha", role: "kitchen" });
      setView("kitchen");
      return;
    }

    const moto = motoboys.find((m) => m.login === term);
    if (moto) {
      setCurrentUser({ ...moto, role: "motoboy" });
      setView("motoboy");
    } else {
      // Se não for admin (que já foi tratado), mostra erro
      if (term !== "admin") alert("Usuário não encontrado.");
    }
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-6 py-10">
      <div className="w-full max-w-sm bg-neutral-900 border border-white/10 rounded-3xl p-8 shadow-2xl text-center relative">
        {/* Logo e Status */}
        <div
          style={themeStyle}
          className="w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] border-4 border-zinc-800"
        >
          <span className="font-black text-4xl text-black tracking-tighter">
            SK
          </span>
        </div>
        <h1 className="text-2xl font-black text-white mb-1">
          {config.storeName}
        </h1>

        <div
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold border mb-6 ${
            isOpen
              ? "bg-green-500/20 text-green-400 border-green-500/50"
              : "bg-red-500/20 text-red-400 border-red-500/50"
          }`}
        >
          {isOpen ? (
            <>
              <Clock size={10} /> ABERTO AGORA
            </>
          ) : (
            <>
              <Lock size={10} /> FECHADO • Abre às {config.openHour}h
            </>
          )}
        </div>

        <div className="space-y-6">
          {/* Botão Cliente */}
          <button
            onClick={() => setView("customer")}
            style={themeStyle}
            className="w-full text-black font-black py-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 group text-lg hover:brightness-110 active:scale-95"
          >
            QUERO PEDIR <ArrowRight size={20} />
          </button>

          {/* Área de Login */}
          <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 text-left">
            <label className="text-[10px] text-zinc-500 uppercase font-bold mb-2 block">
              Área da Equipe
            </label>

            {/* Input Manual */}
            <div className="space-y-3">
              <input
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="Login (admin, cozinha...)"
                className="w-full bg-zinc-800 p-3 rounded text-sm text-white border border-white/10 outline-none focus:border-white/30 transition"
              />

              {showPasswordInput && (
                <div className="animate-in slide-in-from-top-2">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Senha Admin"
                    className="w-full bg-zinc-800 p-3 rounded text-sm text-white border border-red-500/50 outline-none focus:border-red-500 transition"
                  />
                  <p className="text-[10px] text-zinc-600 mt-1 text-right">
                    Senha: sk2024
                  </p>
                </div>
              )}

              <button
                onClick={handleLogin}
                className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-3 rounded transition flex justify-center items-center gap-2"
              >
                ENTRAR <ArrowRight size={14} />
              </button>
            </div>

            {/* Atalhos Rápidos (Agora clicáveis!) */}
            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-[10px] text-zinc-500 mb-2 font-bold">
                Acesso Rápido:
              </p>
              <div className="flex flex-wrap gap-2">
                {/* Botão Cozinha */}
                <button
                  onClick={() => handleQuickLogin("cozinha")}
                  className="flex items-center gap-1 cursor-pointer text-[10px] bg-orange-900/30 text-orange-400 border border-orange-500/30 px-3 py-2 rounded hover:bg-orange-900/50 transition font-bold"
                >
                  <Utensils size={12} /> Cozinha
                </button>

                {/* Botões Motoboys */}
                {motoboys &&
                  motoboys.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleQuickLogin(m.login)}
                      className="flex items-center gap-1 cursor-pointer text-[10px] bg-blue-900/30 text-blue-400 border border-blue-500/30 px-3 py-2 rounded hover:bg-blue-900/50 transition font-bold"
                    >
                      <Bike size={12} /> {m.name.split(" ")[0]}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
