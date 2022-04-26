import '../styles/Global/globals.css'
import '../styles/Global/DarkMode.css'
import 'bootstrap-icons/font/bootstrap-icons.css';
import App from 'next/app'
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