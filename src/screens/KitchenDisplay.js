import React, { useEffect, useState, useRef } from "react";
import {
  Flame,
  Utensils,
  Clock,
  AlertTriangle,
  Award,
  CheckCircle,
  BellRing,
} from "lucide-react";

// --- COMPONENTE DE TIMER ---
function OrderTimer({ timestamp }) {
  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
    const calculateTime = () => {
      const now = Date.now();
      const diffMs = now - timestamp;
      setMinutes(Math.floor(diffMs / 60000));
    };
    calculateTime();
    const interval = setInterval(calculateTime, 30000);
    return () => clearInterval(interval);
  }, [timestamp]);

  let colorClass = "bg-green-500/20 text-green-500 border-green-500/50";
  let statusText = "No Prazo";
  let Icon = Clock;

  if (minutes >= 15) {
    colorClass = "bg-yellow-500/20 text-yellow-500 border-yellow-500/50";
    statusText = "Atenção";
  }
  if (minutes >= 25) {
    colorClass = "bg-red-500/20 text-red-500 border-red-500/50 animate-pulse";
    statusText = "ATRASADO";
    Icon = AlertTriangle;
  }

  return (
    <div
      className={`flex items-center justify-between px-3 py-2 rounded-lg border mb-3 ${colorClass}`}
    >
      <div className="flex items-center gap-2">
        <Icon size={16} />
        <span className="font-bold text-sm">{statusText}</span>
      </div>
      <span className="font-black text-xl font-mono">{minutes} min</span>
    </div>
  );
}

// --- TELA DA COZINHA ---
export default function KitchenDisplay({ onBack, orders, updateOrder }) {
  const [audioAllowed, setAudioAllowed] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now()); // Estado para forçar atualização do "Blink"
  const previousCountRef = useRef(0);

  // Filtra pedidos em preparo
  const preparing = orders.filter((o) => o.status === "preparing");

  // Atualiza o relógio interno a cada 10 segundos para checar o que é "Novo"
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  // --- LÓGICA DA META DO CHAPEIRO ---
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const finishedToday = orders.filter(
    (o) =>
      (o.status === "ready" || o.status === "delivered") &&
      o.timestamp >= startOfDay.getTime()
  );

  const totalItemsMade = finishedToday.reduce((total, order) => {
    return total + order.items.reduce((sum, item) => sum + item.qtd, 0);
  }, 0);

  const bonusAmount = Math.floor(totalItemsMade / 50) * 20;
  const nextGoal = (Math.floor(totalItemsMade / 50) + 1) * 50;
  const progress = totalItemsMade % 50;

  // --- EFEITO SONORO ---
  useEffect(() => {
    if (preparing.length > previousCountRef.current) {
      if (audioAllowed) {
        playSound();
      }
    }
    previousCountRef.current = preparing.length;
  }, [preparing.length, audioAllowed]);

  const playSound = () => {
    try {
      const audio = new Audio(
        "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
      );
      audio.volume = 1.0;
      audio.play().catch((e) => console.log("Som bloqueado"));
    } catch (e) {}
  };

  return (
    <div
      className="min-h-screen bg-black text-white p-4"
      onClick={() => setAudioAllowed(true)}
    >
      {/* HEADER */}
      <header className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
        <h1 className="text-2xl font-black text-orange-500 flex items-center gap-2">
          <Flame /> COZINHA
          <span className="bg-orange-500 text-black text-sm px-2 rounded-full">
            {preparing.length}
          </span>
        </h1>

        <div className="flex gap-2">
          {!audioAllowed && (
            <span className="text-[10px] text-red-500 animate-pulse self-center mr-2 font-bold uppercase border border-red-500/50 px-2 py-1 rounded">
              🔇 Clique na tela p/ ativar som
            </span>
          )}
          <button
            onClick={onBack}
            className="bg-zinc-800 px-4 py-2 rounded text-xs font-bold"
          >
            SAIR
          </button>
        </div>
      </header>

      {/* --- PLACAR META --- */}
      <div className="bg-zinc-900 border border-white/10 rounded-xl p-4 mb-6 flex justify-between items-center shadow-lg relative overflow-hidden">
        <div
          className="absolute left-0 top-0 bottom-0 bg-green-600/10 transition-all duration-1000"
          style={{ width: `${(progress / 50) * 100}%` }}
        ></div>
        <div className="z-10 flex items-center gap-4">
          <div className="bg-yellow-500/20 p-3 rounded-full text-yellow-500">
            <Award size={32} />
          </div>
          <div>
            <h3 className="text-zinc-400 text-xs font-bold uppercase">
              Produção Hoje
            </h3>
            <div className="text-2xl font-black text-white">
              {totalItemsMade}{" "}
              <span className="text-sm text-zinc-500 font-normal">
                / {nextGoal}
              </span>
            </div>
          </div>
        </div>
        <div className="z-10 text-right">
          <h3 className="text-green-500 text-xs font-bold uppercase">
            Bônus Acumulado
          </h3>
          <div className="text-3xl font-black text-green-400">
            R$ {bonusAmount.toFixed(2)}
          </div>
          <div className="text-[10px] text-zinc-500">
            Faltam {50 - progress} p/ +R$20
          </div>
        </div>
      </div>

      {/* --- GRID DE PEDIDOS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {preparing.length === 0 && (
          <div className="col-span-full text-center py-20 opacity-50">
            <Utensils size={64} className="mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Tudo limpo, chef!</h2>
          </div>
        )}

        {preparing.map((o) => {
          // Lógica do Pedido Novo (< 1 minuto)
          const isNew = currentTime - o.timestamp < 60000;

          return (
            <div
              key={o.id}
              className={`p-4 rounded-lg shadow-xl relative animate-in slide-in-from-bottom-2 transition-all duration-500
                ${
                  isNew
                    ? "bg-zinc-800 border-4 border-yellow-400 animate-pulse shadow-yellow-500/20" // Estilo PISCANDO
                    : "bg-zinc-900 border-l-8 border-orange-500" // Estilo NORMAL
                }
              `}
            >
              {isNew && (
                <div className="absolute -top-3 -right-2 bg-yellow-400 text-black font-black text-[10px] px-2 py-1 rounded shadow-lg flex items-center gap-1 animate-bounce">
                  <BellRing size={12} /> NOVO
                </div>
              )}

              <div className="flex justify-between items-start mb-2">
                <span className="text-xl font-black">
                  #{o.id.split("-")[1]}
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  {new Date(o.timestamp).toLocaleTimeString().slice(0, 5)}
                </span>
              </div>

              <OrderTimer timestamp={o.timestamp} />

              <div className="text-sm font-bold mb-4 border-b border-white/10 pb-2 truncate">
                {o.customer}
              </div>

              <div className="space-y-2 mb-6">
                {o.items.map((i, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-1 bg-black/20 p-2 rounded border border-white/5"
                  >
                    <div className="flex gap-2 text-lg">
                      <span className="font-black text-yellow-500">
                        {i.qtd}x
                      </span>
                      <span className="font-bold leading-tight">{i.name}</span>
                    </div>
                    {i.details && (
                      <div className="text-sm text-red-400 font-bold ml-6 bg-red-900/10 p-1 rounded">
                        ⚠️ {i.details}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={() => updateOrder(o.id, { status: "ready" })}
                className={`w-full py-4 rounded-lg font-black text-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2
                  ${
                    isNew
                      ? "bg-yellow-500 text-black hover:bg-yellow-400"
                      : "bg-green-600 text-white hover:bg-green-500"
                  }
                `}
              >
                <CheckCircle size={24} />{" "}
                {isNew ? "ACEITAR / PRONTO" : "PRONTO!"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
