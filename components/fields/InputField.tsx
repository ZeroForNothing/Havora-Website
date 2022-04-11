import { FieldProps } from "formik"
import React, { DetailedHTMLProps, InputHTMLAttributes } from "react"

type InputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement> , HTMLInputElement>
// export const InputField = ({ field  , errorState , ...props }: FieldProps & InputProps)=>{
export const InputField = ({ field  , errorState , ...props }: any)=>{
    return (
        <input {...field} {...props} className={`${"secondLayer"} ${"borderColor"} ${"InputField"} ${errorState ? 'inputError' : null}`}/>
    )
}