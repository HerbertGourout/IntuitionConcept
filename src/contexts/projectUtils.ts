// Place ici tes fonctions utilitaires liées aux projets si besoin
// Exemple : export function calculateProjectProgress(...) { ... }

import type { ProjectTask } from './projectTypes';

export function sumTaskBudgets(tasks: ProjectTask[] = []): number {
  // ProjectTask n'a pas de champ budget, donc cette fonction retourne 0
  return (tasks || []).length;
}
