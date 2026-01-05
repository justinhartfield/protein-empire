/**
 * Build script to generate the browser bundle from source files
 */
const fs = require('fs');
const path = require('path');

// Read source files
const ingredientsData = fs.readFileSync(path.join(__dirname, 'ingredients-data.js'), 'utf8');
const recipeSubstitution = fs.readFileSync(path.join(__dirname, 'recipe-substitution.js'), 'utf8');

// Extract INGREDIENTS object
const ingredientsMatch = ingredientsData.match(/export const INGREDIENTS = ({[\s\S]*?});/);
const ingredients = ingredientsMatch ? ingredientsMatch[1] : '{}';

// Extract SUBSTITUTION_GROUPS object
const groupsMatch = ingredientsData.match(/export const SUBSTITUTION_GROUPS = ({[\s\S]*?});/);
const groups = groupsMatch ? groupsMatch[1] : '{}';

// Extract createRecipeSubstitution function body
const funcMatch = recipeSubstitution.match(/export function createRecipeSubstitution\(config\) \{([\s\S]*?)\n\}/);
const funcBody = funcMatch ? funcMatch[1] : '';

// Create minified version
const bundle = `/**
 * Browser Bundle for the Protein Empire Ingredients System
 * 
 * This file is designed to be included directly in HTML pages via a <script> tag.
 * It exposes INGREDIENTS, SUBSTITUTION_GROUPS, and recipeSubstitution on the window object.
 */

const INGREDIENTS=${JSON.stringify(eval('(' + ingredients + ')'))};

const SUBSTITUTION_GROUPS=${JSON.stringify(eval('(' + groups + ')'))};

function recipeSubstitution(config) {${funcBody}
}

// Export to window for browser usage
if(typeof window!=="undefined"){window.INGREDIENTS=INGREDIENTS;window.SUBSTITUTION_GROUPS=SUBSTITUTION_GROUPS;window.recipeSubstitution=recipeSubstitution}
`;

fs.writeFileSync(path.join(__dirname, 'browser-bundle.js'), bundle);
console.log('Browser bundle generated successfully!');
