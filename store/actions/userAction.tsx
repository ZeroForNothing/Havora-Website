import * as types from '../types'
type User = {
    email: string,
    name: string,
    code : number,
    picToken: string,
    profilePicType: string,
    newAcc: number,
    settings: string
}
export const fetchUser = (data : User) => async dispatch => {
    dispatch({
        type : types.Get_User,
        payload : data
    })
}