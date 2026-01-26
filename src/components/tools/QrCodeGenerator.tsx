import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Copy, Check, Star, ScanLine, Download, Wifi } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import clsx from 'clsx';

type TabType = 'url' | 'wifi';

export const QrCodeGenerator: React.FC = () => {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [activeTab, setActiveTab] = useState<TabType>('url');
  const [text, setText] = useState('');
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiEncryption, setWifiEncryption] = useState('WPA');
  const [qrOutput, setQrOutput] = useState<{
    svg: string;
    png_data_url: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const toolId = 'qr-code-generator';
  const favorite = isFavorite(toolId);

  const generateQr = async () => {
    try {
      const result = await invoke<{
        svg: string;
        png_data_url: string;
      }>(activeTab === 'wifi' ? 'generate_wifi_qr_command' : 'generate_qr_command', {
        ...(activeTab === 'wifi'
          ? {
              ssid: wifiSsid,
              password: wifiPassword || undefined,
              encryption: wifiEncryption,
            }
          : {
              text,
            }),
      });
      setQrOutput(result);
    } catch (err) {
      console.error('QR generation failed:', err);
    }
  };

  const copyToClipboard = async () => {
    if (qrOutput) {
      await navigator.clipboard.writeText(qrOutput.svg);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadPng = () => {
    if (qrOutput) {
      const link = document.createElement('a');
      link.href = qrOutput.png_data_url;
      link.download = 'qrcode.png';
      link.click();
    }
  };

  const downloadSvg = () => {
    if (qrOutput) {
      const blob = new Blob([qrOutput.svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'qrcode.svg';
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const toggleFavorite = () => {
    if (favorite) {
      removeFavorite(toolId);
    } else {
      addFavorite(toolId);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            QR Code Generator
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Generate QR codes for URLs and WiFi networks
          </p>
        </div>
        <button
          onClick={toggleFavorite}
          className={clsx(
            'p-2 rounded-lg transition-colors',
            favorite
              ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
              : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-space-500'
          )}
        >
          <Star className={clsx('w-5 h-5', favorite && 'fill-current')} />
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-space-600">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('url')}
            className={clsx(
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
              activeTab === 'url'
                ? 'border-rust-500 text-rust-600 dark:text-rust-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            )}
          >
            URL / Text
          </button>
          <button
            onClick={() => setActiveTab('wifi')}
            className={clsx(
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
              activeTab === 'wifi'
                ? 'border-rust-500 text-rust-600 dark:text-rust-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            )}
          >
            WiFi Network
          </button>
        </nav>
      </div>

      <div className="space-y-6">
        {activeTab === 'url' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Text or URL
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="https://example.com or any text..."
              rows={3}
              className="w-full px-3 py-2 bg-white dark:bg-space-700 border border-gray-300 dark:border-space-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-rust-500"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                SSID (Network Name)
              </label>
              <input
                type="text"
                value={wifiSsid}
                onChange={(e) => setWifiSsid(e.target.value)}
                placeholder="MyWiFi"
                className="w-full px-3 py-2 bg-white dark:bg-space-700 border border-gray-300 dark:border-space-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-rust-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password (Optional for open networks)
              </label>
              <input
                type="password"
                value={wifiPassword}
                onChange={(e) => setWifiPassword(e.target.value)}
                placeholder="•••••••••"
                className="w-full px-3 py-2 bg-white dark:bg-space-700 border border-gray-300 dark:border-space-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-rust-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Encryption Type
              </label>
              <select
                value={wifiEncryption}
                onChange={(e) => setWifiEncryption(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-space-700 border border-gray-300 dark:border-space-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-rust-500"
              >
                <option value="WEP">WEP</option>
                <option value="WPA">WPA/WPA2</option>
                <option value="nopass">No Password</option>
              </select>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={generateQr} className="btn btn-primary flex items-center gap-2">
            <ScanLine className="w-4 h-4" />
            Generate QR Code
          </button>

          {qrOutput && (
            <>
              <button onClick={downloadPng} className="btn btn-secondary flex items-center gap-2">
                <Download className="w-4 h-4" />
                PNG
              </button>
              <button onClick={downloadSvg} className="btn btn-secondary flex items-center gap-2">
                <Download className="w-4 h-4" />
                SVG
              </button>
              <button
                onClick={copyToClipboard}
                className="btn btn-secondary flex items-center gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy SVG'}
              </button>
            </>
          )}
        </div>

        {qrOutput && (
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preview
              </label>
              <div className="flex justify-center p-6 bg-white dark:bg-space-700 rounded-lg border border-gray-200 dark:border-space-600">
                <div
                  dangerouslySetInnerHTML={{ __html: qrOutput.svg }}
                  className="w-full max-w-xs"
                />
              </div>
            </div>

            {activeTab === 'wifi' && (
              <div className="flex-1">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Wifi className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                        WiFi QR Code
                      </h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Scan this QR code with your phone to automatically connect to the network "
                        {wifiSsid}".
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
