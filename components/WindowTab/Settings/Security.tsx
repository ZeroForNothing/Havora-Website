import { Field, Formik } from "formik";
import { useEffect, useState } from "react";

import styles from '../../../styles/WindowTab/Profile.module.css'
import { ShowError } from "../../fields/error";
import { InputField } from '../../fields/InputField'

export default function Security({socket, editSecurityNav, SetEditPassword, editPassword, ...props}){

    const [oldPassword,SetOldPassword] = useState(false)
    const [newPassword,SetNewPassword] = useState(false)
    const [confPassword,SetConfPassword] = useState(false)

    useEffect(()=>{
        socket.on("editPassword", function(error) {
            SetOldPassword(false);
            SetNewPassword(false);
            SetConfPassword(false);
            if (error == null) {
              alert("Success changing password")
            } else {
              let text = '';
              if (error == 1){
                text = "All fields must be filled and at least 8 characters"
                SetOldPassword(false);
                SetNewPassword(false);
                SetConfPassword(false);
              }
              else if (error == 2) {
                text = "Old password is Incorrect"
                SetOldPassword(true)
              }
              else if (error == 3){
                text = "New Password must be different than old password"
                SetNewPassword(false)
              }
              else if (error == 4){
                text = "Confirmation Password doesn't match"
                SetConfPassword(false)
              }
              else {
                text = "Something went wrong. Try refreshing page";
              }
              ShowError(text)
            }
          })
    }, [socket])

    return <>
        {
        editSecurityNav?<>
          <div className={`MainDisplay Security`}>
            
            {
                editPassword ? <>
            <Formik onSubmit={(values) => {  }} initialValues={{
                oldPassword: "",
                newPassword: "",
                confPassword: ""
            }}>{({ values }) => (
                <form className={`${styles.formContainer}`}>
                
                  
                    <label>Old Password</label>
                    <Field name="oldPassword" type="password" placeholder="Type your password..." maxLength={50} component={InputField}  errorState={oldPassword}/>
                  
                    <label>New Password</label>
                    <Field name="newPassword" type="password" placeholder="ex. bG0J5GW2g^16%klm" maxLength={50} component={InputField} errorState={newPassword}/>

                    <label>Confirm Password</label>
                    <Field name="confPassword" type="password" placeholder="Re-type your new password..." maxLength={50} component={InputField} disabled={false}  errorState={confPassword}/>
                    <div className={`NavButton pickedInput`} onClick={()=>{
                        socket.emit("editPassword", {
                            oldPassword: values.oldPassword,
                            confPassword: values.confPassword,
                            newPassword: values.newPassword
                        }); 
                    }}>
                        <span className={`bi bi-save`}></span>
                        <p>Save</p>
                    </div>
              </form>
            )}</Formik>
            
            </> : null
            }
                
          </div>
        </> : null
      }
    </>
}