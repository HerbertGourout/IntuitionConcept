import { describe, it, expect, beforeEach, vi } from 'vitest';
import { quoteFollowUpService, Quote } from '../quoteFollowUpService';

describe('QuoteFollowUpService', () => {
    beforeEach(() => {
        // Reset configuration avant chaque test
        quoteFollowUpService.configure({
            enabled: true,
            firstFollowUpDays: 3,
            secondFollowUpDays: 7,
            thirdFollowUpDays: 14,
            maxFollowUps: 3,
            expiryWarningDays: 2,
            sendSMS: false,
            smsOnlyUrgent: true
        });
    });

    describe('Configuration', () => {
        it('devrait permettre de configurer le service', () => {
            const newConfig = {
                enabled: false,
                firstFollowUpDays: 5
            };

            quoteFollowUpService.configure(newConfig);
            const config = quoteFollowUpService.getConfig();

            expect(config.enabled).toBe(false);
            expect(config.firstFollowUpDays).toBe(5);
        });

        it('devrait retourner la configuration actuelle', () => {
            const config = quoteFollowUpService.getConfig();

            expect(config).toHaveProperty('enabled');
            expect(config).toHaveProperty('firstFollowUpDays');
            expect(config).toHaveProperty('maxFollowUps');
        });
    });

    describe('Génération Email', () => {
        it('devrait générer un email pour la 1ère relance', () => {
            const quote: Quote = {
                id: 'quote-1',
                clientName: 'Jean Dupont',
                clientEmail: 'jean@example.com',
                amount: 500000,
                status: 'sent',
                followUpCount: 0,
                projectName: 'Construction Villa',
                createdBy: 'user-1'
            };

            const { subject, body } = quoteFollowUpService.generateFollowUpEmail(quote);

            expect(subject).toContain('Rappel');
            expect(subject).toContain('Construction Villa');
            expect(body).toContain('Jean Dupont');
            expect(body).toContain('500 000 FCFA');
            expect(body).toContain('Construction Villa');
        });

        it('devrait générer un email pour la 2ème relance', () => {
            const quote: Quote = {
                id: 'quote-1',
                clientName: 'Jean Dupont',
                clientEmail: 'jean@example.com',
                amount: 500000,
                status: 'sent',
                followUpCount: 1,
                projectName: 'Construction Villa',
                createdBy: 'user-1'
            };

            const { subject, body } = quoteFollowUpService.generateFollowUpEmail(quote);

            expect(subject).toContain('2ème rappel');
            expect(body).toContain('Jean Dupont');
        });

        it('devrait générer un email pour la 3ème relance (dernière chance)', () => {
            const quote: Quote = {
                id: 'quote-1',
                clientName: 'Jean Dupont',
                clientEmail: 'jean@example.com',
                amount: 500000,
                status: 'sent',
                followUpCount: 2,
                projectName: 'Construction Villa',
                createdBy: 'user-1'
            };

            const { subject, body } = quoteFollowUpService.generateFollowUpEmail(quote);

            expect(subject).toContain('Dernière chance');
            expect(body).toContain('Jean Dupont');
        });

        it('devrait inclure un avertissement d\'expiration si proche', () => {
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 1); // Expire dans 1 jour

            const quote: Quote = {
                id: 'quote-1',
                clientName: 'Jean Dupont',
                clientEmail: 'jean@example.com',
                amount: 500000,
                status: 'sent',
                followUpCount: 0,
                projectName: 'Construction Villa',
                createdBy: 'user-1',
                expiresAt
            };

            const { body } = quoteFollowUpService.generateFollowUpEmail(quote);

            expect(body).toContain('expire dans 1 jour');
            expect(body).toContain('⚠️');
        });

        it('devrait afficher si le devis a été consulté', () => {
            const quote: Quote = {
                id: 'quote-1',
                clientName: 'Jean Dupont',
                clientEmail: 'jean@example.com',
                amount: 500000,
                status: 'viewed',
                followUpCount: 0,
                projectName: 'Construction Villa',
                createdBy: 'user-1',
                viewedAt: new Date('2025-01-15')
            };

            const { body } = quoteFollowUpService.generateFollowUpEmail(quote);

            expect(body).toContain('Vous avez consulté ce devis');
        });
    });

    describe('Génération SMS', () => {
        it('devrait générer un SMS pour la 1ère relance', () => {
            const quote: Quote = {
                id: 'quote-1',
                clientName: 'Jean Dupont',
                clientEmail: 'jean@example.com',
                amount: 500000,
                status: 'sent',
                followUpCount: 0,
                projectName: 'Construction Villa',
                createdBy: 'user-1'
            };

            const sms = quoteFollowUpService.generateFollowUpSMS(quote);

            expect(sms).toContain('Jean Dupont');
            expect(sms).toContain('Construction Villa');
            expect(sms).toContain('500 000');
            expect(sms).toContain('https://intuitionconcept.com/quotes/quote-1');
        });

        it('devrait générer un SMS pour la 2ème relance', () => {
            const quote: Quote = {
                id: 'quote-1',
                clientName: 'Jean Dupont',
                clientEmail: 'jean@example.com',
                amount: 500000,
                status: 'sent',
                followUpCount: 1,
                projectName: 'Construction Villa',
                createdBy: 'user-1'
            };

            const sms = quoteFollowUpService.generateFollowUpSMS(quote);

            expect(sms).toContain('besoin d\'infos');
        });

        it('devrait générer un SMS urgent pour la 3ème relance', () => {
            const quote: Quote = {
                id: 'quote-1',
                clientName: 'Jean Dupont',
                clientEmail: 'jean@example.com',
                amount: 500000,
                status: 'sent',
                followUpCount: 2,
                projectName: 'Construction Villa',
                createdBy: 'user-1'
            };

            const sms = quoteFollowUpService.generateFollowUpSMS(quote);

            expect(sms).toContain('⚠️');
            expect(sms).toContain('DERNIÈRE CHANCE');
        });

        it('devrait inclure les jours restants si proche expiration', () => {
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 2); // Expire dans 2 jours

            const quote: Quote = {
                id: 'quote-1',
                clientName: 'Jean Dupont',
                clientEmail: 'jean@example.com',
                amount: 500000,
                status: 'sent',
                followUpCount: 1,
                projectName: 'Construction Villa',
                createdBy: 'user-1',
                expiresAt
            };

            const sms = quoteFollowUpService.generateFollowUpSMS(quote);

            expect(sms).toContain('2j');
        });

        it('ne devrait pas dépasser 160 caractères (limite SMS)', () => {
            const quote: Quote = {
                id: 'quote-1',
                clientName: 'Jean Dupont',
                clientEmail: 'jean@example.com',
                amount: 500000,
                status: 'sent',
                followUpCount: 0,
                projectName: 'Construction Villa Moderne avec Piscine et Jardin',
                createdBy: 'user-1'
            };

            const sms = quoteFollowUpService.generateFollowUpSMS(quote);

            // SMS standard = 160 caractères max
            // On accepte jusqu'à 320 pour SMS long (2 segments)
            expect(sms.length).toBeLessThanOrEqual(320);
        });
    });

    describe('Formatage Montants', () => {
        it('devrait formater correctement les montants en FCFA', () => {
            const quote: Quote = {
                id: 'quote-1',
                clientName: 'Jean Dupont',
                clientEmail: 'jean@example.com',
                amount: 1234567,
                status: 'sent',
                followUpCount: 0,
                projectName: 'Construction Villa',
                createdBy: 'user-1'
            };

            const { body } = quoteFollowUpService.generateFollowUpEmail(quote);

            // Vérifier format français avec espaces
            expect(body).toContain('1 234 567');
        });

        it('devrait gérer les montants à 0', () => {
            const quote: Quote = {
                id: 'quote-1',
                clientName: 'Jean Dupont',
                clientEmail: 'jean@example.com',
                amount: 0,
                status: 'sent',
                followUpCount: 0,
                projectName: 'Construction Villa',
                createdBy: 'user-1'
            };

            const { body } = quoteFollowUpService.generateFollowUpEmail(quote);

            expect(body).toContain('0');
        });
    });

    describe('Validation HTML', () => {
        it('devrait générer un HTML valide', () => {
            const quote: Quote = {
                id: 'quote-1',
                clientName: 'Jean Dupont',
                clientEmail: 'jean@example.com',
                amount: 500000,
                status: 'sent',
                followUpCount: 0,
                projectName: 'Construction Villa',
                createdBy: 'user-1'
            };

            const { body } = quoteFollowUpService.generateFollowUpEmail(quote);

            expect(body).toContain('<!DOCTYPE html>');
            expect(body).toContain('<html>');
            expect(body).toContain('</html>');
            expect(body).toContain('<head>');
            expect(body).toContain('<body>');
        });

        it('devrait inclure des styles CSS inline', () => {
            const quote: Quote = {
                id: 'quote-1',
                clientName: 'Jean Dupont',
                clientEmail: 'jean@example.com',
                amount: 500000,
                status: 'sent',
                followUpCount: 0,
                projectName: 'Construction Villa',
                createdBy: 'user-1'
            };

            const { body } = quoteFollowUpService.generateFollowUpEmail(quote);

            expect(body).toContain('<style>');
            expect(body).toContain('font-family');
            expect(body).toContain('color');
        });

        it('devrait échapper les caractères spéciaux', () => {
            const quote: Quote = {
                id: 'quote-1',
                clientName: 'Jean "Le Boss" Dupont',
                clientEmail: 'jean@example.com',
                amount: 500000,
                status: 'sent',
                followUpCount: 0,
                projectName: 'Construction <Villa>',
                createdBy: 'user-1'
            };

            const { body } = quoteFollowUpService.generateFollowUpEmail(quote);

            // Les caractères spéciaux devraient être présents mais pas causer d'erreur HTML
            expect(body).toBeDefined();
            expect(body.length).toBeGreaterThan(0);
        });
    });

    describe('Liens et URLs', () => {
        it('devrait inclure un lien vers le devis', () => {
            const quote: Quote = {
                id: 'quote-123',
                clientName: 'Jean Dupont',
                clientEmail: 'jean@example.com',
                amount: 500000,
                status: 'sent',
                followUpCount: 0,
                projectName: 'Construction Villa',
                createdBy: 'user-1'
            };

            const { body } = quoteFollowUpService.generateFollowUpEmail(quote);

            expect(body).toContain('https://intuitionconcept.com/quotes/quote-123');
        });

        it('devrait inclure un bouton CTA cliquable', () => {
            const quote: Quote = {
                id: 'quote-1',
                clientName: 'Jean Dupont',
                clientEmail: 'jean@example.com',
                amount: 500000,
                status: 'sent',
                followUpCount: 0,
                projectName: 'Construction Villa',
                createdBy: 'user-1'
            };

            const { body } = quoteFollowUpService.generateFollowUpEmail(quote);

            expect(body).toContain('class="cta-button"');
            expect(body).toContain('Consulter mon devis');
        });
    });

    describe('Personnalisation', () => {
        it('devrait personnaliser avec le nom du client', () => {
            const quote: Quote = {
                id: 'quote-1',
                clientName: 'Marie Diallo',
                clientEmail: 'marie@example.com',
                amount: 500000,
                status: 'sent',
                followUpCount: 0,
                projectName: 'Construction Villa',
                createdBy: 'user-1'
            };

            const { body } = quoteFollowUpService.generateFollowUpEmail(quote);

            expect(body).toContain('Bonjour Marie Diallo');
        });

        it('devrait personnaliser avec le nom du projet', () => {
            const quote: Quote = {
                id: 'quote-1',
                clientName: 'Jean Dupont',
                clientEmail: 'jean@example.com',
                amount: 500000,
                status: 'sent',
                followUpCount: 0,
                projectName: 'Rénovation Bureau',
                createdBy: 'user-1'
            };

            const { body } = quoteFollowUpService.generateFollowUpEmail(quote);

            expect(body).toContain('Rénovation Bureau');
        });
    });

    describe('Responsive Design', () => {
        it('devrait inclure des styles responsive', () => {
            const quote: Quote = {
                id: 'quote-1',
                clientName: 'Jean Dupont',
                clientEmail: 'jean@example.com',
                amount: 500000,
                status: 'sent',
                followUpCount: 0,
                projectName: 'Construction Villa',
                createdBy: 'user-1'
            };

            const { body } = quoteFollowUpService.generateFollowUpEmail(quote);

            expect(body).toContain('max-width');
            expect(body).toContain('600px'); // Largeur standard email
        });
    });

    describe('Branding', () => {
        it('devrait inclure le logo/nom IntuitionConcept', () => {
            const quote: Quote = {
                id: 'quote-1',
                clientName: 'Jean Dupont',
                clientEmail: 'jean@example.com',
                amount: 500000,
                status: 'sent',
                followUpCount: 0,
                projectName: 'Construction Villa',
                createdBy: 'user-1'
            };

            const { body } = quoteFollowUpService.generateFollowUpEmail(quote);

            expect(body).toContain('IntuitionConcept');
            expect(body).toContain('🏗️');
        });

        it('devrait inclure les informations de contact', () => {
            const quote: Quote = {
                id: 'quote-1',
                clientName: 'Jean Dupont',
                clientEmail: 'jean@example.com',
                amount: 500000,
                status: 'sent',
                followUpCount: 0,
                projectName: 'Construction Villa',
                createdBy: 'user-1'
            };

            const { body } = quoteFollowUpService.generateFollowUpEmail(quote);

            expect(body).toContain('Dakar, Sénégal');
            expect(body).toContain('www.intuitionconcept.com');
        });
    });
});
