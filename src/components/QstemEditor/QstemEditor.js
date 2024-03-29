import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
//draft js part
import { EditorState, convertToRaw, convertFromRaw, Modifier } from "draft-js";
import draftToHtml from "draftjs-to-html";
import { Editor } from "react-draft-wysiwyg";
//actions
//ant part
import { Row, Col, Form, Input, Button, notification } from "antd";
import "../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";

import axios from "axios";
import "./QstemEditor.scss";
import { useNavigate } from "react-router-dom";

// import Button from "../Button/Button.js";
import { display } from "@mui/system";

var ObjectID = require("bson-objectid");

function QstemEditor(props) {
	const [objective, setObjective] = useState();
	const updateObjective = (e) => {
		setObjective(e.target.value);
	};
	const navigate = useNavigate();
	const [uploadImages, setUploadImages] = useState([]);
	const cid = props.cid;
	const [template, setTemplate] = useState([]);
	const [answer, setAnswer] = useState();
	const [explanation, setExplanation] = useState();

	const templateList = [
		"Which is most likely to occur if ... ? ",
		"Which is the difference between ... and ... ? ",
		"Which best explains the similarity between ... and ... ?",
		"... is a problem because ... . Which is a possible solution for this? ",
		"Which best explains how  ... affect ... ?",
		"Which best explains the meaning of ...?",
		"Which best explains the importance of ... ?",
		"Which best explains the relationship between  ... and  ...?",
		"Which best explains the cause of ...?",
		"Which is an example of ...?",
	];
	const templatelist_kor = [
		"다음 중 ...의 경우 발생할 수 있는 일로 가장 적합한 것은 무엇인가?",
		"다음 중 ...와 ...의 차이를 가장 잘 설명한 것은 무엇인가?",
		"다음 중 ...와 ...의 공통점을 가장 잘 설명한 것은 무엇인가?",
		"...로 인해 ... 라는 문제가 발생한다. 다음 중 이에 대한 해결책으로 가장 적합한 것은?",
		"다음 중 ...가 ...에 주는 영향에 대한 설명으로 가장 적절한 것은? ",
		"다음 중 ...의 의미를 가장 잘 설명하는 것은?",
		"다음 중 ...가 중요한 이유를 가장 잘 설명하는 것은?",
		"다음 중 ...와 ...의 연관성에 대한 설명으로 가장 적절한 것은?",
		"다음 중 ...가 발생하는 원인에 대해 가장 잘 설명한 것은?",
		"다음 중 ...의 예시로 가장 적절한 것은? ",
	];
	const ITEM_HEIGHT = 48;
	const ITEM_PADDING_TOP = 8;
	const MenuProps = {
		PaperProps: {
			style: {
				maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
				width: 250,
			},
		},
	};
	// function uploadCallback(file) {
	// 	let uploadedImages = uploadImages;
	// 	const imageObject = {
	// 		file: file,
	// 		localSrc: URL.createObjectURL(file),
	// 	};
	// 	uploadedImages.push(imageObject);
	// 	setUploadImages(uploadedImages);
	// 	return new Promise((resolve, reject) => {
	// 		resolve({ data: { link: imageObject.localSrc } });
	// 	});
	// }

	const selectTemplate = (e) => {
		setTemplate(e.target.value);
		setEditorState({
			editorState: insertTemplate(e.target.value, editorState),
		});
	};

	function insertTemplate(templateToInsert, editorState) {
		const currentContent = editorState.editorState.getCurrentContent(),
			currentSelection = editorState.editorState.getSelection();
		const newContent = Modifier.replaceText(
			currentContent,
			currentSelection,
			templateToInsert
		);
		const newEditorState = EditorState.push(
			editorState.editorState,
			newContent,
			"insert-characters"
		);
		return EditorState.forceSelection(
			newEditorState,
			newContent.getSelectionAfter()
		);
	}

	const post = "";

	const description = post ? post.description : "";

	const editorContent = post
		? EditorState.createWithContent(convertFromRaw(JSON.parse(description)))
		: EditorState.createEmpty();
	const [editorState, setEditorState] = useState({
		editorState: editorContent,
	});
	const handleEditorChange = (editorState) => {
		setEditorState({ editorState });
	};
	const uid = useSelector((state) => state.userInfo.userInfo._id);

	
	const setMsg = props.setMsg;
	const checkForm = (qobj) => {
		const rawString = qobj.raw_string;
		const wordcount = rawString.split(" ").filter((word) => word !== "").length;
		if (rawString === null || wordcount<1) {
			alert("문제 내용을 입력해 주세요.");
			return;
		}
		if (answer === null || answer.match(/^\s*$/) !== null) {
			alert("정답을 입력해 주세요.");
			return;
		}
		if (qobj.learning_objective === null) {
			alert("학습 목표를 입력해 주세요.");
			return;
		}
	};
	const submitStem = () => {
		const qstemObj = {
			author: ObjectID(uid),
			stem_text: JSON.stringify(
				convertToRaw(editorState.editorState.getCurrentContent())
			),
			raw_string: editorState.editorState
				.getCurrentContent()
				.getPlainText("\u0001"),
			action_verb: props.verbs,
			keyword: props.keywords,
			class: ObjectID(cid),
			options: [],
			optionSets: [],
			learning_objective: objective,
		};

		const rawString = qstemObj.raw_string;
		const wordcount = rawString.split(" ").filter((word) => word !== "").length;
		if (rawString === null || wordcount < 3) {
			alert("문제 내용을 입력해 주세요.");
			return;
		}
		if (answer === null || answer.match(/^\s*$/) !== null) {
			alert("정답을 입력해 주세요.");
			return;
		}
		if (qstemObj.learning_objective === null) {
			alert("학습 목표를 입력해 주세요.");
			return;
		}
		axios
			.post(`${process.env.REACT_APP_BACK_END}/question/qstem/create`, {
				qstemObj: qstemObj,
				cid: cid,
				answer_text: answer,
			})
			.then((res) => {
				axios

					.post(`${process.env.REACT_APP_BACK_END}/question/option/create`, {
						optionData: {
							author: ObjectID(uid),
							option_text: answer,
							is_answer: true,
							explanation: explanation,
							class: ObjectID(cid),
							qstem: ObjectID(res.data.data),
							plausible: { similar: [], difference: [] },
							cluster: [],
						},
						dependency: [],
					})

					.then((res2) => {
						setMsg("Successfuly made question stem!");
						if (props.classType) {
							navigate("/" + cid + "/question/" + res.data.data + "/create");
						} else {
							navigate("/" + cid + "/question/" + res.data.data);
						}
					});
			});
	};

	const submitAndEnd = () => {
		const qstemObj = {
			author: ObjectID(uid),
			stem_text: JSON.stringify(
				convertToRaw(editorState.editorState.getCurrentContent())
			),
			raw_string: editorState.editorState
				.getCurrentContent()
				.getPlainText("\u0001"),
			action_verb: props.verbs,
			keyword: props.keywords,
			class: ObjectID(cid),
			options: [],
			optionSets: [],
			learning_objective: objective,
		};

		const rawString = qstemObj.raw_string;
		const wordcount = rawString.split(" ").filter((word) => word !== "").length;
		if (rawString === null || wordcount < 3) {
			alert("문제 내용을 입력해 주세요.");
			return;
		}
		if (answer === null || answer.match(/^\s*$/) !== null) {
			alert("정답을 입력해 주세요.");
			return;
		}
		if (qstemObj.learning_objective === null) {
			alert("학습 목표를 입력해 주세요.");
			return;
		}
		axios
			.post(`${process.env.REACT_APP_BACK_END}/question/qstem/create`, {
				qstemObj: qstemObj,
				cid: cid,
				answer_text: answer,
			})
			.then((res) => {
				axios
					.post(`${process.env.REACT_APP_BACK_END}/question/option/create`, {
						optionData: {
							author: ObjectID(uid),
							option_text: answer,
							is_answer: true,
							explanation: explanation,
							class: ObjectID(cid),
							qstem: ObjectID(res.data.data),
							plausible: { similar: [], difference: [] },
							cluster: [],
						},
						dependency: [],
					})
					.then((res2) => {
						setMsg("Successfuly made question stem!");
						navigate("/" + cid + "/question/" + res.data.data);
					});
			});
	};
	return (
		<div id="qstemeditor">
			<h3>학습 목표</h3>

			<TextField
				fullWidth
				value={objective}
				onChange={updateObjective}
				placeholder="이 문제를 풂으로서 배우게 되는 내용은 무엇인가요?"
				className="objective-input"
			/>
			{/* <textarea value ={objective} onChange={updateObjective} placeholder="Learning Objective"/> */}
			<div>
				<h3>문제 내용</h3>
				<div className="helper-text"></div>
				<FormControl id="template">
					<InputLabel id="demo-multiple-checkbox-label">
						문제 형식 예시
					</InputLabel>
					<Select
						labelId="demo-multiple-checkbox-label"
						id="demo-multiple-checkbox"
						value={template}
						onChange={selectTemplate}
						input={<OutlinedInput label="문제 형식 예시" />}
						MenuProps={MenuProps}
					>
						{templatelist_kor.map((t) => (
							<MenuItem key={t} value={t}>
								{/* <Checkbox checked={template.indexOf(t) > -1} /> */}
								<ListItemText primary={t} />
								{/* <div>Import</div> */}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			</div>
			<div>
				<div>
				<Row justify="center">
					<Col span="12">
						<Form
							onFinish={submitStem}
							labelCol={{ span: 4 }}
							wrapperCol={{ span: 30 }}
						>
							<Form.Item name="description">
								<div className="qstem-editor">
									<Editor
										localization={{
											locale: 'ko',
										  }}
										editorState={editorState.editorState}
										onEditorStateChange={handleEditorChange}
										wrapperClassName="wrapper-class"
										editorClassName="editor"
										placeholder="문제 내용을 입력해 주세요."
										toolbarClassName="toolbar-class"
										toolbar={{
											// inDropdown: 해당 항목과 관련된 항목을 드롭다운으로 나타낼것인지
											list: { inDropdown: true },
											textAlign: { inDropdown: true },
											link: { inDropdown: true },
											history: { inDropdown: false },
											// image: { uploadCallback: uploadCallback },
										}}
									/>
								</div>
							</Form.Item>
						</Form>
					</Col>
				</Row>
				</div>
				
				<div>
					<h3>정답</h3>
					<div className="helper-text">
						입력해 주신 내용은 이 문제의 정답 선택지가 됩니다.
					</div>
					<TextField
						fullWidth
						value={answer}
						onChange={(e) => setAnswer(e.target.value)}
						placeholder="문제의 정답을 입력해 주세요."
						className="objective-input"
					/>
					<div className="helper-text">정답에 대한 해설을 입력해 주세요.</div>
					<TextField
						fullWidth
						value={explanation}
						onChange={(e) => setExplanation(e.target.value)}
						placeholder="정답에 대한 해설을 입력해 주세요."
						className="objective-input"
					/>
				</div>

				<div style={{ textAlign: "center", width: "100%" }}>
					<Button
						className="submit"
						style={{ margin: "16px auto", display: "block" }}
						onClick={submitAndEnd}
						type="primary"
						htmlType="submit"
					>
						완료
					</Button>
					<Button
						className="submit"
						style={{ margin: "16px auto", display: "block" }}
						onClick={submitStem}
						type="primary"
						htmlType="submit"
					>
						선택지 추가로 만들기
					</Button>
				</div>
			</div>
		</div>
	);
}

export default QstemEditor;
