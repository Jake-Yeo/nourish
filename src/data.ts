import type { Food, Goals } from './types'

const food = (item: Food) => item

export const starterFoods: Food[] = [
  food({ id: 'egg', name: 'Large egg', servingLabel: '1 large egg', servingGrams: 50, source: 'starter', nutrients: { calories: 72, protein: 6.3, carbs: 0.4, fat: 4.8, fiber: 0, sugar: 0.2, sodium: 71, saturatedFat: 1.6, cholesterol: 186, potassium: 69, calcium: 28, iron: 0.9 } }),
  food({ id: 'greek-yogurt', name: 'Greek yogurt, plain 2%', servingLabel: '¾ cup (170 g)', servingGrams: 170, source: 'starter', nutrients: { calories: 130, protein: 17, carbs: 7, fat: 4, fiber: 0, sugar: 5, sodium: 65, saturatedFat: 2.5, cholesterol: 15, potassium: 220, calcium: 190, iron: 0.1 } }),
  food({ id: 'oats', name: 'Rolled oats', servingLabel: '½ cup dry (40 g)', servingGrams: 40, source: 'starter', nutrients: { calories: 152, protein: 5.1, carbs: 27, fat: 2.8, fiber: 4.1, sugar: 0.4, sodium: 2, saturatedFat: 0.5, cholesterol: 0, potassium: 143, calcium: 21, iron: 1.7 } }),
  food({ id: 'banana', name: 'Banana', servingLabel: '1 medium', servingGrams: 118, source: 'starter', nutrients: { calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1, sugar: 14.4, sodium: 1, saturatedFat: 0.1, cholesterol: 0, potassium: 422, calcium: 6, iron: 0.3 } }),
  food({ id: 'chicken', name: 'Chicken breast, grilled', servingLabel: '4 oz (113 g)', servingGrams: 113, source: 'starter', nutrients: { calories: 187, protein: 35, carbs: 0, fat: 4, fiber: 0, sugar: 0, sodium: 84, saturatedFat: 1.1, cholesterol: 96, potassium: 290, calcium: 17, iron: 1.2 } }),
  food({ id: 'rice', name: 'Jasmine rice, cooked', servingLabel: '1 cup (158 g)', servingGrams: 158, source: 'starter', nutrients: { calories: 205, protein: 4.3, carbs: 44.5, fat: 0.4, fiber: 0.6, sugar: 0.1, sodium: 2, saturatedFat: 0.1, cholesterol: 0, potassium: 55, calcium: 16, iron: 1.9 } }),
  food({ id: 'salmon', name: 'Atlantic salmon, baked', servingLabel: '4 oz (113 g)', servingGrams: 113, source: 'starter', nutrients: { calories: 233, protein: 25, carbs: 0, fat: 14, fiber: 0, sugar: 0, sodium: 67, saturatedFat: 3.1, cholesterol: 71, potassium: 414, calcium: 14, iron: 0.5 } }),
  food({ id: 'avocado', name: 'Avocado', servingLabel: '½ medium (75 g)', servingGrams: 75, source: 'starter', nutrients: { calories: 120, protein: 1.5, carbs: 6.4, fat: 11, fiber: 5, sugar: 0.5, sodium: 5, saturatedFat: 1.6, cholesterol: 0, potassium: 364, calcium: 9, iron: 0.4 } }),
  food({ id: 'broccoli', name: 'Broccoli, steamed', servingLabel: '1 cup (156 g)', servingGrams: 156, source: 'starter', nutrients: { calories: 55, protein: 3.7, carbs: 11.2, fat: 0.6, fiber: 5.1, sugar: 2.2, sodium: 64, saturatedFat: 0.1, cholesterol: 0, potassium: 457, calcium: 62, iron: 1 } }),
  food({ id: 'apple', name: 'Apple', servingLabel: '1 medium', servingGrams: 182, source: 'starter', nutrients: { calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4, sugar: 19, sodium: 2, saturatedFat: 0.1, cholesterol: 0, potassium: 195, calcium: 11, iron: 0.2 } }),
  food({ id: 'almonds', name: 'Almonds', servingLabel: '1 oz (28 g)', servingGrams: 28, source: 'starter', nutrients: { calories: 164, protein: 6, carbs: 6.1, fat: 14.2, fiber: 3.5, sugar: 1.2, sodium: 0, saturatedFat: 1.1, cholesterol: 0, potassium: 208, calcium: 76, iron: 1.1 } }),
  food({ id: 'protein-shake', name: 'Whey protein shake', servingLabel: '1 scoop with water', servingGrams: 32, source: 'starter', nutrients: { calories: 130, protein: 25, carbs: 3, fat: 2, fiber: 0, sugar: 1, sodium: 130, saturatedFat: 1, cholesterol: 45, potassium: 160, calcium: 130, iron: 0.5 } }),
]

export const defaultGoals: Goals = {
  calories: 2200,
  protein: 150,
  carbs: 250,
  fat: 73,
  fiber: 30,
  sugar: 50,
  sodium: 2300,
  saturatedFat: 20,
  cholesterol: 300,
  potassium: 3400,
  calcium: 1000,
  iron: 18,
  water: 8,
}
