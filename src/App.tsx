import React, { useState, useRef, useCallback, useEffect } from 'react';
import { saveAs } from 'file-saver';
import QRCode from 'qrcode';
import { 
  QrCode, 
  Download, 
  Copy, 
  History,
  Check,
  Type
} from 'lucide-react';

interface QRHistoryItem {
  id: string;
  text: string;
  title: string;
  timestamp: Date;
}

function App() {
  const [inputText, setInputText] = useState('');
  const [qrTitle, setQrTitle] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [qrDataURL, setQrDataURL] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<QRHistoryItem[]>([]);
  const [copied, setCopied] = useState(false);

  const generateQR = async () => {
    if (!inputText.trim()) return;
    
    setIsGenerating(true);
    
    try {
      // Generate QR code using the qrcode library
      const qrDataUrl = await QRCode.toDataURL(inputText, {
        width: 200,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      });
      
      setQrDataURL(qrDataUrl);
      setQrValue(inputText);
      
      // Add to history
      const newItem: QRHistoryItem = {
        id: Date.now().toString(),
        text: inputText,
        title: qrTitle,
        timestamp: new Date()
      };
      setHistory(prev => [newItem, ...prev.slice(0, 2)]);
      
      // Show thank you notification
      setShowThankYou(true);
      setTimeout(() => setShowThankYou(false), 2000);
      
    } catch (error) {
      console.error('QR generation failed:', error);
    }
    
    setIsGenerating(false);
  };

  const downloadQR = async (format: 'png' | 'jpg') => {
    if (!qrDataURL) return;

    try {
      // Create a temporary canvas for the complete image with title and watermark
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) return;

      const padding = 40;
      const titleHeight = qrTitle ? 60 : 20;
      const watermarkHeight = 30;
      const qrSize = 200;
      
      tempCanvas.width = qrSize + (padding * 2);
      tempCanvas.height = qrSize + titleHeight + watermarkHeight + (padding * 2);

      // Fill background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      // Draw title if exists
      if (qrTitle) {
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 24px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(qrTitle, tempCanvas.width / 2, padding + 35);
      }

      // Load and draw QR code
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, padding, padding + titleHeight, qrSize, qrSize);
        
        // Draw watermark
        ctx.fillStyle = '#6b7280';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('QR generated by gitanshu.world', tempCanvas.width - padding, tempCanvas.height - 10);

        // Download the canvas
        tempCanvas.toBlob((blob) => {
          if (blob) {
            saveAs(blob, `${qrTitle || 'qr-code'}.${format}`);
          }
        }, `image/${format === 'jpg' ? 'jpeg' : 'png'}`);
      };
      img.src = qrDataURL;
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const copyToClipboard = async () => {
    if (!inputText) return;
    
    try {
      await navigator.clipboard.writeText(inputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const loadFromHistory = (item: QRHistoryItem) => {
    setInputText(item.text);
    setQrTitle(item.title);
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-40 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>

      {/* Thank You Banner Notification */}
      {showThankYou && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slideDown">
          <div className="bg-green-500/90 backdrop-blur-md rounded-xl border border-green-400/30 shadow-lg px-6 py-3 flex items-center gap-3">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-green-500" />
            </div>
            <span className="text-white font-medium">QR code generated successfully!</span>
          </div>
        </div>
      )}

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg mb-4">
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">QR Generator</h1>
          <p className="text-gray-300 text-lg">Create beautiful QR codes instantly</p>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          {/* QR Generator Section */}
          <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Generate QR Code
              </h2>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 rounded-xl border border-white/10 text-gray-300 transition-all"
              >
                <History className="w-4 h-4" />
                History
              </button>
            </div>

            {/* History Panel */}
            {showHistory && (
              <div className="mb-6 p-4 bg-white/5 rounded-2xl border border-white/10">
                <h3 className="text-gray-300 font-medium mb-3">Recent QR Codes</h3>
                {history.length === 0 ? (
                  <p className="text-gray-500 text-sm">No history yet</p>
                ) : (
                  <div className="space-y-2">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => loadFromHistory(item)}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all"
                      >
                        <div className="flex-1 mr-3">
                          {item.title && (
                            <div className="text-white text-sm font-medium truncate mb-1">
                              {item.title}
                            </div>
                          )}
                          <div className="text-gray-400 text-sm truncate">
                            {item.text}
                          </div>
                        </div>
                        <span className="text-gray-500 text-xs">
                          {item.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-gray-300 mb-3 text-sm font-medium">
                  QR Code Title (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={qrTitle}
                    onChange={(e) => setQrTitle(e.target.value)}
                    placeholder="Enter a title for your QR code"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  />
                  <Type className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-3 text-sm font-medium">
                  Enter URL or Text
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="https://example.com or any text"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    onKeyPress={(e) => e.key === 'Enter' && generateQR()}
                  />
                  {inputText && (
                    <button
                      onClick={copyToClipboard}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 hover:bg-white/10 rounded-lg transition-all"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={generateQR}
                disabled={!inputText.trim() || isGenerating}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95"
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Generating...
                  </div>
                ) : (
                  'Generate QR Code'
                )}
              </button>
            </div>

            {/* QR Code Display */}
            {qrValue && qrDataURL && (
              <div className="mt-8 text-center animate-fadeIn">
                {qrTitle && (
                  <h3 className="text-2xl font-bold text-white mb-4">{qrTitle}</h3>
                )}
                <div className="inline-block p-6 bg-white rounded-2xl shadow-2xl relative">
                  <img 
                    src={qrDataURL} 
                    alt="Generated QR Code" 
                    className="mx-auto block"
                    style={{ width: '200px', height: '200px' }}
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                    QR by gitanshu.world
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 justify-center mt-6">
                  <button
                    onClick={() => downloadQR('png')}
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-white transition-all transform hover:scale-105"
                  >
                    <Download className="w-4 h-4" />
                    Download PNG
                  </button>
                  <button
                    onClick={() => downloadQR('jpg')}
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-white transition-all transform hover:scale-105"
                  >
                    <Download className="w-4 h-4" />
                    Download JPG
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            Created with ❤️ by{' '}
            <span className="text-gray-400 font-medium">gitanshu</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;