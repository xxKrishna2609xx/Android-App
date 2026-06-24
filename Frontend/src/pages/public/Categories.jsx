import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  UtensilsCrossed,
  Hotel,
  Sparkles,
  Home,
  Heart,
  GraduationCap,
  Key,
  Activity,
  HardHat,
  Dog,
  BedDouble,
  Smile,
  Dumbbell,
  Coins,
  PartyPopper,
  Car,
  Truck,
  Send,
  Grid,
  ShoppingBag,
  Apple,
  Milk,
  Pill,
  Droplet,
  WashingMachine,
  Plane,
  Train,
  Bus,
} from "lucide-react";
import { getCategories, getSubcategories} from "../../services/api";

const iconMap = {
  UtensilsCrossed, Hotel, Sparkles, Home, Heart, GraduationCap, Key,
  Activity, HardHat, Dog, BedDouble, Building2, Smile, Dumbbell, Coins,
  PartyPopper, Car, Truck, Send, Grid,
  ShoppingBag, Apple, Milk, Pill, Droplet, WashingMachine, Plane, Train, Bus
};
const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then((data) => {
        setCategories(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));

      getSubcategories() .then ((data)=> {
        setSubcategories(data);
      })
  }, []);



  // Professional Layout Skeleton with matching margin layouts
  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl my-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-slate-100 rounded-2xl p-4 border border-slate-200/60 animate-pulse flex items-center gap-4">
              <div className="w-11 h-11 bg-slate-200 rounded-xl shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-3.5 w-24 bg-slate-200 rounded" />
                <div className="h-2.5 w-12 bg-slate-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    /* mx-auto max-w-7xl px-* centers your grid perfectly with symmetric margins */
    <div className="mx-auto max-w-7xl my-10 px-4 sm:px-6 lg:px-8 bg-slate-50">
    <div className="mb-2 flex items-center justify-between ">
      <h2 className="text-xl font-bold text-black-100">
        Categories ({categories.length})
      </h2>
    </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {categories.map((cat, index) => {
          const Icon = iconMap[cat.icon] || Building2;

          return (
            <Link
              key={cat._id}
              to={`/category/${cat.slug}`}
              style={{ 
                animationDelay: `${index * 40}ms`,
                animationFillMode: 'both' 
              }}
              /* animate-fadeIn executes a clean, staggered initial mount appearance */
              className="group relative flex items-center gap-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-blue-200/80 p-4 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-[0.98] hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 animate-in fade-in slide-in-from-bottom-3"
            >
              {/* Left Side: Professional Icon Container */}
              <div className="w-11 h-11 rounded-xl bg-white border border-blue-200 flex items-center justify-center shrink-0 text-slate-600 group-hover:bg-blue-50 group-hover:border-blue-200 group-hover:text-blue-600 shadow-sm transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
                <Icon 
                  size={20} 
                  strokeWidth={2} 
                  className="transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              {/* Middle: Text Layout */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-slate-800 tracking-tight truncate group-hover:text-blue-600 transition-colors duration-200">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5 group-hover:text-slate-500 transition-colors">
                  View Directory
                </p>
              </div>

              {/* Right Side: Micro chevron indicator */}
              <div className="text-slate-300 group-hover:text-blue-500 transform group-hover:translate-x-0.5 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shrink-0">
                <ArrowRight size={14} strokeWidth={2.5} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Categories;