'use client'

import Button from './Button';
import Image from "next/image";
import Input from './Input';

interface Props {
  title: string;
  button?: string;
  subtitle: string;
  value?: string;
  onChange?: (e:any) => void;
  noButton?: boolean;
  icon?: string;
  inputType?: string;
  placeholder?: string;
}

export default function InputBox({ title, button, subtitle, noButton=false, value='', onChange=()=>{}, icon, inputType="number",placeholder="100" }: Props) {
 return (
   <div className="flex flex-col">
     <span className="font-thin pb-1 text-md">{title}</span>
     <div className="flex">
       <Input type={inputType} className="p-2 bg-input-bg rounded-lg mr-2 w-full" placeholder={placeholder} onChange={onChange} />
       {icon && <Image src="/search.svg" alt="search"/>}
       {!noButton && <Button>{button}</Button>}
     </div>
     <span className="font-thin opacity-70 text-xs pl-3 pt-1">{subtitle}</span>
   </div>
 )
}