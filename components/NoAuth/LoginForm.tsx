import styles from '../../styles/Login.module.css'
import Link from 'next/link'
import { Field, Formik } from "formik"
import Layout from '../fields/Layout'
import { InputField } from '../fields/InputField'
import { ShowError } from '../fields/error'

export default function Login() {

    async function LoginUser(data) {
        var userAgent = navigator.userAgent.toLowerCase();
        let returnData = { email: data.email, password: data.password, client: userAgent.indexOf(' electron/') > -1 };
        const response = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(returnData)
        });
        if (response.ok) {
            window.location.reload();
        } else {
            ShowError("Invalid Email or Password")
        }
    }

    return (
        <Layout title="Zero for Nothing | Login">
            <div className={`${"baseLayer"} ${styles.logo}`}>
            </div>
            <div className={`${"baseLayer"} ${styles.signInMainContainer}`}>
                <Formik onSubmit={(values) => { LoginUser(values) }} initialValues={{
                    email: "asd@asd.com",
                    password: "asdasdasd"
                }}>{({ handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                        <Field name="email" type="email" placeholder="My Email..." component={InputField} />
                        <Field name="password" type="password" placeholder="My Password..." component={InputField} />
                        <input value="Login" type="submit" key="Login" className={`${"secondLayer"} ${styles.Login}`} />
                    </form>
                )}</Formik>
                <Link href="/signup">
                    <a className={`${"secondLayer"} ${styles.userInteraction}`}>Register with new account</a>
                </Link>
                <div className={`${styles.otherMediaLogin}`}>
                    <span className={`${"secondLayer"}`}></span>
                    <div>
                        <input type="button" value="Google" className={`${"secondLayer"} ${styles.google}`} />
                        <input type="button" value="Facebook" className={`${"secondLayer"} ${styles.facebook}`} />
                        <input type="button" value="Apple" className={`${"secondLayer"} ${styles.apple}`} />
                    </div>
                </div>
            </div>
        </Layout>
    )
}


