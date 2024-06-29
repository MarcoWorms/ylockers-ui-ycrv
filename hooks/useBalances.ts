import { useSuspenseQuery } from '@tanstack/react-query';
import { erc20Abi, zeroAddress } from 'viem';
import { useAccount, useConfig } from 'wagmi';
import { readContractsQueryOptions } from 'wagmi/query';

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
];

export default function useBalances() {
  const { address } = useAccount();
  const config = useConfig();
  const multicallAddress = config.chains[0].contracts?.multicall3?.address || '0xcA11bde05977b3631167028862bE2a173976CA11';

  const contracts = [...INPUT_TOKENS, ...OUTPUT_TOKENS].map(token => ({
    address: token.address,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address || zeroAddress],
  }));

  const multicall = useSuspenseQuery(
    /* @ts-ignore */
    readContractsQueryOptions(config, { contracts, multicallAddress })
  );

  const balances = multicall.data?.reduce((acc, result, index) => {
    /* @ts-ignore */
    acc[contracts[index].address] = result.result;
    return acc;
  }, {});

  return { balances, refetch: multicall.refetch, isLoading: multicall.isLoading, isError: multicall.isError };
}