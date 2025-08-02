import React from 'react';
import QuoteCreatorSimple from './QuoteCreatorSimple.tsx';

/**
 * Composant principal pour la création de devis structurés
 * Utilise la version simplifiée fonctionnelle qui implémente
 * la hiérarchie Phases → Tâches → Articles avec calculs automatiques
 */
const QuoteCreator: React.FC = () => {
    return <QuoteCreatorSimple />;
};

export default QuoteCreator;
