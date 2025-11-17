import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import emailjs from '@emailjs/browser';

export class StructuralNotificationService {
  /**
   * Envoie une notification email quand l'étude est complétée
   */
  static async notifyStudyCompleted(
    quoteId: string,
    clientEmail: string,
    clientName: string,
    quoteTitle: string
  ): Promise<void> {
    try {
      const templateParams = {
        to_email: clientEmail,
        to_name: clientName,
        quote_title: quoteTitle,
        quote_id: quoteId,
        message: `L'étude structurale pour votre projet "${quoteTitle}" est maintenant complétée. Un devis définitif est disponible.`
      };

      // Configuration EmailJS (à adapter selon vos paramètres)
      await emailjs.send(
        'YOUR_SERVICE_ID',
        'study_completed_template',
        templateParams,
        'YOUR_PUBLIC_KEY'
      );

      console.log('✅ Email envoyé: étude complétée');
    } catch (error) {
      console.error('❌ Erreur envoi email:', error);
    }
  }

  /**
   * Vérifie les études en retard et envoie des rappels
   */
  static async checkOverdueStudies(): Promise<void> {
    try {
      const quotesRef = collection(db, 'structuredQuotes');
      const q = query(
        quotesRef,
        where('structuralStudy.status', 'in', ['pending', 'in_progress'])
      );

      const snapshot = await getDocs(q);
      const now = Date.now();
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

      snapshot.forEach(doc => {
        const quote = doc.data();
        const startDate = quote.structuralStudy?.startDate;

        if (startDate) {
          const elapsed = now - new Date(startDate).getTime();
          if (elapsed > thirtyDaysMs) {
            console.log(`⚠️ Étude en retard: ${quote.title} (${doc.id})`);
            // Envoyer notification
            this.notifyOverdueStudy(doc.id, quote);
          }
        }
      });
    } catch (error) {
      console.error('❌ Erreur vérification études en retard:', error);
    }
  }

  /**
   * Notification étude en retard
   */
  private static async notifyOverdueStudy(quoteId: string, quote: any): Promise<void> {
    // Implémenter l'envoi d'email/notification
    console.log(`📧 Notification retard pour: ${quote.title}`);
  }

  /**
   * Notification conversion possible
   */
  static async notifyConversionReady(
    quoteId: string,
    teamEmail: string
  ): Promise<void> {
    console.log(`✅ Devis ${quoteId} prêt pour conversion en définitif`);
    // Implémenter notification équipe
  }

  /**
   * Alerte dépassement de marge
   */
  static async notifyMarginExceeded(
    quoteId: string,
    quoteTitle: string,
    margin: number,
    threshold: number
  ): Promise<void> {
    if (margin > threshold) {
      console.log(`⚠️ Marge dépassée (${margin}%) pour: ${quoteTitle}`);
      // Implémenter alerte
    }
  }
}

export default StructuralNotificationService;
