import Head from 'next/head'
import { Fragment } from 'react'
import type { AppProps } from 'next/app'
import '../styles/globals.css'
import 'animate.css'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Fragment>
      <Head>
        <meta
          name='description'
          content='A web3 tool designed to make governance on Cardano easy and accesible to everyone!'
        />

        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        <meta name='author' content='Ben Elferink' />
        {/* <meta name='description' content='' /> */}
        {/* <meta name='keywords' content='' /> */}

        <link rel='icon' type='image/x-icon' href='/favicon.ico' />
        <link rel='icon' type='image/png' sizes='16x16' href='/favicon-16x16.png' />
        <link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png' />
        <link rel='apple-touch-icon' sizes='180x180' href='/apple-touch-icon.png' />
        <link rel='manifest' href='/manifest.json' />

        <title>Bad Poll | Governance Tool</title>
      </Head>

      <Header />
      <main className='w-screen min-h-screen bg-black bg-opacity-50'>
        <Component {...pageProps} />
      </main>
      <Footer />
    </Fragment>
  )
}

export default MyApp
