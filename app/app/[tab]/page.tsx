"use client";

import { z } from "zod";
import Image from "next/image";
import Link from "next/link";
import InputBox from "../../components/InputBox";
import Header, { headerItems } from "../../components/Header";
import { useParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { useConnectModal, useAccountModal } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi'
import { useState, useMemo } from 'react';
import { fAddress, fPercent, fTokens, fUSD } from "@/lib/format";
import useData from "@/hooks/useData";
import useVault from "@/hooks/useVault";
import Tokens from "../../components/Tokens";

import ClaimAll from "../../components/ClaimAll";
import Stake from "../../components/Stake";
import Unstake from "../../components/Unstake";
import Mint from "../../components/Mint";
import Deposit from "../../components/Deposit";
import Withdraw from "../../components/Withdraw";
import WithdrawAllFromOldStaker from "../../components/WithdrawAllFromOldStaker";

import { useContractReads } from 'wagmi';
import { PiVaultLight } from "react-icons/pi";
import { erc20Abi } from 'viem';
import { formatUnits } from 'viem';
import usePrices from "@/hooks/usePrices";
import bmath, { priced } from "@/lib/bmath";
import env from '@/lib/env'
import Background from "../../components/Background";
import A from "@/app/components/A";
import ImageOrFallback from "@/app/components/ImageOrFallback";

function isVersionGte(version: string, compareVersion: string) {
    const versionParts = version.split('.').map(Number);
    const compareVersionParts = compareVersion.split('.').map(Number);
    for (let i = 0; i < Math.max(versionParts.length, compareVersionParts.length); i++) {
        const v = versionParts[i] || 0;
        const cv = compareVersionParts[i] || 0;
        if (v > cv) return true;
        if (v < cv) return false;
    }
    return true; 
}

function useTab() {
  const params = useParams()
  return params.tab as string
}

export default function Home() {
  const { openConnectModal  } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { data } = useData()

  const { data: yprismaVault } = useVault(env.YPRISMA_STRATEGY)
  const vaultApr: number = z.number({ coerce: true }).parse(bmath.div(data.utilities.vaultAPR, 10n**18n) ?? 0)
  const vaultApy: number = (1 + (vaultApr / 52)) ** 52 - 1;

  const tab = useTab();

  const account = useAccount()

  const leftActive = (tab === "stake" || tab === "unstake" || tab === "claim" || tab === "get" || tab === "learn_more_stake")
  const rightActive = !leftActive

  const { data: prices } = usePrices([env.YPRISMA]);

  const earned = useMemo(() => {
    if (data.strategy.balance && prices[env.YPRISMA]) {
      return priced(data.strategy.balance, data.strategy.decimals, prices[env.YPRISMA]);
    }
    return 0;
  }, [data.strategy.balance, data.strategy.decimals, prices]);

  return (
    <main className="flex flex-col items-center min-h-screen bg-[linear-gradient(350deg,var(--tw-gradient-from),var(--tw-gradient-to))] from-dark-black to-dark-blue text-white">
      <div className="w-full shadow-lg z-10"></div>
      <Background className="opacity-20" />
      <div className="max-w-[1200px] w-full z-10">
        <Header items={headerItems} selected="Earn" launchText={account.address ? `${fAddress(account.address)}` : "Connect Wallet"} onClickLaunch={account.address ? openAccountModal : openConnectModal} />
        <section className="mt-32 md:mt-[5vh] mx-4 lg:mx-0">
          <div className="w-full flex flex-wrap justify-center items-center mb-12 md:mb-8 space-y-4 md:space-x-8 md:space-y-0 flex-col md:flex-row">
            <Link href="/app/stake"><div className={`${(leftActive) ? 'bg-light-blue' : 'bg-tab-inactive'} rounded-full w-[328px] px-2 py-2`}>
              <div className="flex justify-between items-center text-lg pl-4">EARN crvUSD <div className={`rounded-full ${leftActive ? 'bg-lighter-blue' : 'bg-tab-inactive-inner'} p-1 px-4`}>{data.utilities && data.utilities.globalAverageApr.toString() !== '0' ? fPercent(bmath.div(data.utilities.globalAverageApr, 10n**18n)) : <span title="APR will show when migration period ends after first week.">🌈✨%</span>}</div></div>
            </div></Link>
            <Link href="/app/deposit"><div className={`${(rightActive) ? 'bg-light-blue' : 'bg-tab-inactive'} rounded-full w-[328px] px-2 py-2`}>
              <div className="flex justify-between items-center text-lg pl-4">
                EARN yCRV <div className={`rounded-full ${rightActive ? 'bg-lighter-blue' : 'bg-tab-inactive-inner'} p-1 px-4`}>
                  {vaultApy > 0 ? fPercent(vaultApy) : <span title="APR will show when migration period ends after first week.">🌈✨%</span>}
              </div></div>
            </div></Link>
          </div>
          <div className="flex flex-col lg:flex-row justify-center ">
            <div className="flex-1 bg-darker-blue lg:rounded-bl-lg lg:rounded-tl-lg">
              <Suspense fallback={<div>Loading...</div>}>
                <TabContent leftActive={leftActive} account={account} />
              </Suspense>
            </div>

            <div className="lg:w-[408px] bg-blue flex flex-col p-10 lg:rounded-br-lg lg:rounded-tr-lg">
              {leftActive ? (
                <>
                  <span className="text-light-white font-bold pb-2">ACTIVE APR</span>
                  <span className="text-light-blue text-6xl font-bold mb-[26px]">{data.utilities && data.utilities.globalAverageApr.toString() !== '0' ? fPercent(bmath.div(data.utilities.globalAverageApr, 10n**18n)) : <span title="APR will show when migration period ends after first week.">🌈✨%</span>}</span>
                  <span className="font-normal text-light-blue">Projected APR: {data.utilities && data.utilities.globalProjectedApr.toString() !== '0' ? fPercent(bmath.div(data.utilities.globalProjectedApr, 10n**18n)) : <span title="APR will show when migration period ends after first week.">🌈✨%</span>}</span>
                  <div className="border-t-2 border-b-2 border-soft-blue my-4 py-6 flex flex-col space-y-2">
                    <div className="flex justify-between items-center pb-4">
                      <span className="font-semibold text-lg">YOUR POSITION</span>
                      <span className="font-bold px-2 py-1 bg-disabled-bg rounded-lg text-boost-blue">{bmath.div(data.utilities.userBoostMultiplier, 10n**18n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}x BOOST</span>
                    </div>
                    <div className="flex justify-between w-full">
                      <span className="font-thin opacity-70	w">yCRV Staked</span>
                      <span className="font-bold">
                        <Tokens amount={data.staker.balance} decimals={data.staker.decimals}/>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-thin opacity-70	">Your APR</span>
                      <span className="font-bold">{data.utilities && fPercent(bmath.div(data.utilities.userApr, 10n**18n))}</span>
                    </div>
                    {/* <div className="flex justify-between">
                      <span className="font-thin opacity-70	">Boost Multiplier</span>
                      <span className="font-bold">2x</span>
                    </div> */}
                    <div className="flex justify-between">
                      <span className="font-thin opacity-70	">Claimable Rewards</span>
                      <span className="font-bold">
                        <Tokens amount={data.rewards.claimable} decimals={data.rewards.decimals}/> crvUSD
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 pt-2">
                    <span className="font-semibold pb-4 text-lg">YEARN BOOSTED STAKER</span>
                    <div className="flex justify-between">
                      <span className="font-thin opacity-70	">yCRV Staked</span>
                      <span className="font-bold">{bmath.div(data.staker.totalSupply, 10n**18n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-thin opacity-70	">Rewards this week</span>
                      <span className="font-bold">{bmath.div(data.utilities.weeklyRewardAmount, 10n**18n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} crvUSD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-thin opacity-70	flex items-center gap-2 whitespace-nowrap">
                        <div>APR 1x</div>
                        <Image width={20} height={10} alt="right arrow" src="/right-arrow.svg" />
                        <div>2.5x</div>
                      </span>
                      <span className="w-7/12 font-bold flex items-end md:items-center md:justify-end space-x-2">
                        <span>{data.utilities && bmath.div(data.utilities.globalMinMaxApr.min, 10n**18n) ? fPercent(bmath.div(data.utilities.globalMinMaxApr.min, 10n**18n), 2) : <span title="APR will show when migration period ends after first week.">🌈✨%</span>}</span>
                        <Image width={20} height={10} alt="right arrow" src="/right-arrow.svg" />
                        <span>{data.utilities && bmath.div(data.utilities.globalMinMaxApr.max, 10n**18n) ? fPercent(bmath.div(data.utilities.globalMinMaxApr.max, 10n**18n), 2) : <span title="APR will show when migration period ends after first week.">🌈✨%</span>}</span>                     </span>
                    </div>
                    {/* <div className="flex justify-between">
                      <span className="font-thin opacity-70	">Average Boost Multiplier</span>
                      <span className="font-bold">1.7x</span>
                    </div> */}

                  </div>
                </>
              ) :(
                <>
                  <span className="text-light-blue font-bold pb-2">ESTIMATED AUTO-COMPOUND APY</span>
                  <span className="text-light-blue text-6xl font-bold mb-[26px]">
                    {(vaultApy > 0) ? fPercent(vaultApy) : <span title="APR will show when migration period ends after first week.">🌈✨%</span>}</span>
                  <div className="border-t-2 border-soft-blue my-4 py-6 flex flex-col space-y-2">
                    <span className="font-semibold pb-4 text-lg">MY DEPOSITS</span>
                    <div className="flex justify-between">
                      <span className="font-thin opacity-70	">yCRV Deposited</span>
                      <span className="font-bold">{data.strategy.balance
                        ? (bmath.div(data.strategy.balance, 10n**18n) * bmath.div(data.strategy.pricePerShare, 10n**18n)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        : '-'
                      }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-thin opacity-70 mb-4">USD Value</span>
                      <span className="font-bold">
                        ${data.strategy.balance && prices[env.YPRISMA]
                          ? (Number(bmath.div(data.strategy.balance, 10n**18n) * bmath.div(data.strategy.pricePerShare, 10n**18n)) * prices[env.YPRISMA]).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : '0.00'}
                      </span>
                    </div>
                    <span className="font-semibold pb-4 pt-6 text-lg border-t-2 border-soft-blue">TOTAL DEPOSITS</span>
                    <div className="flex justify-between">
                      <span className="font-thin opacity-70	">yCRV Deposited</span>
                      <span className="font-bold">{data.strategy.totalAssets
                        ? bmath.div(data.strategy.totalAssets, 10n**18n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        : '-'
                      }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-thin opacity-70">USD Value</span>
                      <span className="font-bold">
                        ${data.strategy.totalAssets && prices[env.YPRISMA]
                          ? (Number(bmath.div(data.strategy.totalAssets, 10n ** 18n)) * prices[env.YPRISMA]).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : '-'}
                      </span>
                    </div>
                  </div>
                </>
              )}
              
            </div>
          </div>
          <div className="mt-8">
            <TableComponent address={account.address}/>
          </div>
        </section>
      </div>
    </main>
  );
}

function TabContent(props: { leftActive: any; account: any }) {
  const tab = useTab();
  const { data } = useData();

  return (
    <div className="flex flex-col">
      <h1 className="text-5xl p-8 font-[700]">
        {tab === 'stake' && "Stake yCRV"}
        {tab === 'unstake' && "Stake yCRV"}
        {tab === 'claim' && "Stake yCRV"}
        {tab === 'get' && "Stake yCRV"}
        {tab === 'learn_more_stake' && "Stake yCRV"}
        {tab === 'deposit' && "Auto-Compound yCRV"}
        {tab === 'withdraw' && "Auto-Compound yCRV"}
        {tab === 'learn_more_deposit' && "Auto-Compound yCRV"}
        
      </h1>
      {props.leftActive ? (
        <Header
          items={[
            { text: 'Stake', link: '/app/stake' },
            { text: 'Unstake', link: '/app/unstake' },
            { text: 'Claim Rewards', link: '/app/claim', notification: data.rewards.claimable > 0 },
            { text: 'Get yCRV', link: '/app/get' },
            { text: 'Learn More', link: '/app/learn_more_stake' }
          ]}
          launchApp={false}
          selected={tab === 'get' ? 'Get yCRV' : tab === 'stake' ? 'Stake' : tab === 'learn_more_stake' ? 'Learn More' : tab === 'unstake' ? 'Unstake' : tab === 'claim' ? 'Claim Rewards' : ''}
          className="pl-4 mb-2 md:mb-0 md:pl-8"
          onClickLaunch={() => {}}
        />
      ) : (
        <Header
          items={[
            { text: 'Deposit', link: '/app/deposit' },
            { text: 'Withdraw', link: '/app/withdraw' },
            { text: 'Learn More', link: '/app/learn_more_deposit' },
          ]}
          launchApp={false}
          selected={tab === 'deposit' ? 'Deposit' : tab === 'learn_more_deposit' ? 'Learn More' : tab === 'withdraw' ? 'Withdraw' : ''}
          className="pl-4 mb-2 md:mb-0 md:pl-8"
          onClickLaunch={() => {}}
        />
      )}
      <div className="border-t-2 border-input-bg">
        {tab === 'stake' && (
          <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 w-full pt-0"> 
            <div className="flex flex-col p-4 md:p-8 w-full md:w-1/2">
              <span className="font-thin pb-1 text-md">Stake yCRV</span>
              <Stake />
            </div>
            <div className="flex flex-col space-y-6 w-full md:w-1/2 p-4 md:p-8 pt-0">
              <span className="font-semibold">STAKE yCRV - EARN STABLES</span>
              <span className="font-thin opacity-70">
                {`Stake your yCRV and start earning a share of Yearn's veCRV stablecoin revenue today. You'll reach max boost and hit the maximum staking APR after just 4 weeks.`}
              </span>
              <Image alt="charge multiplier" className="" src="/charge.png" width={370} height={136} />
            </div>
          </div>
        )}
        {tab === 'unstake' && (
          <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 w-full pt-0"> 
            <div className="flex flex-col p-4 md:p-8 w-full md:w-1/2">
              <span className="font-thin pb-1 text-md">Unstake yCRV</span>
              <Unstake />
            </div>
            <div className="flex flex-col space-y-6 w-full md:w-1/2 p-4 md:p-8 pt-0">
              <span className="font-semibold">UNSTAKE yCRV</span>
              <span className="font-thin opacity-70">
                {`Unstake your yCRV. You're free to unstake at any time with no lock-ups or penalties. Unstaked yCRV doesn’t earn any yield. Withdrawals pull from the least boosted position.`}
              </span>
              <Image alt="charge multiplier" className="" src="/charge.png" width={370} height={136} />
            </div>
          </div>
        )}
        {tab === 'claim' && (
          <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 w-full pt-0"> 
            <div className="flex flex-col space-y-4 p-4 md:p-8 w-full md:w-1/2">
            <span className="font-semibold">YOUR REWARD</span>
            <span className="font-semibold text-5xl">{fUSD(data.rewards.claimableUsd)}</span>
            <span className="font-thin opacity-70">{bmath.div(data.rewards.claimable, 10n ** BigInt(data.rewards.decimals)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} yvcrvUSD</span>
            <div>
              <ClaimAll />
            </div>
            </div>
            <div className="flex flex-col space-y-4 w-full md:w-1/2 p-4 md:p-8 pt-0">
              <span className="font-semibold">DESCRIPTION</span>
              <p className="font-thin opacity-70">
                {`Claim your crvUSD rewards. We already deposited your crvUSD into our auto-compounding crvUSD vault (`}
                  <A target="_blank" rel="noreferrer" className="underline" href={`https://yearn.fi/v3/1/${env.YVMKUSD}`}>yvcrvUSD</A>
                {`).`}
              </p>
              <p className="font-thin opacity-70">
                {`That means your yield has been earning you additional yield from the moment we received it. Once claimed, your crvUSD vault holdings will appear below.`}
              </p>
              <div>
                <div className="font-thin opacity-70">Your yvcrvUSD balance</div>
                <A className="flex items-center gap-2 font-mono" href={`https://yearn.fi/v3/1/${env.YVMKUSD}`} target="_blank" rel="noreferrer">
                  <PiVaultLight />
                  <Tokens amount={data.rewards.vaultBalance} decimals={data.rewards.decimals} />
                  ({fUSD(data.rewards.vaultBalanceUsd)})
                </A>
              </div>
            </div>
          </div>
        )}
        {tab === 'get' && (
          <div className="flex">
            <div className="flex flex-col p-4 md:p-8 w-full md:w-2/3">
              <span className="font-thin pb-1 text-md">Mint yCRV from CRV</span>
              <Mint />
              <div className="mt-4 flex flex-col space-y-4">
                <p className="font-thin opacity-70">
                {`Convert your CRV to yCRV using the yCRV contract. This mints yCRV in a 1:1 ratio. ⚠️ Depending on peg it may be more efficient to use a DEX and swap instead of minting.`}
                </p>
                <p className="font-thin opacity-70">
                <b>⚠️ Important: </b>{`yLocker tokens (such as yCRV) can never be redeemed for the underlying locked tokens (CRV). However, because they are liquid, they can be traded on decentralized exchanges, and bought and sold at the current market rate.`}
                </p>
              </div>
            </div>
          </div>
        )}
        {tab === 'learn_more_stake' && (
          <div className="flex flex-row space-y-6 w-full pt-0"> 
            <div className="flex flex-col space-y-4 p-4 md:p-8 w-full md:w-2/3">
              <span className="font-semibold">HOW IT WORKS</span>
              <p className="font-thin opacity-70">
                {`The longer you stake, the greater your boost! Yearn's yCRV staking contract incentivizes long-term users by boosting their yield (up to a maximum of 2.5x). You'll reach max boost and achieve the maximum staking APR less than four weeks after depositing your yCRV.`}
              </p>
              <p className="font-thin opacity-70">
                {`For more information on yCRV and the yLockers ecosystem, read our`} <Link className="underline" href="https://docs.yearn.fi/getting-started/products/ylockers/overview">docs</Link>.
              </p>
            </div>
          </div>
        )}
        {tab === 'deposit' && (
          <div className="flex">
            <div className="flex flex-col p-4 md:p-8 w-full md:w-2/3">
              <span className="font-thin pb-1 text-md">Deposit</span>
              <Deposit />
              <span className="mt-4 font-thin opacity-70">
                {`Deposit your yCRV into Yearn's auto-compounding vault and start earning the maximum APY immediately. The vault will handle staking, claiming and swapping rewards, and reinvesting your yCRV for you.`}
              </span>
            </div>
          </div>
        )}
        {tab === 'withdraw' && (
          <div className="flex">
            <div className="flex flex-col p-4 md:p-8 w-full md:w-2/3">
              <span className="font-thin pb-1 text-md">Withdraw</span>
              <Withdraw />
              <span className="mt-4 font-thin opacity-70">
                {`Withdraw your yCRV from Yearn's auto-compounding vault. Please note that this will unstake your yCRV (and unstaked yCRV doesn’t earn any yield).`}
              </span>
            </div>
          </div>
        )}
        {tab === 'learn_more_deposit' && (
          <div className="flex flex-row space-y-6 w-full pt-0"> 
            <div className="flex flex-col space-y-4 p-4 md:p-8 w-full md:w-2/3">
              <span className="font-semibold">HOW IT WORKS</span>
              <p className="font-thin opacity-70">
                {`Once a week, the vault claims its boosted share of crvUSD from the yCRV staker contract, swaps it for more yCRV, and deposits it back into the staker. On top of that, the vault is whitelisted - allowing it to earn max boost immediately on all reinvested yCRV.`}
              </p>
              <p className="font-thin opacity-70">
              {`For more information on yCRV and the yLockers ecosystem, read our`} <Link className="underline" href="https://docs.yearn.fi/getting-started/products/ylockers/overview">docs</Link>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const TableComponent = (props: any) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState('estApr');
  const [sortDirection, setSortDirection] = useState('desc');
  const [vaultData, setVaultData] = useState([]);

  useEffect(() => {
    const fetchVaultData = async () => {
      try {
        const response = await fetch('https://ydaemon.yearn.finance/1/vaults/all');
        const data = await response.json();
        setVaultData(data);
      } catch (error) {
        console.error('Error fetching vault data:', error);
      }
    };

    fetchVaultData();
  }, []);

  const handleSort = (column: any) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filteredVaultData = vaultData.filter((vault:any) =>
    vault.category === "Curve"
    && vault.endorsed
    && !vault.details.isRetired
    && !vault.details.isHidden
  );

  const contractReads = useContractReads({
    contracts: props.address ? filteredVaultData.flatMap((vault: any) => [
      {
        address: vault.address,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [props.address],
      },
      {
        address: vault.token.address,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [props.address],
      },
    ]) : [],
  });

  const getHoldings = useMemo(() => {
    return (vault: any) => {
      /* @ts-ignore */
      const index = filteredVaultData.indexOf(vault);
      if (contractReads.data && contractReads.data[index * 2]) {
        const vaultBalance = contractReads.data[index * 2].result;
        return {
          /* @ts-ignore */
          balance: vaultBalance ? Number(formatUnits(vaultBalance, vault.decimals)) : 0,
          /* @ts-ignore */
          usdValue: vaultBalance ? Number(formatUnits(vaultBalance, vault.decimals)) * vault.tvl.price : 0,
        };
      }
      return null;
    };
  }, [contractReads.data, filteredVaultData]);

  const getAvailable = useMemo(() => {
    return (vault: any) => {
      /* @ts-ignore */
      const index = filteredVaultData.indexOf(vault);
      if (contractReads.data && contractReads.data[index * 2 + 1]) {
        const tokenBalance = contractReads.data[index * 2 + 1].result;
        return {
          /* @ts-ignore */
          balance: Number(formatUnits(tokenBalance, vault.token.decimals)),
          /* @ts-ignore */
          usdValue: Number(formatUnits(tokenBalance, vault.token.decimals)) * vault.tvl.price,
        };
      }
      return null;
    };
  }, [contractReads.data, filteredVaultData]);

  const sortedData = useMemo(() => {
    return [...filteredVaultData].sort((a: any, b: any) => {
      if (sortColumn === 'token') {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        if (nameA < nameB) return sortDirection === 'asc' ? -1 : 1;
        if (nameA > nameB) return sortDirection === 'asc' ? 1 : -1;
      } else if (sortColumn === 'estApr') {
        const aprA = a.apr.forwardAPR.netAPR;
        const aprB = b.apr.forwardAPR.netAPR;
        if (aprA < aprB) return sortDirection === 'asc' ? -1 : 1;
        if (aprA > aprB) return sortDirection === 'asc' ? 1 : -1;
      } else if (sortColumn === 'histApr') {
        const aprA = a.apr.netAPR;
        const aprB = b.apr.netAPR;
        if (aprA < aprB) return sortDirection === 'asc' ? -1 : 1;
        if (aprA > aprB) return sortDirection === 'asc' ? 1 : -1;
      } else if (sortColumn === 'available') {
        /* @ts-ignore */
        const availableA = getAvailable(a)?.usdValue || 0;
        /* @ts-ignore */
        const availableB = getAvailable(b)?.usdValue || 0;
        if (availableA < availableB) return sortDirection === 'asc' ? -1 : 1;
        if (availableA > availableB) return sortDirection === 'asc' ? 1 : -1;
      } else if (sortColumn === 'holdings') {
        /* @ts-ignore */
        const holdingsA = getHoldings(a)?.usdValue || 0;
        /* @ts-ignore */
        const holdingsB = getHoldings(b)?.usdValue || 0;
        if (holdingsA < holdingsB) return sortDirection === 'asc' ? -1 : 1;
        if (holdingsA > holdingsB) return sortDirection === 'asc' ? 1 : -1;
      } else if (sortColumn === 'deposits') {
        const depositsA = a.tvl.tvl;
        const depositsB = b.tvl.tvl;
        if (depositsA < depositsB) return sortDirection === 'asc' ? -1 : 1;
        if (depositsA > depositsB) return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredVaultData, sortColumn, sortDirection, getHoldings, getAvailable]);

  const filteredData = useMemo(() => {
    return sortedData.filter((vault:any) =>
      vault.token.display_name.toLowerCase().includes(searchTerm.toLowerCase())
      || vault.token.name.toLowerCase().includes(searchTerm.toLowerCase())
      || vault.token.address.toLowerCase().includes(searchTerm.toLowerCase())
      || vault.token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      || vault.token.display_symbol.toLowerCase().includes(searchTerm.toLowerCase())
      || vault.address.toLowerCase().includes(searchTerm.toLowerCase())
      || vault.name.toLowerCase().includes(searchTerm.toLowerCase())
      || vault.display_name.toLowerCase().includes(searchTerm.toLowerCase())
      || vault.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      || vault.display_symbol.toLowerCase().includes(searchTerm.toLowerCase())
      || vault.formated_symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedData, searchTerm]);

  return (
    <div className="w-full rounded-lg overflow-hidden bg-darker-blue text-white mb-8">
      <div className="flex flex-col md:flex-row items-center justify-between w-full">
        <h1 className="text-4xl md:text-5xl p-6 pt-8 md:p-8 font-[700] pb-0">
          Curve Vaults
        </h1>
        <div className="p-4 md:p-8 w-full md:w-2/3">
          <InputBox
            // type="text"
            subtitle=""
            title="Search"
            value={searchTerm}
            onChange={(e:any) => setSearchTerm(e.target.value)}
            noButton
            inputType="text"
            placeholder="Vault or strategy name..."
          />
        </div>
      </div>
      <div className="pb-2">
        <table className="w-full text-left">
          <thead>
            <tr className="">
              <th
                className="text-sm font-thin py-2 hover:underline cursor-pointer pl-4 md:pl-8"
                onClick={() => handleSort('token')}
              >
                Token {sortColumn === 'token' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th
                className="text-sm font-thin hover:underline py-2 cursor-pointer"
                onClick={() => handleSort('estApr')}
              >
                Est. APR {sortColumn === 'estApr' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th
                className="text-sm font-thin hover:underline py-2 cursor-pointer hidden md:table-cell"
                onClick={() => handleSort('histApr')}
              >
                Hist. APR {sortColumn === 'histApr' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th
                className="text-sm font-thin hover:underline py-2 cursor-pointer hidden md:table-cell"
                onClick={() => handleSort('available')}
              >
                Available {sortColumn === 'available' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th
                className="text-sm font-thin hover:underline py-2 cursor-pointer hidden md:table-cell"
                onClick={() => handleSort('holdings')}
              >
                Holdings {sortColumn === 'holdings' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th
                className="text-sm font-thin hover:underline py-2 cursor-pointer pr-8 hidden md:table-cell"
                onClick={() => handleSort('deposits')}
              >
                Deposits {sortColumn === 'deposits' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item: any) => {
              const holdings = getHoldings(item);
              const available = getAvailable(item);
              return (
                <tr onClick={() => window.open(`https://yearn.fi/${isVersionGte(item.version, "3.0.0") ? "v3/1" : "vaults/1"}/${item.address}`, '_blank')} key={item.address} className="hover:bg-blue">
                  <td className="text-sm md:text-base py-2 cursor-pointer px-4 md:pl-8 flex items-center space-x-2">
                    <ImageOrFallback
                      alt={item.name}
                      src={item.token.icon}
                      width={40}
                      height={40}
                      fallback="https://yearn.fi/_next/image?url=%2Fplaceholder.png&w=32&q=75"
                    />
                    <span>{item.name}</span>
                  </td>
                  <td className="text-base font-mono py-2 cursor-pointer pr-4 md:pr-0">{(item.apr.forwardAPR.netAPR * 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</td>
                  <td className="text-base font-mono py-2 cursor-pointer hidden md:table-cell">{(item.apr.netAPR * 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</td>
                  <td className="text-base font-mono py-2 cursor-pointer hidden md:table-cell">
                    {available ? (
                      <>
                        {available.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="text-base font-mono py-2 cursor-pointer hidden md:table-cell">
                    {holdings ? (
                      <>
                        {holdings.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="text-base font-mono py-2 cursor-pointer pr-8 hidden md:table-cell">
                    {item.tvl.totalAssets ? (
                      <>
                        {Number(formatUnits(BigInt(item.tvl.totalAssets), item.decimals)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        <p className="text-sm opacity-40">${item.tvl.tvl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {vaultData.length === 0 && <span className="p-4 md:p-8">Loading...</span>}
      </div>
    </div>
  );
};
