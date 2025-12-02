import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Mail,
    Send,
    XCircle,
    FileText,
    User,
    MessageSquare,
    Paperclip,
    CheckCircle,
    AlertCircle,
    Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Quote } from '../../services/quotesService';
import { emailService, EmailData } from '../../services/emailService';

interface QuoteEmailSenderProps {
    quote: Quote;
    onSend: (emailData: EmailData) => Promise<void>;
    onClose: () => void;
}

const QuoteEmailSender: React.FC<QuoteEmailSenderProps> = ({
    quote,
    onSend,
    onClose
}) => {
    const [emailData, setEmailData] = useState<EmailData>({
        to: quote.clientEmail,
        cc: '',
        subject: `Devis ${quote.reference || quote.title} - ${quote.companyName}`,
        message: `Bonjour ${quote.clientName},

Veuillez trouver ci-joint notre devis pour votre projet "${quote.title}".

Détails du devis :
- Référence : ${quote.reference || 'N/A'}
- Montant total : ${quote.totalAmount.toLocaleString()} FCFA
- Validité : ${quote.validityDays} jours

N'hésitez pas à nous contacter pour toute question ou clarification.

Cordialement,
L'équipe ${quote.companyName}`,
        attachPdf: true,
        sendCopy: false
    });

    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!emailData.to.trim()) {
            newErrors.to = 'L\'adresse email du destinataire est requise';
        } else if (!validateEmail(emailData.to)) {
            newErrors.to = 'Adresse email invalide';
        }

        if (emailData.cc && !validateEmail(emailData.cc)) {
            newErrors.cc = 'Adresse email en copie invalide';
        }

        if (!emailData.subject.trim()) {
            newErrors.subject = 'L\'objet de l\'email est requis';
        }

        if (!emailData.message.trim()) {
            newErrors.message = 'Le message est requis';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSend = async () => {
        if (!validateForm()) {
            toast.error('Veuillez corriger les erreurs dans le formulaire');
            return;
        }

        setIsLoading(true);
        try {
            await onSend(emailData);
            toast.success('Email envoyé avec succès !');
            onClose();
        } catch (error) {
            console.error('Erreur lors de l\'envoi:', error);
            toast.error('Erreur lors de l\'envoi de l\'email');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: keyof EmailData, value: string | boolean) => {
        setEmailData(prev => ({ ...prev, [field]: value }));
        // Effacer l'erreur pour ce champ
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const getValidityStatus = () => {
        if (!quote.validUntil) return null;
        
        const validUntil = new Date(quote.validUntil);
        const now = new Date();
        const daysLeft = Math.ceil((validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysLeft < 0) {
            return { 
                icon: <AlertCircle className="w-4 h-4 text-red-500" />, 
                message: `Devis expiré depuis ${Math.abs(daysLeft)} jour(s)`, 
                color: 'text-red-600 bg-red-50' 
            };
        } else if (daysLeft <= 3) {
            return { 
                icon: <Clock className="w-4 h-4 text-orange-500" />, 
                message: `Expire dans ${daysLeft} jour(s)`, 
                color: 'text-orange-600 bg-orange-50' 
            };
        } else {
            return { 
                icon: <CheckCircle className="w-4 h-4 text-green-500" />, 
                message: `Valide ${daysLeft} jour(s)`, 
                color: 'text-green-600 bg-green-50' 
            };
        }
    };

    const validityStatus = getValidityStatus();

    const emailTemplates = [
        {
            name: 'Standard',
            subject: `Devis ${quote.reference || quote.title} - ${quote.companyName}`,
            message: `Bonjour ${quote.clientName},

Veuillez trouver ci-joint notre devis pour votre projet "${quote.title}".

Détails du devis :
- Référence : ${quote.reference || 'N/A'}
- Montant total : ${quote.totalAmount.toLocaleString()} FCFA
- Validité : ${quote.validityDays} jours

N'hésitez pas à nous contacter pour toute question ou clarification.

Cordialement,
L'équipe ${quote.companyName}`
        },
        {
            name: 'Relance',
            subject: `Relance - Devis ${quote.reference || quote.title}`,
            message: `Bonjour ${quote.clientName},

Nous espérons que vous allez bien. Nous souhaitions faire un suivi concernant le devis que nous vous avons transmis pour votre projet "${quote.title}".

Rappel des détails :
- Référence : ${quote.reference || 'N/A'}
- Montant total : ${quote.totalAmount.toLocaleString()} FCFA
- Validité : ${quote.validityDays} jours

Avez-vous eu l'occasion de l'examiner ? Nous restons à votre disposition pour toute question.

Cordialement,
L'équipe ${quote.companyName}`
        },
        {
            name: 'Urgence',
            subject: `URGENT - Devis ${quote.reference || quote.title} expire bientôt`,
            message: `Bonjour ${quote.clientName},

Nous vous informons que le devis pour votre projet "${quote.title}" expire prochainement.

Pour rappel :
- Référence : ${quote.reference || 'N/A'}
- Montant total : ${quote.totalAmount.toLocaleString()} FCFA
- Date d'expiration : ${new Date(quote.validUntil).toLocaleDateString('fr-FR')}

Merci de nous faire savoir si vous souhaitez donner suite à ce projet.

Cordialement,
L'équipe ${quote.companyName}`
        }
    ];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                className="bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-white/20"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Envoi par Email</h2>
                                <p className="text-blue-100">Devis: {quote.title}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                        >
                            <XCircle className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {/* Informations du devis */}
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg mb-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <FileText className="w-5 h-5 mr-2 text-blue-600" />
                            Informations du Devis
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Client:</span>
                                    <span className="font-medium">{quote.clientName}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Email:</span>
                                    <span className="text-sm">{quote.clientEmail}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Montant:</span>
                                    <span className="font-bold text-green-600">
                                        {quote.totalAmount.toLocaleString()} FCFA
                                    </span>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Référence:</span>
                                    <span className="text-sm">{quote.reference || 'N/A'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Type:</span>
                                    <span className="text-sm">{quote.projectType}</span>
                                </div>
                                {validityStatus && (
                                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${validityStatus.color}`}>
                                        {validityStatus.icon}
                                        <span className="text-sm font-medium">
                                            {validityStatus.message}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Templates d'email */}
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg mb-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <MessageSquare className="w-5 h-5 mr-2 text-purple-600" />
                            Templates d'Email
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {emailTemplates.map((template, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        handleInputChange('subject', template.subject);
                                        handleInputChange('message', template.message);
                                        toast.success(`Template "${template.name}" appliqué`);
                                    }}
                                    className="p-4 text-left border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all"
                                >
                                    <div className="font-semibold text-purple-600 mb-2">
                                        {template.name}
                                    </div>
                                    <div className="text-sm text-gray-600 line-clamp-3">
                                        {template.message.substring(0, 100)}...
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Formulaire d'email */}
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <Send className="w-5 h-5 mr-2 text-green-600" />
                            Composer l'Email
                        </h3>
                        
                        <div className="space-y-4">
                            {/* Destinataire */}
                            <div>
                                <label className="block text-sm font-medium mb-2 flex items-center">
                                    <User className="w-4 h-4 mr-1 text-blue-500" />
                                    Destinataire *
                                </label>
                                <input
                                    type="email"
                                    value={emailData.to}
                                    onChange={(e) => handleInputChange('to', e.target.value)}
                                    className={`w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                        errors.to ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                    placeholder="client@example.com"
                                />
                                {errors.to && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        {errors.to}
                                    </p>
                                )}
                            </div>

                            {/* Copie */}
                            <div>
                                <label className="block text-sm font-medium mb-2 flex items-center">
                                    <User className="w-4 h-4 mr-1 text-gray-500" />
                                    Copie (CC)
                                </label>
                                <input
                                    type="email"
                                    value={emailData.cc}
                                    onChange={(e) => handleInputChange('cc', e.target.value)}
                                    className={`w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                        errors.cc ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                    placeholder="copie@example.com (optionnel)"
                                />
                                {errors.cc && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        {errors.cc}
                                    </p>
                                )}
                            </div>

                            {/* Objet */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Objet *
                                </label>
                                <input
                                    type="text"
                                    value={emailData.subject}
                                    onChange={(e) => handleInputChange('subject', e.target.value)}
                                    className={`w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                        errors.subject ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                    placeholder="Objet de l'email"
                                />
                                {errors.subject && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        {errors.subject}
                                    </p>
                                )}
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-sm font-medium mb-2 flex items-center">
                                    <MessageSquare className="w-4 h-4 mr-1 text-green-500" />
                                    Message *
                                </label>
                                <textarea
                                    value={emailData.message}
                                    onChange={(e) => handleInputChange('message', e.target.value)}
                                    rows={8}
                                    className={`w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                                        errors.message ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                    placeholder="Votre message..."
                                />
                                {errors.message && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        {errors.message}
                                    </p>
                                )}
                            </div>

                            {/* Options */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={emailData.attachPdf}
                                        onChange={(e) => handleInputChange('attachPdf', e.target.checked)}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <Paperclip className="w-4 h-4 text-gray-600" />
                                    <span className="text-sm">Joindre le PDF du devis</span>
                                </label>

                                <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={emailData.sendCopy}
                                        onChange={(e) => handleInputChange('sendCopy', e.target.checked)}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <Mail className="w-4 h-4 text-gray-600" />
                                    <span className="text-sm">M'envoyer une copie</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer avec actions */}
                <div className="bg-gray-50/80 backdrop-blur-sm p-6 border-t border-white/20">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            {emailData.attachPdf && (
                                <span className="flex items-center gap-1">
                                    <Paperclip className="w-4 h-4" />
                                    PDF du devis sera joint
                                </span>
                            )}
                        </div>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                                disabled={isLoading}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSend}
                                disabled={isLoading}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Envoi en cours...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Envoyer l'Email
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default QuoteEmailSender;
