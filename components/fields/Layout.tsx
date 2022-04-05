import Head from 'next/head'
import Error  from './error'
export default function Layout({ children , title }) {
    return (
        <>
            <Head>
                <title>{title}</title>
                <link rel="icon" href="../../sharedComponents/Media/Z4N_Logo_Compressed.png" />
            </Head>
            <Error />
            <div>
                {children}
            </div>
        </>
    )
}