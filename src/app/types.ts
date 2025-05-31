export interface BodyMeasurement {
  id: string;
  date: string;
  weight: number;
  bodyFat?: number;
  notes?: string;
  age: number;
  height: number;
  gender: "male" | "female";
  bmr?: number;
}

export interface Meal {
  id: string;
  date: string;
  type: "breakfast" | "lunch" | "dinner" | "snack";
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface DailyNutrition {
  id: string;
  date: string;
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  waterIntake: number;
}

export interface HealthGoals {
  id: string;
  currentWeight?: number;
  targetWeight?: number;
  targetBodyFat?: number;
  dailyCalories?: number;
  dailyProtein?: number;
  dailyCarbs?: number;
  dailyFat?: number;
  dailyWaterIntake?: number;
  notes?: string;
}

export interface WeeklySummary {
  startDate: string;
  endDate: string;
  averageWeight?: number;
  averageBodyFat?: number;
  totalWorkouts: number;
  averageCalories: number;
  averageProtein: number;
  averageCarbs: number;
  averageFat: number;
  averageWaterIntake: number;
  goalProgress: {
    weight?: number;
    bodyFat?: number;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    waterIntake?: number;
  };
}

export interface MonthlySummary extends Omit<WeeklySummary, 'startDate' | 'endDate'> {
  month: number;
  year: number;
  weeklyProgress: WeeklySummary[];
} 