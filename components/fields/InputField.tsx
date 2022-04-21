import React from "react"

export const InputField = ({ field  , errorState , icon, ...props }: any)=>{
    return (
        <input {...field} {...props} 
        className={`secondLayer borderColor ${icon? 'inputIcon':''} InputField ${errorState ? 'inputError' : ''} ${ icon === 'search' ? 'bi bi-search' : '' }`}
        autoComplete={`off`}/>
    )
}