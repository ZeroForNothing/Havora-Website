import * as types from '../types'
const initalState={
    user : {},
    loading : false,
    error: null
}
export const userReducer = (state = initalState, action) =>{
    switch(action.type){
        case types.Get_User:
            return {
                ...state,
                user : action.payload,
                loading : false,
                error:null
            }
        default:
            return state
    }
}