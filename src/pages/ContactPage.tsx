import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GlobalLayout from '../components/Layout/GlobalLayout';
import BookingCalendar from '../components/Contact/BookingCalendar';
import ContactFAQ from '../components/Contact/ContactFAQ';
import { 
  Mail, 
  Phone, 
  MapPin, 
  MessageCircle, 
  Clock, 
  Send,
  Calendar,
  CheckCircle,
  Building,
  Globe
} from 'lucide-react';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulation d'envoi
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const offices = [
    {
      city: 'Brazzaville',
      country: 'Congo',
      address: 'Centre-ville, Avenue Amilcar Cabral',
      phone: '+242 06 123 45 67',
      email: 'brazzaville@intuitionconcept.com',
      type: 'Siège social'
    },
    {
      city: 'Kinshasa',
      country: 'RDC',
      address: 'Gombe, Boulevard du 30 Juin',
      phone: '+243 81 123 45 67',
      email: 'kinshasa@intuitionconcept.com',
      type: 'Bureau régional'
    },
    {
      city: 'Douala',
      country: 'Cameroun',
      address: 'Akwa, Rue Joss',
      phone: '+237 233 42 00 00',
      email: 'douala@intuitionconcept.com',
      type: 'Bureau régional'
    }
  ];

  const contactMethods = [
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      description: 'Réponse rapide en moins de 2h',
      action: '+242 06 500 00 00',
      link: 'https://wa.me/242065000000',
      color: 'bg-[#4A7C59]'
    },
    {
      icon: Mail,
      title: 'Email',
      description: 'Pour les demandes détaillées',
      action: 'contact@intuitionconcept.com',
      link: 'mailto:contact@intuitionconcept.com',
      color: 'bg-[#1E4B6E]'
    },
    {
      icon: Calendar,
      title: 'Rendez-vous',
      description: 'Réservez un créneau avec un expert',
      action: 'Choisir un horaire',
      link: '#booking',
      color: 'bg-[#E5A832]'
    },
    {
      icon: Phone,
      title: 'Téléphone',
      description: 'Lun-Ven, 8h-18h (GMT)',
      action: '+221 33 123 45 67',
      link: 'tel:+221331234567',
      color: 'bg-[#C45C3E]'
    }
  ];

  return (
    <GlobalLayout showHero={false}>
      {/* Hero */}
      <section className="py-20 bg-[#1E4B6E] text-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Parlons de votre projet
            </h1>
            <p className="text-xl text-gray-200">
              Notre équipe est disponible pour répondre à vos questions et vous accompagner. 
              Réponse garantie sous 24h.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <motion.a
                  key={method.title}
                  href={method.link}
                  target={method.link.startsWith('http') ? '_blank' : undefined}
                  rel={method.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all block"
                >
                  <div className={`w-12 h-12 ${method.color} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{method.title}</h3>
                  <p className="text-gray-500 text-sm mb-2">{method.description}</p>
                  <p className="text-[#1E4B6E] font-medium">{method.action}</p>
                </motion.a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Form + Offices */}
      <section className="py-20 bg-[#F5F0E8]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Formulaire */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-8 shadow-lg"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Envoyez-nous un message
              </h2>

              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <CheckCircle className="w-16 h-16 text-[#4A7C59] mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Message envoyé !</h3>
                  <p className="text-gray-600">Nous vous répondrons sous 24h.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1E4B6E] focus:border-transparent"
                        placeholder="Votre nom"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1E4B6E] focus:border-transparent"
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1E4B6E] focus:border-transparent"
                        placeholder="+221 77 123 45 67"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Entreprise
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1E4B6E] focus:border-transparent"
                        placeholder="Nom de votre entreprise"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sujet *
                    </label>
                    <select
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Choisir un sujet</option>
                      <option value="demo">Demande de démonstration</option>
                      <option value="pricing">Question sur les tarifs</option>
                      <option value="support">Support technique</option>
                      <option value="partnership">Partenariat</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Décrivez votre projet ou votre question..."
                    />
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Envoyer le message
                  </motion.button>
                </form>
              )}
            </motion.div>

            {/* Bureaux */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Nos bureaux
              </h2>

              <div className="space-y-6">
                {offices.map((office) => (
                  <div
                    key={office.city}
                    className="bg-white rounded-2xl p-6 shadow-lg"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Building className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900">{office.city}</h3>
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                            {office.type}
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm mb-3">{office.country}</p>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4" />
                            {office.address}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="w-4 h-4" />
                            {office.phone}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="w-4 h-4" />
                            {office.email}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* FAQ */}
              <div className="mt-8">
                <ContactFAQ />
              </div>

              {/* Engagement */}
              <div className="mt-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-6 h-6" />
                  <h3 className="font-bold text-lg">Notre engagement</h3>
                </div>
                <ul className="space-y-2 text-blue-100">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Réponse sous 24h garantie
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Support en français
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Équipe locale dans 4 pays
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Calendrier de réservation */}
      <section id="booking" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-xl mx-auto">
            <BookingCalendar 
              onBooking={(date, time, type) => {
                console.log('Réservation:', { date, time, type });
                // Ici, intégrer avec un service de calendrier
              }}
            />
          </div>
        </div>
      </section>
    </GlobalLayout>
  );
};

export default ContactPage;
