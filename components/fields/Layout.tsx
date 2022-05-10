import Head from 'next/head'
import { useSelector } from 'react-redux'
import Error  from './error'

export default function Layout({ children , title }) {
    
    const { user } = useSelector((state: any) => { return state.user; });

    const Themes = ["bodyLightMode", "bodyDarkMode", "bodyBlueMode","bodyPurpleMode"]
    
    return (
        <>
            <Head>
                <title>{title}</title>
                <link rel="icon" href="/Media/Z4N_Logo_Compressed.png" />
            </Head>
            <Error />
            <div className={`${ user.settings && user.settings.Theme_Color ? Themes[user.settings.Theme_Color] : "bodyLightMode"}`}>
                {children}
            </div>
        </>
    )
}