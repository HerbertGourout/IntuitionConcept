import React, { useRef, useState, useEffect } from 'react';
import { Pen, RotateCcw, Download, Check, X } from 'lucide-react';

interface SignatureCaptureProps {
  onSignatureSave?: (signature: string) => void;
  onCancel?: () => void;
  width?: number;
  height?: number;
  backgroundColor?: string;
  penColor?: string;
  penWidth?: number;
  showControls?: boolean;
  title?: string;
}

const SignatureCapture: React.FC<SignatureCaptureProps> = ({
  onSignatureSave,
  onCancel,
  width = 400,
  height = 200,
  backgroundColor = '#ffffff',
  penColor = '#000000',
  penWidth = 2,
  showControls = true,
  title = 'Signature électronique'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configuration initiale du canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [width, height, backgroundColor, penColor, penWidth]);

  // Obtenir les coordonnées relatives au canvas
  const getCoordinates = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in event) {
      // Événement tactile
      const touch = event.touches[0] || event.changedTouches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      };
    } else {
      // Événement souris
      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY
      };
    }
  };

  // Commencer à dessiner
  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const coords = getCoordinates(event);
    setIsDrawing(true);
    setLastPoint(coords);
    setHasSignature(true);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
    }
  };

  // Dessiner
  const draw = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    event.preventDefault();

    const coords = getCoordinates(event);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (ctx && lastPoint) {
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }

    setLastPoint(coords);
  };

  // Arrêter de dessiner
  const stopDrawing = () => {
    setIsDrawing(false);
    setLastPoint(null);
  };

  // Effacer la signature
  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
      setHasSignature(false);
    }
  };

  // Sauvegarder la signature
  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;

    const dataURL = canvas.toDataURL('image/png');
    onSignatureSave?.(dataURL);
  };

  // Télécharger la signature
  const downloadSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;

    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `signature_${new Date().toISOString().split('T')[0]}.png`;
    link.href = dataURL;
    link.click();
  };

  // Redimensionner le canvas pour les écrans haute résolution
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const devicePixelRatio = window.devicePixelRatio || 1;
    const displayWidth = width;
    const displayHeight = height;

    canvas.width = displayWidth * devicePixelRatio;
    canvas.height = displayHeight * devicePixelRatio;
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';

    ctx.scale(devicePixelRatio, devicePixelRatio);
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, displayWidth, displayHeight);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [width, height, backgroundColor, penColor, penWidth]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      {/* Titre */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center justify-center gap-2">
          <Pen className="w-5 h-5 text-blue-600" />
          {title}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Signez dans la zone ci-dessous
        </p>
      </div>

      {/* Zone de signature */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 mb-4">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="border border-gray-200 rounded cursor-crosshair touch-none"
          style={{ width: `${width}px`, height: `${height}px` }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      {/* Instructions */}
      <div className="text-xs text-gray-500 text-center mb-4">
        Utilisez votre souris, trackpad ou doigt pour signer
      </div>

      {/* Contrôles */}
      {showControls && (
        <div className="flex justify-center gap-2">
          <button
            onClick={clearSignature}
            className="flex items-center gap-1 px-3 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            title="Effacer"
          >
            <RotateCcw className="w-4 h-4" />
            Effacer
          </button>

          <button
            onClick={downloadSignature}
            disabled={!hasSignature}
            className="flex items-center gap-1 px-3 py-2 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title="Télécharger"
          >
            <Download className="w-4 h-4" />
            Télécharger
          </button>

          {onSignatureSave && (
            <button
              onClick={saveSignature}
              disabled={!hasSignature}
              className="flex items-center gap-1 px-3 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title="Valider"
            >
              <Check className="w-4 h-4" />
              Valider
            </button>
          )}

          {onCancel && (
            <button
              onClick={onCancel}
              className="flex items-center gap-1 px-3 py-2 text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors text-sm"
              title="Annuler"
            >
              <X className="w-4 h-4" />
              Annuler
            </button>
          )}
        </div>
      )}

      {/* Informations légales */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600 text-center">
          En signant, vous acceptez que cette signature électronique ait la même valeur légale qu'une signature manuscrite.
        </p>
      </div>
    </div>
  );
};

export default SignatureCapture;
