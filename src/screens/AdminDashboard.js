import React, { useState, useMemo } from "react";
import {
  Lock,
  Trash2,
  Printer,
  Download,
  Plus,
  Upload,
  Edit,
  Palette,
  Clock,
  Power,
  Map,
  Bike,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  MessageCircle,
  Smartphone,
  Banknote,
  CreditCard,
  Search,
  CheckCircle,
  Flag,
  ArrowUp,
  ArrowDown,
  Filter,
} from "lucide-react";

// Função utilitária para compressão de imagem
const compressImage = (file, callback) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (event) => {
    const img = new Image();
    img.src = event.target.result;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const maxWidth = 800;
      const scaleSize = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * scaleSize;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      callback(canvas.toDataURL("image/jpeg", 0.7));
    };
  };
};

export default function AdminDashboard({
  onBack,
  orders,
  updateOrder,
  deleteOrder,
  menuItems,
  updateMenuItem,
  addMenuItem,
  deleteMenuItem,
  bairros,
  setBairros,
  appConfig,
  saveGlobalSettings,
  motoboys,
  themeStyle,
  textThemeStyle,
  hardResetMenu,
  simulateIncomingOrder,
}) {
  const [tab, setTab] = useState("orders");
  const [menuSearch, setMenuSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("TODOS"); // Novo filtro

  // Estados para formulários
  const [newBairro, setNewBairro] = useState({ nome: "", taxa: "" });
  const [newMoto, setNewMoto] = useState({ name: "", login: "" });
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [prodForm, setProdForm] = useState({
    name: "",
    category: "LINHA SMASH",
    priceSolo: "",
    priceCombo: "",
    description: "",
    image: "",
    stock: 100,
  });

  // --- LÓGICA DO DASHBOARD (REAL TIME) ---
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const todayOrders = orders.filter((o) => o.timestamp >= startOfDay.getTime());

  const totalRevenue = todayOrders
    .filter((o) => o.status === "delivered")
    .reduce((acc, o) => acc + o.total, 0);
  const totalOrdersCount = todayOrders.length;
  const avgTicket = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

  const prep = orders.filter((o) => o.status === "preparing");
  const ready = orders.filter((o) => o.status === "ready");
  const delivering = orders.filter((o) => o.status === "delivering");

  const deliveredToday = orders
    .filter(
      (o) => o.status === "delivered" && o.timestamp >= startOfDay.getTime()
    )
    .sort((a, b) => b.timestamp - a.timestamp);

  // --- ORDENAÇÃO DO MENU ---
  // Ordena os itens baseados no campo 'order' (se não existir, usa 0)
  const sortedMenu = useMemo(() => {
    return [...menuItems].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [menuItems]);

  const filteredMenu = sortedMenu.filter((i) => {
    const matchesSearch = i.name
      .toLowerCase()
      .includes(menuSearch.toLowerCase());
    const matchesCategory =
      selectedCategory === "TODOS" || i.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Função para Mover Item
  const moveItem = (index, direction) => {
    // Só permite mover se estiver filtrado por categoria (para evitar bagunça)
    if (selectedCategory === "TODOS" && menuSearch === "") {
      // Se estiver vendo tudo, move na lista global
    }

    const itemToMove = filteredMenu[index];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    // Verifica limites
    if (targetIndex < 0 || targetIndex >= filteredMenu.length) return;

    const itemTarget = filteredMenu[targetIndex];

    // Troca as ordens
    // Se o item não tem ordem, definimos agora baseado no timestamp para garantir unicidade
    const order1 = itemToMove.order || Date.now();
    const order2 = itemTarget.order || Date.now() + 1;

    // Atualiza no Firebase (inverte os valores)
    updateMenuItem(itemToMove.id, { order: order2 });
    updateMenuItem(itemTarget.id, { order: order1 });
  };

  // --- IMPRESSÃO ---
  const printOrder = (order) => {
    const w = window.open("", "", "width=350,height=600");
    w.document.write(`
      <html>
        <head>
          <title>Imprimir Pedido #${order.id.split("-")[1]}</title>
          <style>
            body { font-family: 'Courier New', monospace; font-size: 12px; width: 300px; margin: 0; padding: 10px; color: #000; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .line { border-bottom: 1px dashed #000; margin: 8px 0; }
            .row { display: flex; justify-content: space-between; }
            .text-lg { font-size: 16px; }
            .text-xl { font-size: 20px; }
            .mb { margin-bottom: 5px; }
          </style>
        </head>
        <body>
          <div class="center bold text-xl">${appConfig.storeName.toUpperCase()}</div>
          <div class="center mb">${new Date(
            order.timestamp
          ).toLocaleDateString()} - ${new Date(order.timestamp)
      .toLocaleTimeString()
      .slice(0, 5)}</div>
          <div class="line"></div>
          <div class="center bold text-lg">PEDIDO #${
            order.id.split("-")[1]
          }</div>
          <div class="line"></div>
          <div class="bold">CLIENTE:</div>
          <div>${order.customer}</div>
          <div>${order.phone || ""}</div>
          <div class="line"></div>
          <div class="bold mb">ITENS:</div>
          ${order.items
            .map(
              (i) => `
            <div class="row">
              <span class="bold" style="width: 20px">${i.qtd}x</span>
              <span style="flex: 1">${i.name}</span>
              <span class="bold">${(i.price * i.qtd).toFixed(2)}</span>
            </div>
            ${
              i.details
                ? `<div style="font-size:10px; margin-left:25px; margin-bottom: 4px; color: #444">(${i.details})</div>`
                : ""
            }
          `
            )
            .join("")}
          <div class="line"></div>
          <div class="row"><span>Subtotal:</span><span>R$ ${(
            order.total - (order.deliveryFee || 0)
          ).toFixed(2)}</span></div>
          <div class="row"><span>Taxa Entrega:</span><span>R$ ${
            order.deliveryFee?.toFixed(2) || "0.00"
          }</span></div>
          <div class="row bold text-lg" style="margin-top: 5px"><span>TOTAL:</span><span>R$ ${order.total.toFixed(
            2
          )}</span></div>
          <div class="line"></div>
          <div class="bold">PAGAMENTO:</div>
          <div>${order.payment.toUpperCase()} ${
      order.change ? `(Troco p/ ${order.change})` : ""
    }</div>
          <div class="line"></div>
          <div class="bold">ENTREGA:</div>
          <div style="font-size: 11px">${order.address}</div>
          <div class="line"></div>
          <div class="center" style="margin-top: 20px">*** Obrigado pela preferência! ***</div>
        </body>
      </html>
    `);
    w.print();
  };

  // --- DOWNLOAD CSV ---
  const downloadReport = () => {
    const headers = "ID,Data,Cliente,Total,Pagamento\n";
    const rows = deliveredToday
      .map(
        (o) =>
          `${o.id},${new Date(o.timestamp).toLocaleDateString()},${
            o.customer
          },${o.total},${o.payment}`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "relatorio_vendas.csv";
    a.click();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file)
      compressImage(file, (base64) =>
        setProdForm({ ...prodForm, image: base64 })
      );
  };

  // Config Actions
  const addBairro = () => {
    if (!newBairro.nome) return;
    saveGlobalSettings({
      bairros: [...bairros, { ...newBairro, taxa: parseFloat(newBairro.taxa) }],
    });
    setNewBairro({ nome: "", taxa: "" });
  };
  const removeBairro = (nome) =>
    saveGlobalSettings({ bairros: bairros.filter((b) => b.nome !== nome) });

  const addMotoboy = () => {
    if (!newMoto.name) return;
    saveGlobalSettings({
      motoboys: [...motoboys, { ...newMoto, id: Date.now() }],
    });
    setNewMoto({ name: "", login: "" });
  };
  const removeMotoboy = (id) =>
    saveGlobalSettings({ motoboys: motoboys.filter((m) => m.id !== id) });

  // Product Actions
  const openNewProduct = () => {
    setEditingId(null);
    setProdForm({
      name: "",
      category: "LINHA SMASH",
      priceSolo: "",
      priceCombo: "",
      description: "",
      image: "",
      stock: 100,
      order: Date.now(),
    });
    setShowProductForm(true);
  };
  const openEditProduct = (item) => {
    setEditingId(item.id);
    setProdForm({
      ...item,
      priceSolo: item.priceSolo || "",
      priceCombo: item.priceCombo || "",
      stock: item.stock || 0,
    });
    setShowProductForm(true);
  };
  const handleSaveProduct = () => {
    const payload = {
      ...prodForm,
      priceSolo: parseFloat(prodForm.priceSolo),
      priceCombo: prodForm.priceCombo ? parseFloat(prodForm.priceCombo) : 0,
      stock: parseInt(prodForm.stock),
      available: true,
      rating: 5.0,
      options: editingId
        ? menuItems.find((i) => i.id === editingId).options || []
        : [],
      order: prodForm.order || Date.now(), // Garante ordem
    };
    if (editingId) updateMenuItem(editingId, payload);
    else addMenuItem(payload);
    setShowProductForm(false);
  };

  const PaymentIcon = ({ payment }) => {
    if (payment === "Pix")
      return (
        <span className="flex items-center gap-1 text-green-400 bg-green-900/30 px-2 py-0.5 rounded text-[10px]">
          <Smartphone size={10} /> PIX
        </span>
      );
    if (payment === "Cartão")
      return (
        <span className="flex items-center gap-1 text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded text-[10px]">
          <CreditCard size={10} /> CARTÃO
        </span>
      );
    return (
      <span className="flex items-center gap-1 text-yellow-500 bg-yellow-900/30 px-2 py-0.5 rounded text-[10px]">
        <Banknote size={10} /> DINHEIRO
      </span>
    );
  };

  const MetricCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-zinc-900 p-4 rounded-xl border border-white/5 flex items-center gap-4 shadow-lg">
      <div
        className={`p-3 rounded-full bg-opacity-20 ${color.replace(
          "text-",
          "bg-"
        )}`}
      >
        <Icon className={color} size={24} />
      </div>
      <div>
        <p className="text-zinc-500 text-[10px] font-bold uppercase">{title}</p>
        <p className="text-xl font-black text-white">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 pt-16 min-h-screen">
      <header className="fixed top-0 left-0 right-0 bg-neutral-900/90 backdrop-blur border-b border-white/10 p-4 flex justify-between items-center z-40 mt-7">
        <h1
          style={textThemeStyle}
          className="font-bold flex items-center gap-2"
        >
          <Lock size={16} /> PAINEL SK
        </h1>
        <button
          onClick={onBack}
          className="text-xs text-red-500 border border-red-900/50 hover:bg-red-900/20 p-1 px-3 rounded transition"
        >
          SAIR
        </button>
      </header>

      <div className="flex gap-2 mt-4 mb-4 overflow-x-auto pb-2 scrollbar-hide">
        {["orders", "reports", "menu", "config"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap uppercase transition ${
              tab === t
                ? "bg-zinc-200 text-black shadow-lg scale-105"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            {t === "orders"
              ? "Pedidos"
              : t === "reports"
              ? "Relatórios"
              : t === "menu"
              ? "Cardápio"
              : "Config"}
          </button>
        ))}
      </div>

      {tab === "orders" && (
        <>
          <div className="grid grid-cols-3 gap-3 mb-6 animate-in slide-in-from-top-5">
            <MetricCard
              title="Faturamento Hoje"
              value={`R$ ${totalRevenue.toFixed(2)}`}
              icon={DollarSign}
              color="text-green-500"
            />
            <MetricCard
              title="Pedidos Hoje"
              value={totalOrdersCount}
              icon={ShoppingBag}
              color="text-blue-500"
            />
            <MetricCard
              title="Ticket Médio"
              value={`R$ ${avgTicket.toFixed(2)}`}
              icon={TrendingUp}
              color="text-yellow-500"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <h3 className="text-red-500 text-xs font-bold uppercase flex items-center gap-2">
                  <Clock size={14} /> Cozinha ({prep.length})
                </h3>
                {simulateIncomingOrder && (
                  <button
                    onClick={simulateIncomingOrder}
                    className="text-[9px] bg-zinc-800 border border-white/10 px-2 rounded hover:bg-zinc-700 transition"
                  >
                    + Teste
                  </button>
                )}
              </div>
              {prep.map((o) => (
                <div
                  key={o.id}
                  className="bg-zinc-800 p-3 rounded-xl border-l-4 border-red-500 shadow-md relative group"
                >
                  <button
                    onClick={() => deleteOrder(o.id)}
                    className="absolute top-2 right-2 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-white">{o.customer}</div>
                      <PaymentIcon payment={o.payment} />
                    </div>
                  </div>
                  <div className="text-xs text-zinc-400 mt-2 bg-black/30 p-2 rounded">
                    {o.items.length} itens •{" "}
                    {new Date(o.timestamp).toLocaleTimeString().slice(0, 5)}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => printOrder(o)}
                      className="bg-zinc-700 p-2 rounded text-white hover:bg-zinc-600"
                      title="Imprimir Cupom"
                    >
                      <Printer size={16} />
                    </button>
                    {o.phone && (
                      <button
                        onClick={() =>
                          window.open(`https://wa.me/${o.phone}`, "_blank")
                        }
                        className="bg-green-900/50 text-green-500 p-2 rounded border border-green-500/30 hover:bg-green-900"
                        title="WhatsApp"
                      >
                        <MessageCircle size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => updateOrder(o.id, { status: "ready" })}
                      className="flex-1 bg-green-600 hover:bg-green-500 text-xs font-bold py-2 rounded text-white shadow-lg"
                    >
                      PRONTO
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h3 className="text-yellow-500 text-xs font-bold uppercase border-b border-white/10 pb-2 flex items-center gap-2">
                <CheckCircle size={14} /> Prontos ({ready.length})
              </h3>
              {ready.map((o) => (
                <div
                  key={o.id}
                  className="bg-zinc-800 p-3 rounded-xl border-l-4 border-yellow-500 shadow-md relative"
                >
                  <div className="font-bold flex justify-between">
                    {o.customer}
                    <span className="text-green-400 text-xs">
                      R$ {o.total.toFixed(2)}
                    </span>
                  </div>
                  <div className="mb-2">
                    <PaymentIcon payment={o.payment} />
                  </div>
                  <div className="text-xs text-zinc-400 mb-3 truncate">
                    {o.address}
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {motoboys &&
                      motoboys.map((m) => (
                        <button
                          key={m.id}
                          onClick={() =>
                            updateOrder(o.id, {
                              status: "delivering",
                              assignedTo: m.id,
                            })
                          }
                          className="bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-bold py-2 rounded flex items-center justify-center gap-1"
                        >
                          <Bike size={10} /> {m.name.split(" ")[0]}
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h3 className="text-blue-500 text-xs font-bold uppercase border-b border-white/10 pb-2 flex items-center gap-2">
                <Bike size={14} /> Em Rota ({delivering.length})
              </h3>
              {delivering.map((o) => (
                <div
                  key={o.id}
                  className="bg-zinc-800 p-3 rounded-xl border-l-4 border-blue-500 opacity-60 hover:opacity-100 transition"
                >
                  <div className="font-bold">{o.customer}</div>
                  <div className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1">
                    <Bike size={10} className="text-blue-400" />
                    {(motoboys &&
                      motoboys.find((m) => m.id === o.assignedTo)?.name) ||
                      "Motoboy"}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h3 className="text-green-500 text-xs font-bold uppercase border-b border-white/10 pb-2 flex items-center gap-2">
                <Flag size={14} /> Entregues ({deliveredToday.length})
              </h3>
              {deliveredToday.slice(0, 15).map((o) => (
                <div
                  key={o.id}
                  className="bg-zinc-900 border border-white/5 p-3 rounded-xl opacity-50 hover:opacity-100 transition"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm text-zinc-300">
                      {o.customer}
                    </span>
                    <span className="text-green-600 font-bold text-xs">
                      R$ {o.total.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                    <CheckCircle size={10} /> Entregue por{" "}
                    {(motoboys &&
                      motoboys
                        .find((m) => m.id === o.assignedTo)
                        ?.name.split(" ")[0]) ||
                      "Motoboy"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {tab === "reports" && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-zinc-800 p-6 rounded-xl border border-white/5 text-center shadow-2xl">
            <TrendingUp size={48} className="mx-auto text-green-500 mb-4" />
            <h3 className="text-zinc-400 text-xs font-bold uppercase mb-2">
              Total Consolidado (Entregues)
            </h3>
            <div className="text-5xl font-black text-white mb-6">
              R$ {deliveredToday.reduce((a, o) => a + o.total, 0).toFixed(2)}
            </div>
            <button
              onClick={downloadReport}
              className="bg-zinc-700 text-white text-xs font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 mx-auto hover:bg-zinc-600 transition"
            >
              <Download size={16} /> BAIXAR RELATÓRIO EXCEL
            </button>
          </div>
        </div>
      )}

      {tab === "menu" && (
        <div className="space-y-4 animate-in fade-in">
          {/* BARRA DE FERRAMENTAS DO MENU */}
          <div className="flex flex-col gap-2 bg-zinc-900 p-3 rounded-xl border border-white/10">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3 top-3 text-zinc-500"
                />
                <input
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  placeholder="Buscar produto..."
                  className="w-full bg-black border border-white/10 rounded-lg py-2.5 pl-10 text-sm text-white focus:border-yellow-500 outline-none"
                />
              </div>
              <button
                onClick={openNewProduct}
                className="bg-green-600 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 hover:bg-green-500 transition"
              >
                <Plus size={16} /> NOVO
              </button>
            </div>

            {/* FILTRO DE CATEGORIAS (ESSENCIAL PARA ORDENAR) */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {[
                "TODOS",
                "LINHA SMASH",
                "LINHA PREMIUM",
                "ACOMPANHAMENTOS",
                "BEBIDAS",
              ].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded text-[10px] font-bold whitespace-nowrap border ${
                    selectedCategory === cat
                      ? "bg-yellow-500 text-black border-yellow-500"
                      : "bg-zinc-800 text-zinc-400 border-white/5"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {showProductForm && (
            <div className="bg-zinc-900 p-4 rounded-xl border border-white/10 space-y-3 animate-in fade-in shadow-2xl">
              <h3 className="font-bold text-sm text-yellow-500 border-b border-white/10 pb-2">
                {editingId ? "Editar Produto" : "Novo Produto"}
              </h3>
              <input
                className="w-full bg-black p-2 rounded text-xs border border-white/10 text-white"
                placeholder="Nome do Produto"
                value={prodForm.name}
                onChange={(e) =>
                  setProdForm({ ...prodForm, name: e.target.value })
                }
              />

              <div className="flex gap-2">
                <label className="flex-1 bg-zinc-800 p-2 rounded text-xs border border-white/10 flex items-center gap-2 cursor-pointer hover:bg-zinc-700">
                  <Upload size={14} />
                  <span className="truncate">
                    {prodForm.image ? "Imagem Carregada" : "Enviar Foto"}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
                <input
                  className="flex-1 bg-black p-2 rounded text-xs border border-white/10 text-white"
                  type="number"
                  placeholder="Estoque"
                  value={prodForm.stock}
                  onChange={(e) =>
                    setProdForm({ ...prodForm, stock: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-2">
                <input
                  className="flex-1 bg-black p-2 rounded text-xs border border-white/10 text-white"
                  type="number"
                  placeholder="Preço"
                  value={prodForm.priceSolo}
                  onChange={(e) =>
                    setProdForm({ ...prodForm, priceSolo: e.target.value })
                  }
                />
                <input
                  className="flex-1 bg-black p-2 rounded text-xs border border-white/10 text-white"
                  type="number"
                  placeholder="Preço Combo"
                  value={prodForm.priceCombo}
                  onChange={(e) =>
                    setProdForm({ ...prodForm, priceCombo: e.target.value })
                  }
                />
              </div>

              <select
                className="w-full bg-black p-2 rounded text-xs border border-white/10 text-white"
                value={prodForm.category}
                onChange={(e) =>
                  setProdForm({ ...prodForm, category: e.target.value })
                }
              >
                {[
                  "LINHA SMASH",
                  "LINHA PREMIUM",
                  "ACOMPANHAMENTOS",
                  "BEBIDAS",
                ].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowProductForm(false)}
                  className="flex-1 bg-zinc-700 py-2 rounded text-xs hover:bg-zinc-600"
                >
                  CANCELAR
                </button>
                <button
                  onClick={handleSaveProduct}
                  className="flex-1 bg-blue-600 py-2 rounded text-xs font-bold hover:bg-blue-500"
                >
                  SALVAR
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {filteredMenu.map((item, index) => (
              <div
                key={item.id}
                className="bg-zinc-800 p-3 rounded-xl border border-white/5 flex justify-between items-center group hover:border-white/20 transition"
              >
                <div className="flex items-center gap-3">
                  {/* BOTÕES DE ORDEM (SÓ APARECEM SE FILTRADO) */}
                  {selectedCategory !== "TODOS" && (
                    <div className="flex flex-col gap-1 mr-2">
                      <button
                        onClick={() => moveItem(index, "up")}
                        disabled={index === 0}
                        className="text-zinc-500 hover:text-white disabled:opacity-30"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => moveItem(index, "down")}
                        disabled={index === filteredMenu.length - 1}
                        className="text-zinc-500 hover:text-white disabled:opacity-30"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  )}

                  <img
                    src={item.image}
                    className={`w-12 h-12 rounded bg-black object-cover ${
                      !item.available && "grayscale opacity-50"
                    }`}
                  />
                  <div>
                    <div className="font-bold text-sm text-white">
                      {item.name}
                    </div>
                    <div className="text-xs text-green-400 font-mono">
                      R$ {item.priceSolo.toFixed(2)} •{" "}
                      <span className="text-zinc-500">
                        Estoque: {item.stock}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 opacity-100 sm:opacity-50 group-hover:opacity-100 transition">
                  <button
                    onClick={() => openEditProduct(item)}
                    className="bg-blue-600 p-2 rounded text-white hover:bg-blue-500"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() =>
                      updateMenuItem(item.id, { available: !item.available })
                    }
                    className={`px-2 py-1 rounded text-[9px] font-bold border ${
                      item.available
                        ? "text-green-500 border-green-900 bg-green-900/20"
                        : "text-red-500 border-red-900 bg-red-900/20"
                    }`}
                  >
                    {item.available ? "ON" : "OFF"}
                  </button>
                  <button
                    onClick={() => deleteMenuItem(item.id)}
                    className="text-zinc-600 hover:text-red-500 p-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "config" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-zinc-900 p-4 rounded-xl border border-white/10">
            <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
              <Palette size={16} /> Aparência
            </h3>
            <div className="space-y-3">
              <input
                className="w-full bg-black p-3 rounded-lg border border-white/10 text-white text-sm"
                placeholder="Nome da Loja"
                value={appConfig.storeName}
                onChange={(e) =>
                  saveGlobalSettings({
                    config: { ...appConfig, storeName: e.target.value },
                  })
                }
              />
              <div className="flex items-center gap-3 bg-black p-2 rounded-lg border border-white/10">
                <label className="text-xs text-zinc-400">Cor do Tema:</label>
                <input
                  type="color"
                  value={appConfig.themeColor}
                  onChange={(e) =>
                    saveGlobalSettings({
                      config: { ...appConfig, themeColor: e.target.value },
                    })
                  }
                  className="h-8 w-full rounded cursor-pointer bg-transparent"
                />
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 p-4 rounded-xl border border-white/10">
            <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
              <Clock size={16} /> Horário
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-zinc-500 uppercase font-bold">
                  Abre (h)
                </label>
                <input
                  type="number"
                  className="w-full bg-black p-3 rounded-lg border border-white/10 text-white"
                  value={appConfig.openHour}
                  onChange={(e) =>
                    saveGlobalSettings({
                      config: {
                        ...appConfig,
                        openHour: parseInt(e.target.value),
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 uppercase font-bold">
                  Fecha (h)
                </label>
                <input
                  type="number"
                  className="w-full bg-black p-3 rounded-lg border border-white/10 text-white"
                  value={appConfig.closeHour}
                  onChange={(e) =>
                    saveGlobalSettings({
                      config: {
                        ...appConfig,
                        closeHour: parseInt(e.target.value),
                      },
                    })
                  }
                />
              </div>
            </div>
            <button
              onClick={() =>
                saveGlobalSettings({
                  config: { ...appConfig, forceClose: !appConfig.forceClose },
                })
              }
              className={`w-full mt-4 py-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                appConfig.forceClose
                  ? "bg-green-600 hover:bg-green-500"
                  : "bg-red-600 hover:bg-red-500"
              }`}
            >
              <Power size={14} />{" "}
              {appConfig.forceClose
                ? "REABRIR LOJA AGORA"
                : "FECHAR LOJA AGORA"}
            </button>
          </div>

          <div className="bg-zinc-900 p-4 rounded-xl border border-white/10">
            <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
              <Map size={16} /> Taxas de Entrega
            </h3>
            <div className="space-y-2 mb-4 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              {bairros.map((b) => (
                <div
                  key={b.nome}
                  className="flex justify-between items-center bg-black/40 p-3 rounded-lg text-xs border border-white/5"
                >
                  <span className="font-bold">{b.nome}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-green-400 font-bold bg-green-900/20 px-2 py-1 rounded">
                      R$ {b.taxa.toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeBairro(b.nome)}
                      className="text-zinc-600 hover:text-red-500 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="flex-[2] bg-black p-3 rounded-lg border border-white/10 text-xs text-white"
                placeholder="Novo Bairro"
                value={newBairro.nome}
                onChange={(e) =>
                  setNewBairro({ ...newBairro, nome: e.target.value })
                }
              />
              <input
                className="flex-1 bg-black p-3 rounded-lg border border-white/10 text-xs text-white"
                type="number"
                placeholder="R$"
                value={newBairro.taxa}
                onChange={(e) =>
                  setNewBairro({ ...newBairro, taxa: e.target.value })
                }
              />
              <button
                onClick={addBairro}
                className="bg-blue-600 p-3 rounded-lg text-white hover:bg-blue-500 transition"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="bg-zinc-900 p-4 rounded-xl border border-white/10">
            <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
              <Bike size={16} /> Equipe de Motoboys
            </h3>
            <div className="space-y-2 mb-4">
              {motoboys &&
                motoboys.map((m) => (
                  <div
                    key={m.id}
                    className="flex justify-between items-center bg-black/40 p-3 rounded-lg text-xs border border-white/5"
                  >
                    <span className="flex items-center gap-2">
                      <Bike size={12} className="text-blue-500" /> {m.name}
                    </span>
                    <button
                      onClick={() => removeMotoboy(m.id)}
                      className="text-zinc-600 hover:text-red-500 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
            </div>
            <div className="flex gap-2">
              <input
                className="flex-[2] bg-black p-3 rounded-lg border border-white/10 text-xs text-white"
                placeholder="Nome"
                value={newMoto.name}
                onChange={(e) =>
                  setNewMoto({ ...newMoto, name: e.target.value })
                }
              />
              <input
                className="flex-1 bg-black p-3 rounded-lg border border-white/10 text-xs text-white"
                placeholder="Login"
                value={newMoto.login}
                onChange={(e) =>
                  setNewMoto({ ...newMoto, login: e.target.value })
                }
              />
              <button
                onClick={addMotoboy}
                className="bg-blue-600 p-3 rounded-lg text-white hover:bg-blue-500 transition"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
