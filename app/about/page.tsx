import Header, { headerItems } from "../components/Header";
import Link from "next/link";
import Background from "../components/Background";

export default function Home() {
  return (
    <main className="flex flex-col items-center min-h-screen bg-[linear-gradient(350deg,var(--tw-gradient-from),var(--tw-gradient-to))] from-dark-black to-dark-blue text-white">
      <div className="w-full shadow-lg z-10"></div>
      <Background />
      <Header items={headerItems} selected="About"/>
      <section className="xl:w-[1200px] px-8 xl:p-0 z-10">
        <div className="w-full">
          <div className="relative mx-auto mb-0 flex w-full flex-col bg-neutral-0">
            <div className="relative mx-auto mt-6 pb-40">
              <section className="grid-cols-12 gap-0 md:grid md:pt-12">
                <div className="col-span-12 md:col-span-6 md:mb-0 md:pr-20">
                  <div className="mb-10 flex flex-col justify-center">
                    <h1 className="mt-28 md:mt-6 block font-black text-5xl"> 
                      {"Let's get your CRV "} 
                      <br />
                      <span className="bg-clip-text bg-gradient-text text-transparent" style={{color: 'transparent'}}>
                        unlocked
                      </span>
                    </h1>
                  </div>
                  <div className="mb-8 border-white-200 py-2 text-white-700 md:border-l-4 border-dark-blue md:pl-6">
                    <div>
                      <h2 className="text-3xl font-bold mb-6 mt-2">
                      How does it work?
                      </h2>
                      <h3 className="text-xl font-bold">
                        Stake
                      </h3>
                      <div className="mt-2 flex flex-col space-y-2 text-white font-thin white">
                        <p>
                          {`Each week, Yearn's veCRV position earns revenue from protocol fees and bribes. This is converted to crvUSD stablecoin and distributed to yCRV stakers at the start of the week.`}
                        </p>
                        <p>
                          {`To begin earning your share, all you need to do is stake your yCRV tokens in the staking contract. You're free to unstake them at any time with no lock-ups or penalties.`}
                        </p>
                      </div>
                      <h3 className="text-xl font-bold mt-6">
                        Boost
                      </h3>
                      <div className="mt-2 flex flex-col space-y-2 text-white font-thin">
                        <p>
                          {`The longer you stake, the greater your boost! Yearn's yCRV staking contract incentivizes long-term users by boosting their yield (up to a maximum of 2.5x).`}
                        </p>
                        <p>
                          {`You'll reach max boost and achieve the maximum staking APR less than four weeks after depositing your yCRV.`}
                        </p>
                      </div>
                      <h3 className="text-xl font-bold mt-6">
                        Weight
                      </h3>
                      <div className="mt-2 flex flex-col space-y-2 text-white font-thin">
                        <p>
                          {`To calculate your boost, the staking contract maintains a weight for every deposit (which is a function of the amount of yCRV you have staked and the duration since it was staked).`}
                        </p>
                        <p>
                          {`For example, stake 100 yCRV and your initial weight will be 50 yCRV. At 00:00:00 UTC the following Thursday, your weight will increase to 100, then 150, then 200, and finally 250 (on the fourth Thursday following your deposit).`}
                        </p>
                      </div>
                      <h3 className="text-xl font-bold mt-2">
                        Rewards
                      </h3>
                      <div className="mt-2 flex flex-col space-y-2 text-white font-thin">
                        <p>
                          {`Each week, Yearn claims its share of protocol fees and vote-maximized bribes. These are swapped for crvUSD and deposited directly into the reward distributor contract.`}
                        </p>
                        <p>
                          {`Your rewards accrue week over week and are never lost if unclaimed. In fact, they begin earning yield from the moment we receive them! Earned vault tokens will be received directly to your wallet.`}
                        </p>
                      </div>
                      <h3 className="text-xl font-bold mt-6">
                        And for the yCRV maxis…
                      </h3>
                      <div className="mt-2 flex flex-col space-y-2 text-white font-thin">
                        <p>
                          {`Not interested in staking, weights, and manual claims? Just want more yCRV and the highest APYs? Then our yCRV auto-compounding vault is for you!`}
                        </p>
                        <p>
                          {`Once a week, the vault claims from the yCRV staker contract, swaps it for more yCRV, and deposits it back into the staker. On top of that, the vault is whitelisted - allowing it to earn max boost immediately on all reinvested yCRV.`}
                        </p>
                        <p>
                          {`For more information on yCRV and the yLockers ecosystem, read our `}<Link className="underline" href="https://docs.yearn.fi/getting-started/products/ylockers/overview">docs</Link>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              <div className="flex flex-col col-span-3 mt-6 rounded-lg bg-darker-blue">
                <div className="mb-4 border-b p-4 md:p-6"><b className="text-2xl">
                  yCRV deployment addresses
                </b></div>
                <dl className="flex flex-col gap-2 p-4 md:p-6 ">
                  <div className="flex flex-col justify-between md:flex-row">
                    <dt className="text-white">yCRV Boosted Staker</dt>
                    <a className="cursor-pointer text-xs hover:underline md:text-base" href="https://etherscan.io/address/0xE9A115b77A1057C918F997c32663FdcE24FB873f">
                      <dd className="font-mono">0xE9A115b77A1057C918F997c32663FdcE24FB873f</dd>
                    </a>
                  </div>
                  <div className="flex flex-col justify-between md:flex-row">
                    <dt className="text-white">Rewards Distributor</dt>
                    <a className="cursor-pointer text-xs hover:underline md:text-base" href="https://etherscan.io/address/0xB226c52EB411326CdB54824a88aBaFDAAfF16D3d">
                      <dd className="font-mono">0xB226c52EB411326CdB54824a88aBaFDAAfF16D3d</dd>
                    </a>
                  </div>
                  <div className="flex flex-col justify-between md:flex-row">
                    <dt className="text-white">Boosted Staker Utilities</dt>
                    <a className="cursor-pointer text-xs hover:underline md:text-base" href="https://etherscan.io/address/0x265c8D21A322B04804524b857089De2fEF619569">
                      <dd className="font-mono">0x265c8D21A322B04804524b857089De2fEF619569</dd>
                    </a>
                  </div>
                  <div className="flex flex-col justify-between md:flex-row">
                    <dt className="text-white">yvyCRV</dt>
                    <a className="cursor-pointer text-xs hover:underline md:text-base" href="https://etherscan.io/address/0x27B5739e22ad9033bcBf192059122d163b60349D">
                      <dd className="font-mono">0x27B5739e22ad9033bcBf192059122d163b60349D</dd>
                    </a>
                  </div>
                  <div className="flex flex-col justify-between md:flex-row">
                    <dt className="text-white">yvcrvUSD</dt>
                    <a className="cursor-pointer text-xs hover:underline md:text-base" href="https://etherscan.io/address/0xBF319dDC2Edc1Eb6FDf9910E39b37Be221C8805F">
                      <dd className="font-mono">0xBF319dDC2Edc1Eb6FDf9910E39b37Be221C8805F</dd>
                    </a>
                  </div>
                  <div className="flex flex-col justify-between md:flex-row">
                    <dt className="text-white">CRV Token</dt>
                    <a className="cursor-pointer text-xs hover:underline md:text-base" href="https://etherscan.io/address/0xD533a949740bb3306d119CC777fa900bA034cd52">
                      <dd className="font-mono">0xD533a949740bb3306d119CC777fa900bA034cd52</dd>
                    </a>
                  </div>
                   <div className="flex flex-col justify-between md:flex-row">
                    <dt className="text-white">yCRV Token</dt>
                    <a className="cursor-pointer text-xs hover:underline md:text-base" href="https://etherscan.io/address/0xFCc5c47bE19d06BF83eB04298b026F81069ff65b">
                      <dd className="font-mono">0xFCc5c47bE19d06BF83eB04298b026F81069ff65b</dd>
                    </a>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
