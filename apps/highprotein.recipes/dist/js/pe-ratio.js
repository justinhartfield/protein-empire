/**
 * P:E Ratio Calculator and Display
 * Calculates protein per 100 calories (P:E ratio)
 */

const PERatio = {
    // P:E Tiers
    TIERS: {
        ELITE: { min: 15, label: 'ELITE', color: 'emerald', bgClass: 'bg-emerald-100', textClass: 'text-emerald-700', borderClass: 'border-emerald-500' },
        EXCELLENT: { min: 10, label: 'EXCELLENT', color: 'green', bgClass: 'bg-green-100', textClass: 'text-green-700', borderClass: 'border-green-500' },
        GOOD: { min: 5, label: 'GOOD', color: 'yellow', bgClass: 'bg-yellow-100', textClass: 'text-yellow-700', borderClass: 'border-yellow-500' },
        MODERATE: { min: 0, label: 'MODERATE', color: 'orange', bgClass: 'bg-orange-100', textClass: 'text-orange-700', borderClass: 'border-orange-500' }
    },

    /**
     * Calculate P:E ratio (protein per 100 calories)
     * @param {number} protein - Grams of protein
     * @param {number} calories - Total calories
     * @returns {number} P:E ratio
     */
    calculate(protein, calories) {
        if (!calories || calories === 0) return 0;
        return (protein / calories) * 100;
    },

    /**
     * Get tier classification for a P:E ratio
     * @param {number} peRatio - The P:E ratio value
     * @returns {Object} Tier information
     */
    getTier(peRatio) {
        if (peRatio >= 15) return this.TIERS.ELITE;
        if (peRatio >= 10) return this.TIERS.EXCELLENT;
        if (peRatio >= 5) return this.TIERS.GOOD;
        return this.TIERS.MODERATE;
    },

    /**
     * Format P:E ratio for display
     * @param {number} peRatio - The P:E ratio value
     * @returns {string} Formatted string
     */
    format(peRatio) {
        return peRatio.toFixed(1);
    },

    /**
     * Generate HTML badge for P:E ratio
     * @param {number} protein - Grams of protein
     * @param {number} calories - Total calories
     * @returns {string} HTML string
     */
    generateBadge(protein, calories) {
        const peRatio = this.calculate(protein, calories);
        const tier = this.getTier(peRatio);

        return `
            <div class="inline-flex items-center gap-1 px-2 py-1 rounded-full ${tier.bgClass} ${tier.textClass} text-xs font-bold">
                <span>P:E</span>
                <span>${this.format(peRatio)}</span>
                <span class="text-[10px] opacity-75">${tier.label}</span>
            </div>
        `;
    },

    /**
     * Sort recipes by P:E ratio
     * @param {Array} recipes - Array of recipe objects
     * @param {string} order - 'asc' or 'desc'
     * @returns {Array} Sorted recipes
     */
    sortRecipes(recipes, order = 'desc') {
        return [...recipes].sort((a, b) => {
            const peA = this.calculate(a.protein, a.calories);
            const peB = this.calculate(b.protein, b.calories);
            return order === 'desc' ? peB - peA : peA - peB;
        });
    },

    /**
     * Filter recipes by P:E tier
     * @param {Array} recipes - Array of recipe objects
     * @param {string} tierName - 'ELITE', 'EXCELLENT', 'GOOD', or 'MODERATE'
     * @returns {Array} Filtered recipes
     */
    filterByTier(recipes, tierName) {
        const tier = this.TIERS[tierName];
        if (!tier) return recipes;

        const nextTierMin = tierName === 'ELITE' ? Infinity :
                           tierName === 'EXCELLENT' ? 15 :
                           tierName === 'GOOD' ? 10 : 5;

        return recipes.filter(recipe => {
            const pe = this.calculate(recipe.protein, recipe.calories);
            return pe >= tier.min && pe < nextTierMin;
        });
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PERatio;
}
