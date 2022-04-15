import React from "react"

export const InputField = ({ field  , errorState , icon, ...props }: any)=>{
    return (
        <input {...field} {...props} 
        className={`secondLayer borderColor inputIcon InputField ${errorState ? 'inputError' : ' '} ${ icon === 'search' ? 'searchIcon' : ' ' }`}
        autoComplete={`off`}/>
    )
}