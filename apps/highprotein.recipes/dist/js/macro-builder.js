/**
 * Breakfast Macro Builder
 * Interactive calculator for finding and scaling breakfast recipes
 */

document.addEventListener('alpine:init', () => {
    Alpine.data('macroBuilder', () => ({
        // User inputs
        proteinTarget: 40,
        calorieLimit: 500,
        maxPrepTime: 30,

        // Dietary filters
        filters: {
            vegan: false,
            vegetarian: false,
            glutenFree: false,
            dairyFree: false,
            eggFree: false,
            lowCarb: false,
            highFiber: false,
            mealPrep: false
        },

        // State
        recipes: [],
        results: [],
        showResults: false,
        sortBy: 'peRatio',

        // Initialize with recipe data
        init() {
            // Recipes loaded from breakfast-data.js
            if (typeof BREAKFAST_RECIPES !== 'undefined') {
                this.recipes = BREAKFAST_RECIPES;
            }
        },

        // Find matching recipes
        findRecipes() {
            let matches = this.recipes.filter(recipe => {
                // Check protein requirement (with scaling)
                const scaleFactor = this.proteinTarget / recipe.protein;
                const scaledCalories = recipe.calories * scaleFactor;

                // Skip if scaled calories exceed limit by more than 20%
                if (scaledCalories > this.calorieLimit * 1.2) return false;

                // Check prep time
                const totalTime = parseInt(recipe.totalTime) || 0;
                if (this.maxPrepTime > 0 && totalTime > this.maxPrepTime) return false;

                // Check dietary filters
                const dietary = recipe.dietary || {};
                if (this.filters.vegan && !dietary.vegan) return false;
                if (this.filters.vegetarian && !dietary.vegetarian) return false;
                if (this.filters.glutenFree && !dietary.glutenFree) return false;
                if (this.filters.dairyFree && !dietary.dairyFree) return false;
                if (this.filters.eggFree && !dietary.eggFree) return false;
                if (this.filters.lowCarb && !dietary.lowCarb) return false;
                if (this.filters.highFiber && !dietary.highFiber) return false;

                // Check meal prep filter
                if (this.filters.mealPrep && (!recipe.mealPrep || !recipe.mealPrep.isMealPrep)) return false;

                return true;
            });

            // Add scaled values to each match
            matches = matches.map(recipe => {
                const scaleFactor = this.proteinTarget / recipe.protein;
                return {
                    ...recipe,
                    scaleFactor: scaleFactor,
                    scaledProtein: Math.round(recipe.protein * scaleFactor),
                    scaledCalories: Math.round(recipe.calories * scaleFactor),
                    scaledCarbs: Math.round(recipe.carbs * scaleFactor),
                    scaledFat: Math.round(recipe.fat * scaleFactor),
                    peRatio: PERatio.calculate(recipe.protein, recipe.calories)
                };
            });

            // Sort results
            this.results = this.sortResults(matches);
            this.showResults = true;
        },

        // Sort results by selected criteria
        sortResults(recipes) {
            return [...recipes].sort((a, b) => {
                switch(this.sortBy) {
                    case 'peRatio':
                        return b.peRatio - a.peRatio;
                    case 'calories':
                        return a.scaledCalories - b.scaledCalories;
                    case 'protein':
                        return b.scaledProtein - a.scaledProtein;
                    case 'time':
                        return (parseInt(a.totalTime) || 0) - (parseInt(b.totalTime) || 0);
                    default:
                        return 0;
                }
            });
        },

        // Get P:E tier badge HTML
        getPEBadge(protein, calories) {
            return PERatio.generateBadge(protein, calories);
        },

        // Get tier class for styling
        getTierClass(peRatio) {
            const tier = PERatio.getTier(peRatio);
            return tier.bgClass + ' ' + tier.textClass;
        },

        // Format scale factor for display
        formatScale(factor) {
            if (factor === 1) return '1x (original)';
            if (factor < 1) return `${(factor * 100).toFixed(0)}%`;
            return `${factor.toFixed(1)}x`;
        },

        // Reset all filters
        resetFilters() {
            this.proteinTarget = 40;
            this.calorieLimit = 500;
            this.maxPrepTime = 30;
            Object.keys(this.filters).forEach(key => {
                this.filters[key] = false;
            });
            this.showResults = false;
            this.results = [];
        },

        // Toggle a dietary filter
        toggleFilter(filter) {
            this.filters[filter] = !this.filters[filter];
        },

        // Get active filter count
        get activeFilterCount() {
            return Object.values(this.filters).filter(v => v).length;
        },

        // Check if any filters are active
        get hasActiveFilters() {
            return this.activeFilterCount > 0;
        }
    }));
});
