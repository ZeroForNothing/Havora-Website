import * as types from '../types'
type User = {
    normalCoin : number,
    zeroCoin: number,
    picToken : string,
    profilePicType : number,
    settings : string,
    code : number,
    name : string
}
export const fetchUser = (data) => async dispatch => {
    dispatch({
        type : types.Get_User,
        payload : {
            normalCoin : data.normalCoin,
            zeroCoin: data.zeroCoin,
            picToken : data.picToken,
            profilePicType : data.profilePicType,
            settings : data.settings,
            code : data.userCode,
            name : data.username
        } as User
    })
}