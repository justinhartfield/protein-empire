/**
 * Recipe Substitution Engine for the Protein Empire
 * 
 * This module provides the interactive ingredient substitution functionality
 * that allows users to swap ingredients while automatically recalculating
 * hydration adjustments and nutrition information.
 * 
 * Used with Alpine.js on the frontend.
 */

import { INGREDIENTS, SUBSTITUTION_GROUPS } from './ingredients-data.js';

/**
 * Create a recipe substitution controller
 * @param {Object} config - Configuration object
 * @param {string} config.recipeId - Unique recipe identifier
 * @param {number} config.yield - Number of servings the recipe makes
 * @param {number} config.servingSize - Size of each serving in grams
 * @param {Array} config.ingredients - Array of ingredient objects
 * @returns {Object} Alpine.js compatible data object
 */
export function createRecipeSubstitution(config) {
  return {
    recipeId: config.recipeId || 'unknown',
    yield: config.yield || 12,
    servingSize: config.servingSize || 75,
    originalIngredients: config.ingredients || [],
    currentIngredients: [],
    expandedIngredient: null,
    unitSystem: 'metric',
    hydrationAdjustments: [],
    nutritionDeltas: [],
    batchNutritionDeltas: [],

    init() {
      // Deep clone original ingredients
      this.currentIngredients = JSON.parse(JSON.stringify(this.originalIngredients));
      this.currentIngredients.forEach(ing => {
        ing.originalId = ing.id;
        ing.isSwapped = false;
        ing.originalAmount = ing.amount;
      });
      this.recalculate();
    },

    getIngredient(id) {
      return INGREDIENTS[id] || null;
    },

    getDisplayName(id) {
      const ing = this.getIngredient(id);
      return ing ? ing.name : id;
    },

    getSubstitutes(id) {
      const ing = this.getIngredient(id);
      if (!ing || ing.isFixed) return [];
      
      return (ing.substitutes || [])
        .map(subId => {
          const sub = this.getIngredient(subId);
          if (!sub) return null;
          return {
            id: subId,
            name: sub.name,
            swapNote: sub.swapNote || null,
            isSpecialSwap: sub.isSpecialSwap || false
          };
        })
        .filter(Boolean);
    },

    canSubstitute(id) {
      const ing = this.getIngredient(id);
      return ing && !ing.isFixed && (ing.substitutes || []).length > 0;
    },

    toggleIngredient(id) {
      if (this.expandedIngredient === id) {
        this.expandedIngredient = null;
      } else {
        const ing = this.currentIngredients.find(i => i.id === id || i.originalId === id);
        if (ing && this.canSubstitute(ing.originalId)) {
          this.expandedIngredient = id;
        }
      }
    },

    selectSubstitute(originalId, newId) {
      const index = this.currentIngredients.findIndex(i => i.originalId === originalId);
      if (index === -1) return;

      const current = this.currentIngredients[index];
      const originalIng = this.getIngredient(originalId);
      const newIng = this.getIngredient(newId);

      if (!originalIng || !newIng) return;

      // Calculate new amount based on ratio
      let newAmount = current.originalAmount;
      if (newIng.amountRatio) {
        newAmount = Math.round(current.originalAmount * newIng.amountRatio);
      }

      this.currentIngredients[index] = {
        ...current,
        id: newId,
        amount: newAmount,
        isSwapped: newId !== originalId,
        previousId: current.id
      };

      this.expandedIngredient = null;
      this.recalculate();
    },

    revertIngredient(originalId) {
      const index = this.currentIngredients.findIndex(i => i.originalId === originalId);
      if (index === -1) return;

      const current = this.currentIngredients[index];
      this.currentIngredients[index] = {
        ...current,
        id: current.originalId,
        amount: current.originalAmount,
        isSwapped: false
      };

      this.recalculate();
    },

    resetAll() {
      this.currentIngredients.forEach((ing, index) => {
        this.currentIngredients[index] = {
          ...ing,
          id: ing.originalId,
          amount: ing.originalAmount,
          isSwapped: false
        };
      });
      this.expandedIngredient = null;
      this.recalculate();
    },

    recalculate() {
      this.calculateHydration();
      this.calculateNutrition();
    },

    calculateHydration() {
      this.hydrationAdjustments = [];

      this.currentIngredients.forEach(ing => {
        if (!ing.isSwapped) return;

        const originalIng = this.getIngredient(ing.originalId);
        const newIng = this.getIngredient(ing.id);

        if (!originalIng || !newIng) return;
        if (originalIng.category !== 'dry') return;

        const hydrationDiff = newIng.hydrationFactor - originalIng.hydrationFactor;
        const effectiveAmount = newIng.amountRatio 
          ? ing.originalAmount * newIng.amountRatio 
          : ing.originalAmount;
        const adjustmentMl = Math.round(hydrationDiff * effectiveAmount);

        if (adjustmentMl !== 0) {
          this.hydrationAdjustments.push({
            ingredientName: newIng.name,
            originalName: originalIng.name,
            adjustmentMl,
            message: adjustmentMl > 0 ? `+${adjustmentMl}ml liquid` : `${adjustmentMl}ml liquid`
          });
        }
      });
    },

    getTotalHydrationAdjustment() {
      return this.hydrationAdjustments.reduce((sum, adj) => sum + adj.adjustmentMl, 0);
    },

    checkHasHydrationAdjustment() {
      return this.hydrationAdjustments.length > 0;
    },

    calculateNutrition() {
      this.nutritionDeltas = [];
      this.batchNutritionDeltas = [];

      let totalCalDelta = 0;
      let totalProteinDelta = 0;
      let totalFatDelta = 0;
      let totalCarbsDelta = 0;

      this.currentIngredients.forEach(ing => {
        if (!ing.isSwapped) return;

        const originalIng = this.getIngredient(ing.originalId);
        const newIng = this.getIngredient(ing.id);

        if (!originalIng || !newIng) return;

        const originalAmount = ing.originalAmount;
        const newAmount = ing.amount;

        const calcDelta = (macro) => {
          const originalValue = (originalIng.macrosPer100g[macro] / 100) * originalAmount;
          const newValue = (newIng.macrosPer100g[macro] / 100) * newAmount;
          return newValue - originalValue;
        };

        totalCalDelta += calcDelta('calories');
        totalProteinDelta += calcDelta('protein');
        totalFatDelta += calcDelta('fat');
        totalCarbsDelta += calcDelta('carbs');
      });

      const servings = this.yield;

      // Batch-level deltas
      if (Math.abs(totalCalDelta) >= 5) {
        this.batchNutritionDeltas.push({
          name: 'Calories',
          delta: Math.round(totalCalDelta),
          formatted: this.formatDelta(Math.round(totalCalDelta), '')
        });
      }
      if (Math.abs(totalProteinDelta) >= 1) {
        this.batchNutritionDeltas.push({
          name: 'Protein',
          delta: Math.round(totalProteinDelta),
          formatted: this.formatDelta(Math.round(totalProteinDelta), 'g')
        });
      }
      if (Math.abs(totalFatDelta) >= 1) {
        this.batchNutritionDeltas.push({
          name: 'Fat',
          delta: Math.round(totalFatDelta),
          formatted: this.formatDelta(Math.round(totalFatDelta), 'g')
        });
      }
      if (Math.abs(totalCarbsDelta) >= 1) {
        this.batchNutritionDeltas.push({
          name: 'Carbs',
          delta: Math.round(totalCarbsDelta),
          formatted: this.formatDelta(Math.round(totalCarbsDelta), 'g')
        });
      }

      // Per-serving deltas
      if (Math.abs(totalCalDelta / servings) >= 1) {
        this.nutritionDeltas.push({
          name: 'Calories',
          delta: Math.round(totalCalDelta / servings),
          formatted: this.formatDelta(Math.round(totalCalDelta / servings), '')
        });
      }
      if (Math.abs(totalProteinDelta / servings) >= 0.5) {
        this.nutritionDeltas.push({
          name: 'Protein',
          delta: Math.round(totalProteinDelta / servings),
          formatted: this.formatDelta(Math.round(totalProteinDelta / servings), 'g')
        });
      }
      if (Math.abs(totalFatDelta / servings) >= 0.5) {
        this.nutritionDeltas.push({
          name: 'Fat',
          delta: Math.round(totalFatDelta / servings),
          formatted: this.formatDelta(Math.round(totalFatDelta / servings), 'g')
        });
      }
      if (Math.abs(totalCarbsDelta / servings) >= 1) {
        this.nutritionDeltas.push({
          name: 'Carbs',
          delta: Math.round(totalCarbsDelta / servings),
          formatted: this.formatDelta(Math.round(totalCarbsDelta / servings), 'g')
        });
      }
    },

    formatDelta(value, unit) {
      if (value > 0) return `+${value}${unit}`;
      if (value < 0) return `${value}${unit}`;
      return `0${unit}`;
    },

    checkHasSubstitutions() {
      return this.currentIngredients.some(ing => ing.isSwapped);
    },

    getSubstitutionCount() {
      return this.currentIngredients.filter(ing => ing.isSwapped).length;
    },

    getFormattedAmount(ing) {
      if (this.unitSystem === 'metric') {
        return `${ing.amount}g`;
      }
      return ing.usUnit || `${ing.amount}g`;
    },

    isExpanded(id) {
      return this.expandedIngredient === id;
    },

    getIngredientClasses(ing) {
      let classes = 'ingredient-item flex flex-col py-3 transition-all duration-200';
      if (ing.isSwapped) {
        classes += ' bg-brand-50 rounded-xl px-3 -mx-3';
      }
      if (this.canSubstitute(ing.originalId)) {
        classes += ' cursor-pointer hover:bg-slate-50';
      }
      return classes;
    }
  };
}

// Browser-compatible export
if (typeof window !== 'undefined') {
  window.INGREDIENTS = INGREDIENTS;
  window.SUBSTITUTION_GROUPS = SUBSTITUTION_GROUPS;
  window.createRecipeSubstitution = createRecipeSubstitution;
}

export default { createRecipeSubstitution, INGREDIENTS, SUBSTITUTION_GROUPS };
