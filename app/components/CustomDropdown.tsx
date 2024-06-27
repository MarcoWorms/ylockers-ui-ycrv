import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import ybsLogo from '@/public/ybs-logo.svg';

interface DropdownOption {
  address: string;
  symbol: string;
  balance?: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  onBalanceClick?: (balance: string) => void;
  isConnected: boolean;
}

export default function CustomDropdown({ options, value, onChange, onBalanceClick, isConnected }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.address === value) || options[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getTokenLogo = (address: string) => {
    if (address?.toLowerCase() === '0xe9a115b77a1057c918f997c32663fdce24fb873f') {
      return ybsLogo;
    }
    return `https://raw.githubusercontent.com/SmolDapp/tokenAssets/main/tokens/1/${address?.toLowerCase()}/logo.svg`;
  };

  return (
    <div className="relative w-full text-blue bg-white" ref={dropdownRef}>
      <div
        className="p-2 border rounded text-blue w-full flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center w-full">
          {isConnected && <Image
            src={getTokenLogo(selectedOption?.address)}
            alt={selectedOption?.symbol || ''}
            width={20}
            height={20}
          />}
          <span className="ml-2 flex justify-between w-full">
            <span className='font-bold'>{isConnected && selectedOption?.symbol}</span>
            {isConnected && selectedOption?.balance && (
              <span 
                className={onBalanceClick ? "cursor-pointer hover:text-light-blue mr-2" : "cursor-pointer mr-2"}
                onClick={(onBalanceClick && selectedOption.balance) ? (e) => {
                  e.stopPropagation();
                  // @ts-ignore
                  onBalanceClick(String(parseInt((selectedOption.balance.toString()))));
                } : () => {}}
              >
                {Number(selectedOption.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            )}
          </span>
        </div>
        <span className='hover:text-light-blue'>▼</span>
      </div>
      {isOpen && (
        <div className="absolute z-10 w-full bg-white border rounded mt-1 overflow-auto">
          {options.map((option) => (
            <div
              key={option.address}
              className="p-2 hover:bg-gray-100 cursor-pointer flex items-center"
              onClick={() => {
                onChange(option.address);
                setIsOpen(false);
              }}
            >
              <Image
                src={getTokenLogo(option.address)}
                alt={option.symbol}
                width={20}
                height={20}
              />
              <span className="ml-2 flex justify-between w-full">
                <span className='font-bold'>{isConnected && option?.symbol}</span>
                {isConnected && option?.balance && (
                  <span 
                    className={onBalanceClick ? "cursor-pointer hover:text-light-blue" : "cursor-pointer"}
                    onClick={(onBalanceClick && option.balance) ? (e) => {
                      // e.stopPropagation();
                      // @ts-ignore
                      onBalanceClick(String(parseInt((option.balance.toString()))));
                    } : () => {}}
                  >
                    {Number(option.balance).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}