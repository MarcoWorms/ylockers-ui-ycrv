import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useContractRead } from 'wagmi';
import { parseUnits, formatUnits, erc20Abi } from 'viem';
import { useDebounce } from 'use-debounce';
import env from '@/lib/env';
import abis from '@/app/abis';
import Image from 'next/image';
import bmath from '@/lib/bmath';
import useBalances from '../../hooks/useBalances';

const INPUT_TOKENS = [
  { address: '0xc5bDdf9843308380375a611c18B50Fb9341f502A', symbol: 'yveCRV-DAO' },
  { address: '0x9d409a0A012CFbA9B15F6D4B36Ac57A46966Ab9a', symbol: 'yvBOOST' },
  { address: '0xFCc5c47bE19d06BF83eB04298b026F81069ff65b', symbol: 'yCRV' },
  { address: '0x27B5739e22ad9033bcBf192059122d163b60349D', symbol: 'yvyCRV' },
  { address: '0x6E9455D109202b426169F0d8f01A3332DAE160f3', symbol: 'lp-yCRVv2' },
  { address: '0x453D92C7d4263201C69aACfaf589Ed14202d83a4', symbol: 'yCRV-f v1' },
  { address: '0x99f5aCc8EC2Da2BC0771c32814EFF52b712de1E5', symbol: 'yCRV-f v2' },
  { address: '0xD533a949740bb3306d119CC777fa900bA034cd52', symbol: 'CRV' },
  { address: '0xc97232527B62eFb0D8ed38CF3EA103A6CcA4037e', symbol: 'lp-yCRVv1' },
  { address: '0xE9A115b77A1057C918F997c32663FdcE24FB873f', symbol: 'YBS' },
];

const OUTPUT_TOKENS = [
  { address: '0xFCc5c47bE19d06BF83eB04298b026F81069ff65b', symbol: 'yCRV' },
  { address: '0x27B5739e22ad9033bcBf192059122d163b60349D', symbol: 'yvyCRV' },
  { address: '0x6E9455D109202b426169F0d8f01A3332DAE160f3', symbol: 'lp-yCRVv2' },
  { address: '0xE9A115b77A1057C918F997c32663FdcE24FB873f', symbol: 'YBS' },
  { address: '0x99f5aCc8EC2Da2BC0771c32814EFF52b712de1E5', symbol: 'yCRV-f v2' },
];

function useSwapForErc20(inputToken: `0x${string}`, address: `0x${string}`) {
  const { data: approvalStatus, refetch: refetchApprovalStatus } = useContractRead(address ? {
    address: inputToken as `0x${string}`,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [address, '0x5271058928d31b6204fc95eee15fe9fbbdca681a'],
  } : {});

  const { writeContract: approveContract, data: approvalHash } = useWriteContract();

  const handleApprove = () => {
    approveContract({
      address: inputToken as `0x${string}`,
      abi: erc20Abi,
      functionName: 'approve',
      args: ['0x5271058928d31b6204fc95eee15fe9fbbdca681a', BigInt(2) ** BigInt(256) - BigInt(1)],
    });
  };

  return { approvalStatus, handleApprove, approvalHash, refetchApprovalStatus };
}

function useSwapForYBS(inputToken: `0x${string}`, address: `0x${string}`) {
  const { data: approvalStatus, refetch: refetchApprovalStatus } = useContractRead(address ? {
    address: inputToken as `0x${string}`,
    abi: abis.YearnBoostedStaker,
    functionName: 'approvedCaller',
    args: [address, '0x5271058928d31b6204fc95eee15fe9fbbdca681a'],
  } : {});

  const { writeContract: approveContract, data: approvalHash } = useWriteContract();

  const handleApprove = () => {
    approveContract({
      address: inputToken,
      abi: abis.YearnBoostedStaker,
      functionName: 'setApprovedCaller',
      args: ['0x5271058928d31b6204fc95eee15fe9fbbdca681a', 3],
    });
  };

  return { approvalStatus, handleApprove, approvalHash, refetchApprovalStatus };
}

function useSwapForYBSOutput(outputToken: `0x${string}`, address: `0x${string}`) {
  const { data: approvalStatus, refetch: refetchApprovalStatus } = useContractRead(address ? {
    address: outputToken as `0x${string}`,
    abi: abis.YearnBoostedStaker,
    functionName: 'approvedCaller',
    args: [address, '0x5271058928d31b6204fc95eee15fe9fbbdca681a'],
  } : {});

  const { writeContract: approveContract, data: approvalHash } = useWriteContract();

  const handleApprove = () => {
    approveContract({
      address: outputToken,
      abi: abis.YearnBoostedStaker,
      functionName: 'setApprovedCaller',
      args: ['0x5271058928d31b6204fc95eee15fe9fbbdca681a', 3],
    });
  };

  return { approvalStatus, handleApprove, approvalHash, refetchApprovalStatus };
}

export default function Zap() {
  const { address, isConnected } = useAccount();
  const [inputToken, setInputToken] = useState(INPUT_TOKENS[0].address);
  const [outputToken, setOutputToken] = useState(OUTPUT_TOKENS[0].address);
  const [amount, setAmount] = useState('');
  const [debouncedAmount] = useDebounce(amount, 500);
  const [minOut, setMinOut] = useState(0n);
  const [isApproved, setIsApproved] = useState(false);
  const [isYBSApproved, setIsYBSApproved] = useState(false);
  const [needsInputApproval, setNeedsInputApproval] = useState(false);
  const [needsOutputApproval, setNeedsOutputApproval] = useState(false);
  const [userInputAmount, setUserInputAmount] = useState('');
  const [inputApproved, setInputApproved] = useState(false);
  const [justApproved, setJustApproved] = useState(false);


  const { balances, refetch: refetchBalances, isLoading: balancesLoading, isError: balancesError } = useBalances();

  const { data: expectedOut } = useContractRead((!!debouncedAmount && !!inputToken && !!outputToken) ? {
    address: '0x5271058928d31b6204fc95eee15fe9fbbdca681a',
    abi: abis.Zap,
    functionName: 'calc_expected_out',
    args: [inputToken, outputToken, parseUnits(debouncedAmount, 18)],
  } : {});

  useEffect(() => {
    if (expectedOut) {
      const allowableSlippage = 0.01;
      setMinOut(bmath.mul((1 - allowableSlippage), expectedOut as bigint));
    }
  }, [expectedOut]);

  const { data: hash, error, isPending, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const swapErc20 = useSwapForErc20(inputToken as `0x${string}`, address as `0x${string}`);
  const swapYBSInput = useSwapForYBS(inputToken as `0x${string}`, address as `0x${string}`);
  const swapYBSOutput = useSwapForYBSOutput(outputToken as `0x${string}`, address as `0x${string}`);

  const { isLoading: isApprovalPending, isSuccess: isApprovalConfirmed } = useWaitForTransactionReceipt({
    hash: inputToken === '0xE9A115b77A1057C918F997c32663FdcE24FB873f' ? swapYBSInput.approvalHash :
          outputToken === '0xE9A115b77A1057C918F997c32663FdcE24FB873f' ? swapYBSOutput.approvalHash :
          swapErc20.approvalHash,
  });

  useEffect(() => {
    if (isApprovalConfirmed) {
      if (inputToken === '0xE9A115b77A1057C918F997c32663FdcE24FB873f') {
        swapYBSInput.refetchApprovalStatus();
      } else if (outputToken === '0xE9A115b77A1057C918F997c32663FdcE24FB873f') {
        swapYBSOutput.refetchApprovalStatus();
      } else {
        swapErc20.refetchApprovalStatus();
      }
      setInputApproved(true);
    }
  }, [isApprovalConfirmed, inputToken, outputToken, swapErc20, swapYBSInput, swapYBSOutput]);

  useEffect(() => {
    const updateApprovalStatus = async () => {
      if (inputToken === '0xE9A115b77A1057C918F997c32663FdcE24FB873f') {
        setIsApproved(swapYBSInput.approvalStatus === 3);
      } else {
        setIsApproved(Number(swapErc20.approvalStatus) > 0);
      }
  
      if (outputToken === '0xE9A115b77A1057C918F997c32663FdcE24FB873f') {
        setIsYBSApproved(swapYBSOutput.approvalStatus === 3);
      } else {
        setIsYBSApproved(true);
      }
  
      setNeedsInputApproval(!isApproved);
      setNeedsOutputApproval(outputToken === '0xE9A115b77A1057C918F997c32663FdcE24FB873f' && !isYBSApproved);
    };
  
    updateApprovalStatus();
  }, [swapErc20.approvalStatus, swapYBSInput.approvalStatus, swapYBSOutput.approvalStatus, inputToken, outputToken, isApproved, isYBSApproved]);

  useEffect(() => {
    if (!justApproved) {
      if (inputToken === '0xE9A115b77A1057C918F997c32663FdcE24FB873f') {
        setIsApproved(swapYBSInput.approvalStatus === 3);
      } else {
        setIsApproved(Number(swapErc20.approvalStatus) > 0);
      }
  
      if (outputToken === '0xE9A115b77A1057C918F997c32663FdcE24FB873f') {
        setIsYBSApproved(swapYBSOutput.approvalStatus === 3);
      } else {
        setIsYBSApproved(true);
      }
  
      setNeedsInputApproval(!isApproved);
      setNeedsOutputApproval(outputToken === '0xE9A115b77A1057C918F997c32663FdcE24FB873f' && !isYBSApproved);
    }
  }, [swapErc20.approvalStatus, swapYBSInput.approvalStatus, swapYBSOutput.approvalStatus, inputToken, outputToken, isApproved, isYBSApproved, justApproved]);
 
  const handleApprove = useCallback(async () => {
    if (needsInputApproval) {
      if (inputToken === '0xE9A115b77A1057C918F997c32663FdcE24FB873f') {
        await swapYBSInput.handleApprove();
      } else {
        await swapErc20.handleApprove();
      }
    } else if (needsOutputApproval) {
      await swapYBSOutput.handleApprove();
    }
    setJustApproved(true);
  }, [inputToken, swapErc20, swapYBSInput, swapYBSOutput, needsInputApproval, needsOutputApproval]);

  async function handleClick() {
    if (!isConnected) {
      // Trigger wallet connection here
    } else if (needsInputApproval || needsOutputApproval) {
      handleApprove();
    } else {
      writeContract({
        address: '0x5271058928d31b6204fc95eee15fe9fbbdca681a',
        abi: abis.Zap,
        functionName: 'zap',
        args: [inputToken, outputToken, parseUnits(debouncedAmount, 18), minOut],      });
    }
  }

  useEffect(() => {
    if (inputToken === outputToken) {
      setOutputToken(inputToken === '0x27B5739e22ad9033bcBf192059122d163b60349D' ? '0xE9A115b77A1057C918F997c32663FdcE24FB873f' : '0x27B5739e22ad9033bcBf192059122d163b60349D');
    }
  }, [inputToken, outputToken]);

  useEffect(() => {
    if (inputToken === '0x453D92C7d4263201C69aACfaf589Ed14202d83a4') {
      setOutputToken('0x99f5aCc8EC2Da2BC0771c32814EFF52b712de1E5');
    }
  }, [inputToken]);

  useEffect(() => {
    if (isConfirmed) {
      refetchBalances();
      swapErc20.refetchApprovalStatus();
      swapYBSInput.refetchApprovalStatus();
      swapYBSOutput.refetchApprovalStatus();
    }
  }, [isConfirmed, refetchBalances, swapErc20, swapYBSInput, swapYBSOutput]);

  useEffect(() => {
    if (justApproved) {
      const updateAfterApproval = async () => {
        await swapErc20.refetchApprovalStatus();
        await swapYBSInput.refetchApprovalStatus();
        await swapYBSOutput.refetchApprovalStatus();
        setTimeout(() => setJustApproved(false), 500);
      };
      updateAfterApproval();
    }
  }, [justApproved, swapErc20, swapYBSInput, swapYBSOutput]);

  useEffect(() => {
    if (balances[inputToken] && Number(formatUnits(balances[inputToken], 18)) >= 1) {
      if (!userInputAmount) {
        setAmount('0');
      } else {
        setAmount(userInputAmount);
      }
    } else {
      setAmount('');
      setUserInputAmount('');
    }
  }, [inputToken, balances, userInputAmount]);

  const handleAmountChange = (e: any) => {
    const newAmount = e.target.value;
    if (balances[inputToken] && Number(formatUnits(balances[inputToken], 18)) >= 1) {
      setUserInputAmount(newAmount);
      setAmount(newAmount);
    }
  };

  const filteredInputTokens = INPUT_TOKENS.filter(token => {
    const balance = balances[token.address];
    return balance !== undefined && Number(formatUnits(balance, 18)) >= 1;
  });

  useEffect(() => {
    if (isApprovalConfirmed) {
      swapErc20.refetchApprovalStatus();
      swapYBSInput.refetchApprovalStatus();
      swapYBSOutput.refetchApprovalStatus();
    }
  }, [isApprovalConfirmed, swapErc20, swapYBSInput, swapYBSOutput]);

  const getButtonText = () => {
    if (!isConnected) return 'Connect Wallet';
    if (isPending || isApprovalPending || justApproved) return 'Confirming...';
    if (needsInputApproval) return 'Approve Input';
    if (needsOutputApproval) return 'Approve YBS Output';
    return 'Zap';
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Supercharge your yield with yCRV</h2>
      <p className="mb-8">{`Zap any token within the yCRV ecosystem for any other. Maybe you want to zap for a higher yield, or maybe you just like zapping (it's ok, we don't judge).`}</p>
      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <label className="font-medium text-center">Zap from</label>
          <div className='flex w-full space-x-4'>
          <select
            className="p-2 border rounded text-blue w-full"
            value={inputToken}
            onChange={(e) => setInputToken(e.target.value)}
          >
            {filteredInputTokens.map((token: any) => (
              <option key={token.address} value={token.address}>
                {/* <Image src={`https://github.com/SmolDapp/tokenAssets/blob/main/tokens/1/${token.address}/logo.svg`} alt={token.symbol} width={20} height={20} /> */}
                {token.symbol} ({Number(formatUnits(balances[token.address], 18)).toFixed(2)})
              </option>
            ))}
          </select>
            <input
              className="p-2 border rounded text-blue w-full"
              type="number"
              value={amount}
              onChange={handleAmountChange}
              placeholder="Amount"
            />
          </div>
        </div>
        <div className="text-center text-2xl">↓</div>
        <div className="flex flex-col space-y-2">
          <label className="font-medium text-center">Zap to minimum of:</label>
          <div className='flex w-full space-x-4'>
            <select
              className="p-2 border rounded text-blue w-full"
              value={outputToken}
              onChange={(e) => setOutputToken(e.target.value)}
            >
              {OUTPUT_TOKENS.filter(token => token.address !== inputToken && (inputToken !== '0x453D92C7d4263201C69aACfaf589Ed14202d83a4' || token.address === '0x99f5aCc8EC2Da2BC0771c32814EFF52b712de1E5')).map((token) => (
                <option key={token.address} value={token.address}>
                  {/* @ts-ignore */}
                  {token.symbol} ({balances[token.address] ? Number(formatUnits(balances[token.address], 18)).toFixed(2) : '0.00'})
                </option>
              ))}
            </select>
            <input
              className="p-2 border rounded text-blue w-full"
              type="number"
              value={Number(formatUnits(minOut, 18)).toFixed(2)}
              readOnly
              placeholder="You will receive a minimum of"
            /> 
          </div>
        </div>
        <button
          className="mt-4 w-full bg-lighter-blue text-white p-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 border-1 border-white"
          onClick={handleClick}
          disabled={isPending || isApprovalPending || justApproved || inputToken === outputToken || !inputToken || !outputToken || !debouncedAmount}
        >
          {getButtonText()}
        </button>
        {hash && <div>Transaction Hash: {hash}</div>}
        {isConfirming && <div>Waiting for confirmation...</div>}
        {isConfirmed && <div>Transaction confirmed.</div>}
        {error && <div>Transaction Error.</div>}
      </div>
    </div>
  );
}