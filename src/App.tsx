import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingCart, 
  Utensils, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Plus, 
  ChefHat, 
  Wallet, 
  Calendar as CalendarIcon, 
  Home, 
  Package, 
  Search,
  ChevronRight,
  Clock,
  ArrowRight,
  X,
  GripVertical,
  Edit3
} from 'lucide-react';
import { RECIPES } from './data';
import { Recipe, WeeklyPlan, DayOfWeek, MealTime } from './types';

const DAYS: DayOfWeek[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const MEALS: MealTime[] = ['Desayuno', 'Almuerzo', 'Cena'];

const getCurrentDay = (): DayOfWeek => {
  const days: DayOfWeek[] = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const day = days[new Date().getDay()];
  return (day === 'Domingo' ? 'Domingo' : day) as DayOfWeek;
};

const MealSlot: React.FC<{ 
  day: DayOfWeek, 
  time: MealTime, 
  recipeId?: string, 
  isSelected: boolean,
  isActiveDay: boolean,
  isLocked?: boolean,
  isCooked?: boolean,
  onClick?: () => void
}> = ({ 
  day, 
  time, 
  recipeId, 
  isSelected, 
  isActiveDay,
  isLocked = false,
  isCooked = false,
  onClick 
}) => {
  const recipe = recipeId ? RECIPES.find(r => r.id === recipeId) : null;

  return (
    <div
      onClick={onClick}
      className={`relative group transition-all duration-300 rounded-2xl ${
        isSelected ? 'ring-2 ring-orange-500 ring-offset-2' : ''
      } ${!isLocked ? 'cursor-pointer' : 'cursor-default'} ${
        !recipe && isActiveDay && !isLocked ? 'scale-105 shadow-md' : ''
      } ${recipe && !isLocked ? 'hover:ring-2 hover:ring-red-200 hover:ring-offset-1' : ''} ${isCooked ? 'opacity-60' : ''}`}
    >
      <div className={`aspect-[4/3] rounded-2xl overflow-hidden border-2 border-dashed transition-all ${
        recipe ? 'border-transparent shadow-sm' : 
        isActiveDay ? 'border-orange-300 bg-orange-50/50' : 'border-gray-100 bg-gray-50/30'
      }`}>
        {recipe ? (
          <div className="relative h-full">
            <img src={recipe.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {isCooked && (
              <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-white drop-shadow-lg" />
              </div>
            )}

            {/* Hover Delete Overlay */}
            {!isLocked && !isCooked && (
              <div className="absolute inset-0 bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                <Trash2 className="w-6 h-6 text-white/90" />
              </div>
            )}

            <div className={`absolute bottom-2 left-2 right-2 ${!isLocked && !isCooked ? 'group-hover:opacity-0' : ''} transition-opacity`}>
              <p className="text-[10px] font-bold text-white truncate">{recipe.name}</p>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center">
            <div className={`w-1.5 h-1.5 rounded-full transition-all ${isActiveDay ? 'bg-orange-400 scale-150' : 'bg-gray-200'}`} />
          </div>
        )}
      </div>
    </div>
  );
}

const SetupPoolItem: React.FC<{ id: string, recipe: Recipe, onRemove: () => void }> = ({ id, recipe, onRemove }) => {
  return (
    <div
      className="bg-white rounded-xl p-2 border border-gray-100 flex items-center gap-3 shadow-sm group"
    >
      <img src={recipe.image} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold truncate">{recipe.name}</p>
        <p className="text-[8px] text-gray-400 uppercase font-black tracking-widest">{recipe.category}</p>
      </div>
      <button onClick={onRemove} className="p-1 text-gray-300 hover:text-red-500">
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

const SidebarRecipeItem: React.FC<{ recipe: Recipe, onClick: () => void }> = ({ recipe, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl p-2 border border-gray-100 flex items-center gap-3 shadow-sm cursor-pointer hover:border-orange-200 transition-all active:scale-95"
    >
      <img src={recipe.image} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold truncate">{recipe.name}</p>
        <p className="text-[8px] text-gray-400 uppercase font-black tracking-widest">{recipe.category}</p>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<'dashboard' | 'calendar' | 'planner' | 'inventory' | 'setup' | 'recipe-details'>('dashboard');
  const [setupStep, setSetupStep] = useState<'breakfast' | 'lunch' | 'dinner'>('breakfast');
  const [setupSelectedPool, setSetupSelectedPool] = useState<{id: string, category: string}[]>([]);
  const [selectedRecipeForDetails, setSelectedRecipeForDetails] = useState<Recipe | null>(null);

  const [isReselectingPool, setIsReselectingPool] = useState(false);
  const [hasReachedCalendarOnce, setHasReachedCalendarOnce] = useState(false);
  const [isShowingCalendarCTA, setIsShowingCalendarCTA] = useState(true);
  const [cookedMeals, setCookedMeals] = useState<Set<string>>(new Set());

  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan>(() => {
    const plan: WeeklyPlan = {};
    DAYS.forEach(day => {
      plan[day] = { Desayuno: null, Almuerzo: null, Cena: null };
    });
    return plan;
  });
  const [inventory, setInventory] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<{ day: DayOfWeek, time: MealTime } | null>(null);

  const [selectedRecipeForPlacement, setSelectedRecipeForPlacement] = useState<Recipe | null>(null);
  const [activeCategory, setActiveCategory] = useState<Recipe['category']>('Breakfast');

  const [activeDay, setActiveDay] = useState<DayOfWeek>('Lunes');

  const handleSidebarRecipeClick = (recipe: Recipe) => {
    const mealTimeMap: Record<string, MealTime> = {
      'Breakfast': 'Desayuno',
      'Lunch': 'Almuerzo',
      'Dinner': 'Cena'
    };
    const time = mealTimeMap[recipe.category];
    if (time) {
      setWeeklyPlan(prev => {
        const newPlan = {
          ...prev,
          [activeDay]: {
            ...prev[activeDay],
            [time]: recipe.id
          }
        };

        // Check if current activeDay is now complete
        const isDayComplete = Object.values(newPlan[activeDay]).every(v => v !== null);
        
        if (isDayComplete) {
          const currentIndex = DAYS.indexOf(activeDay);
          for (let i = 1; i < DAYS.length; i++) {
            const nextIndex = (currentIndex + i) % DAYS.length;
            const nextDay = DAYS[nextIndex];
            const isNextDayComplete = Object.values(newPlan[nextDay]).every(v => v !== null);
            if (!isNextDayComplete) {
              // Use a small delay to ensure the state update for weeklyPlan is processed
              setTimeout(() => setActiveDay(nextDay), 0);
              break;
            }
          }
        }

        return newPlan;
      });
    }
  };

  // Derived state
  const hasPlan = useMemo(() => 
    Object.values(weeklyPlan).some(day => Object.values(day).some(v => v !== null)),
    [weeklyPlan]
  );

  const isPlanComplete = useMemo(() => 
    DAYS.every(day => Object.values(weeklyPlan[day] || {}).every(v => v !== null)),
    [weeklyPlan]
  );

  const nextMeal = useMemo(() => {
    const today = getCurrentDay();
    const todayIdx = DAYS.indexOf(today);
    
    // Start from today and look forward
    for (let i = 0; i < DAYS.length; i++) {
      const dayIdx = (todayIdx + i) % DAYS.length;
      const day = DAYS[dayIdx];
      
      for (const time of MEALS) {
        const recipeId = weeklyPlan[day]?.[time];
        const isCooked = cookedMeals.has(`${day}-${time}`);
        
        if (recipeId && !isCooked) {
          return { day, time, recipe: RECIPES.find(r => r.id === recipeId) };
        }
      }
    }
    return null;
  }, [weeklyPlan, cookedMeals]);

  const filteredRecipes = useMemo(() => {
    let base = RECIPES;
    
    // Filter by category if in setup or on-the-go slot selection
    if (view === 'setup') {
      const catMap = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' };
      base = base.filter(r => r.category === catMap[setupStep]);
    } else if (selectedSlot) {
      const catMap = { Desayuno: 'Breakfast', Almuerzo: 'Lunch', Cena: 'Dinner' };
      base = base.filter(r => r.category === catMap[selectedSlot.time]);
    }

    return base.filter(recipe => {
      const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          recipe.ingredients.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    }).sort((a, b) => {
      const aMatches = a.ingredients.filter(i => inventory.has(i.name.toLowerCase())).length;
      const bMatches = b.ingredients.filter(i => inventory.has(i.name.toLowerCase())).length;
      return bMatches - aMatches;
    });
  }, [searchQuery, inventory, view, setupStep, selectedSlot]);

  const totalCost = useMemo(() => {
    let cost = 0;
    Object.values(weeklyPlan).forEach(day => {
      Object.values(day).forEach(recipeId => {
        if (recipeId) {
          const recipe = RECIPES.find(r => r.id === recipeId);
          recipe?.ingredients.forEach(ing => {
            if (!inventory.has(ing.name.toLowerCase())) {
              cost += ing.estimatedCost;
            }
          });
        }
      });
    });
    return cost;
  }, [weeklyPlan, inventory]);

  const handleSelectRecipe = (recipeId: string) => {
    if (view === 'setup') {
      const recipe = RECIPES.find(r => r.id === recipeId);
      if (!recipe) return;
      
      setSetupSelectedPool(prev => {
        const exists = prev.find(item => item.id === recipeId);
        if (exists) return prev.filter(item => item.id !== recipeId);
        
        // Limit to 5 items per category
        const categoryCount = prev.filter(item => item.category === recipe.category).length;
        if (categoryCount >= 5) {
          // Optional: show a message or just ignore
          return prev;
        }
        
        return [...prev, { id: recipeId, category: recipe.category }];
      });
      return;
    }

    if (selectedSlot) {
      setWeeklyPlan(prev => ({
        ...prev,
        [selectedSlot.day]: {
          ...prev[selectedSlot.day],
          [selectedSlot.time]: recipeId
        }
      }));
      setSelectedSlot(null);
      setView('calendar');
    }
  };

  const [cookingMessage, setCookingMessage] = useState<string | null>(null);

  const handleCook = () => {
    if (nextMeal?.recipe) {
      const { day, time } = nextMeal;
      setCookedMeals(prev => {
        const next = new Set(prev);
        next.add(`${day}-${time}`);
        return next;
      });
      setCookingMessage(`¡Buen provecho! Has cocinado ${nextMeal.recipe.name}.`);
      setTimeout(() => setCookingMessage(null), 3000);
    }
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [hasFinalizedInitialPlan, setHasFinalizedInitialPlan] = useState(false);

  // Lock active day to today when plan is finalized and not editing
  useEffect(() => {
    if (view === 'calendar' && isPlanComplete && hasFinalizedInitialPlan && !isEditingPlan) {
      setActiveDay(getCurrentDay());
    }
  }, [view, isPlanComplete, hasFinalizedInitialPlan, isEditingPlan]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1C1E] font-sans pb-24">
      {/* Cooking Feedback Overlay */}
      <AnimatePresence>
        {cookingMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-28 left-6 right-6 bg-[#1A1C1E] text-white p-4 rounded-2xl shadow-2xl z-50 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <ChefHat className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-bold">{cookingMessage}</span>
            </div>
            <button onClick={() => setCookingMessage(null)}><X className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">StudentPlan</span>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
          <Wallet className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-bold text-gray-600">${totalCost.toFixed(2)}</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex min-h-[calc(100vh-64px)]">
        {/* Sidebar for Calendar View */}
        <AnimatePresence>
          {view === 'calendar' && (!isPlanComplete || isEditingPlan || !hasFinalizedInitialPlan) && (!(!hasFinalizedInitialPlan && isShowingCalendarCTA)) && (
            <>
              {/* Mobile Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}
              />
              
              <motion.div 
                initial={{ x: -320, opacity: 0 }}
                animate={{ x: isSidebarOpen || window.innerWidth >= 1024 ? 0 : -320, opacity: 1 }}
                exit={{ x: -320, opacity: 0 }}
                className={`w-80 bg-white border-r border-gray-100 fixed lg:sticky top-0 lg:top-16 h-screen lg:h-[calc(100vh-64px)] overflow-y-auto no-scrollbar p-6 space-y-8 z-50 lg:z-10 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
              >
                <div className="flex items-center justify-between lg:block">
                  <div className="space-y-2">
                    <h2 className="text-xl font-black tracking-tight">Recetario</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Arrastra a tu plan semanal</p>
                  </div>
                  <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 bg-gray-50 rounded-full">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-6 pb-20">
                  {MEALS.map(meal => {
                    const catMap = { Desayuno: 'Breakfast', Almuerzo: 'Lunch', Cena: 'Dinner' };
                    const recipes = setupSelectedPool.length > 0
                      ? setupSelectedPool.filter(p => p.category === catMap[meal]).map(p => RECIPES.find(r => r.id === p.id)!)
                      : RECIPES.filter(r => r.category === catMap[meal]);

                    return (
                      <div key={meal} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-orange-500" />
                            {meal}
                          </h3>
                          <button 
                            onClick={() => {
                              const stepMap = { Desayuno: 'breakfast', Almuerzo: 'lunch', Cena: 'dinner' };
                              setSetupStep(stepMap[meal] as any);
                              setIsReselectingPool(true);
                              setView('setup');
                            }}
                            className="text-[8px] font-black text-orange-500 uppercase tracking-widest hover:underline"
                          >
                            Elegir otras
                          </button>
                        </div>
                        <div className="grid gap-2">
                          {recipes.map(recipe => (
                            <SidebarRecipeItem 
                              key={recipe.id} 
                              recipe={recipe} 
                              onClick={() => handleSidebarRecipeClick(recipe)}
                            />
                          ))}
                          {recipes.length === 0 && (
                            <div className="py-4 text-center border border-dashed border-gray-100 rounded-xl">
                              <p className="text-[8px] text-gray-300 font-bold uppercase tracking-widest">Sin recetas</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <main className={`flex-1 transition-all duration-300 ${view === 'calendar' ? (isPlanComplete && hasFinalizedInitialPlan && !isEditingPlan ? 'max-w-5xl mx-auto' : 'max-w-none') : (view === 'recipe-details' ? 'max-w-7xl mx-auto' : 'max-w-2xl mx-auto')} px-6 py-8`}>
          <AnimatePresence mode="wait">
          {view === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Welcome Message */}
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tight">¡Hola, Arnold👋!</h2>
                <p className="text-gray-500 font-medium">¿Qué vamos a cocinar hoy?</p>
              </div>

              {/* Next Meal Card */}
              {nextMeal ? (
                <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-orange-500/10 border border-orange-100 space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Próxima Comida</span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {nextMeal.day === getCurrentDay() ? 'HOY' : nextMeal.day} • {nextMeal.time}
                    </span>
                  </div>
                  
                  <div className="flex gap-6">
                    <img 
                      src={nextMeal.recipe?.image} 
                      className="w-28 h-28 rounded-3xl object-cover shadow-lg" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 space-y-2 flex flex-col justify-center">
                      <h3 className="text-2xl font-black leading-tight tracking-tight">{nextMeal.recipe?.name}</h3>
                      <div className="flex items-center gap-4 text-gray-400 text-xs font-bold">
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-orange-500" /> 20 min</span>
                        <span className="flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5 text-orange-500" /> ${nextMeal.recipe?.ingredients.reduce((s,i)=>s+i.estimatedCost,0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={handleCook}
                      className="flex-1 bg-white border-2 border-[#1A1C1E] text-[#1A1C1E] py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-gray-50 transition-all active:scale-95"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Ya lo cociné
                    </button>
                    <button 
                      onClick={() => {
                        if (nextMeal?.recipe) {
                          setSelectedRecipeForDetails(nextMeal.recipe);
                          setView('recipe-details');
                        }
                      }}
                      className="flex-1 bg-[#1A1C1E] text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 shadow-lg shadow-black/10"
                    >
                      Cocinar
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : hasPlan ? (
                <div className="bg-white rounded-[40px] p-10 border-2 border-dashed border-green-200 text-center space-y-6 shadow-sm">
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10 text-green-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black tracking-tight">¡Plan completado! 🥳</h3>
                    <p className="text-sm text-gray-400 font-medium max-w-[200px] mx-auto">Has cocinado todas tus comidas de la semana.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setWeeklyPlan(prev => {
                        const empty: WeeklyPlan = {};
                        DAYS.forEach(d => empty[d] = { Desayuno: null, Almuerzo: null, Cena: null });
                        return empty;
                      });
                      setCookedMeals(new Set());
                      setView('setup');
                    }}
                    className="inline-flex items-center gap-3 bg-green-500 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-lg shadow-green-500/30 hover:scale-105 transition-transform active:scale-95"
                  >
                    Empezar nueva semana
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-[40px] p-10 border-2 border-dashed border-gray-200 text-center space-y-6 shadow-sm">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                    <CalendarIcon className="w-10 h-10 text-gray-300" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black tracking-tight">No tienes plan para hoy</h3>
                    <p className="text-sm text-gray-400 font-medium max-w-[200px] mx-auto">Organiza tu semana para ahorrar tiempo y dinero.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setView('setup');
                      setIsShowingCalendarCTA(false);
                    }}
                    className="inline-flex items-center gap-3 bg-orange-500 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-lg shadow-orange-500/30 hover:scale-105 transition-transform active:scale-95"
                  >
                    Crear Plan Semanal
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {view === 'recipe-details' && selectedRecipeForDetails && (
            <motion.div
              key="recipe-details"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Header Navigation */}
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setView('dashboard')}
                  className="group flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-400 hover:text-orange-500 transition-colors"
                >
                  <div className="p-2 bg-white rounded-xl border border-gray-100 shadow-sm group-hover:border-orange-100 transition-colors">
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </div>
                  Volver
                </button>
                
                <div className="flex items-center gap-2">
                  <span className="bg-orange-50 text-orange-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                    {selectedRecipeForDetails.category}
                  </span>
                </div>
              </div>

              {/* Main Recipe Layout */}
              <div className="grid lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column: Image & Ingredients (Sticky on Desktop) */}
                <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
                  <div className="relative group overflow-hidden rounded-[40px] shadow-2xl shadow-orange-500/10">
                    <img 
                      src={selectedRecipeForDetails.image} 
                      className="w-full aspect-[4/5] md:aspect-video lg:aspect-[4/5] object-cover transition-transform duration-700 group-hover:scale-110" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="flex items-center gap-4 text-white/90 text-xs font-bold">
                        <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full">
                          <Clock className="w-3.5 h-3.5 text-orange-400" /> 25 min
                        </span>
                        <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full">
                          <Utensils className="w-3.5 h-3.5 text-orange-400" /> Fácil
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-orange-500" />
                        Ingredientes
                      </h4>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {selectedRecipeForDetails.ingredients.length} items
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {selectedRecipeForDetails.ingredients.map((ing, idx) => (
                        <div key={idx} className="flex items-center justify-between group py-2 border-b border-gray-50 last:border-0">
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-200 group-hover:bg-orange-500 transition-colors" />
                            <span className="text-sm font-medium text-gray-600">{ing.name}</span>
                          </div>
                          <span className="font-mono text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                            {ing.amount} {ing.unit}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Costo Estimado</span>
                      <span className="text-lg font-black text-orange-500">
                        ${selectedRecipeForDetails.ingredients.reduce((s, i) => s + i.estimatedCost, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Title & Instructions */}
                <div className="lg:col-span-8 space-y-8">
                  <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-4xl sm:text-5xl font-black tracking-tighter leading-[0.9] text-[#1A1C1E]">
                        {selectedRecipeForDetails.name}
                      </h3>
                    </div>

                    <div className="h-px bg-gray-100 w-full" />

                    <div className="space-y-8">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
                          <ChefHat className="w-5 h-5 text-orange-500" />
                          Pasos de Preparación
                        </h4>
                      </div>

                      <div className="space-y-6">
                        {selectedRecipeForDetails.instructions.map((step, idx) => (
                          <motion.div 
                            key={idx}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex gap-6 group"
                          >
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center text-sm font-black shadow-sm group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                                {idx + 1}
                              </div>
                            </div>
                            <div className="flex-1 pt-2">
                              <p className="text-lg text-gray-600 font-medium leading-relaxed group-hover:text-gray-900 transition-colors">
                                {step}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-10">
                      <button 
                        onClick={() => {
                          handleCook();
                          setView('dashboard');
                        }}
                        className="w-full bg-[#1A1C1E] text-white py-4 sm:py-6 rounded-[20px] sm:rounded-[24px] font-black flex items-center justify-center gap-3 sm:gap-4 hover:bg-black transition-all active:scale-[0.98] shadow-2xl shadow-black/20 group"
                      >
                        <span className="text-sm sm:text-lg">Marcar como cocinado</span>
                        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 group-hover:scale-125 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {view === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          if (isReselectingPool) {
                            setView('calendar');
                            setIsReselectingPool(false);
                          } else {
                            if (setupStep === 'breakfast') setView('dashboard');
                            else if (setupStep === 'lunch') setSetupStep('breakfast');
                            else setSetupStep('lunch');
                          }
                        }}
                        className="p-1 -ml-1 text-gray-400 hover:text-gray-600"
                      >
                        <ArrowRight className="w-4 h-4 rotate-180" />
                      </button>
                      <h2 className="text-2xl font-black tracking-tight">
                        {setupStep === 'breakfast' ? '¿Qué desayunarás?' : 
                         setupStep === 'lunch' ? '¿Qué almorzarás?' : '¿Qué cenarás?'}
                      </h2>
                    </div>
                    <p className="text-gray-500 text-sm">Selecciona las opciones para tu semana.</p>
                  </div>
                  {!isReselectingPool && (
                    <div className="text-right">
                      <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Paso {setupStep === 'breakfast' ? '1' : setupStep === 'lunch' ? '2' : '3'} de 3</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-32">
                  {filteredRecipes.map(recipe => {
                    const isSelected = setupSelectedPool.some(item => item.id === recipe.id);
                    return (
                      <button
                        key={recipe.id}
                        onClick={() => handleSelectRecipe(recipe.id)}
                        className={`bg-white rounded-3xl overflow-hidden border transition-all flex flex-col group ${
                          isSelected ? 'border-orange-500 ring-4 ring-orange-500/10' : 'border-gray-100 hover:border-orange-200'
                        }`}
                      >
                        <div className="relative aspect-square">
                          <img src={recipe.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                          {isSelected && (
                            <div className="absolute inset-0 bg-orange-500/40 flex items-center justify-center">
                              <CheckCircle2 className="w-10 h-10 text-white" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2">
                            <span className="text-[10px] font-black text-white bg-black/40 backdrop-blur-md px-2 py-1 rounded-full">
                              ${recipe.ingredients.reduce((s,i)=>s+i.estimatedCost,0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="p-3 text-left space-y-1 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-xs line-clamp-1">{recipe.name}</h4>
                            <p className="text-[9px] text-gray-400 line-clamp-2 leading-tight">{recipe.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Floating Selection Bar */}
                <AnimatePresence>
                  {setupSelectedPool.filter(item => item.category === (setupStep === 'breakfast' ? 'Breakfast' : setupStep === 'lunch' ? 'Lunch' : 'Dinner')).length > 0 && (
                    <motion.div 
                      initial={{ y: 100, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 100, opacity: 0 }}
                      className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-3xl bg-white/90 backdrop-blur-xl border border-gray-100 rounded-[40px] p-4 shadow-2xl z-40 flex items-center justify-between gap-6"
                    >
                      <div className="flex-1 flex items-center gap-4 overflow-x-auto no-scrollbar py-1">
                        {setupSelectedPool
                          .filter(item => item.category === (setupStep === 'breakfast' ? 'Breakfast' : setupStep === 'lunch' ? 'Lunch' : 'Dinner'))
                          .map(item => {
                            const recipe = RECIPES.find(r => r.id === item.id);
                            if (!recipe) return null;
                            return (
                              <motion.div 
                                layout
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                key={item.id}
                                className="relative flex-shrink-0"
                              >
                                <img src={recipe.image} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md" referrerPolicy="no-referrer" />
                                <button 
                                  onClick={() => handleSelectRecipe(item.id)}
                                  className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </motion.div>
                            );
                          })}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="hidden sm:block text-right">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</p>
                          <p className="text-sm font-black text-orange-500">
                            ${setupSelectedPool
                              .filter(item => item.category === (setupStep === 'breakfast' ? 'Breakfast' : setupStep === 'lunch' ? 'Lunch' : 'Dinner'))
                              .reduce((acc, item) => {
                                const r = RECIPES.find(res => res.id === item.id);
                                return acc + (r?.ingredients.reduce((s, i) => s + i.estimatedCost, 0) || 0);
                              }, 0).toFixed(2)}
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            if (isReselectingPool) {
                              setView('calendar');
                              setIsReselectingPool(false);
                            } else {
                              if (setupStep === 'breakfast') setSetupStep('lunch');
                              else if (setupStep === 'lunch') setSetupStep('dinner');
                              else {
                                setView('calendar');
                                setHasReachedCalendarOnce(true);
                                setIsShowingCalendarCTA(false); // When moving from setup to calendar, don't show CTA
                              }
                            }
                          }}
                          className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-2 shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all"
                        >
                          {isReselectingPool ? 'Guardar Cambios' : (setupStep === 'dinner' ? 'Finalizar' : 'Siguiente')}
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {view === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {!hasFinalizedInitialPlan && isShowingCalendarCTA ? (
                <div className="bg-white rounded-[40px] p-10 border-2 border-dashed border-gray-200 text-center space-y-6 shadow-sm">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                    <CalendarIcon className="w-10 h-10 text-gray-300" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black tracking-tight">
                      {setupSelectedPool.length === 0 ? 'No tienes plan para hoy' : 'Tienes un plan pendiente'}
                    </h3>
                    <p className="text-sm text-gray-400 font-medium max-w-[200px] mx-auto">
                      {setupSelectedPool.length === 0 
                        ? 'Organiza tu semana para ahorrar tiempo y dinero.' 
                        : 'Continúa donde lo dejaste para terminar tu planificación.'}
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      if (setupSelectedPool.length === 0) {
                        setView('setup');
                        setSetupStep('breakfast');
                        setIsShowingCalendarCTA(false);
                      } else {
                        if (hasReachedCalendarOnce) {
                          setIsShowingCalendarCTA(false);
                        } else {
                          setView('setup');
                          setIsShowingCalendarCTA(false);
                        }
                      }
                    }}
                    className="inline-flex items-center gap-3 bg-orange-500 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-lg shadow-orange-500/30 hover:scale-105 transition-transform active:scale-95"
                  >
                    {setupSelectedPool.length === 0 ? 'Crear Plan Semanal' : 'Continuar Planificación'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {(!isPlanComplete || isEditingPlan) && (
                        <button 
                          onClick={() => setIsSidebarOpen(true)}
                          className="lg:hidden p-3 bg-white border border-gray-100 rounded-2xl shadow-sm text-orange-500"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      )}
                      <div className="space-y-1">
                        <h2 className="text-3xl font-black tracking-tight">Tu Plan Semanal</h2>
                        <p className="text-gray-500 text-sm">Organiza tus comidas y ahorra dinero</p>
                      </div>
                    </div>

                    {isPlanComplete && hasFinalizedInitialPlan && !isEditingPlan && (
                      <button 
                        onClick={() => {
                          setIsEditingPlan(true);
                          setActiveDay(getCurrentDay());
                        }}
                        className="flex items-center gap-2 bg-white border border-gray-200 px-6 py-3 rounded-2xl font-black text-sm hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
                      >
                        <Edit3 className="w-4 h-4 text-orange-500" />
                        Editar Plan
                      </button>
                    )}
                  </div>

                  <div className="bg-white rounded-[40px] p-4 md:p-8 border border-gray-100 shadow-xl shadow-gray-200/50 overflow-x-auto no-scrollbar">
                    <div className="min-w-[800px]">
                      <div className="grid grid-cols-8 gap-4 mb-6">
                        <div />
                        {DAYS.map(day => {
                          const isToday = day === getCurrentDay();
                          const isLocked = isPlanComplete && hasFinalizedInitialPlan && !isEditingPlan;
                          
                          return (
                            <div 
                              key={day} 
                              onClick={() => !isLocked && setActiveDay(day)}
                              className={`text-center py-2 rounded-xl transition-all ${!isLocked ? 'cursor-pointer' : 'cursor-default'} ${
                                activeDay === day ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-transparent text-gray-400'
                              } ${isLocked && activeDay !== day ? 'opacity-30' : 'opacity-100'}`}
                            >
                              <span className="text-[10px] font-black uppercase tracking-widest">
                                {isToday && isLocked ? 'Hoy' : day}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="space-y-6">
                        {MEALS.map(time => (
                          <div key={time} className="grid grid-cols-8 gap-4 items-center">
                            <div className="text-right pr-4">
                              <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{time}</span>
                            </div>
                            {DAYS.map(day => {
                              const isLocked = isPlanComplete && hasFinalizedInitialPlan && !isEditingPlan;
                              return (
                                <MealSlot
                                  key={`${day}-${time}`}
                                  day={day}
                                  time={time}
                                  recipeId={weeklyPlan[day]?.[time]}
                                  isSelected={selectedSlot?.day === day && selectedSlot?.time === time}
                                  isActiveDay={activeDay === day}
                                  isLocked={isLocked}
                                  isCooked={cookedMeals.has(`${day}-${time}`)}
                                  onClick={() => {
                                    if (isLocked) return;
                                    
                                    if (weeklyPlan[day]?.[time]) {
                                    setWeeklyPlan(prev => ({
                                      ...prev,
                                      [day]: {
                                        ...prev[day],
                                        [time]: null
                                      }
                                    }));
                                  } else {
                                    setActiveDay(day);
                                  }
                                }}
                              />
                            );
                          })}
                        </div>
                      ))}
                    </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {view === 'planner' && (
            <motion.div
              key="planner"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      if (selectedSlot) {
                        setSelectedSlot(null);
                        setView('calendar');
                      } else {
                        setView('dashboard');
                      }
                    }}
                    className="p-2 bg-white rounded-xl border border-gray-100 text-gray-400 hover:text-gray-600 shadow-sm"
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </button>
                  <div>
                    <h2 className="text-xl font-black tracking-tight">
                      {selectedSlot ? `Elegir para ${selectedSlot.day}` : 'Todas las Recetas'}
                    </h2>
                    {selectedSlot && (
                      <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">{selectedSlot.time}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Search & Filter */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text"
                    placeholder="Busca por ingrediente o nombre..."
                    className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  <button 
                    onClick={() => setSearchQuery('')}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                      searchQuery === '' ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20' : 'bg-white text-gray-500 border-gray-200'
                    }`}
                  >
                    Todos
                  </button>
                  {Array.from(inventory).map((ing: any) => (
                    <button 
                      key={ing}
                      onClick={() => setSearchQuery(ing)}
                      className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                        searchQuery.toLowerCase() === (ing as string).toLowerCase() ? 'bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/20' : 'bg-white text-gray-500 border-gray-200'
                      }`}
                    >
                      Usar {ing}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipe Grid */}
              <div className="grid gap-4">
                {filteredRecipes.length > 0 ? (
                  filteredRecipes.map(recipe => {
                    const matchCount = recipe.ingredients.filter(i => inventory.has(i.name.toLowerCase())).length;
                    return (
                      <div 
                        key={recipe.id}
                        onClick={() => handleSelectRecipe(recipe.id)}
                        className="bg-white rounded-2xl p-3 border border-gray-100 flex gap-4 cursor-pointer hover:border-orange-200 transition-all active:scale-[0.98] shadow-sm"
                      >
                        <img src={recipe.image} className="w-20 h-20 rounded-xl object-cover" referrerPolicy="no-referrer" />
                        <div className="flex-1 py-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-sm">{recipe.name}</h4>
                            <span className="text-[10px] font-bold text-gray-400">${recipe.ingredients.reduce((s,i)=>s+i.estimatedCost,0).toFixed(2)}</span>
                          </div>
                          <p className="text-[10px] text-gray-500 line-clamp-1 mb-2">{recipe.description}</p>
                          {matchCount > 0 && (
                            <span className="bg-green-50 text-green-700 text-[8px] font-black px-2 py-0.5 rounded-full border border-green-100">
                              TIENES {matchCount} INGREDIENTES
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                      <Search className="w-8 h-8 text-gray-200" />
                    </div>
                    <p className="text-sm text-gray-400 font-medium">No encontramos recetas con esos criterios.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {view === 'inventory' && (
            <motion.div
              key="inventory"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-black tracking-tight">Tu Despensa</h2>
              
              <div className="bg-white rounded-3xl p-6 border border-gray-100 space-y-8">
                <section>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Básicos de Despensa</h3>
                  <div className="space-y-2">
                    {['Arroz', 'Pasta', 'Aceite', 'Sal', 'Pimienta', 'Ajo', 'Cebolla'].map(ing => (
                      <button
                        key={ing}
                        onClick={() => {
                          setInventory(prev => {
                            const next = new Set(prev);
                            const key = ing.toLowerCase();
                            if (next.has(key)) next.delete(key);
                            else next.add(key);
                            return next;
                          });
                        }}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                          inventory.has(ing.toLowerCase()) ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'
                        }`}
                      >
                        <span className={`text-sm font-bold ${inventory.has(ing.toLowerCase()) ? 'text-green-700' : 'text-gray-600'}`}>
                          {ing}
                        </span>
                        {inventory.has(ing.toLowerCase()) ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5 text-gray-300" />}
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-4">Sobrantes de Comidas</h3>
                  <div className="space-y-2">
                    {['Pollo', 'Res', 'Zanahoria', 'Papa', 'Tomate', 'Huevos', 'Leche'].map(ing => (
                      <button
                        key={ing}
                        onClick={() => {
                          setInventory(prev => {
                            const next = new Set(prev);
                            const key = ing.toLowerCase();
                            if (next.has(key)) next.delete(key);
                            else next.add(key);
                            return next;
                          });
                        }}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                          inventory.has(ing.toLowerCase()) ? 'bg-orange-50 border-orange-100' : 'bg-gray-50 border-gray-100'
                        }`}
                      >
                        <span className={`text-sm font-bold ${inventory.has(ing.toLowerCase()) ? 'text-orange-700' : 'text-gray-600'}`}>
                          {ing}
                        </span>
                        {inventory.has(ing.toLowerCase()) ? <CheckCircle2 className="w-5 h-5 text-orange-500" /> : <Circle className="w-5 h-5 text-gray-300" />}
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>

      {/* Finalize Planning Fixed Button */}
      <AnimatePresence>
        {view === 'calendar' && isPlanComplete && (isEditingPlan || (!hasFinalizedInitialPlan && !isShowingCalendarCTA)) && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-24 left-0 right-0 px-6 z-40 flex justify-center pointer-events-none"
          >
            <button 
              onClick={() => {
                if (hasFinalizedInitialPlan) {
                  setIsEditingPlan(false);
                } else {
                  setIsEditingPlan(false);
                  setHasFinalizedInitialPlan(true);
                  setView('dashboard');
                }
              }}
              className="group pointer-events-auto flex items-center gap-3 bg-orange-500 text-white px-8 py-4 rounded-3xl font-black uppercase tracking-widest shadow-2xl shadow-orange-500/40 hover:bg-orange-600 transition-all active:scale-95"
            >
              <CheckCircle2 className="w-5 h-5" />
              Finalizar Planificación
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-between items-center z-30">
        <button 
          onClick={() => setView('dashboard')}
          className={`flex flex-col items-center gap-1 transition-colors ${view === 'dashboard' ? 'text-orange-500' : 'text-gray-400'}`}
        >
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Inicio</span>
        </button>
        <button 
          onClick={() => {
            setView('calendar');
            setIsShowingCalendarCTA(true);
          }}
          className={`flex flex-col items-center gap-1 transition-colors ${view === 'calendar' ? 'text-orange-500' : 'text-gray-400'}`}
        >
          <CalendarIcon className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Plan</span>
        </button>
        <button 
          onClick={() => setView('planner')}
          className={`flex flex-col items-center gap-1 transition-colors ${view === 'planner' ? 'text-orange-500' : 'text-gray-400'}`}
        >
          <Utensils className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Recetas</span>
        </button>
        <button 
          onClick={() => setView('inventory')}
          className={`flex flex-col items-center gap-1 transition-colors ${view === 'inventory' ? 'text-orange-500' : 'text-gray-400'}`}
        >
          <Package className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Despensa</span>
        </button>
      </nav>
    </div>
  );
}
