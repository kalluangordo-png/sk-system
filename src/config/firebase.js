// src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// --- CONFIGURAÇÃO DO FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyBTcBT1E42L9tLeIEXaJTLUO9-8KTYYyeE",
  authDomain: "sk-burgers.firebaseapp.com",
  projectId: "sk-burgers",
  storageBucket: "sk-burgers.firebasestorage.app",
  messagingSenderId: "730774889060",
  appId: "1:730774889060:web:d9be05097ff9dcc65b7571",
};

let db = null;
let auth = null;
const appId = "sk-delivery-app";

try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (e) {
  console.log("Firebase já iniciado ou erro:", e);
}

// Exportamos as variáveis para usar em outros arquivos
export { db, auth, appId };

// --- CONSTANTES E DADOS PADRÃO ---
// Exportamos também os dados fixos para não poluir as telas

export const OPCOES_EXTRAS = {
  name: "ACOMPANHAMENTOS E EXTRAS",
  type: "check",
  items: [
    { name: "Batata Frita Individual (150g)", price: 10.0 },
    { name: "Batata SK (Cheddar e Bacon - 300g)", price: 18.0 },
    { name: "Adicional de Smash (Carne 70g + Queijo)", price: 6.0 },
    { name: "Pote Extra de Maionese Verde (30ml)", price: 2.0 },
  ],
};

export const INITIAL_MENU = [
  // --- LINHA SMASH ---
  {
    id: 1,
    category: "LINHA SMASH",
    name: "SK ORIGINAL (O Clássico)",
    description:
      "Pão brioche macio, 1 smash de carne (70g), queijo derretido e Maionese Secreta SK.",
    priceSolo: 16.9,
    priceCombo: 26.9,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
    rating: 4.8,
    available: true,
    stock: 100,
    options: [
      {
        name: "Ponto da Carne",
        type: "radio",
        items: ["Ao Ponto", "Bem Passado"],
        required: true,
      },
      OPCOES_EXTRAS,
    ],
  },
  {
    id: 2,
    category: "LINHA SMASH",
    name: "SK SALAD (O Fresquinho)",
    description:
      "Pão brioche, 1 smash de carne (70g), queijo, alface americana crocante, tomate e cebola roxa.",
    priceSolo: 18.9,
    priceCombo: 28.9,
    image: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400",
    rating: 4.7,
    available: true,
    stock: 100,
    options: [
      {
        name: "Ponto da Carne",
        type: "radio",
        items: ["Ao Ponto", "Bem Passado"],
        required: true,
      },
      OPCOES_EXTRAS,
    ],
  },
  {
    id: 3,
    category: "LINHA SMASH",
    name: "SK DOUBLE SMASH (⭐ Favorito)",
    description:
      "Pão brioche, 2 carnes smash (sabor em dobro!), dobro de queijo cheddar e bacon em cubos crocantes.",
    priceSolo: 22.9,
    priceCombo: 32.9,
    image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400",
    rating: 5.0,
    available: true,
    stock: 100,
    options: [
      {
        name: "Ponto da Carne",
        type: "radio",
        items: ["Ao Ponto", "Bem Passado"],
        required: true,
      },
      OPCOES_EXTRAS,
    ],
  },
  // --- LINHA PREMIUM ---
  {
    id: 4,
    category: "LINHA PREMIUM",
    name: "O CABOQUINHO (Sabor de Manaus 🍌)",
    description:
      "Pão brioche, carne alta 150g, queijo coalho tostado, fatias de banana pacovã frita e um fio de melaço.",
    priceSolo: 29.9,
    priceCombo: 39.9,
    image: "https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=400",
    rating: 5.0,
    available: true,
    stock: 50,
    options: [
      {
        name: "Ponto da Carne",
        type: "radio",
        items: ["Ao Ponto", "Bem Passado"],
        required: true,
      },
      OPCOES_EXTRAS,
    ],
  },
  {
    id: 5,
    category: "LINHA PREMIUM",
    name: "SK GORGON (O Intenso 🧀)",
    description:
      "Pão brioche, carne alta 150g, Creme de Gorgonzola Artesanal e cebola roxa caramelizada.",
    priceSolo: 29.9,
    priceCombo: 39.9,
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400",
    rating: 4.9,
    available: true,
    stock: 50,
    options: [
      {
        name: "Ponto da Carne",
        type: "radio",
        items: ["Ao Ponto", "Bem Passado"],
        required: true,
      },
      OPCOES_EXTRAS,
    ],
  },
  {
    id: 6,
    category: "LINHA PREMIUM",
    name: "MONSTRO DA 212 (Matador de Fome)",
    description:
      "Pão brioche, carne alta 150g, queijo cheddar, fatias de bacon, ovo frito, alface, tomate e molho especial.",
    priceSolo: 32.9,
    priceCombo: 42.9,
    image: "https://images.unsplash.com/photo-1617196034438-346b11f11d72?w=400",
    rating: 5.0,
    available: true,
    stock: 50,
    options: [
      {
        name: "Ponto da Carne",
        type: "radio",
        items: ["Ao Ponto", "Bem Passado"],
        required: true,
      },
      OPCOES_EXTRAS,
    ],
  },
  // --- ACOMPANHAMENTOS ---
  {
    id: 10,
    category: "ACOMPANHAMENTOS",
    name: "Batata Frita Individual (150g)",
    description: "Sequinha e crocante.",
    priceSolo: 10.0,
    image: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=400",
    rating: 4.8,
    available: true,
    stock: 200,
    options: [],
  },
  {
    id: 11,
    category: "ACOMPANHAMENTOS",
    name: "Batata SK (Cheddar e Bacon - 300g)",
    description: "300g de batata com muito cheddar e bacon.",
    priceSolo: 18.0,
    image: "https://images.unsplash.com/photo-1585109649139-3668018951a7?w=400",
    rating: 5.0,
    available: true,
    stock: 100,
    options: [],
  },
  {
    id: 12,
    category: "ACOMPANHAMENTOS",
    name: "Adicional de Smash (Carne 70g + Queijo)",
    description: "Carne extra para o seu lanche.",
    priceSolo: 6.0,
    image: "https://images.unsplash.com/photo-1619250906682-903789458432?w=400",
    rating: 4.9,
    available: true,
    stock: 100,
    options: [],
  },
  {
    id: 13,
    category: "ACOMPANHAMENTOS",
    name: "Pote Extra Maionese Verde (30ml)",
    description: "Perfeita para mergulhar sua batata!",
    priceSolo: 2.0,
    image: "https://images.unsplash.com/photo-1625937759420-26251d82c94d?w=400",
    rating: 5.0,
    available: true,
    stock: 100,
    options: [],
  },
  // --- BEBIDAS ---
  {
    id: 7,
    category: "BEBIDAS",
    name: "Coca-Cola Lata",
    description: "350ml Gelada.",
    priceSolo: 6.0,
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400",
    rating: 5.0,
    available: true,
    stock: 100,
    options: [],
  },
];

export const INITIAL_BAIRROS = [
  { id: 1, nome: "Núcleo 16", taxa: 0.0 },
  { nome: "Cidade Nova", taxa: 5.0 },
  { nome: "Novo Aleixo", taxa: 7.0 },
  { nome: "Centro", taxa: 15.0 },
];

export const INITIAL_CONFIG = {
  openHour: 18,
  closeHour: 23,
  forceClose: false,
  whatsapp: "5592999999999",
  pixKey: "000.000.000-00",
  storeName: "SK BURGUER",
  themeColor: "#EAB308",
};

export const INITIAL_MOTOBOYS = [
  { id: 101, name: "Marcos Silva", login: "marcos" },
  { id: 102, name: "João Souza", login: "joao" },
];

export const INITIAL_COUPONS = [
  { code: "SK10", discount: 0.1, type: "percent" },
  { code: "BEMVINDO", discount: 5.0, type: "fixed" },
];
