'use client';

import { useState, useRef, useEffect } from 'react';
import { Heart, Copy, Check, Mail, Wallet, Phone, Send, Coins } from 'lucide-react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount, useDisconnect, useSendTransaction } from 'wagmi';
import { parseEther } from 'viem';

// Your wallet addresses - update these with your actual addresses
const WALLET_ADDRESSES = {
  eth: '0xc0b8c380c84d050c557f6fa6722fbca2f19988dc',
  sol: 'E5Mag5EL7JZTSHPpWQUbBBgP7oCyar3QL3xF9Q9YssGe',
  btc: 'bc1qhpeyhnj6kg43yml2dvr6x34utrrx3zfa2ahtgk',
};

// Contact info for ad sales
const AD_SALES_EMAIL = 'jzamudio14@icloud.com';
const AD_SALES_TELEGRAM = 'juanesx305'; // Replace with your Telegram username
const AD_SALES_PHONE = '+16036822835'; // Replace with your phone number

// Your Venmo username - update this
const VENMO_USERNAME = 'juanezamudio';

// Donation amounts in ETH (default is 0.01)
const DONATION_AMOUNTS = ['0.005', '0.01', '0.025', '0.05', '0.1'];

export default function DonationBar() {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [donationAmount, setDonationAmount] = useState('0.01'); // Default to 0.01 ETH
  const [customAmount, setCustomAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showAdDropdown, setShowAdDropdown] = useState(false);
  const adDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (adDropdownRef.current && !adDropdownRef.current.contains(event.target as Node)) {
        setShowAdDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Web3 hooks
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { sendTransaction } = useSendTransaction();

  const getEffectiveAmount = () => {
    // Custom amount takes priority if entered
    if (customAmount && parseFloat(customAmount) > 0) {
      return customAmount;
    }
    return donationAmount;
  };

  const handleDonate = async () => {
    if (!isConnected || !address) {
      open();
      return;
    }

    const amount = getEffectiveAmount();
    if (!amount || parseFloat(amount) <= 0) {
      return;
    }

    setIsSending(true);
    try {
      sendTransaction({
        to: WALLET_ADDRESSES.eth as `0x${string}`,
        value: parseEther(amount),
      });
    } catch (error) {
      console.error('Transaction failed:', error);
    } finally {
      setIsSending(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(type);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-900/50 via-pink-900/50 to-orange-900/50 rounded-xl border border-purple-500/30 p-4 mb-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <Heart className="text-pink-400 flex-shrink-0" size={20} />
          <p className="text-gray-200 text-sm">
            <span className="font-semibold">Love this project?</span>{' '}
            <span className="text-gray-400">Support me with a donation or by buying ad space!</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {/* Venmo */}
          <a
            href={`https://venmo.com/${VENMO_USERNAME}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#008CFF] hover:bg-[#0074D4] text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M19.5 2c.998 1.666 1.5 3.392 1.5 5.178 0 4.07-3.474 9.357-6.293 13.072H6.834L4 3.75l7.674-.707L13.3 14.07c1.232-2.01 2.755-5.17 2.755-7.332 0-1.69-.58-2.852-1.39-3.807L19.5 2z"/>
            </svg>
            <span>Venmo</span>
          </a>

          {/* PayPal */}
          <a
            href="https://paypal.me/juanezamudio"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#003087] hover:bg-[#002369] text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M6.908 24H3.804a.547.547 0 0 1-.54-.635L6.38 3.15A.848.848 0 0 1 7.216 2.4h5.604c2.656 0 4.584.616 5.72 1.828.976 1.04 1.392 2.476 1.236 4.272-.016.156-.036.316-.06.48a7.262 7.262 0 0 1-.728 2.376c-.716 1.4-1.832 2.432-3.32 3.064-1.356.576-3.06.868-5.064.868h-1.3a.848.848 0 0 0-.836.716l-.032.168-.78 4.94-.024.124a.272.272 0 0 1-.268.232l-.456-.468zM19.06 7.94l-.012.076c-.868 4.46-3.836 6.004-7.632 6.004H9.744a.94.94 0 0 0-.928.796l-.984 6.252-.28 1.772a.494.494 0 0 0 .488.572h3.424a.744.744 0 0 0 .736-.628l.032-.16.58-3.68.036-.2a.744.744 0 0 1 .736-.632h.464c3 0 5.352-1.22 6.04-4.748.288-1.476.14-2.708-.624-3.576a2.98 2.98 0 0 0-.852-.648 8.202 8.202 0 0 1 .448 1.8z"/>
            </svg>
            <span>PayPal</span>
          </a>

          {/* Cash App */}
          <a
            href="https://cash.app/$juanezamudio"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00D632] hover:bg-[#00B82B] text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M23.59 3.47A5.1 5.1 0 0 0 20.55.42 5.07 5.07 0 0 0 17.11 0H6.89a5.07 5.07 0 0 0-3.44.42A5.1 5.1 0 0 0 .42 3.47 5.07 5.07 0 0 0 0 6.91v10.18a5.07 5.07 0 0 0 .42 3.44 5.1 5.1 0 0 0 3.03 3.05 5.07 5.07 0 0 0 3.44.42h10.22a5.07 5.07 0 0 0 3.44-.42 5.1 5.1 0 0 0 3.03-3.05 5.07 5.07 0 0 0 .42-3.44V6.91a5.07 5.07 0 0 0-.41-3.44zm-6.17 4.53l-.93.93a.5.5 0 0 1-.67.01 4 4 0 0 0-2.78-1.05c-1.23 0-2.09.53-2.09 1.37 0 .87.89 1.18 2.28 1.53 2.16.52 4.04 1.34 4.04 3.85 0 2.37-1.89 3.97-4.66 4.23v1.44a.5.5 0 0 1-.5.5h-1.27a.5.5 0 0 1-.5-.5v-1.5a5.95 5.95 0 0 1-3.86-1.68.5.5 0 0 1 0-.69l.93-.93a.5.5 0 0 1 .68-.02 4.4 4.4 0 0 0 3.02 1.23c1.55 0 2.35-.68 2.35-1.54 0-.85-.67-1.27-2.37-1.67-2.26-.53-3.95-1.47-3.95-3.75 0-2.12 1.67-3.74 4.2-4.07V4.28a.5.5 0 0 1 .5-.5h1.27a.5.5 0 0 1 .5.5v1.4a5.42 5.42 0 0 1 3.29 1.44.5.5 0 0 1 .02.68z"/>
            </svg>
            <span>Cash App</span>
          </a>

          {/* Crypto Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Coins size={16} />
            <span>Crypto</span>
            <svg
              className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Divider */}
          <div className="hidden sm:block w-px h-6 bg-gray-600" />

          {/* Ad Sales Dropdown */}
          <div className="relative" ref={adDropdownRef}>
            <button
              onClick={() => setShowAdDropdown(!showAdDropdown)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Mail size={16} />
              <span>Advertise</span>
              <svg
                className={`w-3 h-3 transition-transform ${showAdDropdown ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showAdDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-[#1a1a2e] border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
                <a
                  href={`mailto:${AD_SALES_EMAIL}?subject=Art Basel 2025 - Advertising Inquiry`}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-200 hover:bg-purple-600/20 transition-colors"
                  onClick={() => setShowAdDropdown(false)}
                >
                  <Mail size={16} className="text-gray-400" />
                  <span>Email</span>
                </a>
                <a
                  href={`https://t.me/${AD_SALES_TELEGRAM}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-200 hover:bg-purple-600/20 transition-colors"
                  onClick={() => setShowAdDropdown(false)}
                >
                  <Send size={16} className="text-[#0088cc]" />
                  <span>Telegram</span>
                </a>
                <a
                  href={`tel:${AD_SALES_PHONE}`}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-200 hover:bg-purple-600/20 transition-colors"
                  onClick={() => setShowAdDropdown(false)}
                >
                  <Phone size={16} className="text-green-400" />
                  <span>Phone</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Crypto Addresses - Expandable */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-700/50 space-y-3">
          {/* Ethereum */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-2 min-w-[100px]">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#627EEA]" fill="currentColor">
                <path d="M12 2L4 12l8 4.5L20 12 12 2zm0 15l-8-4.5L12 22l8-9.5L12 17z"/>
              </svg>
              <span className="text-gray-300 text-sm font-medium">Ethereum</span>
            </div>
            <div className="flex-1 flex items-center gap-2 bg-[#0a0a0f] rounded-lg px-3 py-2">
              <code className="text-xs text-gray-400 truncate flex-1">{WALLET_ADDRESSES.eth}</code>
              <button
                onClick={() => copyToClipboard(WALLET_ADDRESSES.eth, 'eth')}
                className="p-1 text-gray-400 hover:text-white transition-colors flex-shrink-0"
                title="Copy address"
              >
                {copiedAddress === 'eth' ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          {/* Solana */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-2 min-w-[100px]">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#9945FF]" fill="currentColor">
                <path d="M4 16.5l3.5-3.5h12l-3.5 3.5H4zm0-5l3.5-3.5h12L16 11.5H4zm12-5L12.5 3H4l3.5 3.5h8.5z"/>
              </svg>
              <span className="text-gray-300 text-sm font-medium">Solana</span>
            </div>
            <div className="flex-1 flex items-center gap-2 bg-[#0a0a0f] rounded-lg px-3 py-2">
              <code className="text-xs text-gray-400 truncate flex-1">{WALLET_ADDRESSES.sol}</code>
              <button
                onClick={() => copyToClipboard(WALLET_ADDRESSES.sol, 'sol')}
                className="p-1 text-gray-400 hover:text-white transition-colors flex-shrink-0"
                title="Copy address"
              >
                {copiedAddress === 'sol' ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          {/* Bitcoin */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-2 min-w-[100px]">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#F7931A]" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09v1.38h-1.41v-1.33c-.82-.07-1.65-.3-2.2-.67l.4-1.5c.63.35 1.47.62 2.25.55.88-.08 1.27-.48 1.25-1.03-.02-.55-.4-.83-1.38-1.14-1.4-.44-2.3-1.07-2.25-2.45.04-1.17.87-2.08 2.18-2.37V8.09h1.41v1.28c.65.06 1.25.22 1.64.4l-.36 1.45c-.36-.17-.92-.4-1.54-.4-.95 0-1.21.44-1.19.82.03.44.47.72 1.6 1.14 1.55.55 2.1 1.28 2.05 2.55-.05 1.21-.86 2.15-2.45 2.47z"/>
              </svg>
              <span className="text-gray-300 text-sm font-medium">Bitcoin</span>
            </div>
            <div className="flex-1 flex items-center gap-2 bg-[#0a0a0f] rounded-lg px-3 py-2">
              <code className="text-xs text-gray-400 truncate flex-1">{WALLET_ADDRESSES.btc}</code>
              <button
                onClick={() => copyToClipboard(WALLET_ADDRESSES.btc, 'btc')}
                className="p-1 text-gray-400 hover:text-white transition-colors flex-shrink-0"
                title="Copy address"
              >
                {copiedAddress === 'btc' ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center mt-2">
            Click the copy icon to copy the wallet address
          </p>

          {/* Wallet Connect Section */}
          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex items-center gap-2">
                <Wallet size={18} className="text-purple-400" />
                <span className="text-gray-300 text-sm font-medium">Or donate directly:</span>
              </div>

              {isConnected ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-400 bg-[#0a0a0f] px-2 py-1 rounded">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>

                  {/* Preset dropdown */}
                  <select
                    value={customAmount ? '' : donationAmount}
                    onChange={(e) => {
                      setDonationAmount(e.target.value);
                      setCustomAmount(''); // Clear custom when preset selected
                    }}
                    className={`bg-[#0a0a0f] text-gray-200 text-sm pl-2 pr-8 py-1.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-purple-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_0.5rem_center] bg-no-repeat ${
                      customAmount ? 'border-gray-700/50 text-gray-500' : 'border-gray-700'
                    }`}
                  >
                    <option value="" disabled>Select</option>
                    {DONATION_AMOUNTS.map((amount) => (
                      <option key={amount} value={amount}>
                        {amount} ETH
                      </option>
                    ))}
                  </select>

                  <span className="text-gray-500 text-xs">or</span>

                  {/* Custom input */}
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.001"
                      min="0.001"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="0.00"
                      className={`w-20 bg-[#0a0a0f] text-gray-200 text-sm px-2 py-1.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                        customAmount ? 'border-purple-500' : 'border-gray-700'
                      }`}
                    />
                    <span className="text-gray-400 text-sm">ETH</span>
                  </div>

                  <button
                    onClick={handleDonate}
                    disabled={isSending || (!customAmount && !donationAmount)}
                    className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isSending ? 'Sending...' : `Send ${getEffectiveAmount() || '...'}`}
                  </button>
                  <button
                    onClick={() => disconnect()}
                    className="px-3 py-1.5 text-gray-400 hover:text-white text-sm border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => open()}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Wallet size={16} />
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
