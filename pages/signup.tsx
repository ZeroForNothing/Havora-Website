import styles from '../styles/NoAuth/Signup.module.css'
import Link from 'next/link'
import { InputField } from '../components/fields/InputField'
import { Field, Formik } from "formik"
import Layout from '../components/fields/Layout'
import TermsOfService from '../components/Utility/TermsOfService'
import { useState } from 'react'
import { ShowError } from '../components/fields/error'

export default function signup() {
  let [currentPage, SetCurrentPage] = useState<number>(1);
  async function  RegisterUser(data){      
      fetchAPI('/CreateUser', data)
        .then(dataD => {
          if (dataD.error){
            ShowError(dataD.error)
          }
          else if(dataD.ok) window.location.href = "/"
        }).catch(error =>{
          console.error(error);
        });
      }
      async function fetchAPI(url = '', dataD = {}) {
        // Default options are marked with *
        const response = await fetch(url, {
          method: 'POST', // *GET, POST, PUT, DELETE, etc.
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataD) // body data type must match "Content-Type" header
        });
        return response.json(); // parses JSON response into native JavaScript objects
      }
  return (
    <Layout title="Zero for Nothing | Signup">
      <div className={`${"baseLayer"} ${styles.logo}`}></div>
      <div className={`${"baseLayer"} ${styles.signInMainContainer}`}>

        <Formik onSubmit={(values) => { }} initialValues={{
          firstName: "qwe",
          lastName: "qwe",
          username: "qwe",
          email: "qwe@qwe.com",
          password: "qweqweqwe",
          confPassword: "qweqweqwe",
          gender: 0,
          date: "1996-01-01",
          termsOfService: false
        }}>{({ values }) => (
          <form id="myForm">
            <div className={`${styles.divContainer}`}>
              {
                 currentPage == 1 ? <>
                 <label htmlFor="firstName">First Name</label>
                 <Field name="firstName" type="text" placeholder="ex. Axel" maxLength={26} component={InputField} />
                 <label htmlFor="lastName">Last Name</label>
                 <Field name="lastName" type="text" placeholder="ex. Brock" maxLength={26} component={InputField} />
                  </> : null
              }
              {
                 currentPage == 2 ? <>
                 <label htmlFor="email">Email</label>
                 <Field name="email" type="email" placeholder="ex. whatever@whatever.com" maxLength={50} component={InputField} />
                 <label htmlFor="username">Username</label>
                 <Field name="username" type="text" placeholder="ex. DevilsDontCry" maxLength={26} component={InputField} />
                  </> : null
              }
              {
                 currentPage == 3 ? <>
                 <label htmlFor="password">Password</label>
                 <Field name="password" type="password" placeholder="ex. bG0J5GW2g^16%klm" maxLength={50} component={InputField} />
                 <label htmlFor="confPassword">Confirm Password</label>
                 <Field name="confPassword" type="password" placeholder="Re-type password..." maxLength={50} component={InputField} />
               </> : null
              }
              {
                currentPage == 4 ? <>
                <label className="title">Pick your Gender</label>
                <div className={`${styles.radioContainer} `}>
                  <label htmlFor="male" className={`${"secondLayer"} ${values.gender == 1 ? "pickedInput" : null} ${styles.radioLabel} `}>Male</label>
                  <Field type="radio" id="male" name="gender" className={styles.radioInput} value={1} />
                  <label htmlFor="female" className={`${"secondLayer"} ${values.gender == 0 ? "pickedInput" : null} ${styles.radioLabel} `}>Female</label>
                  <Field type="radio" id="female" name="gender" className={styles.radioInput} value={0} />
                </div>
                <label className="title">Birth Date</label>
                <div>
                  <Field type="date" name="date" className={styles.dateList}></Field>
                </div>
              </> :null
              }
              {
                currentPage == 5? <>
                  <div className={`${"secondLayer"} ${styles.termsOfService}`}><TermsOfService /></div>
                  <input type="button" className={`${"secondLayer"} ${styles.termOfServiceButton}`} onClick={() => { window.open("https://www.termsofservicegenerator.net/live.php?token=J5opv8zwCjKfh11SjSS1W5mS4kVFAjuS"); }} value="View Full Terms" />
                  <label htmlFor="termOfService" className={`${styles.termOfServiceLabel}`}>
                    <Field id="termOfService" type="checkbox" name="termsOfService" />
                    <span>Accept Terms of Service</span>
                  </label>
                </> : null
              }

            </div>
            <div className={styles.buttonsContainer}>
              {
                currentPage == 1 ? 
                <Link href="/">
                  <a className={`secondLayer ${styles.loginPage}`}>Ops! get me back to Login</a>
                </Link> : null
              }
              {
                currentPage > 1 ? 
                <input type="button" value="Back" className={`secondLayer ${styles.backButton}`} onClick={() => { SetCurrentPage(currentPage - 1)}} /> : null
              }
              {
                currentPage < 5 ? 
                <input type="button" value="Next" id="nextButton" className={`secondLayer ${styles.nextButton}`} onClick={() => { SetCurrentPage(currentPage + 1) }} />: null
              }
              {
                currentPage == 5 ? 
                <input type="button" value="Save" className={`secondLayer ${styles.registerUser}`} onClick={() => { RegisterUser(values) }} />: null
              }
            </div>
          </form>
        )}</Formik>
      </div>
    </Layout>
  )
}