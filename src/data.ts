import { Recipe } from './types';

export const RECIPES: Recipe[] = [
  // BREAKFAST (8)
  {
    id: 'b1',
    name: 'Avena con Frutas',
    description: 'Energía para toda la mañana.',
    category: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&q=80&w=800',
    ingredients: [
      { name: 'Avena', amount: 50, unit: 'g', estimatedCost: 4.00 },
      { name: 'Leche', amount: 200, unit: 'ml', estimatedCost: 5.00 },
      { name: 'Plátano', amount: 1, unit: 'unidad', estimatedCost: 3.00 },
      { name: 'Miel', amount: 1, unit: 'cucharada', estimatedCost: 2.00 },
    ],
    instructions: [
      'Calentar la leche con la avena.',
      'Remover hasta que espese.',
      'Cortar el plátano en rodajas.',
      'Servir con el plátano y un chorrito de miel.'
    ]
  },
  {
    id: 'b2',
    name: 'Tostadas con Huevo',
    description: 'Proteína rápida y barata.',
    category: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=800',
    ingredients: [
      { name: 'Pan de molde', amount: 2, unit: 'rebanadas', estimatedCost: 3.00 },
      { name: 'Huevos', amount: 2, unit: 'unidades', estimatedCost: 6.00 },
      { name: 'Aceite', amount: 1, unit: 'cucharada', estimatedCost: 1.00 },
    ],
    instructions: [
      'Tostar el pan.',
      'Hacer los huevos a la plancha o revueltos.',
      'Poner los huevos sobre las tostadas.',
      'Salpimentar al gusto.'
    ]
  },
  {
    id: 'b3',
    name: 'Yogurt con Granola',
    description: 'Ligero y refrescante.',
    category: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a02583ec?auto=format&fit=crop&q=80&w=800',
    ingredients: [
      { name: 'Yogurt Natural', amount: 200, unit: 'g', estimatedCost: 8.00 },
      { name: 'Granola', amount: 50, unit: 'g', estimatedCost: 5.00 },
      { name: 'Fresas', amount: 4, unit: 'unidades', estimatedCost: 4.00 },
    ],
    instructions: [
      'Servir el yogurt en un bol.',
      'Añadir la granola por encima.',
      'Lavar y picar las fresas y decorar.'
    ]
  },
  {
    id: 'b4',
    name: 'Sándwich de Jamón y Queso',
    description: 'El clásico de siempre.',
    category: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1475090169767-40ed8d18f67d?auto=format&fit=crop&q=80&w=800',
    ingredients: [
      { name: 'Pan de molde', amount: 2, unit: 'rebanadas', estimatedCost: 3.00 },
      { name: 'Jamón', amount: 2, unit: 'fetas', estimatedCost: 5.00 },
      { name: 'Queso', amount: 1, unit: 'feta', estimatedCost: 4.00 },
    ],
    instructions: [
      'Tostar el pan levemente.',
      'Colocar el jamón y el queso entre las rebanadas.',
      'Calentar en la sartén hasta que el queso derrita.'
    ]
  },
  {
    id: 'b5',
    name: 'Omelet de Espinacas',
    description: 'Desayuno verde y potente.',
    category: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&q=80&w=800',
    ingredients: [
      { name: 'Huevos', amount: 2, unit: 'unidades', estimatedCost: 6.00 },
      { name: 'Espinacas', amount: 50, unit: 'g', estimatedCost: 4.00 },
      { name: 'Ajo', amount: 1, unit: 'diente', estimatedCost: 1.00 },
    ],
    instructions: [
      'Sofreír la espinaca con el ajo picado.',
      'Batir los huevos y verter en la sartén.',
      'Doblar cuando esté cuajado y servir.'
    ]
  },
  {
    id: 'b6',
    name: 'Panqueques de Plátano',
    description: 'Dulce pero muy saludable.',
    category: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&q=80&w=800',
    ingredients: [
      { name: 'Plátano', amount: 1, unit: 'unidad', estimatedCost: 3.00 },
      { name: 'Huevo', amount: 1, unit: 'unidad', estimatedCost: 3.00 },
      { name: 'Canela', amount: 1, unit: 'pizca', estimatedCost: 0.50 },
    ],
    instructions: [
      'Aplastar el plátano hasta que sea puré.',
      'Mezclar con el huevo y canela.',
      'Cocinar cucharadas de la mezcla en una sartén antiadherente.'
    ]
  },
  {
    id: 'b7',
    name: 'Tostada con Aguacate',
    description: 'Tendencia nutritiva y deliciosa.',
    category: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=800',
    ingredients: [
      { name: 'Aguacate', amount: 0.5, unit: 'unidad', estimatedCost: 8.00 },
      { name: 'Pan integral', amount: 1, unit: 'rebanada', estimatedCost: 2.00 },
      { name: 'Limón', amount: 0.25, unit: 'unidad', estimatedCost: 1.00 },
    ],
    instructions: [
      'Tostar el pan.',
      'Machacar el aguacate con sal y limón.',
      'Untar sobre el pan caliente.'
    ]
  },
  {
    id: 'b8',
    name: 'Batido de Fresa y Plátano',
    description: 'Desayuno rápido para llevar.',
    category: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1464454709131-ffd692591ee5?auto=format&fit=crop&q=80&w=800',
    ingredients: [
      { name: 'Fresas', amount: 6, unit: 'unidades', estimatedCost: 6.00 },
      { name: 'Plátano', amount: 1, unit: 'unidad', estimatedCost: 3.00 },
      { name: 'Leche', amount: 250, unit: 'ml', estimatedCost: 6.00 },
    ],
    instructions: [
      'Poner todos los ingredientes en la licuadora.',
      'Mezclar hasta que esté suave.',
      'Servir frío inmediatamente.'
    ]
  },

  // LUNCH (8)
  {
    id: 'l1',
    name: 'Arroz con Pollo',
    description: 'Nutritivo y rinde para varias comidas.',
    category: 'Lunch',
    image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&q=80&w=800',
    ingredients: [
      { name: 'Arroz', amount: 300, unit: 'g', estimatedCost: 6.00 },
      { name: 'Pechuga de pollo', amount: 400, unit: 'g', estimatedCost: 35.00 },
      { name: 'Zanahoria', amount: 2, unit: 'unidades', estimatedCost: 4.00 },
      { name: 'Guisantes', amount: 100, unit: 'g', estimatedCost: 5.00 },
    ],
    instructions: [
      'Cortar el pollo y dorar en la olla.',
      'Añadir las verduras picadas.',
      'Echar el arroz y el doble de agua.',
      'Cocinar hasta que el arroz esté listo.'
    ]
  },
  {
    id: 'l2',
    name: 'Ensalada de Garbanzos',
    description: 'Fresca, barata y llena de proteína.',
    category: 'Lunch',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800',
    ingredients: [
      { name: 'Garbanzos cocidos', amount: 400, unit: 'g', estimatedCost: 9.00 },
      { name: 'Pepino', amount: 1, unit: 'unidad', estimatedCost: 6.00 },
      { name: 'Tomate cherry', amount: 200, unit: 'g', estimatedCost: 15.00 },
      { name: 'Cebolla roja', amount: 0.5, unit: 'unidad', estimatedCost: 2.00 },
    ],
    instructions: [
      'Lavar los garbanzos.',
      'Picar todas las verduras en trozos pequeños.',
      'Mezclar todo en un bol.',
      'Aliñar con aceite, vinagre y sal.'
    ]
  },
  {
    id: 'l3',
    name: 'Lentejas con Chorizo',
    description: 'Sabor tradicional y reconfortante.',
    category: 'Lunch',
    image: 'https://images.unsplash.com/photo-1547592110-803916738902?auto=format&fit=crop&q=80&w=800',
    ingredients: [
      { name: 'Lentejas', amount: 200, unit: 'g', estimatedCost: 5.00 },
      { name: 'Chorizo', amount: 100, unit: 'g', estimatedCost: 12.00 },
      { name: 'Patata', amount: 1, unit: 'unidad', estimatedCost: 3.00 },
      { name: 'Pimentón', amount: 1, unit: 'cucharadita', estimatedCost: 1.00 },
    ],
    instructions: [
      'Lavar lentejas y cocer con agua fría.',
      'Añadir el chorizo troceado y la patata.',
      'Hacer un sofrito de cebolla con el pimentón.',
      'Juntar todo y cocinar 20 minutos.'
    ]
  },
  {
    id: 'l4',
    name: 'Tacos de Pollo',
    description: 'Comida rápida y divertida.',
    category: 'Lunch',
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&q=80&w=800',
    ingredients: [
      { name: 'Tortillas de maíz', amount: 6, unit: 'unidades', estimatedCost: 6.00 },
      { name: 'Pechuga de pollo', amount: 300, unit: 'g', estimatedCost: 28.00 },
      { name: 'Cebolla', amount: 0.5, unit: 'unidad', estimatedCost: 2.00 },
      { name: 'Cilantro', amount: 1, unit: 'manojo', estimatedCost: 3.00 },
    ],
    instructions: [
      'Desmechar o picar el pollo cocido.',
      'Picar la cebolla y el cilantro finamente.',
      'Calentar tortillas.',
      'Armar los tacos con el pollo y los vegetales.'
    ]
  },
  {
    id: 'l5',
    name: 'Filete de Pescado al Limón',
    description: 'Almuerzo ligero y elegante.',
    category: 'Lunch',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800',
    ingredients: [
      { name: 'Pescado blanco', amount: 400, unit: 'g', estimatedCost: 45.00 },
      { name: 'Limón', amount: 1, unit: 'unidad', estimatedCost: 4.00 },
      { name: 'Mantequilla', amount: 2, unit: 'cucharadas', estimatedCost: 6.00 },
    ],
    instructions: [
      'Salpimentar los filetes de pescado.',
      'Derretir mantequilla en una sartén.',
      'Cocinar 4 min por lado y rociar con limón.'
    ]
  },
  {
    id: 'l6',
    name: 'Pasta Carbonara Económica',
    description: 'Cremosa y muy saciante.',
    category: 'Lunch',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=800',
    ingredients: [
      { name: 'Pasta', amount: 250, unit: 'g', estimatedCost: 8.00 },
      { name: 'Huevos', amount: 2, unit: 'unidades', estimatedCost: 6.00 },
      { name: 'Panceta o Tocino', amount: 100, unit: 'g', estimatedCost: 15.00 },
      { name: 'Queso rallado', amount: 50, unit: 'g', estimatedCost: 10.00 },
    ],
    instructions: [
      'Cocer pasta al dente.',
      'Dorar el tocino en la sartén.',
      'Batir huevos con queso.',
      'Mezclar todo fuera del fuego con agua de cocción.'
    ]
  },
  {
    id: 'l7',
    name: 'Hamburguesa Casera',
    description: 'Mucho mejor que la de cadena.',
    category: 'Lunch',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800',
    ingredients: [
      { name: 'Carne molida', amount: 300, unit: 'g', estimatedCost: 25.00 },
      { name: 'Pan de hamburguesa', amount: 2, unit: 'unidades', estimatedCost: 10.00 },
      { name: 'Lechuga', amount: 2, unit: 'hojas', estimatedCost: 2.00 },
      { name: 'Tomate', amount: 1, unit: 'unidad', estimatedCost: 4.00 },
    ],
    instructions: [
      'Formar medallones de carne y salpimentar.',
      'Cocinar a la plancha.',
      'Armar en el pan con los vegetales y salsas.'
    ]
  },
  {
    id: 'l8',
    name: 'Ensalada César con Pollo',
    description: 'Equilibrio perfecto de sabores.',
    category: 'Lunch',
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&q=80&w=800',
    ingredients: [
      { name: 'Pechuga de pollo', amount: 200, unit: 'g', estimatedCost: 18.00 },
      { name: 'Lechuga', amount: 1, unit: 'cabeza', estimatedCost: 8.00 },
      { name: 'Crutones', amount: 50, unit: 'g', estimatedCost: 5.00 },
      { name: 'Queso Parmesano', amount: 20, unit: 'g', estimatedCost: 10.00 },
    ],
    instructions: [
      'Cocinar el pollo a la plancha y cortar en tiras.',
      'Mezclar lechuga picada con crutones y queso.',
      'Añadir aderezo César y el pollo.'
    ]
  },

  // DINNER (8)
  {
    id: 'd1',
    name: 'Pasta con Tomate y Albahaca',
    description: 'Un clásico económico y rápido.',
    category: 'Dinner',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=800',
    ingredients: [
      { name: 'Pasta', amount: 250, unit: 'g', estimatedCost: 8.00 },
      { name: 'Tomate triturado', amount: 400, unit: 'g', estimatedCost: 12.00 },
      { name: 'Albahaca fresca', amount: 1, unit: 'manojo', estimatedCost: 10.00 },
      { name: 'Ajo', amount: 2, unit: 'dientes', estimatedCost: 2.00 },
    ],
    instructions: [
      'Cocer la pasta en agua con sal.',
      'Sofreír el ajo en una sartén.',
      'Añadir el tomate y cocinar 10 min.',
      'Mezclar con la pasta y añadir albahaca.'
    ]
  },
  {
    id: 'd2',
    name: 'Tortilla de Patatas',
    description: 'Solo 3 ingredientes básicos.',
    category: 'Dinner',
    image: 'https://images.unsplash.com/photo-1547592166-73ac4a10655c?auto=format&fit=crop&q=80&w=800',
    ingredients: [
      { name: 'Patatas', amount: 500, unit: 'g', estimatedCost: 7.00 },
      { name: 'Huevos', amount: 6, unit: 'unidades', estimatedCost: 18.00 },
      { name: 'Cebolla', amount: 1, unit: 'unidad', estimatedCost: 3.00 },
    ],
    instructions: [
      'Pelar y cortar las patatas y cebolla.',
      'Freír en abundante aceite hasta que estén tiernas.',
      'Batir los huevos y mezclar con las patatas.',
      'Cuajar la tortilla en la sartén por ambos lados.'
    ]
  },
  {
    id: 'd3',
    name: 'Sopa de Fideos',
    description: 'Lo más barato para una cena ligera.',
    category: 'Dinner',
    image: 'https://images.unsplash.com/photo-1547592110-803916738902?auto=format&fit=crop&q=80&w=800',
    ingredients: [
      { name: 'Caldo de pollo', amount: 500, unit: 'ml', estimatedCost: 6.00 },
      { name: 'Fideos finos', amount: 50, unit: 'g', estimatedCost: 2.00 },
      { name: 'Huevo duro', amount: 1, unit: 'unidad', estimatedCost: 3.00 },
    ],
    instructions: [
      'Calentar el caldo hasta que hierva.',
      'Añadir los fideos y cocinar 3 min.',
      'Picar el huevo duro.',
      'Servir la sopa con el huevo por encima.'
    ]
  },
  {
    id: 'd4',
    name: 'Quesadillas de Frijoles',
    description: 'Rápido, barato y delicioso.',
    category: 'Dinner',
    image: 'https://images.unsplash.com/photo-1599974590225-217ec63a8da0?auto=format&fit=crop&q=80&w=800',
    ingredients: [
      { name: 'Tortillas de harina', amount: 4, unit: 'unidades', estimatedCost: 8.00 },
      { name: 'Queso Oaxaca o Mozzarella', amount: 200, unit: 'g', estimatedCost: 20.00 },
      { name: 'Frijoles refritos', amount: 1, unit: 'taza', estimatedCost: 10.00 },
    ],
    instructions: [
      'Untar frijoles en la mitad de cada tortilla.',
      'Añadir abundante queso.',
      'Doblar y calentar en comal hasta que doren.'
    ]
  },
  {
    id: 'd5',
    name: 'Pizza Margarita Casera',
    description: 'La cena favorita de todos.',
    category: 'Dinner',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?auto=format&fit=crop&q=80&w=800',
    ingredients: [
      { name: 'Masa de pizza', amount: 1, unit: 'unidad', estimatedCost: 15.00 },
      { name: 'Salsa de tomate', amount: 100, unit: 'ml', estimatedCost: 5.00 },
      { name: 'Mozzarella fresca', amount: 150, unit: 'g', estimatedCost: 25.00 },
    ],
    instructions: [
      'Precalentar horno a 220°C.',
      'Extender salsa sobre la masa.',
      'Añadir queso y hornear 12 minutos.'
    ]
  },
  {
    id: 'd6',
    name: 'Sándwich Club',
    description: 'Cena completa entre pan.',
    category: 'Dinner',
    image: 'https://images.unsplash.com/photo-1567234665766-dec7480ee062?auto=format&fit=crop&q=80&w=800',
    ingredients: [
      { name: 'Pan de molde', amount: 3, unit: 'rebanadas', estimatedCost: 4.50 },
      { name: 'Pechuga de pavo', amount: 50, unit: 'g', estimatedCost: 8.00 },
      { name: 'Lechuga y Tomate', amount: 1, unit: 'set', estimatedCost: 5.00 },
      { name: 'Huevo frito', amount: 1, unit: 'unidad', estimatedCost: 3.00 },
    ],
    instructions: [
      'Tostar 3 panes.',
      'Armar capas con pavo, vegetales y huevo.',
      'Cortar en triángulos y pinchar con palillo.'
    ]
  },
  {
    id: 'd7',
    name: 'Crema de Calabaza',
    description: 'Suave y llena de vitaminas.',
    category: 'Dinner',
    image: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?auto=format&fit=crop&q=80&w=800',
    ingredients: [
      { name: 'Calabaza', amount: 500, unit: 'g', estimatedCost: 15.00 },
      { name: 'Cebolla', amount: 0.5, unit: 'unidad', estimatedCost: 2.00 },
      { name: 'Nata o crema leche', amount: 50, unit: 'ml', estimatedCost: 8.00 },
    ],
    instructions: [
      'Cocer calabaza y cebolla en agua hasta que estén tiernas.',
      'Escurrir casi todo el agua.',
      'Licuar con la nata y salpimentar.'
    ]
  },
  {
    id: 'd8',
    name: 'Atún con Galletas',
    description: 'La cena de "no tengo ganas de cocinar".',
    category: 'Dinner',
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=800',
    ingredients: [
      { name: 'Atún en lata', amount: 1, unit: 'lata', estimatedCost: 12.00 },
      { name: 'Mayonesa', amount: 1, unit: 'cucharada', estimatedCost: 2.00 },
      { name: 'Galletas saladas', amount: 1, unit: 'paquete', estimatedCost: 5.00 },
    ],
    instructions: [
      'Mezclar atún con mayonesa.',
      'Añadir unas gotas de limón si tienes.',
      'Comer sobre las galletas saladas.'
    ]
  },
];
