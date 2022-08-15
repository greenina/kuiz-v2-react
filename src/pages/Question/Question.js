import React, {useEffect, useState} from "react";
import { Link } from 'react-router-dom';
import { useParams } from "react-router";
import axios from 'axios';
import draftToHtml from 'draftjs-to-html';
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";



import Button from "../../components/Button/Button";

import "./Question.scss";
import { is } from "immutable";

var ObjectID = require("bson-objectid");


const Question = (props) => {
	const navigate = useNavigate()
	props.funcNav(true);
	const qid = useParams().id 
	const [options, setOptions] = useState([])
	const [qinfo, setQinfo] = useState()
	const [stem, setStem] = useState()
	const [ansVisible, setAnsVisible] = useState(false)
	const cid = useParams().cid
	const [selected, setSelected] = useState()
	const cType = useSelector((state) => state.userInfo.cType)
	const [answer, setAnswer] = useState()
	const uid = useSelector((state) => state.userInfo.userInfo._id)
	const [isOptionValid, setIsOptionValid] = useState()
	const getQinfo = (qid) => {
		console.log("QID:",qid)
		axios.get("http://localhost:4000/question/detail/load?qid="+qid).then(
			(res)=> {
				console.log("Qinfo:",res.data.data)
				if(res.data.data.options.length>1) {
					const ansList = res.data.data.options.filter((o) => o.is_answer===true)
					const disList = res.data.data.options.filter((o) => o.is_answer === false)
					if(ansList.length>0 && disList.length>0){
						const optionList = [ansList[0]].concat(disList)
						if(disList.length>4){
							setOptions(optionList.slice(0,4))
						} else {
							setOptions(optionList)
						}
					} else {
						setIsOptionValid(false)
					}
				} else {
					console.log("Not enough")
					setIsOptionValid(false)
				}
				setQinfo(res.data.data.qinfo)
				res.data.data.options.map((o, i) => {
					if(o.is_answer) setAnswer(i)
				})
			}
		)
	}
	// getQinfo(qid)
	const isLoggedIn = useSelector((state)=> state.userInfo.isLoggedIn)
	const checkAnswer = () => {
		if(!ansVisible){
			axios.post("http://localhost:4000/question/solve",{qid:qid, uid:uid, initAns: options[selected]._id, isCorrect:(selected === answer),optionSet:options.map((o)=>ObjectID(o._id))}).then(
			(res)=>{
				console.log("success:",res.data.success)
			}
			)
		}
		setAnsVisible(!ansVisible)
	}
	useEffect(()=>{
		if(isLoggedIn) {
			getQinfo(qid)
			console.log("cType:",cType)
		} else {
			navigate("/login")
		}
	},[])

	return (
		<div id="question-screen-wrapper">
			<div id="question-nav">Question List &gt; #123</div>
			<div id="question-screen">
				<Link to={"/"+cid+(cType?"":"/qlist")} style={{ textDecoration: 'none', color:'#000000' }}>
					<div id="return-button" >
						<i className="fa-solid fa-arrow-left" ></i> Back to Question List
					</div>
				</Link>
				
				{qinfo && <div dangerouslySetInnerHTML={{__html: draftToHtml(JSON.parse(qinfo.stem_text))}} className="introduce-content"/>}
				{isOptionValid?
				<div id="question-options">
					{options && options.map((option, index)=><div className="question-option-item"><input checked={selected === index} type="radio" onChange={(e) => setSelected(index)}/>{option.option_text}</div>)}
				</div>:
				<div>Not enough options yet</div>
				}
				

				{isOptionValid?
				<div id="question-explanation">
					<div id="hide-answer" onClick={() => checkAnswer()}>
						{ansVisible?"Hide":"Show"} Answer
					</div>
					{ansVisible && (cType?
						<div id="answer-wrapper">
								{options && options.map((option)=>
									<div className="answer-option">
										<div className="option-text">{option.option_text}</div>
										<div className="option-exp">{option.explanation}</div>
									</div>)
								}
							</div>:
						<div className="explanation">
							<div>
								answer : {options[answer].option_text}
							</div>
							explanation : {qinfo.explanation}
						</div>)
					}
					
				</div>:<div></div>}
				{cType?<Link to={"/"+cid+"/question/"+qid+"/create"}><div>MAKE MORE OPTIONS</div></Link>:<></>}
			</div>
		</div>
	);
}

export default Question;
