import React, { useState, useEffect, useMemo } from "react";
import {
  ShoppingCart,
  MapPin,
  CheckCircle,
  Bike,
  Package,
  Plus,
  X,
  Flame,
  Search,
  Gift,
  Home,
  List,
  User,
  ChevronRight,
} from "lucide-react";

export default function CustomerApp({
  onBack,
  addOrder,
  menuItems,
  categories,
  showToast,
  bairros,
  appConfig,
  orders,
  myOrderIds,
  coupons,
  themeStyle,
  textThemeStyle,
}) {
  const [tab, setTab] = useState("menu");
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [form, setForm] = useState(
    () =>
      JSON.parse(localStorage.getItem("sk_user_data")) || {
        name: "",
        street: "",
        number: "",
        reference: "",
        payment: "Pix",
        change: "",
        points: 0,
      }
  );

  const [selectedBairro, setSelectedBairro] = useState(bairros[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [isCombo, setIsCombo] = useState(null);
  const [obs, setObs] = useState("");
  const [activeCategory, setActiveCategory] = useState("TODOS");

  const isOpen =
    !appConfig.forceClose &&
    new Date().getHours() >= appConfig.openHour &&
    new Date().getHours() < appConfig.closeHour;

  // --- FILTROS ---
  const filteredMenu = useMemo(() => {
    if (!menuItems) return [];
    return menuItems.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      // Se for TODOS e não tiver busca, a gente ignora o filtro aqui para agrupar depois
      // Se tiver busca, filtra tudo
      if (activeCategory === "TODOS" && searchTerm === "") return true;

      const matchesCategory =
        activeCategory === "TODOS" || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchTerm, activeCategory]);

  const myActiveOrders = useMemo(() => {
    return orders.filter((o) => myOrderIds.includes(o.id));
  }, [orders, myOrderIds]);

  useEffect(
    () => localStorage.setItem("sk_user_data", JSON.stringify(form)),
    [form]
  );

  // --- CONTROLE DO BOTÃO VOLTAR (ANDROID/IPHONE) ---
  useEffect(() => {
    const handleBackButton = (event) => {
      if (selectedProduct) {
        setSelectedProduct(null); // Fecha produto
      } else if (isCartOpen) {
        setIsCartOpen(false); // Fecha carrinho
      } else if (tab !== "menu") {
        setTab("menu"); // Volta pro menu
      } else {
        // Se não tiver nada aberto, deixa o comportamento padrão ou avisa
      }
    };

    window.addEventListener("popstate", handleBackButton);
    return () => window.removeEventListener("popstate", handleBackButton);
  }, [selectedProduct, isCartOpen, tab]);

  // Função auxiliar para criar histórico ao abrir modal
  const openWithHistory = (action) => {
    window.history.pushState(null, "", window.location.href);
    action();
  };

  // --- LOGICA CARRINHO ---
  const handleOptionChange = (groupName, item, type, price) => {
    setSelectedOptions((prev) => {
      const current = prev[groupName] || [];
      if (type === "radio") return { ...prev, [groupName]: [item] };
      if (type === "check") {
        const exists = current.find((x) => x.name === item.name);
        if (exists)
          return {
            ...prev,
            [groupName]: current.filter((x) => x.name !== item.name),
          };
        return { ...prev, [groupName]: [...current, { ...item, price }] };
      }
      return prev;
    });
  };

  const addToCart = () => {
    if (!selectedProduct) return;
    if (selectedProduct.stock !== undefined && selectedProduct.stock <= 0)
      return alert("Produto Esgotado!");

    if (selectedProduct.options) {
      for (let opt of selectedProduct.options) {
        if (
          opt.required &&
          (!selectedOptions[opt.name] || selectedOptions[opt.name].length === 0)
        )
          return alert(`Selecione: ${opt.name}`);
      }
    }

    let price = selectedProduct.priceSolo;
    let name = selectedProduct.name;
    let desc = [];

    Object.keys(selectedOptions).forEach((key) => {
      selectedOptions[key].forEach((opt) => {
        desc.push(opt.name);
        if (opt.price) price += opt.price;
      });
    });

    if (isCombo) {
      price = selectedProduct.priceCombo || price;
      name = `COMBO ${name}`;
      desc.push("+ Batata + Refri");
    }
    if (obs) desc.push(`Obs: ${obs}`);

    setCart([
      ...cart,
      { id: Date.now(), name, details: desc.join(", "), price, qtd: 1 },
    ]);

    // Fecha modal voltando o histórico para não bugar
    window.history.back();
    // Abre carrinho criando novo histórico
    setTimeout(() => openWithHistory(() => setIsCartOpen(true)), 100);

    showToast("Adicionado!");
  };

  const total =
    cart.reduce((a, b) => a + b.price * b.qtd, 0) +
    (selectedBairro ? selectedBairro.taxa : 0) -
    discount;

  const send = () => {
    if (!form.name || !form.street || !form.number)
      return alert("Preencha o endereço!");
    if (!selectedBairro) return alert("Selecione seu bairro!");

    const pointsEarned = Math.floor(total);
    addOrder({
      customer: form.name,
      phone: appConfig.whatsapp,
      address: `${form.street}, ${form.number} - ${selectedBairro.nome} (${form.reference})`,
      total,
      payment: form.payment,
      status: "preparing",
      items: cart,
      assignedTo: null,
      deliveryFee: selectedBairro.taxa,
    });
    setForm((prev) => ({ ...prev, points: (prev.points || 0) + pointsEarned }));
    setCart([]);
    window.history.back(); // Fecha carrinho
    setTab("orders"); // Vai para pedidos

    const msg = `🍔 *PEDIDO SK* \n👤 ${form.name}\n📍 ${
      selectedBairro.nome
    }\n\n${cart
      .map((i) => `${i.qtd}x ${i.name}`)
      .join("\n")}\n\n💰 TOTAL: R$ ${total.toFixed(2)}`;
    window.open(
      `https://wa.me/${appConfig.whatsapp}?text=${encodeURIComponent(msg)}`,
      "_blank"
    );
  };

  // --- COMPONENTE DO CARD DE PRODUTO ---
  const ProductCard = ({ item }) => (
    <div
      key={item.id}
      onClick={() =>
        openWithHistory(() => {
          setSelectedProduct(item);
          setSelectedOptions({});
          setIsCombo(null);
          setObs("");
        })
      }
      className={`flex gap-4 items-center bg-zinc-900/50 p-3 rounded-2xl border border-white/5 active:scale-[0.98] transition mb-3 ${
        !item.available || item.stock <= 0 ? "opacity-50 grayscale" : ""
      }`}
    >
      <img
        src={item.image}
        className="w-24 h-24 rounded-xl object-cover bg-zinc-800"
      />
      <div className="flex-1">
        <h3 className="font-bold text-base leading-tight mb-1 text-white">
          {item.name}
        </h3>
        <p className="text-xs text-zinc-400 line-clamp-2 mb-3">
          {item.description}
        </p>
        <div className="flex justify-between items-center">
          <span className="font-black text-lg text-white">
            R$ {item.priceSolo.toFixed(2)}
          </span>
          <button className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-yellow-500 border border-white/10">
            <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  const OrderStatus = ({ status }) => {
    const steps = {
      preparing: {
        label: "Cozinha",
        color: "text-orange-500",
        icon: Flame,
        percent: "33%",
      },
      ready: {
        label: "Pronto",
        color: "text-yellow-500",
        icon: Package,
        percent: "66%",
      },
      delivering: {
        label: "A Caminho",
        color: "text-blue-500",
        icon: Bike,
        percent: "80%",
      },
      delivered: {
        label: "Entregue",
        color: "text-green-500",
        icon: CheckCircle,
        percent: "100%",
      },
    };
    const current = steps[status] || steps["preparing"];
    const Icon = current.icon;
    return (
      <div className="mt-3">
        <div className="flex justify-between items-center mb-1">
          <span
            className={`text-xs font-bold ${current.color} flex items-center gap-1`}
          >
            <Icon size={12} /> {current.label}
          </span>
        </div>
        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${
              status === "delivered" ? "bg-green-500" : "bg-yellow-500"
            } transition-all duration-1000`}
            style={{ width: current.percent }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-black min-h-screen pb-24 font-sans text-white">
      {/* HEADER */}
      <header className="sticky top-0 bg-black/90 backdrop-blur-md z-40 px-4 py-3 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-2" onClick={onBack}>
          <div
            style={themeStyle}
            className="w-8 h-8 rounded-full flex items-center justify-center font-black text-black text-xs shadow-lg"
          >
            SK
          </div>
          <div>
            <h1 className="font-bold text-sm leading-none">
              {appConfig.storeName}
            </h1>
            <div className="flex items-center gap-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  isOpen ? "bg-green-500" : "bg-red-500"
                }`}
              ></span>
              <p className="text-[10px] text-zinc-400">
                {isOpen ? "Aberto" : "Fechado"}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => openWithHistory(() => setIsCartOpen(true))}
          className="relative p-2"
        >
          <ShoppingCart size={24} className="text-white" />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-[10px] min-w-[1.25rem] h-5 px-1 rounded-full flex items-center justify-center font-bold border border-zinc-900 shadow-sm">
              {cart.length}
            </span>
          )}
        </button>
      </header>

      {/* CONTEÚDO */}
      {tab === "menu" && (
        <>
          {/* BUSCA */}
          <div className="px-4 mt-4">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-3.5 text-zinc-500"
              />
              <input
                className="w-full bg-zinc-900 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-none focus:ring-1 focus:ring-yellow-500/50 transition"
                placeholder="Buscar lanche..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* CATEGORIAS (STORIES) */}
          <div className="mt-6 pl-4 flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
            <button
              onClick={() => setActiveCategory("TODOS")}
              className="flex flex-col items-center gap-2 snap-start min-w-[64px]"
            >
              <div
                className={`w-16 h-16 rounded-full p-0.5 transition-all ${
                  activeCategory === "TODOS"
                    ? "bg-gradient-to-tr from-yellow-400 to-red-500 scale-105"
                    : "bg-zinc-800"
                }`}
              >
                <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center border-2 border-black">
                  <span className="font-bold text-[10px]">TODOS</span>
                </div>
              </div>
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="flex flex-col items-center gap-2 snap-start min-w-[64px]"
              >
                <div
                  className={`w-16 h-16 rounded-full p-0.5 transition-all ${
                    activeCategory === cat
                      ? "bg-gradient-to-tr from-yellow-400 to-red-500 scale-105"
                      : "bg-zinc-800"
                  }`}
                >
                  <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center border-2 border-black">
                    {cat.includes("SMASH") && (
                      <span className="text-xl">🍔</span>
                    )}
                    {cat.includes("PREMIUM") && (
                      <span className="text-xl">🥓</span>
                    )}
                    {cat.includes("BEBIDAS") && (
                      <span className="text-xl">🥤</span>
                    )}
                    {cat.includes("ACOMP") && (
                      <span className="text-xl">🍟</span>
                    )}
                  </div>
                </div>
                <span className="text-[10px] font-medium text-zinc-400 whitespace-nowrap overflow-hidden text-ellipsis max-w-[70px]">
                  {cat.split(" ")[1] || cat}
                </span>
              </button>
            ))}
          </div>

          {/* LISTA DE PRODUTOS */}
          <div className="px-4 mt-2 space-y-6">
            {/* Banner */}
            {activeCategory === "TODOS" && searchTerm === "" && (
              <div className="relative w-full h-40 rounded-2xl overflow-hidden shadow-lg mb-6">
                <img
                  src="https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex items-end p-4">
                  <div>
                    <span className="bg-red-600 text-white text-[9px] font-bold px-2 py-1 rounded mb-1 inline-block">
                      OFERTA
                    </span>
                    <h3 className="font-black text-lg">Combos Supremos</h3>
                    <p className="text-xs text-zinc-300">
                      O dobro de sabor pela metade do preço.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* RENDERIZAÇÃO: AGRUPADO POR TOPICOS SE "TODOS" */}
            {activeCategory === "TODOS" && searchTerm === "" ? (
              categories.map((cat) => {
                // Pega os itens dessa categoria
                const itemsInCat = menuItems.filter((i) => i.category === cat);
                if (itemsInCat.length === 0) return null;

                return (
                  <div key={cat} className="mb-4">
                    {/* TÍTULO DO TÓPICO */}
                    <div className="flex items-center gap-2 mb-3 mt-6 border-b border-white/5 pb-2">
                      <div className="h-6 w-1 bg-yellow-500 rounded-full"></div>
                      <h3 className="font-black text-lg text-white tracking-tight">
                        {cat}
                      </h3>
                    </div>

                    {/* ITENS DO TÓPICO */}
                    <div>
                      {itemsInCat.map((item) => (
                        <ProductCard key={item.id} item={item} />
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              // MODO LISTA SIMPLES (Busca ou Categoria Específica)
              <div>
                {activeCategory !== "TODOS" && (
                  <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="text-yellow-500">●</span> {activeCategory}
                  </h2>
                )}
                {filteredMenu.map((item) => (
                  <ProductCard key={item.id} item={item} />
                ))}
                {filteredMenu.length === 0 && (
                  <div className="text-center py-10 opacity-50">
                    <p>Nada encontrado.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* TELA DE PEDIDOS */}
      {tab === "orders" && (
        <div className="p-4 pt-10 animate-in fade-in">
          <h2 className="text-2xl font-black mb-6">Meus Pedidos</h2>
          {myActiveOrders.length === 0 ? (
            <div className="text-center py-20 opacity-50">
              <Package size={64} className="mx-auto mb-4 text-zinc-700" />
              <p>Você ainda não pediu nada hoje.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myActiveOrders.map((o) => (
                <div
                  key={o.id}
                  className="bg-zinc-900 border border-white/10 p-4 rounded-2xl shadow-lg"
                >
                  <div className="flex justify-between mb-2">
                    <span className="font-bold text-zinc-400">
                      #{o.id.split("-")[1]}
                    </span>
                    <span className="font-bold text-green-500">
                      R$ {o.total.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-sm text-zinc-300 mb-4">
                    {o.items.map((i) => i.name).join(", ")}
                  </div>
                  <OrderStatus status={o.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TELA PERFIL */}
      {tab === "profile" && (
        <div className="p-4 pt-10 text-center animate-in fade-in">
          <div className="w-24 h-24 bg-zinc-800 rounded-full mx-auto mb-4 flex items-center justify-center text-zinc-500 border-4 border-zinc-900 shadow-xl">
            <User size={40} />
          </div>
          <h2 className="text-xl font-bold mb-1">{form.name || "Visitante"}</h2>
          <p className="text-zinc-500 text-sm mb-6">Cliente VIP</p>

          <div className="bg-zinc-900 rounded-2xl p-4 text-left border border-white/5 space-y-4">
            <div className="flex justify-between items-center p-2">
              <div className="flex items-center gap-3">
                <Gift className="text-yellow-500" />
                <div>
                  <p className="font-bold text-sm">Meus Pontos</p>
                  <p className="text-xs text-zinc-500">
                    Você tem {form.points} pontos
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-zinc-600" />
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM BAR (NAVEGAÇÃO) */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur border-t border-white/10 px-6 py-4 flex justify-between items-center z-50">
        <button
          onClick={() => setTab("menu")}
          className={`flex flex-col items-center gap-1 transition ${
            tab === "menu" ? "text-yellow-500 scale-110" : "text-zinc-600"
          }`}
        >
          <Home size={24} strokeWidth={tab === "menu" ? 3 : 2} />
        </button>

        <button
          onClick={() => setTab("orders")}
          className={`flex flex-col items-center gap-1 relative transition ${
            tab === "orders" ? "text-yellow-500 scale-110" : "text-zinc-600"
          }`}
        >
          <List size={24} strokeWidth={tab === "orders" ? 3 : 2} />
          {myActiveOrders.filter((o) => o.status !== "delivered").length >
            0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-black animate-pulse"></span>
          )}
        </button>

        <button
          onClick={() => setTab("profile")}
          className={`flex flex-col items-center gap-1 transition ${
            tab === "profile" ? "text-yellow-500 scale-110" : "text-zinc-600"
          }`}
        >
          <User size={24} strokeWidth={tab === "profile" ? 3 : 2} />
        </button>
      </div>

      {/* MODAL PRODUTO */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-end sm:items-center justify-center backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-white/10 overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-10">
            <div className="relative h-64 shrink-0">
              <img
                src={selectedProduct.image}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent"></div>
              {/* Botão X fecha e volta o histórico */}
              <button
                onClick={() => window.history.back()}
                className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white backdrop-blur"
              >
                <X size={20} />
              </button>
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-2xl font-black text-white leading-none mb-1">
                  {selectedProduct.name}
                </h2>
                <p className="text-sm text-zinc-300 line-clamp-2">
                  {selectedProduct.description}
                </p>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {selectedProduct.options &&
                selectedProduct.options.map((opt, idx) => (
                  <div key={idx} className="space-y-3">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                      {opt.name} {opt.required && "*"}
                    </label>
                    <div className="space-y-2">
                      {opt.type === "radio" && (
                        <div className="flex flex-wrap gap-2">
                          {opt.items.map((i) => (
                            <button
                              key={i}
                              onClick={() =>
                                handleOptionChange(
                                  opt.name,
                                  { name: i },
                                  "radio"
                                )
                              }
                              className={`px-4 py-2 rounded-full text-xs font-bold border transition ${
                                selectedOptions[opt.name]?.[0]?.name === i
                                  ? "bg-white text-black border-white"
                                  : "bg-transparent text-zinc-400 border-zinc-700"
                              }`}
                            >
                              {i}
                            </button>
                          ))}
                        </div>
                      )}
                      {opt.type === "check" &&
                        opt.items.map((i) => {
                          const isSelected = selectedOptions[opt.name]?.find(
                            (x) => x.name === i.name
                          );
                          return (
                            <button
                              key={i.name}
                              onClick={() =>
                                handleOptionChange(
                                  opt.name,
                                  i,
                                  "check",
                                  i.price
                                )
                              }
                              className={`w-full flex justify-between p-4 rounded-xl border text-sm transition ${
                                isSelected
                                  ? "bg-white/10 border-green-500 text-white"
                                  : "bg-zinc-950 border-zinc-800 text-zinc-400"
                              }`}
                            >
                              <span>{i.name}</span>
                              <span className="font-bold">
                                + R$ {i.price.toFixed(2)}
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                ))}

              {!selectedProduct.category.includes("COMBO") &&
                !selectedProduct.category.includes("ACOMPANHAMENTOS") &&
                !selectedProduct.category.includes("BEBIDAS") &&
                selectedProduct.priceCombo > 0 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl space-y-3">
                    <div className="flex justify-between font-bold text-yellow-500 text-sm">
                      <span>Virar Combo? 🍟🥤</span>
                      <span>
                        + R${" "}
                        {(
                          selectedProduct.priceCombo - selectedProduct.priceSolo
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsCombo(true)}
                        className={`flex-1 py-3 rounded-lg text-xs font-black transition ${
                          isCombo === true
                            ? "bg-yellow-500 text-black"
                            : "bg-zinc-800 hover:bg-zinc-700"
                        }`}
                      >
                        QUERO COMBO
                      </button>
                      <button
                        onClick={() => setIsCombo(false)}
                        className={`flex-1 py-3 rounded-lg text-xs font-black transition ${
                          isCombo === false
                            ? "bg-white/20 text-white"
                            : "bg-zinc-800 hover:bg-zinc-700"
                        }`}
                      >
                        SÓ O LANCHE
                      </button>
                    </div>
                  </div>
                )}
              <textarea
                placeholder="Alguma observação? Ex: Tirar cebola"
                className="w-full bg-zinc-950 p-4 rounded-xl text-sm text-white border border-zinc-800 focus:border-white/20 outline-none"
                value={obs}
                onChange={(e) => setObs(e.target.value)}
              />
            </div>

            <div className="p-4 border-t border-white/10 bg-zinc-900 pb-8">
              <button
                onClick={addToCart}
                style={themeStyle}
                className="w-full text-black py-4 rounded-xl font-black text-lg flex justify-between px-6 hover:brightness-110 shadow-lg shadow-yellow-500/20 active:scale-95 transition"
              >
                <span>ADICIONAR</span>
                <span>
                  R${" "}
                  {(
                    parseFloat(selectedProduct.priceSolo) +
                    (isCombo
                      ? selectedProduct.priceCombo - selectedProduct.priceSolo
                      : 0) +
                    Object.values(selectedOptions)
                      .flat()
                      .reduce((a, b) => a + (b.price || 0), 0)
                  ).toFixed(2)}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CARRINHO */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col animate-in slide-in-from-bottom-10">
          <div className="flex justify-between items-center p-4 border-b border-white/10">
            <h2 className="font-black text-xl">Seu Pedido</h2>
            {/* Botão X fecha e volta o histórico */}
            <button
              onClick={() => window.history.back()}
              className="bg-zinc-800 p-2 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.map((i, x) => (
              <div
                key={x}
                className="flex justify-between items-center bg-zinc-900 p-4 rounded-xl border border-white/5"
              >
                <div>
                  <div className="font-bold text-white">{i.name}</div>
                  <div className="text-xs text-zinc-500 max-w-[200px]">
                    {i.details}
                  </div>
                </div>
                <span className="font-bold text-green-400">
                  R$ {i.price.toFixed(2)}
                </span>
              </div>
            ))}

            <div className="bg-zinc-900 p-4 rounded-xl border border-white/10 space-y-4">
              <h3 className="text-xs font-bold uppercase text-zinc-500 flex items-center gap-2">
                <MapPin size={14} /> Endereço de Entrega
              </h3>
              <input
                className="w-full bg-black border border-zinc-800 p-3 rounded-lg text-sm text-white outline-none focus:border-yellow-500"
                placeholder="Seu Nome"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <div className="grid grid-cols-4 gap-2">
                <input
                  className="col-span-3 w-full bg-black border border-zinc-800 p-3 rounded-lg text-sm text-white"
                  placeholder="Rua"
                  value={form.street}
                  onChange={(e) => setForm({ ...form, street: e.target.value })}
                />
                <input
                  className="col-span-1 w-full bg-black border border-zinc-800 p-3 rounded-lg text-sm text-white"
                  placeholder="Nº"
                  value={form.number}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                />
              </div>
              <input
                className="w-full bg-black border border-zinc-800 p-3 rounded-lg text-sm text-white"
                placeholder="Ponto de Referência"
                value={form.reference}
                onChange={(e) =>
                  setForm({ ...form, reference: e.target.value })
                }
              />

              <select
                className="w-full bg-black border border-zinc-800 p-3 rounded-lg text-sm text-white"
                onChange={(e) =>
                  setSelectedBairro(
                    bairros.find((b) => b.nome === e.target.value)
                  )
                }
              >
                {bairros.map((b) => (
                  <option key={b.nome} value={b.nome}>
                    {b.nome} (+ R$ {b.taxa.toFixed(2)})
                  </option>
                ))}
              </select>

              <div className="flex gap-2">
                <input
                  className="flex-1 bg-black border border-zinc-800 p-3 rounded-lg text-sm uppercase text-white"
                  placeholder="CUPOM"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <button
                  onClick={applyCoupon}
                  className="bg-zinc-800 px-4 rounded-lg font-bold text-xs"
                >
                  APLICAR
                </button>
              </div>

              <select
                className="w-full bg-black border border-zinc-800 p-3 rounded-lg text-sm text-white"
                value={form.payment}
                onChange={(e) => setForm({ ...form, payment: e.target.value })}
              >
                <option value="Pix">Pagamento via Pix</option>
                <option value="Cartão">Cartão na Entrega</option>
                <option value="Dinheiro">Dinheiro</option>
              </select>
              {form.payment === "Dinheiro" && (
                <input
                  className="w-full bg-black border border-zinc-800 p-3 rounded-lg text-sm text-white"
                  placeholder="Troco para quanto?"
                  value={form.change}
                  onChange={(e) => setForm({ ...form, change: e.target.value })}
                />
              )}
            </div>
          </div>

          <div className="p-4 border-t border-white/10 bg-zinc-900 pb-8">
            <div className="flex justify-between text-xl font-black text-white mb-4">
              <span>Total</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
            <button
              onClick={send}
              disabled={!isOpen}
              style={themeStyle}
              className="w-full text-black disabled:bg-zinc-800 disabled:text-zinc-600 py-4 rounded-xl font-black shadow-lg hover:brightness-110 active:scale-95 transition"
            >
              {isOpen ? "ENVIAR PEDIDO NO ZAP" : "LOJA FECHADA"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
