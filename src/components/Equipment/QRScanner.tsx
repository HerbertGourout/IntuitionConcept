import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Scan, 
  X, 
  Flashlight, 
  FlashlightOff, 
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Package,
  MapPin,
  Calendar,
  User
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface Equipment {
  id: string;
  name: string;
  type: string;
  serialNumber: string;
  status: 'available' | 'in-use' | 'maintenance' | 'damaged';
  location: string;
  assignedTo?: string;
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  qrCode: string;
  barcode?: string;
}

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (equipment: Equipment) => void;
  onScanError?: (error: string) => void;
}

// Simulation d'équipements pour la démo
const mockEquipments: Equipment[] = [
  {
    id: 'eq-001',
    name: 'Pelleteuse CAT 320',
    type: 'Engin de chantier',
    serialNumber: 'CAT320-2024-001',
    status: 'available',
    location: 'Chantier Dakar Nord',
    qrCode: 'QR001',
    barcode: '1234567890123',
    lastMaintenance: new Date('2024-07-01'),
    nextMaintenance: new Date('2024-08-15'),
  },
  {
    id: 'eq-002',
    name: 'Grue mobile 50T',
    type: 'Engin de levage',
    serialNumber: 'GROVE-RT550-002',
    status: 'in-use',
    location: 'Chantier Almadies',
    assignedTo: 'Mamadou Diallo',
    qrCode: 'QR002',
    barcode: '2345678901234',
    lastMaintenance: new Date('2024-06-15'),
    nextMaintenance: new Date('2024-09-01'),
  },
  {
    id: 'eq-003',
    name: 'Bétonnière 500L',
    type: 'Équipement de construction',
    serialNumber: 'BET500-2024-003',
    status: 'maintenance',
    location: 'Atelier central',
    qrCode: 'QR003',
    barcode: '3456789012345',
    lastMaintenance: new Date('2024-07-20'),
    nextMaintenance: new Date('2024-08-20'),
  },
];

const QRScanner: React.FC<QRScannerProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  onScanError,
}) => {
  const { resolvedTheme } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [scanResult, setScanResult] = useState<Equipment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  // Initialiser la caméra
  useEffect(() => {
    if (isOpen && !isScanning) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Caméra arrière
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setHasCamera(true);
        setIsScanning(true);
        setError(null);
        
        // Démarrer la détection de QR codes
        startQRDetection();
      }
    } catch (err) {
      console.error('Erreur d\'accès à la caméra:', err);
      setError('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
      setHasCamera(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
    setHasCamera(false);
  };

  const startQRDetection = () => {
    const detectQR = () => {
      if (!videoRef.current || !canvasRef.current || !isScanning) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx || video.videoWidth === 0) {
        requestAnimationFrame(detectQR);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      // Simulation de détection QR (en production, utiliser une lib comme jsQR)
      // Pour la démo, on simule une détection aléatoire
      if (Math.random() < 0.01) { // 1% de chance par frame
        const randomEquipment = mockEquipments[Math.floor(Math.random() * mockEquipments.length)];
        handleScanSuccess(randomEquipment);
        return;
      }

      if (isScanning) {
        requestAnimationFrame(detectQR);
      }
    };

    requestAnimationFrame(detectQR);
  };

  const handleScanSuccess = (equipment: Equipment) => {
    setScanResult(equipment);
    setIsScanning(false);
    
    // Vibration si supportée
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
    
    // Appeler le callback après un délai pour montrer le résultat
    setTimeout(() => {
      onScanSuccess(equipment);
      onClose();
    }, 2000);
  };

  const handleManualInput = () => {
    if (!manualInput.trim()) return;
    
    // Chercher l'équipement par QR code ou code-barres
    const equipment = mockEquipments.find(eq => 
      eq.qrCode === manualInput || eq.barcode === manualInput
    );
    
    if (equipment) {
      handleScanSuccess(equipment);
    } else {
      setError('Code non reconnu. Vérifiez le code saisi.');
      onScanError?.('Code non reconnu');
    }
  };

  const toggleFlashlight = async () => {
    try {
      const stream = videoRef.current?.srcObject as MediaStream;
      const track = stream?.getVideoTracks()[0];
      
      if (track && 'torch' in track.getCapabilities()) {
        await track.applyConstraints({
          advanced: [{ torch: !flashlightOn } as any]
        });
        setFlashlightOn(!flashlightOn);
      }
    } catch (err) {
      console.error('Erreur flash:', err);
    }
  };

  const getStatusColor = (status: Equipment['status']) => {
    switch (status) {
      case 'available': return 'text-green-500';
      case 'in-use': return 'text-blue-500';
      case 'maintenance': return 'text-yellow-500';
      case 'damaged': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusLabel = (status: Equipment['status']) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'in-use': return 'En cours d\'utilisation';
      case 'maintenance': return 'En maintenance';
      case 'damaged': return 'Endommagé';
      default: return 'Inconnu';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className={`
            relative w-full max-w-md mx-4 rounded-2xl overflow-hidden
            ${resolvedTheme === 'dark'
              ? 'bg-gray-900 border border-gray-700'
              : 'bg-white border border-gray-200'
            }
          `}
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
        >
          {/* Header */}
          <div className={`
            flex items-center justify-between p-4 border-b
            ${resolvedTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
          `}>
            <div className="flex items-center gap-2">
              <Scan className="w-5 h-5 text-blue-500" />
              <h2 className="font-semibold">Scanner Équipement</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contenu principal */}
          <div className="p-4">
            {/* Résultat du scan */}
            {scanResult ? (
              <motion.div
                className="text-center space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex justify-center">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-green-600">
                    Équipement détecté !
                  </h3>
                  <p className="text-sm opacity-70">
                    Redirection en cours...
                  </p>
                </div>

                <div className={`
                  p-4 rounded-lg border text-left
                  ${resolvedTheme === 'dark'
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-gray-50 border-gray-200'
                  }
                `}>
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4" />
                    <span className="font-medium">{scanResult.name}</span>
                  </div>
                  
                  <div className="space-y-1 text-sm opacity-70">
                    <div className="flex items-center gap-2">
                      <span>Statut:</span>
                      <span className={getStatusColor(scanResult.status)}>
                        {getStatusLabel(scanResult.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3" />
                      <span>{scanResult.location}</span>
                    </div>
                    {scanResult.assignedTo && (
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3" />
                        <span>Assigné à: {scanResult.assignedTo}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <>
                {/* Zone de scan */}
                <div className="relative mb-4">
                  {hasCamera && !error ? (
                    <div className="relative">
                      <video
                        ref={videoRef}
                        className="w-full h-64 object-cover rounded-lg bg-black"
                        playsInline
                        muted
                      />
                      <canvas ref={canvasRef} className="hidden" />
                      
                      {/* Overlay de scan */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                          className="w-48 h-48 border-2 border-white rounded-lg"
                          animate={{
                            boxShadow: [
                              '0 0 0 0 rgba(59, 130, 246, 0.7)',
                              '0 0 0 10px rgba(59, 130, 246, 0)',
                            ],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'easeOut',
                          }}
                        >
                          <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
                          <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
                          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
                          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />
                        </motion.div>
                      </div>

                      {/* Instructions */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center">
                        <p className="text-sm bg-black/50 px-3 py-1 rounded-full">
                          Pointez vers un QR code ou code-barres
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className={`
                      w-full h-64 rounded-lg border-2 border-dashed flex flex-col items-center justify-center
                      ${resolvedTheme === 'dark'
                        ? 'border-gray-600 bg-gray-800'
                        : 'border-gray-300 bg-gray-50'
                      }
                    `}>
                      <Camera className="w-12 h-12 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 text-center">
                        {error || 'Caméra non disponible'}
                      </p>
                      <button
                        onClick={startCamera}
                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <RotateCcw className="w-4 h-4 inline mr-2" />
                        Réessayer
                      </button>
                    </div>
                  )}
                </div>

                {/* Contrôles */}
                {hasCamera && (
                  <div className="flex justify-center gap-4 mb-4">
                    <button
                      onClick={toggleFlashlight}
                      className={`
                        p-3 rounded-full transition-colors
                        ${flashlightOn
                          ? 'bg-yellow-500 text-white'
                          : resolvedTheme === 'dark'
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }
                      `}
                    >
                      {flashlightOn ? (
                        <Flashlight className="w-5 h-5" />
                      ) : (
                        <FlashlightOff className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                )}

                {/* Saisie manuelle */}
                <div className="space-y-3">
                  <button
                    onClick={() => setShowManualInput(!showManualInput)}
                    className="w-full text-sm text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    {showManualInput ? 'Masquer' : 'Saisir'} le code manuellement
                  </button>

                  {showManualInput && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3"
                    >
                      <input
                        type="text"
                        value={manualInput}
                        onChange={(e) => setManualInput(e.target.value)}
                        placeholder="QR code ou code-barres"
                        className={`
                          w-full px-3 py-2 rounded-lg border
                          ${resolvedTheme === 'dark'
                            ? 'bg-gray-800 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                          }
                        `}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleManualInput();
                          }
                        }}
                      />
                      <button
                        onClick={handleManualInput}
                        disabled={!manualInput.trim()}
                        className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Rechercher
                      </button>
                    </motion.div>
                  )}
                </div>

                {/* Codes d'exemple pour la démo */}
                <div className={`
                  mt-4 p-3 rounded-lg text-xs
                  ${resolvedTheme === 'dark'
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-gray-50 border border-gray-200'
                  }
                `}>
                  <p className="font-medium mb-2"> Codes de test :</p>
                  <div className="space-y-1 opacity-70">
                    <p>• QR001 - Pelleteuse CAT 320</p>
                    <p>• QR002 - Grue mobile 50T</p>
                    <p>• QR003 - Bétonnière 500L</p>
                  </div>
                </div>
              </>
            )}

            {/* Erreur */}
            {error && !scanResult && (
              <motion.div
                className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg mt-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QRScanner;
