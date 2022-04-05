import React, { DetailedHTMLProps, InputHTMLAttributes } from "react"
type InputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement> , HTMLInputElement>

export const NavButton = ({  ...props }:  InputProps)=>{
    return (
        <input {...props} type="button" className={`${"secondLayer"}`}/>
    )
}