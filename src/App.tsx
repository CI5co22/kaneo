import React, { useState, useMemo, useEffect, useCallback } from 'react';
import kaneoLogo from './assets/logo.png';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingCart,
  Utensils,
  CheckCircle2,
  Circle,
  Trash2,
  Plus,
  Minus,
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
  Edit3,
  Star,
  Heart,
  Save,
  FolderOpen,
  ListTodo,
  AlertCircle,
  Info,
  LogOut,
  User as UserIcon,
  LogIn
} from 'lucide-react';
import { RECIPES } from './data';
import { Recipe, WeeklyPlan, DayOfWeek, MealTime, SavedPlan, InventoryState } from './types';
import { useAuth } from './contexts/AuthContext';
import { db } from './firebase';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

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
        className={`relative group transition-all duration-300 rounded-2xl ${isSelected ? 'ring-2 ring-orange-500 ring-offset-2' : ''
          } ${!isLocked ? 'cursor-pointer' : 'cursor-default'} ${!recipe && isActiveDay && !isLocked ? 'scale-105 shadow-md' : ''
          } ${recipe && !isLocked ? 'hover:ring-2 hover:ring-red-200 hover:ring-offset-1' : ''} ${isCooked ? 'opacity-60' : ''}`}
      >
        <div className={`aspect-[4/3] rounded-2xl overflow-hidden border-2 border-dashed transition-all ${recipe ? 'border-transparent shadow-sm' :
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

const SidebarRecipeItem: React.FC<{
  recipe: Recipe,
  onClick: () => void,
  onInfoClick?: () => void
}> = ({ recipe, onClick, onInfoClick }) => {
  return (
    <div className="group relative">
      <button
        onClick={onClick}
        className="w-full flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-white hover:border-orange-200 hover:shadow-md transition-all pr-12"
      >
        <img
          src={recipe.image}
          className="w-12 h-12 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform"
          referrerPolicy="no-referrer"
        />
        <div className="flex-1 text-left">
          <h4 className="text-xs font-black tracking-tight text-gray-900 line-clamp-1">{recipe.name}</h4>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{recipe.category}</p>
        </div>
        <Plus className="w-4 h-4 text-gray-300 group-hover:text-orange-500" />
      </button>

      {onInfoClick && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onInfoClick();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
        >
          <Search className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

const SidebarNavItem: React.FC<{ icon: any, label: string, active: boolean, onClick: () => void }> = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-black text-sm transition-all duration-300 group ${active
      ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/20'
      : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'
      }`}
  >
    <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${active ? 'text-white' : 'text-gray-400 group-hover:text-orange-500'}`} />
    <span className="tracking-tight">{label}</span>
  </button>
);

export default function App() {
  const { user, loginWithGoogle, logout, loading: authLoading } = useAuth();
  
  // --- STATE DECLARATIONS ---
  
  // Navigation & View Management
  const [view, setView] = useState<'dashboard' | 'calendar' | 'planner' | 'inventory' | 'setup' | 'recipe-details' | 'saved-plans' | 'shopping-list'>('dashboard');
  const [previousView, setPreviousView] = useState<'dashboard' | 'calendar' | 'planner' | 'inventory' | 'setup' | 'recipe-details' | 'saved-plans' | 'shopping-list'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [hasFinalizedInitialPlan, setHasFinalizedInitialPlan] = useState(false);

  // Core App Data (Synchronized with Firestore)
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [nickname, setNickname] = useState<string>('');
  const [inventory, setInventory] = useState<InventoryState>({});
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan>(() => {
    const plan: WeeklyPlan = {};
    DAYS.forEach(day => { plan[day] = { Desayuno: null, Almuerzo: null, Cena: null }; });
    return plan;
  });
  const [cookedMeals, setCookedMeals] = useState<Set<string>>(new Set());
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  
  // UI States & Modals
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<'all' | 'Breakfast' | 'Lunch' | 'Dinner' | 'favorites' | 'wishlist'>('all');
  const [selectedSlot, setSelectedSlot] = useState<{ day: DayOfWeek, time: MealTime } | null>(null);
  const [selectedRecipeForPlacement, setSelectedRecipeForPlacement] = useState<Recipe | null>(null);
  const [activeCategory, setActiveCategory] = useState<Recipe['category']>('Breakfast');
  const [activeDay, setActiveDay] = useState<DayOfWeek>('Lunes');
  const [setupStep, setSetupStep] = useState<'breakfast' | 'lunch' | 'dinner'>('breakfast');
  const [setupSelectedPool, setSetupSelectedPool] = useState<{ id: string, category: string }[]>([]);
  const [selectedRecipeForDetails, setSelectedRecipeForDetails] = useState<Recipe | null>(null);
  const [selectedRecipeForModal, setSelectedRecipeForModal] = useState<Recipe | null>(null);
  const [isSavingPlanModalOpen, setIsSavingPlanModalOpen] = useState(false);
  const [isDeletePlanModalOpen, setIsDeletePlanModalOpen] = useState(false);
  const [hasShoppingListReady, setHasShoppingListReady] = useState(false);
  const [hasConfirmedShoppingList, setHasConfirmedShoppingList] = useState(false);
  const [showShoppingListBanner, setShowShoppingListBanner] = useState(false);
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [newPlanDescription, setNewPlanDescription] = useState('');
  const [editingSavedPlan, setEditingSavedPlan] = useState<SavedPlan | null>(null);
  const [checkedShoppingItems, setCheckedShoppingItems] = useState<Set<string>>(new Set());
  const [isReselectingPool, setIsReselectingPool] = useState(false);
  const [hasReachedCalendarOnce, setHasReachedCalendarOnce] = useState(false);
  const [isShowingCalendarCTA, setIsShowingCalendarCTA] = useState(true);
  const [isCookingAnimating, setIsCookingAnimating] = useState(false);
  const [cookingMessage, setCookingMessage] = useState<string | null>(null);

  // --- HELPER FUNCTIONS ---

  const navigateTo = (newView: typeof view) => {
    setPreviousView(view);
    setView(newView);
  };

  const showSnackbar = (msg: string) => {
    setSnackbarMessage(msg);
    setTimeout(() => setSnackbarMessage(null), 4000);
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleWishlist = (id: string) => {
    setWishlist(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleShoppingItem = (name: string) => {
    setCheckedShoppingItems(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleToggleAllItems = (names: string[]) => {
    setCheckedShoppingItems(prev => {
      if (prev.size === names.length) return new Set();
      return new Set(names);
    });
  };

  const handleSaveCurrentPlan = () => {
    if (editingSavedPlan) {
      setSavedPlans(prev => prev.map(p => p.id === editingSavedPlan.id ? { ...p, title: newPlanTitle, description: newPlanDescription } : p));
      setEditingSavedPlan(null);
    } else {
      const newPlan: SavedPlan = {
        id: Date.now().toString(),
        title: newPlanTitle,
        description: newPlanDescription,
        plan: JSON.parse(JSON.stringify(weeklyPlan)),
        createdAt: new Date().toISOString()
      };
      setSavedPlans(prev => [newPlan, ...prev]);
    }
    setIsSavingPlanModalOpen(false);
    setNewPlanTitle('');
    setNewPlanDescription('');
  };

  const loadSavedPlan = (savedPlan: SavedPlan) => {
    setWeeklyPlan(JSON.parse(JSON.stringify(savedPlan.plan)));
    setHasFinalizedInitialPlan(true);
    setIsEditingPlan(false);
    setView('calendar');
  };

  const deleteSavedPlan = (id: string) => {
    setSavedPlans(prev => prev.filter(p => p.id !== id));
  };

  // --- FIREBASE SYNC EFFECTS ---

  // Save to Cloud on data changes
  useEffect(() => {
    if (user && isDataLoaded) {
      setDoc(doc(db, 'users', user.uid), { 
        inventory,
        favorites: Array.from(favorites),
        wishlist: Array.from(wishlist),
        savedPlans,
        weeklyPlan,
        cookedMeals: Array.from(cookedMeals),
        nickname
      }, { merge: true });
    }
  }, [inventory, favorites, wishlist, savedPlans, weeklyPlan, cookedMeals, nickname, user, isDataLoaded]);

  // Load from Cloud on Login
  useEffect(() => {
    if (user) {
      const docRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        const alreadyPrompted = localStorage.getItem('nickname_prompted');
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.favorites) setFavorites(new Set(data.favorites));
          if (data.wishlist) setWishlist(new Set(data.wishlist));
          if (data.inventory) setInventory(data.inventory);
          if (data.savedPlans) setSavedPlans(data.savedPlans);
          if (data.weeklyPlan) setWeeklyPlan(data.weeklyPlan);
          if (data.cookedMeals) setCookedMeals(new Set(data.cookedMeals));
          
          if (data.nickname) {
            setNickname(data.nickname);
            setShowNicknameModal(false);
          } else if (!alreadyPrompted) {
            setShowNicknameModal(true);
            localStorage.setItem('nickname_prompted', 'true');
          }
        } else if (!alreadyPrompted) {
          setShowNicknameModal(true);
          localStorage.setItem('nickname_prompted', 'true');
        }
        setIsDataLoaded(true);
      });
      return () => unsubscribe();
    } else {
      setIsDataLoaded(false);
      // Reset state for safety
      setFavorites(new Set());
      setWishlist(new Set());
      setNickname('');
      setInventory({});
      setSavedPlans([]);
      setWeeklyPlan(() => {
        const plan: WeeklyPlan = {};
        DAYS.forEach(day => { plan[day] = { Desayuno: null, Almuerzo: null, Cena: null }; });
        return plan;
      });
      setCookedMeals(new Set());
    }
  }, [user]);

  // --- BUSINESS LOGIC HELPERS ---

  const handleSidebarRecipeClick = (recipe: Recipe) => {
    const mealTimeMap: Record<string, MealTime> = { 'Breakfast': 'Desayuno', 'Lunch': 'Almuerzo', 'Dinner': 'Cena' };
    const time = mealTimeMap[recipe.category];
    if (time) {
      setWeeklyPlan(prev => {
        const newPlan = { ...prev, [activeDay]: { ...prev[activeDay], [time]: recipe.id } };
        const isDayComplete = Object.values(newPlan[activeDay]).every(v => v !== null);
        if (isDayComplete) {
          const currentIndex = DAYS.indexOf(activeDay);
          for (let i = 1; i < DAYS.length; i++) {
            const nextDay = DAYS[(currentIndex + i) % DAYS.length];
            if (!Object.values(newPlan[nextDay]).every(v => v !== null)) {
              setTimeout(() => setActiveDay(nextDay), 0);
              break;
            }
          }
        }
        return newPlan;
      });
    }
  };

  const handleSelectRecipe = (recipeId: string) => {
    const recipe = RECIPES.find(r => r.id === recipeId);
    if (!recipe) return;

    if (view === 'setup') {
      setSetupSelectedPool(prev => {
        const exists = prev.find(item => item.id === recipeId);
        if (exists) return prev.filter(item => item.id !== recipeId);
        if (prev.filter(item => item.category === recipe.category).length >= 5) return prev;
        return [...prev, { id: recipeId, category: recipe.category }];
      });
    } else if (selectedSlot) {
      setWeeklyPlan(prev => ({
        ...prev, [selectedSlot.day]: { ...prev[selectedSlot.day], [selectedSlot.time]: recipeId }
      }));
      setSelectedSlot(null);
      setView('calendar');
    }
  };

  const handleCook = () => {
    if (nextMeal?.recipe) {
      const { day, time } = nextMeal;
      const depleted: string[] = [];
      setInventory(prev => {
        const next = { ...prev };
        nextMeal.recipe!.ingredients.forEach(ing => {
          const key = ing.name.toLowerCase();
          if (next[key]) {
            next[key].amount -= ing.amount;
            if (next[key].amount <= 0) { next[key].amount = 0; depleted.push(ing.name); }
          } else {
            depleted.push(ing.name);
          }
        });
        return next;
      });

      setCookedMeals(prev => {
        const next = new Set(prev);
        next.add(`${day}-${time}`);
        return next;
      });

      setCookingMessage(`¡Buen provecho! Has cocinado ${nextMeal.recipe.name}.`);
      if (depleted.length > 0) showSnackbar(`Se agotó el stock de: ${depleted.join(', ')}`);
      setTimeout(() => setCookingMessage(null), 3000);
    }
  };

  // --- DERIVED STATES ---

  const hasPlan = useMemo(() => Object.values(weeklyPlan).some(day => Object.values(day).some(v => v !== null)), [weeklyPlan]);
  
  const isPlanComplete = useMemo(() => DAYS.every(day => Object.values(weeklyPlan[day] || {}).every(v => v !== null)), [weeklyPlan]);

  const nextMeal = useMemo(() => {
    const today = getCurrentDay();
    const todayIdx = DAYS.indexOf(today);
    for (let i = 0; i < DAYS.length; i++) {
      const day = DAYS[(todayIdx + i) % DAYS.length];
      for (const time of MEALS) {
        const recipeId = weeklyPlan[day]?.[time];
        if (recipeId && !cookedMeals.has(`${day}-${time}`)) {
          return { day, time, recipe: RECIPES.find(r => r.id === recipeId) };
        }
      }
    }
    return null;
  }, [weeklyPlan, cookedMeals]);

  const filteredRecipes = useMemo(() => {
    let base = RECIPES;
    if (view === 'setup') {
      const catMap = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' };
      base = base.filter(r => r.category === catMap[setupStep]);
    } else if (selectedSlot) {
      const catMap = { Desayuno: 'Breakfast', Almuerzo: 'Lunch', Cena: 'Dinner' };
      base = base.filter(r => r.category === catMap[selectedSlot.time]);
    }
    if (selectedSection === 'favorites') base = base.filter(r => favorites.has(r.id));
    else if (selectedSection === 'wishlist') base = base.filter(r => wishlist.has(r.id));
    else if (selectedSection !== 'all') base = base.filter(r => r.category === selectedSection);

    return base.filter(recipe => {
      const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           recipe.ingredients.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    }).sort((a, b) => {
      const getScore = (r: Recipe) => r.ingredients.filter(i => (inventory[i.name.toLowerCase()]?.amount || 0) >= i.amount).length / r.ingredients.length;
      return getScore(b) - getScore(a);
    });
  }, [searchQuery, inventory, view, setupStep, selectedSlot, favorites, wishlist, selectedSection]);

  const totalCost = useMemo(() => {
    let cost = 0;
    const reqs: Record<string, number> = {};
    Object.values(weeklyPlan).forEach(day => Object.values(day).forEach(id => {
      RECIPES.find(r => r.id === id)?.ingredients.forEach(i => { reqs[i.name.toLowerCase()] = (reqs[i.name.toLowerCase()] || 0) + i.amount; });
    }));
    Object.keys(reqs).forEach(k => {
      const diff = reqs[k] - (inventory[k]?.amount || 0);
      if (diff > 0) {
        const ing = RECIPES.flatMap(r => r.ingredients).find(i => i.name.toLowerCase() === k);
        if (ing) cost += diff * (ing.estimatedCost / ing.amount);
      }
    });
    return cost;
  }, [weeklyPlan, inventory]);

  const cookableNow = useMemo(() => {
    return RECIPES.filter(r => r.ingredients.filter(i => (inventory[i.name.toLowerCase()]?.amount || 0) >= i.amount).length / r.ingredients.length >= 0.6)
      .sort((a, b) => {
        const getScore = (r: Recipe) => r.ingredients.filter(i => (inventory[i.name.toLowerCase()]?.amount || 0) >= i.amount).length / r.ingredients.length;
        return getScore(b) - getScore(a);
      });
  }, [inventory]);

  // Lock active day to today when conditions are met
  useEffect(() => {
    if (view === 'calendar' && isPlanComplete && hasFinalizedInitialPlan && !isEditingPlan) {
      setActiveDay(getCurrentDay());
    }
  }, [view, isPlanComplete, hasFinalizedInitialPlan, isEditingPlan]);

  // --- AUTH GUARDS ---

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full" />
        <p className="text-sm font-black text-gray-400 uppercase tracking-widest animate-pulse">Cargando Kaneo...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full space-y-10">
          <div className="space-y-6">
            <div className="w-24 h-24 bg-white rounded-[32px] p-4 shadow-xl shadow-orange-500/10 border border-orange-50 mx-auto flex items-center justify-center">
              <img src={kaneoLogo} alt="Kaneo" className="w-16 h-16 object-contain" />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tight text-gray-900">Bienvenido a Kaneo</h1>
              <p className="text-gray-500 font-medium px-4">Planes de comida inteligentes y sincronizados. Ahorra tiempo y cocina mejor.</p>
            </div>
          </div>
          <button onClick={loginWithGoogle} className="w-full flex items-center justify-center gap-4 bg-white border-2 border-gray-100 py-5 rounded-[24px] font-black text-gray-700 shadow-xl shadow-black/5 hover:border-orange-200 transition-all active:scale-95 group">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
            Continuar con Google
          </button>
          <div className="grid grid-cols-3 gap-4 pt-8 opacity-50">
            <div className="space-y-2"><CalendarIcon className="w-5 h-5 mx-auto text-orange-500" /><p className="text-[8px] font-black uppercase tracking-widest">Planes</p></div>
            <div className="space-y-2"><ShoppingCart className="w-5 h-5 mx-auto text-orange-500" /><p className="text-[8px] font-black uppercase tracking-widest">Compras</p></div>
            <div className="space-y-2"><Package className="w-5 h-5 mx-auto text-orange-500" /><p className="text-[8px] font-black uppercase tracking-widest">Despensa</p></div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1C1E] font-sans pb-24 lg:pb-0 lg:flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-100 sticky top-0 h-screen p-8 space-y-10 z-30">
        {/* Branding */}
        <div className="flex items-center gap-3 px-2">
          <img src={kaneoLogo} alt="Kaneo" className="w-12 h-12 object-contain" />
          <span className="font-black text-xl tracking-tighter">Kaneo</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          <SidebarNavItem
            icon={Home}
            label="Inicio"
            active={view === 'dashboard'}
            onClick={() => setView('dashboard')}
          />
          <SidebarNavItem
            icon={CalendarIcon}
            label="Mi Plan Semanal"
            active={view === 'calendar'}
            onClick={() => { setView('calendar'); setIsShowingCalendarCTA(true); }}
          />
          <SidebarNavItem
            icon={Utensils}
            label="Explorar Recetas"
            active={view === 'planner'}
            onClick={() => setView('planner')}
          />
          <SidebarNavItem
            icon={Package}
            label="Mi Despensa"
            active={view === 'inventory'}
            onClick={() => setView('inventory')}
          />
          <SidebarNavItem
            icon={ListTodo}
            label="Lista de Compras"
            active={view === 'shopping-list'}
            onClick={() => setView('shopping-list')}
          />
          <SidebarNavItem
            icon={FolderOpen}
            label="Mis Planes"
            active={view === 'saved-plans'}
            onClick={() => setView('saved-plans')}
          />
        </nav>

        {/* User Profile / Auth Section */}
        <div className="pt-6 border-t border-gray-100">
          {user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 px-2">
                <img 
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                  className="w-10 h-10 rounded-xl object-cover border-2 border-orange-100" 
                  alt="Profile"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black tracking-tight truncate">{user.displayName}</p>
                  <p className="text-[10px] text-gray-400 font-bold truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-xs text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100 group"
              >
                <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          ) : (
            <button
              onClick={loginWithGoogle}
              className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl font-black text-sm bg-orange-500 text-white shadow-xl shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-95 group"
            >
              <LogIn className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              <span>Entrar con Google</span>
            </button>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <AnimatePresence>
          {snackbarMessage && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl z-[200] flex items-center gap-3 font-medium text-sm w-max max-w-[90vw]"
            >
              <AlertCircle className="w-5 h-5 text-orange-400" />
              <span className="truncate">{snackbarMessage}</span>
              <button onClick={() => setSnackbarMessage(null)} className="ml-2 bg-white/10 p-1 rounded-full hover:bg-white/20">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

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
        <header className="bg-white border-b border-gray-100 sticky top-0 z-20 px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-2">
            <img src={kaneoLogo} alt="Kaneo" className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
            <span className="font-black text-base sm:text-lg tracking-tight">kaneo</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('saved-plans')}
              className="p-2 text-gray-400 hover:text-orange-500 transition-colors"
            >
              <FolderOpen className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 bg-gray-50 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-gray-100">
              <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
              <span className="text-[10px] sm:text-xs font-bold text-gray-600">Q{totalCost.toFixed(2)}</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex h-[calc(100vh-64px)] lg:h-screen overflow-hidden">
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
                  className={`w-80 bg-white border-r border-gray-100 fixed lg:sticky top-0 h-screen overflow-y-auto no-scrollbar p-6 space-y-8 z-50 lg:z-10 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
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
                                onInfoClick={() => setSelectedRecipeForModal(recipe)}
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

          <main className={`flex-1 flex flex-col transition-all duration-300 ${view === 'calendar' ? (isPlanComplete && hasFinalizedInitialPlan && !isEditingPlan ? 'max-w-5xl mx-auto' : 'max-w-none') : (view === 'recipe-details' || view === 'planner' || view === 'dashboard' || view === 'setup' ? 'max-w-7xl mx-auto' : 'max-w-2xl md:max-w-4xl mx-auto')} h-full overflow-hidden`}>
            <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-3 sm:px-6 sm:py-6 lg:px-8 lg:py-10 pb-20 lg:pb-16">
              <AnimatePresence mode="wait">
                {view === 'dashboard' && (
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-3 sm:space-y-8 h-full flex flex-col"
                  >
                    {/* Welcome Message */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0 sm:space-y-2">
                        <h2 className="text-lg sm:text-3xl font-black tracking-tight flex items-center gap-3">
                          ¡Hola, {nickname || user?.displayName?.split(' ')[0] || 'Invitado'}👋!
                          <button 
                            onClick={() => setShowNicknameModal(true)}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors group"
                          >
                            <Edit3 className="w-4 h-4 text-gray-300 group-hover:text-orange-500" />
                          </button>
                        </h2>
                        <p className="text-gray-400 sm:text-gray-500 text-[8px] sm:text-sm sm:font-medium">
                          {user ? 'Tu cocina sincronizada' : 'Accede para guardar tus recetas en la nube'}
                        </p>
                      </div>
                      {nextMeal && (
                        <div className="bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-100 flex items-center gap-2 sm:hidden">
                          <Clock className="w-3 h-3 text-orange-500" />
                          <span className="text-[8px] font-black text-orange-600 uppercase tracking-widest">{nextMeal.time}</span>
                        </div>
                      )}
                    </div>

                    {/* Next Meal Card - More compact for mobile */}
                    {hasPlan ? (
                      nextMeal ? (
                        <div className="hidden sm:block relative overflow-hidden bg-white rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 shadow-xl shadow-orange-500/10 border border-orange-100 space-y-4 sm:space-y-6">
                          <div className="flex items-center gap-2">
                            <span className="bg-orange-500 text-white text-[8px] sm:text-[10px] font-black px-2 sm:px-3 py-1 rounded-full uppercase tracking-widest">Próxima Comida</span>
                            <span className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                              {nextMeal.day === getCurrentDay() ? 'HOY' : nextMeal.day} • {nextMeal.time}
                            </span>
                          </div>

                          <div className="flex gap-4 sm:gap-6">
                            <img
                              src={nextMeal.recipe?.image}
                              className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl object-cover shadow-lg"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex-1 space-y-1 sm:space-y-2 flex flex-col justify-center">
                              <h3 className="text-lg sm:text-2xl font-black leading-tight tracking-tight">{nextMeal.recipe?.name}</h3>
                              <div className="flex items-center gap-3 sm:gap-4 text-gray-400 text-[10px] sm:text-xs font-bold">
                                <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-500" /> 20 min</span>
                                <span className="flex items-center gap-1.5"><Wallet className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-500" /> Q{nextMeal.recipe?.ingredients.reduce((s, i) => s + i.estimatedCost, 0).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 sm:gap-3">
                            {!hasConfirmedShoppingList && hasShoppingListReady ? (
                              <div className="flex-1 flex flex-col items-center justify-center gap-2 py-3 px-4 bg-amber-50 border-2 border-amber-200 rounded-xl sm:rounded-2xl">
                                <p className="text-amber-700 font-black text-xs text-center leading-tight">Confirma tu lista de compras primero</p>
                                <button
                                  onClick={() => setView('shopping-list')}
                                  className="text-amber-600 underline font-black text-[10px] uppercase tracking-widest hover:text-amber-800 transition-colors"
                                >
                                  Ir a Lista de Compras →
                                </button>
                              </div>
                            ) : (
                              <>
                                <motion.button
                                  onClick={() => {
                                    setIsCookingAnimating(true);
                                    setTimeout(() => {
                                      handleCook();
                                      setIsCookingAnimating(false);
                                    }, 1200);
                                  }}
                                  disabled={isCookingAnimating}
                                  animate={isCookingAnimating ? {
                                    backgroundColor: '#10B981',
                                    borderColor: '#10B981',
                                    color: '#ffffff',
                                    scale: [1, 0.95, 1.05, 1]
                                  } : {}}
                                  transition={{ duration: 0.5 }}
                                  className={`flex-1 border-2 border-[#1A1C1E] text-[#1A1C1E] py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-base flex items-center justify-center gap-2 transition-all overflow-hidden relative ${isCookingAnimating ? 'pointer-events-none' : 'bg-white hover:bg-gray-50 active:scale-95'}`}
                                >
                                  <motion.div
                                    initial={false}
                                    animate={isCookingAnimating ? { rotate: [0, -20, 360], scale: [1, 1.4, 1] } : {}}
                                    transition={{ duration: 0.6, delay: 0.1 }}
                                  >
                                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                  </motion.div>
                                  <div className="relative w-[70px] sm:w-[84px] h-[20px] sm:h-[24px] flex items-center justify-center">
                                    <motion.span
                                      initial={false}
                                      animate={isCookingAnimating ? { opacity: 0, y: -20 } : { opacity: 1, y: 0 }}
                                      className="absolute inset-0 flex items-center justify-center"
                                    >
                                      Cocinado
                                    </motion.span>
                                    <motion.span
                                      initial={false}
                                      animate={isCookingAnimating ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                      className="absolute inset-0 flex items-center justify-center"
                                    >
                                      ¡Hecho!
                                    </motion.span>
                                  </div>
                                </motion.button>
                                <button
                                  onClick={() => {
                                    if (nextMeal?.recipe) {
                                      setSelectedRecipeForDetails(nextMeal.recipe);
                                      navigateTo('recipe-details');
                                    }
                                  }}
                                  className="flex-1 bg-[#1A1C1E] text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-base flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 shadow-lg shadow-black/10"
                                >
                                  Cocinar
                                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                              </>
                            )}
                          </div>

                          {/* OVERLAY FOR COMPLETED DAY */}
                          {nextMeal.day !== getCurrentDay() && (
                            <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-white via-white/95 to-white/40 backdrop-blur-[2px] z-30 flex flex-col items-center justify-end pb-8 sm:pb-12 px-6 text-center animate-in fade-in duration-700">
                              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-inner border border-green-200">
                                <CheckCircle2 className="w-6 h-6 text-green-500" />
                              </div>
                              <h4 className="text-xl font-black text-gray-900 mb-2 tracking-tight">¡Todo listo por hoy!</h4>
                              <p className="text-sm font-bold text-gray-500 mb-6 max-w-[250px]">Has completado todas tus comidas. Esta es tu primera comida de mañana.</p>
                              <button
                                onClick={() => {
                                  setView('calendar');
                                }}
                                className="bg-gray-900 hover:bg-black text-white px-6 py-4 rounded-[20px] font-black text-sm shadow-xl shadow-black/20 transition-all active:scale-95 flex items-center gap-2 group"
                              >
                                Ver mi plan semanal
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
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
                      )
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
                            setSelectedSection('all');
                            setSearchQuery('');
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
                    className="space-y-6 sm:space-y-8 h-full overflow-y-auto no-scrollbar pb-20"
                  >
                    {/* Header Navigation */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setView(previousView)}
                        className="group flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-400 hover:text-orange-500 transition-colors"
                      >
                        <div className="p-2 bg-white rounded-xl border border-gray-100 shadow-sm group-hover:border-orange-100 transition-colors">
                          <ArrowRight className="w-4 h-4 rotate-180" />
                        </div>
                        Volver
                      </button>

                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => toggleFavorite(selectedRecipeForDetails.id)}
                          className={`p-3 rounded-2xl border transition-all ${favorites.has(selectedRecipeForDetails.id)
                            ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20'
                            : 'bg-white border-gray-100 text-gray-400 hover:text-orange-500'
                            }`}
                        >
                          <Star className={`w-5 h-5 ${favorites.has(selectedRecipeForDetails.id) ? 'fill-current' : ''}`} />
                        </button>
                        <span className="bg-orange-50 text-orange-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                          {selectedRecipeForDetails.category}
                        </span>
                      </div>
                    </div>
                    {/* Main Recipe Layout */}
                    <div className="space-y-8">

                      {/* Top Section: Image and Ingredients Side-by-Side (Desktop) */}
                      <div className="grid lg:grid-cols-2 gap-8 items-stretch">

                        {/* Image Card */}
                        <div className="relative group overflow-hidden rounded-[30px] sm:rounded-[40px] shadow-2xl shadow-orange-500/10 min-h-[300px] sm:min-h-[400px]">
                          <img
                            src={selectedRecipeForDetails.image}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                          <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 right-6">
                            <div className="flex items-center gap-3 sm:gap-4 text-white/90 text-[10px] sm:text-xs font-bold">
                              <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full">
                                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-400" /> 25 min
                              </span>
                              <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full">
                                <Utensils className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-400" /> Fácil
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Ingredients Card - Height capped to image height on Desktop */}
                        <div className="bg-white rounded-[30px] sm:rounded-[40px] p-6 sm:p-10 border border-gray-100 shadow-sm flex flex-col justify-between h-full">
                          <div className="space-y-6">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
                                <ShoppingCart className="w-5 h-5 text-orange-500" />
                                Ingredientes
                              </h4>
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                {selectedRecipeForDetails.ingredients.length} items
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 sm:gap-y-2 max-h-[350px] sm:max-h-none overflow-y-auto sm:overflow-visible no-scrollbar">
                              {selectedRecipeForDetails.ingredients.map((ing, idx) => (
                                <div key={idx} className="flex items-center justify-between group py-2 border-b border-gray-50 last:border-0 transition-opacity">
                                  <div className="flex items-center gap-1 sm:gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-200 group-hover:bg-orange-500 transition-colors" />
                                    <span className="text-xs sm:text-sm font-medium text-gray-600 line-clamp-1">{ing.name}</span>
                                  </div>
                                  <span className="font-mono text-[9px] sm:text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg whitespace-nowrap">
                                    {ing.amount} {ing.unit}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="pt-6 mt-4 border-t border-gray-50 flex items-center justify-between">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Costo Estimado</span>
                            <span className="text-xl sm:text-2xl font-black text-orange-500">
                              Q{selectedRecipeForDetails.ingredients.reduce((s, i) => s + i.estimatedCost, 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Content Section: Title, Instructions and Actions */}
                      <div className="bg-white rounded-[30px] sm:rounded-[40px] p-6 sm:p-10 border border-gray-100 shadow-sm space-y-8">
                        <div className="space-y-4">
                          <h3 className="text-2xl sm:text-5xl font-black tracking-tighter leading-tight sm:leading-[0.9] text-[#1A1C1E]">
                            {selectedRecipeForDetails.name}
                          </h3>
                          <div className="h-px bg-gray-100 w-full" />
                        </div>

                        <div className="space-y-8">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
                              <ChefHat className="w-6 h-6 text-orange-500" />
                              Pasos de Preparación
                            </h4>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-x-12 gap-y-8">
                            {selectedRecipeForDetails.instructions.map((step, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex gap-6 group"
                              >
                                <div className="flex-shrink-0">
                                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center text-lg font-black shadow-sm group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                                    {idx + 1}
                                  </div>
                                </div>
                                <div className="flex-1 pt-1">
                                  <p className="text-base sm:text-lg text-gray-600 font-medium leading-relaxed group-hover:text-gray-900 transition-colors">
                                    {step}
                                  </p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>

                        {/* Actions buttons */}
                        <div className="pt-10 border-t border-gray-100">
                          {previousView !== 'planner' && Object.values(weeklyPlan).some(day => Object.values(day).includes(selectedRecipeForDetails.id)) ? (
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
                          ) : (
                            <button
                              onClick={() => toggleWishlist(selectedRecipeForDetails.id)}
                              className={`w-full py-4 sm:py-6 rounded-[20px] sm:rounded-[24px] font-black flex items-center justify-center gap-3 sm:gap-4 transition-all active:scale-[0.98] shadow-2xl group ${wishlist.has(selectedRecipeForDetails.id)
                                ? 'bg-green-500 text-white shadow-green-500/20 hover:bg-green-600'
                                : 'bg-orange-500 text-white shadow-orange-500/20 hover:bg-orange-600'
                                }`}
                            >
                              <span className="text-sm sm:text-lg">
                                {wishlist.has(selectedRecipeForDetails.id) ? 'Quitar de cocinar próximamente' : 'Cocinar próximamente'}
                              </span>
                              {wishlist.has(selectedRecipeForDetails.id) ? (
                                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-125 transition-transform" />
                              ) : (
                                <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-125 transition-transform" />
                              )}
                            </button>
                          )}
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
                    {/* Header with Search */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              setSelectedSection('all');
                              setSearchQuery('');
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
                          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter leading-none">
                            {setupStep === 'breakfast' ? '¿Qué desayunarás?' :
                              setupStep === 'lunch' ? '¿Qué almorzarás?' : '¿Qué cenarás?'}
                          </h2>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-gray-500 text-sm">Selecciona las opciones para tu semana.</p>
                          {!isReselectingPool && (
                            <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest ml-4">Paso {setupStep === 'breakfast' ? '1' : setupStep === 'lunch' ? '2' : '3'} de 3</span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-xl">
                        <div className="relative flex-1">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Busca por ingrediente o nombre..."
                            className="w-full bg-white border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-orange-500/10 shadow-sm transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quick Filters */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                      <button
                        onClick={() => setSelectedSection('all')}
                        className={`flex-shrink-0 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest border transition-all ${selectedSection === 'all' ? 'bg-[#1A1C1E] text-white border-[#1A1C1E] shadow-xl' : 'bg-white text-gray-400 border-gray-100 hover:border-orange-200'
                          }`}
                      >
                        Todas
                      </button>
                      <button
                        onClick={() => setSelectedSection('favorites')}
                        className={`flex-shrink-0 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest border transition-all ${selectedSection === 'favorites' ? 'bg-orange-500 text-white border-orange-500 shadow-xl shadow-orange-500/20' : 'bg-white text-gray-400 border-gray-100 hover:border-orange-200'
                          }`}
                      >
                        Favoritos
                      </button>
                      <button
                        onClick={() => setSelectedSection('wishlist')}
                        className={`flex-shrink-0 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest border transition-all ${selectedSection === 'wishlist' ? 'bg-orange-500 text-white border-orange-500 shadow-xl shadow-orange-500/20' : 'bg-white text-gray-400 border-gray-100 hover:border-orange-200'
                          }`}
                      >
                        Próximos
                      </button>
                    </div>

                    {/* Search & Hero / Grid */}
                    <div className="space-y-12">
                      {searchQuery === '' && selectedSection === 'all' ? (
                        <>


                          {/* Cocinable Ahora */}
                          {cookableNow.filter(r => r.category === (setupStep === 'breakfast' ? 'Breakfast' : setupStep === 'lunch' ? 'Lunch' : 'Dinner')).length > 0 && searchQuery === '' && (
                            <div className="space-y-4 mt-6">
                              <div className="flex items-center justify-between px-1 sm:px-2">
                                <h3 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2">
                                  <ChefHat className="w-6 h-6 text-orange-500" />
                                  Cocinable Ahora
                                </h3>
                              </div>
                              <div className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-4 px-1 -mx-1 text-left">
                                {cookableNow.filter(r => {
                                  const mappedCat = setupStep === 'breakfast' ? 'Breakfast' : setupStep === 'lunch' ? 'Lunch' : 'Dinner';
                                  return r.category === mappedCat;
                                }).map(recipe => {
                                  let missingList: string[] = [];
                                  let costToCook = 0;
                                  recipe.ingredients.forEach(i => {
                                    const inv = inventory[i.name.toLowerCase()];
                                    if (!inv || inv.amount < i.amount) {
                                      missingList.push(i.name);
                                      costToCook += i.estimatedCost;
                                    }
                                  });

                                  const isSelected = setupSelectedPool.some(item => item.id === recipe.id);

                                  return (
                                    <motion.div
                                      key={recipe.id}
                                      whileHover={{ scale: 1.05, zIndex: 10 }}
                                      className="flex-shrink-0 w-[180px] sm:w-[220px] group cursor-pointer relative"
                                    >
                                      <div
                                        onClick={() => handleSelectRecipe(recipe.id)}
                                        className={`relative aspect-[4/5] rounded-[20px] overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-2xl border-4 flex flex-col ${isSelected ? 'border-orange-500 shadow-orange-500/50' : 'border-transparent bg-white shadow-gray-200/50'}`}
                                      >
                                        <div className="absolute top-0 left-0 right-0 p-3 z-10 flex flex-col gap-2 pointer-events-none">
                                          {missingList.length === 0 ? (
                                            <div className="bg-green-100/90 backdrop-blur-md text-green-700 text-[10px] font-black px-2.5 py-1.5 rounded-xl flex flex-row items-center w-max gap-1.5 shadow-sm border border-green-200">
                                              <CheckCircle2 className="w-3.5 h-3.5" />
                                              Tienes todo
                                            </div>
                                          ) : (
                                            <div className="bg-yellow-100/90 backdrop-blur-md text-yellow-700 text-[10px] font-black px-2.5 py-1.5 rounded-xl flex flex-row w-max items-center gap-1.5 shadow-sm border border-yellow-200 line-clamp-1 truncate">
                                              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                              Faltan {missingList.length}
                                            </div>
                                          )}
                                        </div>
                                        <img
                                          src={recipe.image}
                                          className="w-full h-[60%] object-cover transition-transform duration-700 group-hover:scale-110"
                                          referrerPolicy="no-referrer"
                                        />
                                        <div className="p-4 flex flex-col justify-between h-[40%] bg-white">
                                          <h4 className="text-gray-900 font-black text-sm leading-tight line-clamp-2">
                                            {recipe.name}
                                          </h4>
                                          <div className="flex items-center justify-between mt-1">
                                            <span className="text-orange-500 font-black text-xs uppercase tracking-widest whitespace-nowrap">
                                              Ahorras Q{(recipe.ingredients.reduce((s, i) => s + i.estimatedCost, 0) - costToCook).toFixed(2)}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedRecipeForModal(recipe);
                                        }}
                                        className="absolute top-3 right-3 z-20 p-2 bg-black/40 backdrop-blur-md rounded-xl text-white hover:bg-orange-500 transition-all opacity-0 group-hover:opacity-100"
                                      >
                                        <Search className="w-4 h-4" />
                                      </button>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Category Row for current step */}
                          {(() => {
                            const catMap = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' };
                            const category = catMap[setupStep];
                            const categoryRecipes = filteredRecipes; // Already filtered by step
                            if (categoryRecipes.length === 0) return null;

                            return (
                              <div className="space-y-6">
                                <div className="flex items-center justify-between px-2">
                                  <h3 className="text-2xl font-black tracking-tight">
                                    {category === 'Breakfast' ? 'Opciones de Desayuno' : category === 'Lunch' ? 'Opciones de Almuerzo' : 'Opciones de Cena'}
                                  </h3>
                                  <button
                                    onClick={() => setSelectedSection(category as any)}
                                    className="text-orange-500 font-black text-xs uppercase tracking-widest hover:underline"
                                  >
                                    Ver Todo
                                  </button>
                                </div>

                                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-8 px-2 -mx-2">
                                  {categoryRecipes.map(recipe => {
                                    const isSelected = setupSelectedPool.some(item => item.id === recipe.id);
                                    const matchCount = recipe.ingredients.filter(i => { const inv = inventory[i.name.toLowerCase()]; return inv && inv.amount >= i.amount; }).length;
                                    return (
                                      <motion.div
                                        key={recipe.id}
                                        whileHover={{ scale: 1.05, zIndex: 10 }}
                                        className="flex-shrink-0 w-[200px] group cursor-pointer relative"
                                      >
                                        <div
                                          onClick={() => handleSelectRecipe(recipe.id)}
                                          className={`relative aspect-[3/4] rounded-[20px] overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-2xl ${isSelected ? 'ring-4 ring-orange-500 ring-offset-4 ring-offset-gray-50' : ''
                                            }`}
                                        >
                                          <img
                                            src={recipe.image}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            referrerPolicy="no-referrer"
                                          />
                                          <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity ${isSelected ? 'opacity-90' : 'opacity-80 group-hover:opacity-100'
                                            }`} />

                                          <div className="absolute top-3 left-3 flex items-center gap-2">
                                            {isSelected ? (
                                              <div className="bg-orange-500 text-white p-1.5 rounded-full shadow-lg">
                                                <CheckCircle2 className="w-3 h-3" />
                                              </div>
                                            ) : matchCount > 0 && (
                                              <div className="bg-green-500 text-white p-1.5 rounded-full shadow-lg">
                                                <CheckCircle2 className="w-3 h-3" />
                                              </div>
                                            )}
                                            {favorites.has(recipe.id) && (
                                              <div className="bg-orange-500 text-white p-1.5 rounded-full shadow-lg">
                                                <Star className="w-3 h-3 fill-current" />
                                              </div>
                                            )}
                                          </div>

                                          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                                            <h4 className="text-white font-black text-sm leading-tight group-hover:text-orange-400 transition-colors line-clamp-2">
                                              {recipe.name}
                                            </h4>
                                            <div className="flex items-center justify-between">
                                              <span className="text-orange-400 font-black text-xs">${recipe.ingredients.reduce((s, i) => s + i.estimatedCost, 0).toFixed(2)}</span>
                                              <div className="flex items-center gap-1 text-white/60 text-[10px] font-bold">
                                                <Clock className="w-3 h-3" />
                                                20m
                                              </div>
                                            </div>
                                          </div>
                                        </div>

                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedRecipeForModal(recipe);
                                          }}
                                          className="absolute top-3 right-3 z-20 p-2 bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-white hover:text-orange-500 transition-all opacity-0 group-hover:opacity-100"
                                        >
                                          <Search className="w-4 h-4" />
                                        </button>
                                      </motion.div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}
                        </>
                      ) : (
                        /* Search Results Grid */
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 pb-32">
                          {filteredRecipes.map(recipe => {
                            const isSelected = setupSelectedPool.some(item => item.id === recipe.id);
                            const matchCount = recipe.ingredients.filter(i => inventory[i.name.toLowerCase()]?.amount >= i.amount).length;
                            return (
                              <motion.div
                                layout
                                key={recipe.id}
                                onClick={() => handleSelectRecipe(recipe.id)}
                                className="group relative cursor-pointer"
                              >
                                <div className={`relative aspect-[3/4] rounded-[20px] overflow-hidden shadow-lg transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2 ${isSelected ? 'ring-4 ring-orange-500 ring-offset-4 ring-offset-gray-50' : ''
                                  }`}>
                                  <img
                                    src={recipe.image}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    referrerPolicy="no-referrer"
                                  />

                                  <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity ${isSelected ? 'opacity-90' : 'opacity-80 group-hover:opacity-100'
                                    }`} />

                                  <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                      <span className="bg-white/20 backdrop-blur-md text-white text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest border border-white/10">
                                        {recipe.category}
                                      </span>
                                      {favorites.has(recipe.id) && (
                                        <div className="bg-orange-500 text-white p-1 rounded-lg shadow-lg">
                                          <Star className="w-2.5 h-2.5 fill-current" />
                                        </div>
                                      )}
                                    </div>
                                    {isSelected ? (
                                      <div className="bg-orange-500 text-white p-1.5 rounded-full shadow-lg">
                                        <CheckCircle2 className="w-4 h-4" />
                                      </div>
                                    ) : matchCount > 0 && (
                                      <div className="bg-green-500 text-white p-1.5 rounded-full shadow-lg">
                                        <CheckCircle2 className="w-3 h-3" />
                                      </div>
                                    )}
                                  </div>

                                  <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                      <h4 className="text-white font-black text-sm leading-tight group-hover:text-orange-400 transition-colors line-clamp-2">
                                        {recipe.name}
                                      </h4>
                                    </div>

                                    <div className="flex items-center justify-between">
                                      <span className="text-orange-400 font-black text-xs">${recipe.ingredients.reduce((s, i) => s + i.estimatedCost, 0).toFixed(2)}</span>
                                      <div className="flex items-center gap-1 text-white/60 text-[10px] font-bold">
                                        <Clock className="w-3 h-3" />
                                        20m
                                      </div>
                                    </div>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedRecipeForModal(recipe);
                                    }}
                                    className="absolute top-3 right-3 z-20 p-2 bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-white hover:text-orange-500 transition-all opacity-0 group-hover:opacity-100"
                                  >
                                    <Search className="w-4 h-4" />
                                  </button>
                                </div>
                              </motion.div>
                            );
                          })}
                          {filteredRecipes.length === 0 && (
                            <div className="col-span-full py-20 text-center space-y-4">
                              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                                <Search className="w-8 h-8 text-gray-200" />
                              </div>
                              <p className="text-sm text-gray-400 font-medium">
                                No encontramos {searchQuery !== '' ? `"${searchQuery}"` : 'nada'} en {
                                  selectedSection === 'favorites' ? 'tus favoritos' :
                                    selectedSection === 'wishlist' ? 'tus guardados' :
                                      'esta categoría'
                                }.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
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

                            <button
                              onClick={() => {
                                setSelectedSection('all');
                                setSearchQuery('');
                                if (isReselectingPool) {
                                  setView('calendar');
                                  setIsReselectingPool(false);
                                } else {
                                  if (setupStep === 'breakfast') setSetupStep('lunch');
                                  else if (setupStep === 'lunch') setSetupStep('dinner');
                                  else {
                                    setView('calendar');
                                    setHasReachedCalendarOnce(true);
                                    setIsShowingCalendarCTA(false);
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
                  </motion.div>
                )}

                {view === 'calendar' && (
                  <motion.div
                    key="calendar"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6 sm:space-y-8 h-full overflow-y-auto no-scrollbar pb-20"
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
                        <div className="flex flex-col sm:flex-row gap-4">
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
                            className="flex-1 inline-flex items-center justify-center gap-3 bg-orange-500 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-lg shadow-orange-500/30 hover:scale-105 transition-transform active:scale-95"
                          >
                            {setupSelectedPool.length === 0 ? 'Crear Plan Semanal' : 'Continuar Planificación'}
                            <ArrowRight className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setView('saved-plans')}
                            className="flex-1 inline-flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-600 px-8 py-4 rounded-2xl font-black text-sm hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
                          >
                            <FolderOpen className="w-4 h-4 text-orange-500" />
                            Ver Planes Guardados
                          </button>
                        </div>
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

                          <div className="flex items-center gap-2 sm:gap-4">
                            {isPlanComplete && hasFinalizedInitialPlan && !isEditingPlan && (
                              <>
                                <button
                                  onClick={() => setView('saved-plans')}
                                  className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm text-gray-400 hover:text-orange-500 transition-colors"
                                  title="Planes Guardados"
                                >
                                  <FolderOpen className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingSavedPlan(null);
                                    setNewPlanTitle('');
                                    setNewPlanDescription('');
                                    setIsSavingPlanModalOpen(true);
                                  }}
                                  className="p-3 bg-white border border-gray-200 rounded-2xl shadow-sm hover:bg-gray-50 transition-all active:scale-95"
                                  title="Guardar Plan"
                                >
                                  <Save className="w-5 h-5 text-orange-500" />
                                </button>
                                <button
                                  onClick={() => {
                                    setIsEditingPlan(true);
                                    setActiveDay(getCurrentDay());
                                  }}
                                  className="p-3 bg-white border border-gray-200 rounded-2xl shadow-sm hover:bg-gray-50 transition-all active:scale-95"
                                  title="Editar Plan"
                                >
                                  <Edit3 className="w-5 h-5 text-orange-500" />
                                </button>
                                <button
                                  onClick={() => setIsDeletePlanModalOpen(true)}
                                  className="p-3 bg-white border border-red-200 text-red-500 rounded-2xl shadow-sm hover:bg-red-50 transition-all active:scale-95"
                                  title="Eliminar Plan"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="bg-white rounded-[30px] sm:rounded-[40px] p-4 sm:p-6 lg:p-8 border border-gray-100 shadow-xl shadow-gray-200/50 overflow-x-auto lg:overflow-x-visible no-scrollbar">
                          {/* Calendar Mobile View: Vertical List for Active Day */}
                          <div className="sm:hidden space-y-4">
                            {MEALS.map(time => {
                              const isLocked = isPlanComplete && hasFinalizedInitialPlan && !isEditingPlan;
                              return (
                                <div key={time} className="flex items-center gap-4">
                                  <div className="w-16 text-right">
                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{time}</span>
                                  </div>
                                  <div className="flex-1">
                                    <MealSlot
                                      day={activeDay}
                                      time={time}
                                      recipeId={weeklyPlan[activeDay]?.[time]}
                                      isSelected={selectedSlot?.day === activeDay && selectedSlot?.time === time}
                                      isActiveDay={true}
                                      isLocked={isLocked}
                                      isCooked={cookedMeals.has(`${activeDay}-${time}`)}
                                      onClick={() => {
                                        if (isLocked) return;
                                        if (weeklyPlan[activeDay]?.[time]) {
                                          setWeeklyPlan(prev => ({
                                            ...prev,
                                            [activeDay]: { ...prev[activeDay], [time]: null }
                                          }));
                                        } else {
                                          setSelectedSlot({ day: activeDay, time });
                                          setView('planner');
                                        }
                                      }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Calendar Desktop View: 8-column Grid */}
                          <div className="hidden sm:block">
                            <div className="grid grid-cols-8 gap-2 sm:gap-3 mb-6">
                              <div />
                              {DAYS.map(day => {
                                const isToday = day === getCurrentDay();
                                const isLocked = isPlanComplete && hasFinalizedInitialPlan && !isEditingPlan;

                                return (
                                  <div
                                    key={day}
                                    onClick={() => !isLocked && setActiveDay(day)}
                                    className={`text-center py-2 rounded-xl transition-all ${!isLocked ? 'cursor-pointer' : 'cursor-default'} ${activeDay === day ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-transparent text-gray-400'
                                      } ${isLocked && activeDay !== day ? 'opacity-30' : 'opacity-100'}`}
                                  >
                                    <span className="text-[10px] font-black uppercase tracking-widest">
                                      {isToday && isLocked ? 'Hoy' : day}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>

                            <div className="space-y-3 sm:space-y-4">
                              {MEALS.map(time => (
                                <div key={time} className="grid grid-cols-8 gap-2 sm:gap-3 items-center">
                                  <div className="text-right pr-2 sm:pr-4">
                                    <span className="text-[8px] sm:text-[10px] font-black text-gray-900 uppercase tracking-widest">{time}</span>
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
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6 sm:space-y-10 h-full overflow-y-auto no-scrollbar pb-20"
                  >
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                      <div className="space-y-2">
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
                            className="p-2 bg-white rounded-xl border border-gray-100 text-gray-400 hover:text-orange-500 shadow-sm transition-colors"
                          >
                            <ArrowRight className="w-4 h-4 rotate-180" />
                          </button>
                          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter">
                            {selectedSlot ? `Elegir para ${selectedSlot.day}` : 'Explorar Recetas'}
                          </h2>
                        </div>
                        <p className="text-gray-500 font-medium">
                          {selectedSlot ? `Selecciona el mejor ${selectedSlot.time} para tu día` : 'Descubre nuevas ideas para tu menú semanal'}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-xl">
                        <div className="relative flex-1">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Busca por ingrediente o nombre..."
                            className="w-full bg-white border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-orange-500/10 shadow-sm transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quick Filters */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                      <button
                        onClick={() => setSelectedSection('all')}
                        className={`flex-shrink-0 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest border transition-all ${selectedSection === 'all' ? 'bg-[#1A1C1E] text-white border-[#1A1C1E] shadow-xl' : 'bg-white text-gray-400 border-gray-100 hover:border-orange-200'
                          }`}
                      >
                        Todas
                      </button>
                      <button
                        onClick={() => setSelectedSection('favorites')}
                        className={`flex-shrink-0 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest border transition-all ${selectedSection === 'favorites' ? 'bg-orange-500 text-white border-orange-500 shadow-xl shadow-orange-500/20' : 'bg-white text-gray-400 border-gray-100 hover:border-orange-200'
                          }`}
                      >
                        Favoritos
                      </button>
                      <button
                        onClick={() => setSelectedSection('wishlist')}
                        className={`flex-shrink-0 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest border transition-all ${selectedSection === 'wishlist' ? 'bg-orange-500 text-white border-orange-500 shadow-xl shadow-orange-500/20' : 'bg-white text-gray-400 border-gray-100 hover:border-orange-200'
                          }`}
                      >
                        Próximos
                      </button>
                      {(['Breakfast', 'Lunch', 'Dinner'] as const).map(cat => (
                        <button
                          key={cat}
                          onClick={() => setSelectedSection(cat)}
                          className={`flex-shrink-0 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest border transition-all ${selectedSection === cat ? 'bg-orange-500 text-white border-orange-500 shadow-xl shadow-orange-500/20' : 'bg-white text-gray-400 border-gray-100 hover:border-orange-200'
                            }`}
                        >
                          {cat === 'Breakfast' ? 'Desayunos' : cat === 'Lunch' ? 'Almuerzos' : 'Cenas'}
                        </button>
                      ))}
                    </div>

                    {/* Search & Hero / Grid */}
                    <div className="space-y-4 sm:space-y-12">
                      {searchQuery === '' && selectedSection === 'all' ? (
                        <>
                          {/* Featured Hero */}
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative h-[140px] sm:h-[220px] md:h-[260px] rounded-[24px] overflow-hidden shadow-2xl group cursor-pointer"
                            onClick={() => {
                              const featured = RECIPES[0];
                              if (selectedSlot) {
                                handleSelectRecipe(featured.id);
                              } else {
                                setSelectedRecipeForDetails(featured);
                                navigateTo('recipe-details');
                              }
                            }}
                          >
                            <img
                              src={RECIPES[0].image}
                              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                            <div className="absolute inset-0 flex flex-col justify-center p-4 sm:p-6 md:p-8 space-y-2 sm:space-y-4 max-w-2xl">
                              <div className="flex items-center gap-2">
                                <span className="bg-orange-500 text-white text-[7px] sm:text-[10px] font-black px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-widest">
                                  Destacado
                                </span>
                                <span className="text-white/60 text-[7px] sm:text-[10px] font-black uppercase tracking-widest">
                                  • {RECIPES[0].category}
                                </span>
                              </div>
                              <h3 className="text-lg sm:text-3xl md:text-4xl font-black text-white tracking-tighter leading-tight sm:leading-none">
                                {RECIPES[0].name}
                              </h3>
                              <p className="text-white/70 text-[10px] sm:text-sm md:text-base font-medium line-clamp-1 sm:line-clamp-2">
                                {RECIPES[0].description}
                              </p>
                              <div className="flex items-center gap-4 pt-1 sm:pt-2">
                                <button className="bg-white text-black px-4 py-1.5 sm:px-6 sm:py-2.5 rounded-lg sm:rounded-xl font-black text-[8px] sm:text-xs uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all flex items-center gap-2">
                                  {selectedSlot ? 'Seleccionar' : 'Ver Detalles'}
                                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                              </div>
                            </div>
                          </motion.div>

                          {/* Cocinable Ahora */}
                          {cookableNow.length > 0 && searchQuery === '' && (
                            <div className="space-y-4 mt-6">
                              <div className="flex items-center justify-between px-1 sm:px-2">
                                <h3 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2">
                                  <ChefHat className="w-6 h-6 text-orange-500" />
                                  Cocinable Ahora
                                </h3>
                              </div>
                              <div className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-4 px-1 -mx-1 text-left">
                                {cookableNow.map(recipe => {
                                  let missingList: string[] = [];
                                  let costToCook = 0;
                                  recipe.ingredients.forEach(i => {
                                    const inv = inventory[i.name.toLowerCase()];
                                    if (!inv || inv.amount < i.amount) {
                                      missingList.push(i.name);
                                      costToCook += i.estimatedCost;
                                    }
                                  });

                                  return (
                                    <motion.div
                                      key={recipe.id}
                                      whileHover={{ scale: 1.05, zIndex: 10 }}
                                      className="flex-shrink-0 w-[180px] sm:w-[220px] group cursor-pointer relative"
                                    >
                                      <div
                                        onClick={() => {
                                          if (selectedSlot) {
                                            handleSelectRecipe(recipe.id);
                                          } else {
                                            setSelectedRecipeForDetails(recipe);
                                            navigateTo('recipe-details');
                                          }
                                        }}
                                        className="relative aspect-[4/5] rounded-[20px] overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-2xl bg-white border border-gray-100 flex flex-col"
                                      >
                                        <div className="absolute top-0 left-0 right-0 p-3 z-10 flex flex-col gap-2 pointer-events-none">
                                          {missingList.length === 0 ? (
                                            <div className="bg-green-100/90 backdrop-blur-md text-green-700 text-[10px] font-black px-2.5 py-1.5 rounded-xl flex flex-row items-center w-max gap-1.5 shadow-sm border border-green-200">
                                              <CheckCircle2 className="w-3.5 h-3.5" />
                                              Tienes todo
                                            </div>
                                          ) : (
                                            <div className="bg-yellow-100/90 backdrop-blur-md text-yellow-700 text-[10px] font-black px-2.5 py-1.5 rounded-xl flex flex-row w-max items-center gap-1.5 shadow-sm border border-yellow-200 line-clamp-1 truncate">
                                              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                              Faltan {missingList.length}
                                            </div>
                                          )}
                                        </div>
                                        <img
                                          src={recipe.image}
                                          className="w-full h-[60%] object-cover transition-transform duration-700 group-hover:scale-110"
                                          referrerPolicy="no-referrer"
                                        />
                                        <div className="p-4 flex flex-col justify-between h-[40%] bg-white">
                                          <h4 className="text-gray-900 font-black text-sm leading-tight line-clamp-2">
                                            {recipe.name}
                                          </h4>
                                          <div className="flex items-center justify-between">
                                            <span className="text-orange-500 font-black text-xs uppercase tracking-widest whitespace-nowrap">
                                              Ahorras Q{(recipe.ingredients.reduce((s, i) => s + i.estimatedCost, 0) - costToCook).toFixed(2)}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedRecipeForModal(recipe);
                                        }}
                                        className="absolute top-3 right-3 z-20 p-2 bg-black/40 backdrop-blur-md rounded-xl text-white hover:bg-orange-500 transition-all opacity-0 group-hover:opacity-100"
                                      >
                                        <Search className="w-4 h-4" />
                                      </button>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Category Rows */}
                          {['Breakfast', 'Lunch', 'Dinner'].map(category => {
                            const categoryRecipes = RECIPES.filter(r => r.category === category);
                            if (categoryRecipes.length === 0) return null;

                            return (
                              <div key={category} className="space-y-2 sm:space-y-6">
                                <div className="flex items-center justify-between px-1 sm:px-2">
                                  <h3 className="text-xs sm:text-xl md:text-2xl font-black tracking-tight">
                                    {category === 'Breakfast' ? 'Desayunos' : category === 'Lunch' ? 'Almuerzos' : 'Cenas'}
                                  </h3>
                                  <button
                                    onClick={() => setSelectedSection(category as any)}
                                    className="text-orange-500 font-black text-[10px] sm:text-xs uppercase tracking-widest hover:underline"
                                  >
                                    Ver Todo
                                  </button>
                                </div>

                                <div className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-4 px-1 -mx-1">
                                  {categoryRecipes.map(recipe => {
                                    const matchCount = recipe.ingredients.filter(i => { const inv = inventory[i.name.toLowerCase()]; return inv && inv.amount >= i.amount; }).length;
                                    return (
                                      <motion.div
                                        key={recipe.id}
                                        whileHover={{ scale: 1.05, zIndex: 10 }}
                                        className="flex-shrink-0 w-[120px] sm:w-[200px] group cursor-pointer relative"
                                      >
                                        <div
                                          onClick={() => {
                                            if (selectedSlot) {
                                              handleSelectRecipe(recipe.id);
                                            } else {
                                              setSelectedRecipeForDetails(recipe);
                                              navigateTo('recipe-details');
                                            }
                                          }}
                                          className="relative aspect-[3/4] rounded-[12px] sm:rounded-[20px] overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-2xl"
                                        >
                                          <img
                                            src={recipe.image}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            referrerPolicy="no-referrer"
                                          />
                                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                                          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex items-center gap-1 sm:gap-2">
                                            {matchCount > 0 && (
                                              <div className="bg-green-500 text-white p-1 rounded-full shadow-lg">
                                                <CheckCircle2 className="w-2 h-2 sm:w-3 sm:h-3" />
                                              </div>
                                            )}
                                            {favorites.has(recipe.id) && (
                                              <div className="bg-orange-500 text-white p-1 rounded-full shadow-lg">
                                                <Star className="w-2 h-2 sm:w-3 sm:h-3 fill-current" />
                                              </div>
                                            )}
                                          </div>

                                          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 space-y-1 sm:space-y-2">
                                            <h4 className="text-white font-black text-[10px] sm:text-sm leading-tight group-hover:text-orange-400 transition-colors line-clamp-2">
                                              {recipe.name}
                                            </h4>
                                            <div className="flex items-center justify-between">
                                              <span className="text-orange-400 font-black text-[8px] sm:text-xs">Q{recipe.ingredients.reduce((s, i) => s + i.estimatedCost, 0).toFixed(2)}</span>
                                              <div className="flex items-center gap-1 text-white/60 text-[8px] sm:text-[10px] font-bold">
                                                <Clock className="w-2 h-2 sm:w-3 sm:h-3" />
                                                20m
                                              </div>
                                            </div>
                                          </div>
                                        </div>

                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedRecipeForModal(recipe);
                                          }}
                                          className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 p-1.5 sm:p-2 bg-white/20 backdrop-blur-md rounded-lg sm:rounded-xl text-white hover:bg-white hover:text-orange-500 transition-all opacity-0 group-hover:opacity-100"
                                        >
                                          <Search className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </button>
                                      </motion.div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </>
                      ) : (
                        /* Search Results Grid */
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                          {filteredRecipes.map(recipe => {
                            const matchCount = recipe.ingredients.filter(i => { const inv = inventory[i.name.toLowerCase()]; return inv && inv.amount >= i.amount; }).length;
                            return (
                              <motion.div
                                layout
                                key={recipe.id}
                                onClick={() => {
                                  if (selectedSlot) {
                                    handleSelectRecipe(recipe.id);
                                  } else {
                                    setSelectedRecipeForDetails(recipe);
                                    navigateTo('recipe-details');
                                  }
                                }}
                                className="group relative cursor-pointer"
                              >
                                <div className="relative aspect-[3/4] rounded-[20px] overflow-hidden shadow-lg transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2">
                                  <img
                                    src={recipe.image}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    referrerPolicy="no-referrer"
                                  />

                                  {/* Overlay Gradient */}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                                  {/* Badges */}
                                  <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                      <span className="bg-white/20 backdrop-blur-md text-white text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest border border-white/10">
                                        {recipe.category}
                                      </span>
                                      {favorites.has(recipe.id) && (
                                        <div className="bg-orange-500 text-white p-1 rounded-lg shadow-lg">
                                          <Star className="w-2.5 h-2.5 fill-current" />
                                        </div>
                                      )}
                                    </div>
                                    {matchCount > 0 && (
                                      <div className="bg-green-500 text-white p-1.5 rounded-full shadow-lg">
                                        <CheckCircle2 className="w-3 h-3" />
                                      </div>
                                    )}
                                  </div>

                                  {/* Content */}
                                  <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                      <h4 className="text-white font-black text-sm leading-tight group-hover:text-orange-400 transition-colors line-clamp-2">
                                        {recipe.name}
                                      </h4>
                                    </div>

                                    <div className="flex items-center justify-between">
                                      <span className="text-orange-400 font-black text-xs">Q{recipe.ingredients.reduce((s, i) => s + i.estimatedCost, 0).toFixed(2)}</span>
                                      <div className="flex items-center gap-1 text-white/60 text-[10px] font-bold">
                                        <Clock className="w-3 h-3" />
                                        20m
                                      </div>
                                    </div>

                                    {matchCount > 0 && (
                                      <p className="text-[8px] font-black text-green-400 uppercase tracking-widest pt-1">
                                        {matchCount} ingredientes en despensa
                                      </p>
                                    )}
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedRecipeForModal(recipe);
                                    }}
                                    className="absolute top-3 right-3 z-20 p-2 bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-white hover:text-orange-500 transition-all opacity-0 group-hover:opacity-100"
                                  >
                                    <Search className="w-4 h-4" />
                                  </button>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}

                      {(filteredRecipes.length === 0 && (searchQuery !== '' || selectedSection !== 'all')) && (
                        <div className="py-24 text-center space-y-6 bg-white rounded-[40px] border-2 border-dashed border-gray-100">
                          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                            <Search className="w-10 h-10 text-gray-200" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-xl font-black tracking-tight">No se encontraron recetas</h3>
                            <p className="text-sm text-gray-400 font-medium max-w-xs mx-auto">
                              No encontramos nada {searchQuery !== '' ? `que coincida con "${searchQuery}"` : ''} en {
                                selectedSection === 'all' ? 'todas las recetas' :
                                  selectedSection === 'Breakfast' ? 'desayunos' :
                                    selectedSection === 'Lunch' ? 'almuerzos' :
                                      selectedSection === 'Dinner' ? 'cenas' :
                                        selectedSection === 'favorites' ? 'tus favoritos' :
                                          'tus recetas guardadas'
                              }.
                            </p>
                          </div>
                          <button
                            onClick={() => { setSearchQuery(''); setSelectedSection('all'); }}
                            className="text-orange-500 font-black text-xs uppercase tracking-widest hover:underline"
                          >
                            Ver todas las recetas
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {view === 'shopping-list' && (
                  <motion.div
                    key="shopping-list"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6 sm:space-y-10 h-full overflow-y-auto no-scrollbar pb-24"
                  >
                    <div className="space-y-2">
                      <h2 className="text-3xl font-black tracking-tight">Lista de Compras</h2>
                      <p className="text-gray-500 font-medium">Generada automáticamente de tu plan semanal.</p>
                    </div>

                    {(() => {
                      const reqs: Record<string, { amount: number, unit: string, name: string }> = {};
                      let hasPlanItems = false;
                      Object.values(weeklyPlan).forEach(day => {
                        Object.values(day).forEach(recipeId => {
                          if (recipeId) {
                            hasPlanItems = true;
                            const recipe = RECIPES.find(r => r.id === recipeId);
                            recipe?.ingredients.forEach(ing => {
                              const key = ing.name.toLowerCase();
                              if (!reqs[key]) reqs[key] = { amount: 0, unit: ing.unit, name: ing.name };
                              reqs[key].amount += ing.amount;
                            });
                          }
                        });
                      });

                      if (!hasPlanItems) return (
                        <div className="py-24 text-center space-y-6 bg-white rounded-[40px] border-2 border-dashed border-gray-100">
                          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                            <ShoppingCart className="w-10 h-10 text-gray-200" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-xl font-black tracking-tight">Tu plan está vacío</h3>
                            <p className="text-sm text-gray-400 font-medium max-w-xs mx-auto">Crea un plan semanal para generar tu lista de compras.</p>
                          </div>
                        </div>
                      );

                      const toBuy = Object.values(reqs).map(req => {
                        const key = req.name.toLowerCase();
                        const have = inventory[key]?.amount || 0;
                        return {
                          name: req.name,
                          unit: req.unit,
                          need: req.amount,
                          have: have,
                          toBuy: Math.max(0, req.amount - have)
                        };
                      }).filter(r => r.toBuy > 0);

                      if (toBuy.length === 0) return (
                        <div className="py-24 text-center space-y-6 bg-green-50 rounded-[40px] border border-green-100 shadow-sm">
                          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                            <CheckCircle2 className="w-10 h-10 text-green-500" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-xl font-black tracking-tight text-green-800">¡No necesitas comprar nada!</h3>
                            <p className="text-sm text-green-600 font-medium max-w-xs mx-auto">Tienes todo lo necesario en tu despensa para cocinar esta semana.</p>
                          </div>
                        </div>
                      );

                      return (
                        <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-gray-100 shadow-xl shadow-gray-200/50 space-y-8">

                          {/* Summary Header */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-max">
                            <div className="flex justify-between items-center bg-orange-50 p-5 rounded-2xl">
                              <div className="space-y-1">
                                <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest block">Ítems a comprar</span>
                                <span className="font-black text-orange-600 text-lg">Total de ingredientes</span>
                              </div>
                              <span className="bg-orange-600 text-white px-4 py-2 rounded-2xl font-black text-xl">{toBuy.length}</span>
                            </div>

                            <div className="flex justify-between items-center bg-gray-50 p-5 rounded-2xl border border-gray-100">
                              <div className="space-y-1">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Inversión Aproximada</span>
                                <div className="flex items-center gap-2">
                                  <Wallet className="w-4 h-4 text-gray-400" />
                                  <span className="font-black text-gray-900 text-lg">Costo Estimado</span>
                                </div>
                              </div>
                              <span className="text-2xl font-black text-gray-900">Q{totalCost.toFixed(2)}</span>
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex items-center justify-between pb-2 border-b border-gray-50">
                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Tu Lista</h3>
                            <button
                              onClick={() => handleToggleAllItems(toBuy.map(i => i.name.toLowerCase()))}
                              className="text-[10px] font-black uppercase tracking-widest text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-lg"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {checkedShoppingItems.size === toBuy.length ? 'Desmarcar todo' : 'Marcar todo'}
                            </button>
                          </div>

                          {/* List Items */}
                          <div className="space-y-3">
                            {toBuy.map(item => {
                              const isChecked = checkedShoppingItems.has(item.name.toLowerCase());
                              return (
                                <motion.div
                                  layout
                                  key={item.name}
                                  onClick={() => handleToggleShoppingItem(item.name.toLowerCase())}
                                  className={`flex items-center justify-between gap-4 p-4 rounded-2xl border transition-all cursor-pointer group ${isChecked
                                    ? 'bg-gray-50 border-gray-100 opacity-60'
                                    : 'bg-white border-gray-100 hover:border-orange-200 hover:shadow-md'
                                    }`}
                                >
                                  <div className="flex items-center gap-4">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${isChecked ? 'bg-green-500 text-white' : 'border-2 border-gray-200 group-hover:border-orange-300'
                                      }`}>
                                      {isChecked && <CheckCircle2 className="w-4 h-4" />}
                                    </div>
                                    <div className="space-y-0.5">
                                      <p className={`font-bold text-base transition-all ${isChecked ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                                        {item.name}
                                      </p>
                                      <p className="text-[10px] text-gray-400 font-medium tracking-wide">
                                        Faltan {item.toBuy} {item.unit} (Tienes {item.have})
                                      </p>
                                    </div>
                                  </div>

                                  <div className={`flex items-center gap-3 px-3 py-1.5 rounded-xl border transition-all ${isChecked ? 'bg-gray-100 border-transparent opacity-0' : 'bg-gray-50 border-gray-100 group-hover:bg-white'
                                    }`}>
                                    <span className="font-mono text-sm font-black text-gray-700">{item.toBuy}</span>
                                    <span className="text-[9px] font-black bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-md uppercase">{item.unit}</span>
                                  </div>

                                  {/* Hidden inputs to maintain existing inventory update logic */}
                                  <input
                                    id={`buy_${item.name}`}
                                    type="hidden"
                                    value={isChecked ? item.toBuy : 0}
                                  />
                                </motion.div>
                              );
                            })}
                          </div>

                          {/* Final Action Button */}
                          <div className="pt-6 border-t border-gray-50 space-y-4">
                            {checkedShoppingItems.size < toBuy.length && (
                              <div className="flex items-center gap-2 justify-center text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 py-2 rounded-xl border border-gray-100">
                                <AlertCircle className="w-4 h-4 text-orange-400" />
                                Marca todos los elementos para finalizar
                              </div>
                            )}

                            <button
                              disabled={checkedShoppingItems.size < toBuy.length}
                              onClick={() => {
                                setInventory(prev => {
                                  const next = { ...prev };
                                  toBuy.forEach(item => {
                                    const key = item.name.toLowerCase();
                                    if (checkedShoppingItems.has(key)) {
                                      if (!next[key]) next[key] = { name: item.name, amount: 0, unit: item.unit };
                                      next[key].amount += item.toBuy;
                                    }
                                  });
                                  return next;
                                });
                                setCheckedShoppingItems(new Set()); // Clear list for next time
                                setHasConfirmedShoppingList(true);
                                showSnackbar('¡Perfecto! Tus compras han sido añadidas a la despensa.');
                                setView('dashboard');
                              }}
                              className={`w-full py-5 rounded-2xl font-black shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${checkedShoppingItems.size < toBuy.length
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed grayscale'
                                : 'bg-orange-500 text-white shadow-orange-500/30 hover:bg-orange-600 hover:scale-[1.02]'
                                }`}
                            >
                              <CheckCircle2 className="w-6 h-6" />
                              <span className="text-sm sm:text-base uppercase tracking-widest">¡Terminé mis compras!</span>
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </motion.div>
                )}

                {view === 'saved-plans' && (
                  <motion.div
                    key="saved-plans"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6 sm:space-y-10 h-full overflow-y-auto no-scrollbar pb-20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <h2 className="text-3xl font-black tracking-tight">Mis Planes Guardados</h2>
                        <p className="text-gray-500 font-medium">Reutiliza tus mejores combinaciones semanales</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setEditingSavedPlan(null);
                            setNewPlanTitle('');
                            setNewPlanDescription('');
                            setIsSavingPlanModalOpen(true);
                          }}
                          className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm text-gray-400 hover:text-orange-500 transition-colors"
                        >
                          <Save className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setView('calendar')}
                          className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm text-gray-400 hover:text-orange-500 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {savedPlans.length === 0 ? (
                      <div className="py-24 text-center space-y-6 bg-white rounded-[40px] border-2 border-dashed border-gray-100">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                          <FolderOpen className="w-10 h-10 text-gray-200" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-black tracking-tight">No tienes planes guardados</h3>
                          <p className="text-sm text-gray-400 font-medium max-w-xs mx-auto">Guarda tus planes actuales para verlos aquí más tarde.</p>
                        </div>
                        <button
                          onClick={() => setView('calendar')}
                          className="inline-flex items-center gap-3 bg-orange-500 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-lg shadow-orange-500/30 hover:scale-105 transition-transform active:scale-95"
                        >
                          Ir a mi Plan Actual
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {savedPlans.map(savedPlan => (
                          <motion.div
                            key={savedPlan.id}
                            layout
                            className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-xl shadow-gray-200/50 space-y-4 group relative"
                          >
                            <div className="space-y-1">
                              <h3 className="text-xl font-black tracking-tight group-hover:text-orange-500 transition-colors">
                                {savedPlan.title}
                              </h3>
                              <p className="text-sm text-gray-400 font-medium line-clamp-2">
                                {savedPlan.description || 'Sin descripción'}
                              </p>
                            </div>

                            <div className="flex items-center gap-4 py-2">
                              <div className="flex -space-x-2">
                                {(Object.values(savedPlan.plan) as Record<MealTime, string | null>[]).slice(0, 3).map((day, idx) => {
                                  const recipeId = day.Almuerzo || day.Cena || day.Desayuno;
                                  const recipe = RECIPES.find(r => r.id === recipeId);
                                  if (!recipe) return null;
                                  return (
                                    <img
                                      key={idx}
                                      src={recipe.image}
                                      className="w-8 h-8 rounded-full border-2 border-white object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  );
                                })}
                              </div>
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                {new Date(savedPlan.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            <div className="flex gap-2 pt-2">
                              <button
                                onClick={() => loadSavedPlan(savedPlan)}
                                className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-black text-xs shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-95"
                              >
                                Cargar Plan
                              </button>
                              <button
                                onClick={() => {
                                  setEditingSavedPlan(savedPlan);
                                  setNewPlanTitle(savedPlan.title);
                                  setNewPlanDescription(savedPlan.description);
                                  setIsSavingPlanModalOpen(true);
                                }}
                                className="p-3 bg-gray-50 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteSavedPlan(savedPlan.id)}
                                className="p-3 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {view === 'inventory' && (
                  <motion.div
                    key="inventory"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6 sm:space-y-10 h-full overflow-y-auto no-scrollbar pb-20"
                  >
                    <div className="space-y-2">
                      <h2 className="text-3xl font-black tracking-tight">Tu Despensa Inteligente</h2>
                      <p className="text-gray-500 font-medium">Mantén tu inventario actualizado para calcular listas de compra reales.</p>
                    </div>

                    <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-gray-100 shadow-xl shadow-gray-200/50 space-y-8">
                      {(() => {
                        const allIngs = new Map<string, { name: string, unit: string }>();
                        RECIPES.forEach(r => r.ingredients.forEach(i => allIngs.set(i.name.toLowerCase(), { name: i.name, unit: i.unit })));
                        const list = Array.from(allIngs.values()).sort((a, b) => a.name.localeCompare(b.name));

                        return (
                          <div className="flex flex-col bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
                            {list.map(ing => {
                              const invItem = inventory[ing.name.toLowerCase()];
                              const currentAmount = invItem ? invItem.amount : 0;
                              return (
                                <div key={ing.name} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 px-5 sm:px-6 hover:bg-gray-50/80 border-b border-gray-100 last:border-b-0 transition-colors group">

                                  <div className="flex items-center gap-3">
                                    <span className="font-bold text-gray-800 text-base sm:text-lg">{ing.name}</span>
                                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-500 px-2.5 py-1 rounded-lg border border-gray-200">
                                      {ing.unit}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                                    <div className="flex items-center bg-white border border-gray-200 rounded-[14px] overflow-hidden shadow-sm group-hover:border-orange-300 transition-colors">
                                      <button
                                        onClick={() => setInventory(prev => {
                                          const next = { ...prev };
                                          const key = ing.name.toLowerCase();
                                          if (!next[key]) next[key] = { name: ing.name, amount: 0, unit: ing.unit };
                                          next[key].amount = Math.max(0, next[key].amount - 1);
                                          return next;
                                        })}
                                        className="w-12 h-12 flex items-center justify-center bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                      >
                                        <Minus className="w-5 h-5" />
                                      </button>

                                      <div className="w-px h-8 bg-gray-200" />

                                      <input
                                        type="number"
                                        min="0"
                                        value={currentAmount || ''}
                                        placeholder="0"
                                        onChange={(e) => {
                                          const val = parseFloat(e.target.value) || 0;
                                          setInventory(prev => {
                                            const next = { ...prev };
                                            const key = ing.name.toLowerCase();
                                            next[key] = { name: ing.name, amount: Math.max(0, val), unit: ing.unit };
                                            return next;
                                          });
                                        }}
                                        className="w-20 text-center font-black text-xl bg-transparent border-none focus:ring-0 outline-none p-0 text-gray-800"
                                      />

                                      <div className="w-px h-8 bg-gray-200" />

                                      <button
                                        onClick={() => setInventory(prev => {
                                          const next = { ...prev };
                                          const key = ing.name.toLowerCase();
                                          if (!next[key]) next[key] = { name: ing.name, amount: 0, unit: ing.unit };
                                          next[key].amount = Math.max(0, next[key].amount) + 1;
                                          return next;
                                        })}
                                        className="w-12 h-12 flex items-center justify-center bg-gray-50 hover:bg-green-50 text-gray-400 hover:text-green-500 transition-colors"
                                      >
                                        <Plus className="w-5 h-5" />
                                      </button>
                                    </div>
                                  </div>

                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
                    setHasShoppingListReady(true);
                    setHasConfirmedShoppingList(false);
                    setShowShoppingListBanner(true);
                    setTimeout(() => setShowShoppingListBanner(false), 6000);
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
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 px-6 py-2 flex justify-between lg:hidden items-center z-30 sm:max-w-lg sm:mx-auto sm:left-6 sm:right-6 sm:bottom-6 sm:rounded-[32px] sm:border sm:shadow-2xl sm:shadow-black/10">
          <button
            onClick={() => setView('dashboard')}
            className={`flex flex-col items-center gap-0.5 transition-all duration-300 ${view === 'dashboard' ? 'text-orange-500 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Home className={`w-5 h-5 ${view === 'dashboard' ? 'fill-orange-50' : ''}`} />
            <span className="text-[8px] font-black uppercase tracking-widest">Inicio</span>
          </button>
          <button
            onClick={() => {
              setView('calendar');
              setIsShowingCalendarCTA(true);
            }}
            className={`flex flex-col items-center gap-0.5 transition-all duration-300 ${view === 'calendar' ? 'text-orange-500 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <CalendarIcon className={`w-5 h-5 ${view === 'calendar' ? 'fill-orange-50' : ''}`} />
            <span className="text-[8px] font-black uppercase tracking-widest">Plan</span>
          </button>
          <button
            onClick={() => setView('planner')}
            className={`flex flex-col items-center gap-0.5 transition-all duration-300 ${view === 'planner' ? 'text-orange-500 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Utensils className={`w-5 h-5 ${view === 'planner' ? 'fill-orange-50' : ''}`} />
            <span className="text-[8px] font-black uppercase tracking-widest">Recetas</span>
          </button>
          <button
            onClick={() => setView('inventory')}
            className={`flex flex-col items-center gap-0.5 transition-all duration-300 ${view === 'inventory' ? 'text-orange-500 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Package className={`w-5 h-5 ${view === 'inventory' ? 'fill-orange-50' : ''}`} />
            <span className="text-[8px] font-black uppercase tracking-widest">Despensa</span>
          </button>
          <button
            onClick={() => {
              setView('shopping-list');
              setHasShoppingListReady(false);
            }}
            className={`flex flex-col items-center gap-0.5 transition-all duration-300 relative ${view === 'shopping-list' ? 'text-orange-500 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <div className="relative">
              <ListTodo className={`w-5 h-5 ${view === 'shopping-list' ? 'fill-orange-50' : ''}`} />
              {hasShoppingListReady && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
              )}
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest">Lista</span>
          </button>
          <button
            onClick={() => {
              if (user) logout();
              else loginWithGoogle();
            }}
            className="flex flex-col items-center gap-0.5 transition-all duration-300 text-gray-400 hover:text-gray-600"
          >
            {user ? (
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                className="w-5 h-5 rounded-full object-cover border border-orange-200" 
                alt="Profile"
              />
            ) : (
              <UserIcon className="w-5 h-5" />
            )}
            <span className="text-[8px] font-black uppercase tracking-widest">{user ? 'Salir' : 'Entrar'}</span>
          </button>
        </nav>

        {/* Shopping List Ready Banner */}
        <AnimatePresence>
          {showShoppingListBanner && (
            <motion.div
              initial={{ opacity: 0, y: 80, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 80, scale: 0.9 }}
              transition={{ type: 'spring', bounce: 0.4 }}
              className="fixed bottom-28 sm:bottom-36 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50"
            >
              <div className="bg-gray-900 text-white rounded-[28px] p-5 shadow-2xl shadow-black/40 flex items-start gap-4 border border-white/10">
                <div className="w-12 h-12 flex-shrink-0 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/40">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-black text-base leading-tight">¡Tu lista de compras está lista! 🛒</p>
                  <p className="text-gray-400 text-xs font-medium">Confírmala antes de empezar a cocinar</p>
                </div>
                <button
                  onClick={() => {
                    setShowShoppingListBanner(false);
                    setView('shopping-list');
                    setHasShoppingListReady(false);
                  }}
                  className="flex-shrink-0 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-black text-xs transition-all active:scale-95 mt-0.5"
                >
                  Ver
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Plan Confirmation Modal */}
        <AnimatePresence>
          {isDeletePlanModalOpen && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsDeletePlanModalOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl p-8 space-y-6"
              >
                {/* Icon */}
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center border-2 border-red-100">
                    <Trash2 className="w-7 h-7 text-red-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black tracking-tight text-gray-900">¿Eliminar plan?</h3>
                    <p className="text-gray-500 font-medium leading-relaxed max-w-[280px] mx-auto">
                      Esta acción eliminará permanentemente tu plan semanal actual.
                    </p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 w-full">
                    <p className="text-red-600 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                      <span>⚠️</span> Esta acción no se puede revertir
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsDeletePlanModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl font-black text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      setWeeklyPlan(prev => {
                        const empty: WeeklyPlan = {};
                        DAYS.forEach(d => empty[d] = { Desayuno: null, Almuerzo: null, Cena: null });
                        return empty;
                      });
                      setCookedMeals(new Set());
                      setHasFinalizedInitialPlan(false);
                      setIsEditingPlan(false);
                      setIsDeletePlanModalOpen(false);
                      setView('setup');
                      showSnackbar('Plan eliminado correctamente.');
                    }}
                    className="flex-[1.5] py-4 rounded-2xl font-black text-sm text-white bg-red-500 hover:bg-red-600 transition-all active:scale-95 shadow-lg shadow-red-500/25 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Sí, eliminar plan
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Save Plan Modal */}
        <AnimatePresence>
          {isSavingPlanModalOpen && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSavingPlanModalOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg bg-white rounded-[32px] overflow-hidden shadow-2xl p-8 space-y-6"
              >
                <div className="space-y-2">
                  <h2 className="text-2xl font-black tracking-tight">
                    {editingSavedPlan ? 'Editar Plan Guardado' : 'Guardar Plan Actual'}
                  </h2>
                  <p className="text-gray-500 font-medium">
                    {editingSavedPlan ? 'Actualiza el título y la descripción de tu plan.' : 'Dale un nombre a tu plan para usarlo más adelante.'}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Título del Plan</label>
                    <input
                      type="text"
                      placeholder="Ej: Dieta Mediterránea, Semana de Volumen..."
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all font-bold"
                      value={newPlanTitle}
                      onChange={(e) => setNewPlanTitle(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Descripción (Opcional)</label>
                    <textarea
                      placeholder="Breve descripción de este plan..."
                      rows={3}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all font-bold resize-none"
                      value={newPlanDescription}
                      onChange={(e) => setNewPlanDescription(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setIsSavingPlanModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl font-black text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveCurrentPlan}
                    disabled={!newPlanTitle.trim()}
                    className="flex-[2] py-4 rounded-2xl font-black text-sm text-white bg-orange-500 shadow-xl shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingSavedPlan ? 'Guardar Cambios' : 'Confirmar y Guardar'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Recipe Details Modal */}
        <AnimatePresence>
          {selectedRecipeForModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedRecipeForModal(null)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-4xl bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
              >
                <button
                  onClick={() => setSelectedRecipeForModal(null)}
                  className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-md rounded-full text-gray-500 hover:text-orange-500 transition-colors shadow-lg"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="overflow-y-auto no-scrollbar p-6 sm:p-10 space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="relative aspect-video sm:aspect-square rounded-[24px] overflow-hidden shadow-xl">
                        <img
                          src={selectedRecipeForModal.image}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute bottom-4 left-4 flex gap-2">
                          <span className="bg-white/90 backdrop-blur-md text-orange-600 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                            {selectedRecipeForModal.category}
                          </span>
                        </div>
                      </div>

                      <div className="bg-orange-50 rounded-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <Wallet className="w-5 h-5 text-orange-500" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Costo Estimado</p>
                            <p className="text-lg font-black text-orange-600">
                              Q{selectedRecipeForModal.ingredients.reduce((s, i) => s + i.estimatedCost, 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <Clock className="w-5 h-5 text-orange-500" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Tiempo</p>
                            <p className="text-lg font-black text-orange-600">25 min</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                        {selectedRecipeForModal.name}
                      </h2>

                      <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                          <ShoppingCart className="w-4 h-4" />
                          Ingredientes
                        </h3>
                        <div className="grid grid-cols-1 gap-2">
                          {selectedRecipeForModal.ingredients.map((ing, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100/50">
                              <span className="text-sm font-bold text-gray-600">{ing.name}</span>
                              <span className="text-[10px] font-black text-orange-500 bg-orange-50 px-2 py-1 rounded-lg uppercase">
                                {ing.amount} {ing.unit}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                      <ChefHat className="w-4 h-4" />
                      Pasos de Preparación
                    </h3>
                    <div className="space-y-4 h-max overflow-y-auto pr-2 no-scrollbar pr-1">
                      {selectedRecipeForModal.instructions.map((step, idx) => (
                        <div key={idx} className="flex gap-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center text-xs font-black shadow-lg shadow-orange-500/20">
                            {idx + 1}
                          </div>
                          <p className="text-gray-600 font-medium text-sm leading-relaxed pt-1">
                            {step}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setSelectedRecipeForModal(null)}
                      className="flex-1 py-4 rounded-2xl font-black text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all active:scale-95"
                    >
                      Cerrar
                    </button>
                    {view === 'planner' ? (
                      <button
                        onClick={() => {
                          toggleWishlist(selectedRecipeForModal.id);
                          setSelectedRecipeForModal(null);
                        }}
                        className={`flex-[2] py-4 rounded-2xl font-black text-sm text-white shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${wishlist.has(selectedRecipeForModal.id)
                          ? 'bg-green-500 shadow-green-500/20 hover:bg-green-600'
                          : 'bg-orange-500 shadow-orange-500/20 hover:bg-orange-600'
                          }`}
                      >
                        {wishlist.has(selectedRecipeForModal.id) ? (
                          <>
                            Quitar de cocinar próximamente <CheckCircle2 className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            Cocinar próximamente  <Plus className="w-4 h-4" />
                          </>
                        )}

                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (view === 'setup') {
                            handleSelectRecipe(selectedRecipeForModal.id);
                          } else if (selectedSlot) {
                            handleSelectRecipe(selectedRecipeForModal.id);
                          } else {
                            handleSidebarRecipeClick(selectedRecipeForModal);
                          }
                          setSelectedRecipeForModal(null);
                        }}
                        className="flex-[2] py-4 rounded-2xl font-black text-sm text-white bg-orange-500 shadow-xl shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Agregar a mi plan
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Nickname Modal */}
        <AnimatePresence>
          {showNicknameModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md bg-white rounded-[40px] overflow-hidden shadow-2xl p-10 text-center space-y-8"
              >
                <div className="space-y-4">
                  <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner border border-orange-100">
                    👋
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black tracking-tight">¡Bienvenido a Kaneo!</h2>
                    <p className="text-gray-500 font-medium">¿Cómo quieres que te llamemos?</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <input
                    type="text"
                    placeholder="Tu apodo favorito..."
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-3xl py-5 px-8 text-lg text-center focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all font-black placeholder:font-bold placeholder:text-gray-300"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && nickname.trim()) {
                        setShowNicknameModal(false);
                      }
                    }}
                  />

                  <button
                    onClick={() => setShowNicknameModal(false)}
                    disabled={!nickname.trim()}
                    className="w-full bg-orange-500 text-white py-5 rounded-3xl font-black text-sm shadow-xl shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Empezar a cocinar
                  </button>
                  
                  {user && (
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      O usaremos tu nombre de Google: {user.displayName?.split(' ')[0]}
                    </p>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
