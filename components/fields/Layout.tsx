import Head from 'next/head'
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux'
import Error  from './error'

export default function Layout({ children , title , showTheme }) {
    
    const { user } = useSelector((state: any) => { return state.user; });
    const [currentTheme , SetCurrentTheme] = useState(null);
    const Themes = ["bodyLightMode", "bodyDarkMode", "bodyBlueMode","bodyPurpleMode"]
    useEffect(()=>{
        if(user && user.settings && localStorage){
            localStorage.setItem('Theme_Color', Themes[user.settings.Theme_Color]);
            SetCurrentTheme(localStorage.getItem('Theme_Color'));
        }
    },[user])

    return (
        <>
            <Head>
                <title>{title}</title>
                <link rel="icon" href="/Media/Z4N_Logo_Compressed.png" />
            </Head>
            <Error />
            {
                showTheme && currentTheme != null ? 
                <div className={`${currentTheme}`}> {children} </div> 
                : <div className='loading'>{`loading`}</div>
            }
        </>
    )
}