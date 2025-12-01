import React, { useState, useMemo } from "react";
import {
  Bike,
  Navigation,
  DollarSign,
  MessageCircle,
  CheckCircle,
  Map,
  History,
  List,
  CreditCard,
  Banknote,
  Smartphone,
  Lock,
  Store,
} from "lucide-react";

export default function MotoboyApp({
  user,
  onBack,
  orders,
  updateOrder,
  themeStyle,
}) {
  const [tab, setTab] = useState("active"); // 'active' ou 'history'

  // --- LÓGICA DE DADOS ---
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  // Pedidos que estão prontos na loja (VISUALIZAÇÃO APENAS)
  const availableOrders = orders.filter((o) => o.status === "ready");

  // Pedidos que estão COMIGO agora (Em rota - Atribuídos pelo Admin)
  const myDeliveries = orders.filter(
    (o) => o.assignedTo === user.id && o.status === "delivering"
  );

  // Pedidos que EU entreguei HOJE
  const myHistoryToday = orders.filter(
    (o) =>
      o.assignedTo === user.id &&
      o.status === "delivered" &&
      o.timestamp >= startOfDay.getTime()
  );

  // Cálculo financeiro
  const earningsToday = myHistoryToday.reduce(
    (total, o) => total + (o.deliveryFee || 0),
    0
  );

  // --- FUNÇÃO DE ROTA INTELIGENTE ---
  const openSmartRoute = () => {
    if (myDeliveries.length === 0) return;
    const addresses = myDeliveries.map((o) => o.address);
    const destination = encodeURIComponent(addresses[addresses.length - 1]);
    const waypoints = addresses
      .slice(0, -1)
      .map((addr) => encodeURIComponent(addr))
      .join("|");

    let url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    if (waypoints) {
      url += `&waypoints=${waypoints}`;
    }

    window.open(url, "_blank");
  };

  // --- COMPONENTE DE CARTÃO DE PAGAMENTO ---
  const PaymentBadge = ({ order }) => {
    let icon = <DollarSign size={12} />;
    let color = "bg-zinc-700 text-zinc-300";
    let text = order.payment;

    if (order.payment === "Pix") {
      icon = <Smartphone size={12} />;
      color = "bg-green-900/50 text-green-400 border border-green-500/30";
    } else if (order.payment === "Cartão") {
      icon = <CreditCard size={12} />;
      color = "bg-blue-900/50 text-blue-400 border border-blue-500/30";
    } else if (order.payment === "Dinheiro") {
      icon = <Banknote size={12} />;
      color = "bg-yellow-900/50 text-yellow-500 border border-yellow-500/30";
      if (order.change) text += ` (Troco p/ ${order.change})`;
    }

    return (
      <span
        className={`px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1 w-fit ${color}`}
      >
        {icon} {text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-20">
      {/* CABEÇALHO */}
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-black flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Bike size={20} className="text-white" />
          </div>
          {user.name.split(" ")[0]}
        </h1>
        <button
          onClick={onBack}
          className="bg-zinc-800 border border-white/10 px-4 py-2 rounded text-xs font-bold text-red-400"
        >
          SAIR
        </button>
      </header>

      {/* DASHBOARD FINANCEIRO */}
      <div className="bg-zinc-900 border border-white/10 p-4 rounded-2xl mb-6 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 p-4 opacity-5">
          <DollarSign size={100} />
        </div>
        <div className="relative z-10 flex justify-between items-end">
          <div>
            <p className="text-zinc-400 text-xs font-bold uppercase mb-1">
              Ganho Hoje
            </p>
            <h2 className="text-3xl font-black text-green-500">
              R$ {earningsToday.toFixed(2)}
            </h2>
          </div>
          <div className="text-right">
            <p className="text-zinc-400 text-xs font-bold uppercase mb-1">
              Entregas
            </p>
            <h2 className="text-2xl font-bold text-white">
              {myHistoryToday.length}
            </h2>
          </div>
        </div>
      </div>

      {/* ABAS DE NAVEGAÇÃO */}
      <div className="flex bg-zinc-900 p-1 rounded-xl mb-4 border border-white/5">
        <button
          onClick={() => setTab("active")}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex justify-center items-center gap-2 transition ${
            tab === "active"
              ? "bg-zinc-800 text-white shadow-md"
              : "text-zinc-500"
          }`}
        >
          <List size={14} /> TAREFAS
        </button>
        <button
          onClick={() => setTab("history")}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex justify-center items-center gap-2 transition ${
            tab === "history"
              ? "bg-zinc-800 text-white shadow-md"
              : "text-zinc-500"
          }`}
        >
          <History size={14} /> HISTÓRICO
        </button>
      </div>

      {/* CONTEÚDO: ABA ATIVA */}
      {tab === "active" && (
        <div className="space-y-6 animate-in slide-in-from-left-5">
          {/* SEÇÃO: MINHAS ENTREGAS (EM ROTA) */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-blue-500 font-bold uppercase text-xs tracking-wider flex items-center gap-2">
                <Bike size={14} /> Na Bag ({myDeliveries.length})
              </h2>
              {/* BOTÃO ROTA INTELIGENTE */}
              {myDeliveries.length > 1 && (
                <button
                  onClick={openSmartRoute}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 transition"
                >
                  <Map size={12} /> CRIAR ROTA
                </button>
              )}
            </div>

            {myDeliveries.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-zinc-800 rounded-xl mb-6">
                <p className="text-zinc-500 text-xs font-bold">
                  Aguardando atribuição do Admin...
                </p>
              </div>
            )}

            <div className="space-y-3">
              {myDeliveries.map((o) => (
                <div
                  key={o.id}
                  className="bg-zinc-900 border-l-4 border-blue-500 p-4 rounded-xl shadow-lg relative"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-black text-lg text-white leading-none">
                        {o.customer}
                      </h3>
                      <span className="text-[10px] text-zinc-500">
                        #{o.id.split("-")[1]}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="block font-bold text-green-400">
                        Taxa: R${" "}
                        {o.deliveryFee ? o.deliveryFee.toFixed(2) : "0.00"}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        Total: R$ {o.total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-black/40 p-2 rounded mb-3 border border-white/5">
                    <p className="text-zinc-300 text-xs leading-relaxed">
                      {o.address}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <PaymentBadge order={o} />
                    {o.phone && (
                      <button
                        onClick={() =>
                          window.open(`https://wa.me/${o.phone}`, "_blank")
                        }
                        className="text-green-500 text-xs font-bold flex items-center gap-1 hover:underline"
                      >
                        <MessageCircle size={12} /> WhatsApp
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2 h-10">
                    <a
                      href={`https://waze.com/ul?q=${encodeURIComponent(
                        o.address
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-zinc-800 border border-white/10 rounded-lg text-zinc-300 flex-1 flex justify-center items-center hover:bg-zinc-700 transition"
                    >
                      <Navigation size={18} />
                    </a>
                    <button
                      onClick={() =>
                        updateOrder(o.id, {
                          status: "delivered",
                          archived: true,
                        })
                      }
                      className="bg-green-600 flex-[3] rounded-lg font-black text-sm hover:bg-green-500 transition shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                    >
                      FINALIZAR
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SEÇÃO: VISUALIZAÇÃO DOS PRONTOS (SEM AÇÃO) */}
          <div className="pt-4 border-t border-white/10">
            <h2 className="text-zinc-500 font-bold uppercase text-xs tracking-wider mb-3 flex items-center gap-2">
              <Store size={14} /> Prontos na Loja ({availableOrders.length})
            </h2>

            {availableOrders.length === 0 && (
              <p className="text-zinc-700 text-xs italic">
                Nenhum pedido pronto.
              </p>
            )}

            <div className="space-y-2 opacity-75">
              {availableOrders.map((o) => (
                <div
                  key={o.id}
                  className="bg-zinc-900/30 border border-white/5 p-3 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <div className="font-bold text-sm text-zinc-400">
                      {o.customer}
                    </div>
                    <div className="text-[10px] text-zinc-600">
                      #{o.id.split("-")[1]}
                    </div>
                  </div>
                  <span className="text-[10px] bg-zinc-800 text-zinc-500 px-2 py-1 rounded border border-white/5 flex items-center gap-1">
                    <Lock size={10} /> Aguardando Admin
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO: ABA HISTÓRICO */}
      {tab === "history" && (
        <div className="space-y-3 animate-in slide-in-from-right-5">
          <h2 className="text-zinc-500 font-bold uppercase text-xs tracking-wider mb-2">
            Entregues Hoje ({myHistoryToday.length})
          </h2>
          {myHistoryToday.length === 0 ? (
            <div className="text-center py-10 opacity-30">
              <History size={48} className="mx-auto mb-2" />
              <p>Nada por aqui ainda.</p>
            </div>
          ) : (
            myHistoryToday
              .sort((a, b) => b.timestamp - a.timestamp)
              .map((o) => (
                <div
                  key={o.id}
                  className="bg-zinc-900 p-3 rounded-lg border border-white/5 flex justify-between items-center opacity-60"
                >
                  <div>
                    <span className="text-[10px] text-zinc-500 block">
                      #{o.id.split("-")[1]} •{" "}
                      {new Date(o.timestamp).toLocaleTimeString().slice(0, 5)}
                    </span>
                    <span className="font-bold text-sm">{o.customer}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-green-500 font-bold text-xs">
                      + R$ {o.deliveryFee ? o.deliveryFee.toFixed(2) : "0.00"}
                    </span>
                  </div>
                </div>
              ))
          )}
        </div>
      )}
    </div>
  );
}
