import '../styles/globals.css'
import '../styles/DarkMode.css'
import '../styles/Post.css'

import App , { AppProps } from 'next/app'
import {Provider} from 'react-redux'
import {createWrapper} from 'next-redux-wrapper'
import store from '../store/store'

class MyApp extends App {
  render(){
    const {Component , pageProps} = this.props;
    return(
      <Provider store ={store}>
        {/* <AppWrapper> */}
      <Component {...pageProps} />
        {/* </AppWrapper> */}
      </Provider>
    ) 
  }
}
const makestore = () => store;
const wrapper = createWrapper(makestore)
export default wrapper.withRedux(MyApp);