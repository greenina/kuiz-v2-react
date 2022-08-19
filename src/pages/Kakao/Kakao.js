import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, logoutUser, enrollClass } from "../../features/authentication/userSlice";
import axios from "axios";
import { useNavigate } from "react-router";
import { Send } from "@mui/icons-material";


const Kakao = (props) => {
    const dispatch = useDispatch();
    const email = useSelector((state) => state.userInfo.email)
    const uInfo = useSelector((state) => state.userInfo.userInfo)

    const href = window.location.href;
    const navigate = useNavigate()
    let params = new URL(document.URL).searchParams;
    let KAKAO_CODE = params.get("code");


    const REDIRECT_URI = `${process.env.REACT_APP_REQ_END}:3000/kakaologin`
    const getKakaoToken = () => {
        fetch(`https://kauth.kakao.com/oauth/token`,{
            method:'POST',
            headers:{'Content-Type':'application/x-www-form-urlencoded'},
            body:`grant_type=authorization_code&client_id=${process.env.REACT_APP_REST_API_KEY}&redirect_uri=${REDIRECT_URI}&code=${KAKAO_CODE}`,
        })
            .then(res => res.json())
            .then(data => {
                console.log("DATA:",data)
                if(data.access_token) {
                    window.Kakao.init(process.env.REACT_APP_REST_API_KEY)
                    window.Kakao.Auth.setAccessToken(data.access_token)
                    getUserInfo()
                } else {
                    console.log("Failed to get data")
                }
            })
    }

    const getUserInfo = async () => {
        try {

            let data = await window.Kakao.API.request({
                url: "/v2/user/me"
            })

            

            axios.post(`${process.env.REACT_APP_REQ_END}:${process.env.REACT_APP_PORT}/auth/register`,{email: email, name:data.properties.nickname, image: data.properties.profile_image}).then(
                (res) => {
                    if(res.data.success){
                        console.log("success!")
                        dispatch(loginUser(res.data.user))
                        if(res.data.user.classes.length!=0){
                            console.log("cid:",res.data.user.classes[0])
                            dispatch(enrollClass({cid:res.data.user.classes[0], cType:res.data.cType}))
                            if(res.data.cType) {
                                navigate('/'+res.data.user.classes[0])
                            } else {
                                navigate('/'+res.data.user.classes[0] +'/qlist')
                            }
                            
                        } else {
                            navigate('/enroll')
                        }
                    }
                }
            )

        } catch (err) {
            console.log(err)
        }
    }
    useEffect(()=>{
        console.log("uinfo:",uInfo)
        // if(uInfo!=={}) {
        //     navigate('/'+uInfo.classes[0])
        // } else {
        //     getKakaoToken() 
        // }
        getKakaoToken() 
          
             
    },[])

    return (
    
        <div>
            <div>
                <div>잠시만 기다려 주세요! 로그인 중입니다.</div>
            </div>
        </div> 
    )

}

export default Kakao;