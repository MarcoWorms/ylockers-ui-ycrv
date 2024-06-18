import { useState, useEffect, useMemo } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useContractRead } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { useDebounce } from 'use-debounce';
import env from '@/lib/env';
import abis from '@/app/abis';
import Image from 'next/image';
import { erc20Abi } from 'viem';

const INPUT_TOKENS = [
  { address: '0xc5bDdf9843308380375a611c18B50Fb9341f502A', symbol: 'yveCRV-DAO' },
  { address: '0x9d409a0A012CFbA9B15F6D4B36Ac57A46966Ab9a', symbol: 'yvBOOST' },
  { address: '0xFCc5c47bE19d06BF83eB04298b026F81069ff65b', symbol: 'yCRV' },
  { address: '0x27B5739e22ad9033bcBf192059122d163b60349D', symbol: 'st-yCRV' },
  { address: '0x6E9455D109202b426169F0d8f01A3332DAE160f3', symbol: 'lp-yCRVv2' },
  { address: '0x453D92C7d4263201C69aACfaf589Ed14202d83a4', symbol: 'yCRV-f v1' },
  { address: '0x99f5aCc8EC2Da2BC0771c32814EFF52b712de1E5', symbol: 'yCRV-f v2' },
  { address: '0xD533a949740bb3306d119CC777fa900bA034cd52', symbol: 'CRV' },
  { address: '0xc97232527B62eFb0D8ed38CF3EA103A6CcA4037e', symbol: 'lp-yCRVv1' },
  { address: '0xE9A115b77A1057C918F997c32663FdcE24FB873f', symbol: 'YBS' },
];

const OUTPUT_TOKENS = [
  { address: '0xFCc5c47bE19d06BF83eB04298b026F81069ff65b', symbol: 'yCRV' },
  { address: '0x27B5739e22ad9033bcBf192059122d163b60349D', symbol: 'st-yCRV' },
  { address: '0x6E9455D109202b426169F0d8f01A3332DAE160f3', symbol: 'lp-yCRVv2' },
  { address: '0xE9A115b77A1057C918F997c32663FdcE24FB873f', symbol: 'YBS' },
];

export default function Zap() {
  const { address } = useAccount();
  const [inputToken, setInputToken] = useState(INPUT_TOKENS[0].address);
  const [outputToken, setOutputToken] = useState(OUTPUT_TOKENS[0].address);
  const [amount, setAmount] = useState('');
  const [debouncedAmount] = useDebounce(amount, 500);
  const [minOut, setMinOut] = useState('0');
  const [isApproved, setIsApproved] = useState(false);
  const [balances, setBalances] = useState({});

  const { data: expectedOut } = useContractRead((!!debouncedAmount && !!inputToken && !!outputToken) ? {
    address: '0x5271058928d31b6204fc95eee15fe9fbbdca681a',
    abi: abis.Zap,
    functionName: 'calc_expected_out',
    args: [inputToken, outputToken, parseUnits(debouncedAmount, 18)],
  } : {});

  useEffect(() => {
    if (expectedOut) {
      const allowableSlippage = 0.01;
      setMinOut((Number(expectedOut) * (1 - allowableSlippage)).toString());
    }
  }, [expectedOut]);

  const { data: hash, error, isPending, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const { data: approvalStatus } = useContractRead(address ? {
    address: inputToken as `0x${string}`,
    abi: inputToken === '0xE9A115b77A1057C918F997c32663FdcE24FB873f' ? abis.YearnBoostedStaker : erc20Abi,
    functionName: inputToken === '0xE9A115b77A1057C918F997c32663FdcE24FB873f' ? 'approvedCaller' : 'allowance',
    args: inputToken === '0xE9A115b77A1057C918F997c32663FdcE24FB873f'
      ? [address, '0x5271058928d31b6204fc95eee15fe9fbbdca681a']
      : [address, inputToken],
  } : {});

  useEffect(() => {
    if (inputToken === '0xE9A115b77A1057C918F997c32663FdcE24FB873f') {
      setIsApproved(approvalStatus === 3);
    } else {
      setIsApproved(Number(approvalStatus) >= parseUnits(debouncedAmount, 18));
    }
  }, [approvalStatus, inputToken, debouncedAmount]);

  const { writeContract: approveContract } = useWriteContract();

  const handleApprove = () => {
    if (inputToken === '0xE9A115b77A1057C918F997c32663FdcE24FB873f') {
      approveContract({
        address: inputToken,
        abi: abis.YearnBoostedStaker,
        functionName: 'setApprovedCaller',
        args: ['0x5271058928d31b6204fc95eee15fe9fbbdca681a', 3],
      });
    } else {
      approveContract({
        address: inputToken as `0x${string}`,
        abi: erc20Abi,
        functionName: 'approve',
        args: ['0x5271058928d31b6204fc95eee15fe9fbbdca681a', parseUnits(debouncedAmount, 18)],
      });
    }
  };

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isApproved) {
      handleApprove();
    } else {
      writeContract({
        address: '0x5271058928d31b6204fc95eee15fe9fbbdca681a',
        abi: abis.Zap,
        functionName: 'zap',
        args: [inputToken, outputToken, parseUnits(debouncedAmount, 18), parseUnits(minOut, 18)],
      });
    }
  }

  useEffect(() => {
    if (inputToken === outputToken) {
      setOutputToken('');
    }
  }, [inputToken, outputToken]);

  useEffect(() => {
    if (inputToken === '0xc97232527B62eFb0D8ed38CF3EA103A6CcA4037e') {
      setOutputToken('0x6E9455D109202b426169F0d8f01A3332DAE160f3');
    }
  }, [inputToken]);

  useEffect(() => {
    const fetchBalances = async () => {
      const balances = await Promise.all(INPUT_TOKENS.map(async (token) => {
        const { data: balance } = await useContractRead({
          address: token.address as `0x${string}`,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [address as `0x${string}`],
        });
        return { address: token.address, balance: balance ? formatUnits(balance, 18) : '0' };
      }));
      setBalances(balances.reduce((acc, { address, balance }) => ({ ...acc, [address]: balance }), {}));
    };

    if (address) {
      fetchBalances();
    }
  }, [address]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Supercharge your yield with yCRV</h2>
      <p className="mb-4">{`Swap any token within the yCRV ecosystem for any other. Maybe you want to swap for a higher yield, or maybe you just like swapping (it's ok, we don't judge).`}</p>
      <form onSubmit={submit} className="space-y-4">
        <div className="flex flex-col space-y-2">
          <label className="font-medium">Swap from</label>
          <select
            className="p-2 border rounded text-blue"
            value={inputToken}
            onChange={(e) => setInputToken(e.target.value)}
          >
            {INPUT_TOKENS.map((token: any) => (
              <option key={token.address} value={token.address}>
                <Image src={`https://github.com/SmolDapp/tokenAssets/blob/main/tokens/1/${token.address}/logo.svg`} alt={token.symbol} width={20} height={20} />
                {/* @ts-ignore */}
                {token.symbol} ({balances[token.address] ? Number(balances[token.address]).toFixed(2) : '0.00'})
              </option>
            ))}
          </select>
          <input
            className="p-2 border rounded text-blue"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
          />
        </div>
        <div className="text-center text-2xl">↓</div>
        <div className="flex flex-col space-y-2">
          <label className="font-medium">Swap to</label>
          <select
            className="p-2 border rounded text-blue"
            value={outputToken}
            onChange={(e) => setOutputToken(e.target.value)}
          >
            {OUTPUT_TOKENS.map((token) => (
              <option key={token.address} value={token.address}>
                <Image src={`https://github.com/SmolDapp/tokenAssets/blob/main/tokens/1/${token.address}/logo.svg`} alt={token.symbol} width={20} height={20} />
                {token.symbol}
              </option>
            ))}
          </select>
          <input
            className="p-2 border rounded text-blue"
            type="number"
            value={minOut}
            readOnly
            placeholder="You will receive minimum"
          />
        </div>
        <button
          className="mt-4 w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400 border-1 border-white"
          type="submit"
          disabled={isPending}
        >
          {isPending ? 'Confirming...' : isApproved ? 'Swap' : 'Approve'}
        </button>
        {hash && <div>Transaction Hash: {hash}</div>}
        {isConfirming && <div>Waiting for confirmation...</div>}
        {isConfirmed && <div>Transaction confirmed.</div>}
        {error && <div>Error: {error.message}</div>}
      </form>
    </div>
  );
}