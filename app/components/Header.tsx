'use client'

import Button from "./Button";
import Link from "next/link";
import { ReactNode } from "react";

type Item = { text: string, link: string, notification?: boolean }
type Items = Array<Item>
type HeaderProps = {
  items: Items,
  selected?: string,
  launchApp?: boolean,
  launchText?: string,
  className?: string,
  onClickLaunch?: () => void,
}

const Header = ({ items, selected="", launchApp=true, launchText='Launch App', className="", onClickLaunch }: HeaderProps) => (
  <header className={`flex flex-wrap justify-between items-start md:items-center z-50 ${
    launchApp ? 'xl:w-[1200px] w-full px-4 xl:p-0 h-[72px]' : ''
  } ${className}`}>
    <div className={`flex ${launchApp ? 'flex-col pt-2 ' : 'md:space-x-4 flex-col items-start'} md:flex-row md:space-x-4 md:md:pt-0`}>
      {(!launchApp ? items.slice(0, -1) : items).map((item:Item, index:Number) => (
          <Link
            href={item.link}
            key={item.text}
            className={`py-2 border-b-2 border-transparent hover:border-white flex ${launchApp ? 'px-2' : 'py-[18px]'} ${
              selected === item.text
                ? 'border-b-2 border-white font-bold'
                : (launchApp
                  ? 'font-thin '
                  : 'border-b-2 border-transparent')} ${
                (!launchApp && !(selected === item.text))
                  ? 'text-soft-blue'
                  : ''
            }`}>
            {item.text} {item.notification && <div className="w-2 h-2 bg-light-blue rounded-full" />}
          </Link>
      ))}
    </div>
    {!launchApp && items.length > 0 && (
      <div className="ml-auto mr-8">
        <Link
          href={items[items.length - 1].link}
          className={`py-2 hover:border-b-2 py-[20px] ${
            selected === items[items.length - 1].text
              ? 'border-b-2 font-bold'
              : 'text-soft-blue'
          }`}>
          {items[items.length - 1].text}
        </Link>
      </div>
    )}
    {(launchApp && !onClickLaunch) ? <Link href="/app/stake">
      <Button theme="transparent" className="px-4 md:px-12 mt-4 md:mt-0">{launchText}</Button>
    </Link> : (launchApp && onClickLaunch) && <div>
      <Button onClick={onClickLaunch} theme="transparent" className="px-4 md:px-12 mt-4 md:mt-0">{launchText}</Button>
    </div>}
  </header>
)

export const headerItems = [
  { text: 'Home', link: '/' },
  { text: 'Earn', link: '/app/stake' },
  { text: 'About', link: '/about' },
]

export default Header