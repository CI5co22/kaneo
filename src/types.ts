export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  estimatedCost: number;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: Ingredient[];
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  image: string;
  instructions: string[];
}

export interface ShoppingItem extends Ingredient {
  recipes: string[];
  alreadyHave: boolean;
}

export type DayOfWeek = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';
export type MealTime = 'Desayuno' | 'Almuerzo' | 'Cena';

export interface WeeklyPlan {
  [day: string]: {
    [time: string]: string | null; // recipeId
  };
}

export interface InventoryItem {
  name: string;
  amount: number;
  unit: string;
}
