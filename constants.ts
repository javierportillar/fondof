import { LoanStatus, Product, UserProfile, Role } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: "Aceite purísimo",
    price: 31600,
    description: "3000 ml 1",
    image: "https://via.placeholder.com/200x200",
    category: "despensa",
    stock: 50,
    rating: 4.8,
    isGolden: true
  },
  {
    id: '2',
    name: "Atún Isabel en aceite",
    price: 5200,
    description: "142gr",
    image: "https://via.placeholder.com/200x200",
    category: "despensa",
    stock: 50,
    rating: 4.5
  },
  {
    id: '3',
    name: "Café odisea",
    price: 25000,
    description: "500g",
    image: "https://via.placeholder.com/200x200",
    category: "despensa",
    stock: 50,
    rating: 4.9,
    isGolden: true
  },
  {
    id: '4',
    name: "Arroz florhuila",
    price: 24500,
    description: "5000gr",
    image: "https://via.placeholder.com/200x200",
    category: "despensa",
    stock: 50,
    rating: 4.5
  },
  {
    id: '5',
    name: "Azúcar providencia",
    price: 14600,
    description: "2500gr",
    image: "https://via.placeholder.com/200x200",
    category: "despensa",
    stock: 50,
    rating: 4.5
  },
  {
    id: '6',
    name: "Harina pan",
    price: 2400,
    description: "500gm",
    image: "https://via.placeholder.com/200x200",
    category: "despensa",
    stock: 50,
    rating: 4.5
  },
  {
    id: '7',
    name: "Arvejas y zanahoria mi dia",
    price: 4100,
    description: "300g",
    image: "https://via.placeholder.com/200x200",
    category: "despensa",
    stock: 50,
    rating: 4.5
  },
  {
    id: '8',
    name: "Desengrasante",
    price: 3700,
    description: "1 galón",
    image: "https://via.placeholder.com/200x200",
    category: "aseo hogar",
    stock: 50,
    rating: 4.5
  },
  {
    id: '9',
    name: "Suavizante alkosto",
    price: 17000,
    description: "4Lt",
    image: "https://via.placeholder.com/200x200",
    category: "aseo hogar",
    stock: 50,
    rating: 4.5
  },
  {
    id: '10',
    name: "Detergente - súper B",
    price: 13600,
    description: "3000ml",
    image: "https://via.placeholder.com/200x200",
    category: "aseo hogar",
    stock: 50,
    rating: 4.5
  },
  {
    id: '11',
    name: "Limpia pisos - súper B",
    price: 6500,
    description: "2Lt",
    image: "https://via.placeholder.com/200x200",
    category: "aseo hogar",
    stock: 50,
    rating: 4.5
  },
  {
    id: '12',
    name: "Limpia pisos - Bondi",
    price: 1500,
    description: "5000ml",
    image: "https://via.placeholder.com/200x200",
    category: "aseo hogar",
    stock: 50,
    rating: 4.5
  },
  {
    id: '13',
    name: "Lava losa - súper B",
    price: 5500,
    description: "960ml liquido",
    image: "https://via.placeholder.com/200x200",
    category: "aseo hogar",
    stock: 50,
    rating: 4.5
  },
  {
    id: '14',
    name: "Bolsas basura",
    price: 16000,
    description: "60 unidades",
    image: "https://via.placeholder.com/200x200",
    category: "aseo hogar",
    stock: 50,
    rating: 4.5
  },
  {
    id: '15',
    name: "pañitos húmedos dampi  ",
    price: 8200,
    description: "150 unidades",
    image: "https://via.placeholder.com/200x200",
    category: "aseo personal",
    stock: 50,
    rating: 4.5
  },
  {
    id: '16',
    name: "pañitos húmedos  ",
    price: 6000,
    description: "100 unidades",
    image: "https://via.placeholder.com/200x200",
    category: "aseo personal",
    stock: 50,
    rating: 4.5
  },
  {
    id: '17',
    name: "jabon de baño protex ",
    price: 3700,
    description: "110 gr",
    image: "https://via.placeholder.com/200x200",
    category: "aseo personal",
    stock: 50,
    rating: 4.5
  },
  {
    id: '18',
    name: "lava loza crema mi dia  ",
    price: 5800,
    description: "1000 gr",
    image: "https://via.placeholder.com/200x200",
    category: "aseo hogar",
    stock: 50,
    rating: 4.5
  },
  {
    id: '19',
    name: "papel higenico blank x 4 ",
    price: 9500,
    description: "triple hoja abullomax plux ",
    image: "https://via.placeholder.com/200x200",
    category: "despensa",
    stock: 50,
    rating: 4.5
  },
  {
    id: '20',
    name: "papel higenico  ",
    price: 2500,
    description: "megarrollo",
    image: "https://via.placeholder.com/200x200",
    category: "despensa",
    stock: 50,
    rating: 4.5
  },
  {
    id: '21',
    name: "protectores diarios nosotras",
    price: 16000,
    description: "tipo tela x 120 und",
    image: "https://via.placeholder.com/200x200",
    category: "cuidado personal",
    stock: 50,
    rating: 4.5
  },
  {
    id: '22',
    name: "toallas femeninas kotex ",
    price: 4200,
    description: "tipo tela x 10 und",
    image: "https://via.placeholder.com/200x200",
    category: "cuidado personal",
    stock: 50,
    rating: 4.5
  },
  {
    id: '23',
    name: "toallas de cocina  ",
    price: 11800,
    description: "triple hoja x 130 hojas ",
    image: "https://via.placeholder.com/200x200",
    category: "despensa",
    stock: 50,
    rating: 4.5
  },
  {
    id: '24',
    name: "toallas de cocina  ",
    price: 8200,
    description: "triple hoja x 80 hojas ",
    image: "https://via.placeholder.com/200x200",
    category: "despensa",
    stock: 50,
    rating: 4.5
  },
  {
    id: '25',
    name: "protector solar total block yanbal  ",
    price: 65500,
    description: "140 gr",
    image: "https://via.placeholder.com/200x200",
    category: "despensa",
    stock: 50,
    rating: 4.7,
    isGolden: true
  },
  {
    id: '26',
    name: "protector solar total block yanbal ",
    price: 52000,
    description: "80 gr ",
    image: "https://via.placeholder.com/200x200",
    category: "cuidado personal",
    stock: 50,
    rating: 4.5
  },
  {
    id: '27',
    name: "aguardiente Nariño  ",
    price: 45000,
    description: "botella ",
    image: "https://via.placeholder.com/200x200",
    category: "despensa",
    stock: 50,
    rating: 4.8,
    isGolden: true
  },
  {
    id: '28',
    name: "aguardiente nariño ",
    price: 24000,
    description: "media",
    image: "https://via.placeholder.com/200x200",
    category: "despensa",
    stock: 50,
    rating: 4.5
  },
  {
    id: '29',
    name: "electrolit ",
    price: 7800,
    description: "625 ml ",
    image: "https://via.placeholder.com/200x200",
    category: "cuidado personal",
    stock: 50,
    rating: 4.5
  },
  {
    id: '30',
    name: "saviloe ",
    price: 2300,
    description: "320 ml",
    image: "https://via.placeholder.com/200x200",
    category: "mecato",
    stock: 50,
    rating: 4.5
  },
  {
    id: '31',
    name: "papel higenico rosal ",
    price: 20000,
    description: "12 rollos triple hoja  XG",
    image: "https://via.placeholder.com/200x200",
    category: "despensa",
    stock: 50,
    rating: 4.5
  },
  {
    id: '32',
    name: "papel higenico rosal ",
    price: 23000,
    description: "15 rollos, triple hoja XG",
    image: "https://via.placeholder.com/200x200",
    category: "despensa",
    stock: 50,
    rating: 4.5
  },
  {
    id: '33',
    name: "crema dental fortident x3 und",
    price: 19500,
    description: "125 ml cada una  cuatriaccion",
    image: "https://via.placeholder.com/200x200",
    category: "cuidado personal",
    stock: 50,
    rating: 4.5
  },
  {
    id: '34',
    name: "crema dental fortident x3 und cuatriaccion",
    price: 14000,
    description: "85 ml c/u",
    image: "https://via.placeholder.com/200x200",
    category: "cuidado personal",
    stock: 50,
    rating: 4.5
  },
  {
    id: '35',
    name: "Colgate triple acción x 3",
    price: 17500,
    description: "75 ml c/u",
    image: "https://via.placeholder.com/200x200",
    category: "cuidado personal",
    stock: 50,
    rating: 4.5
  },
  {
    id: '36',
    name: "crema dental oral B",
    price: 7000,
    description: "53 ml 3D white",
    image: "https://via.placeholder.com/200x200",
    category: "cuidado personal",
    stock: 50,
    rating: 4.5
  },
  {
    id: '37',
    name: "Colgate triple acción",
    price: 4200,
    description: "60 ml 1",
    image: "https://via.placeholder.com/200x200",
    category: "cuidado personal",
    stock: 50,
    rating: 4.5
  },
  {
    id: '38',
    name: "EJEMPLO",
    price: 4200,
    description: "60 ml 1",
    image: "https://via.placeholder.com/200x200",
    category: "cuidado personal",
    stock: 50,
    rating: 4.5
  }
];

export const MOCK_USERS: UserProfile[] = [
  {
    id: '1',
    cedula: '1234567890',
    name: 'Administrador Principal',
    email: 'admin@fondof.com',
    phoneNumber: '3105830555',
    createdAt: '2023-01-01',
    role: Role.ADMIN,
    creditLimit: 0,
    savings: {
      balance: 0,
      monthlyContribution: 0,
      lastContributionDate: '',
      interestEarned: 0,
      history: []
    },
    loans: []
  },
  {
    id: '109823',
    cedula: '987654321',
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@email.com',
    phoneNumber: '3109876543',
    createdAt: '2023-05-10',
    role: Role.USER,
    creditLimit: 5000000,
    savings: {
      balance: 1250000,
      monthlyContribution: 100000,
      lastContributionDate: '2023-10-01',
      interestEarned: 45000,
      history: [
        { id: 'h1', date: '2023-10-01', amount: 100000, type: 'DEPOSIT' },
        { id: 'h2', date: '2023-09-01', amount: 100000, type: 'DEPOSIT' },
        { id: 'h3', date: '2023-08-31', amount: 5000, type: 'INTEREST' },
        { id: 'h4', date: '2023-08-01', amount: 100000, type: 'DEPOSIT' },
        { id: 'h5', date: '2023-07-01', amount: 100000, type: 'DEPOSIT' },
        { id: 'h6', date: '2023-06-15', amount: 50000, type: 'WITHDRAWAL' },
        { id: 'h7', date: '2023-06-01', amount: 100000, type: 'DEPOSIT' },
      ]
    },
    loans: [
      {
        id: 'L-001',
        amount: 2000000,
        remainingAmount: 1200000,
        interestRate: 1.5, // 1.5% Mensual
        termMonths: 12,
        startDate: '2023-05-15',
        nextPaymentDate: '2023-11-15',
        monthlyPayment: 183000,
        status: LoanStatus.ACTIVE,
        paymentsMade: 5
      }
    ]
  }
];