import Erc20 from './Erc20'
import Stake from '../components/Stake'

export default function ForExample() {
  return <div className="w-full min-h-screen px-96 flex flex-col items-center justify-center gap-12">
    <div className="p-24 w-full flex flex-col gap-4">
      <Stake />
      {/* <div className="relative w-96 h-64 bg-dark-blue rounded-lg rainbow">
      </div> */}
    </div>
    {/* <Erc20 address={env.PRISMA} className="p-24 border border-charge-red text-charge-red rounded-lg" /> */}
  </div>
}
