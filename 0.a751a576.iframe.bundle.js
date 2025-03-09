"use strict";(globalThis.webpackChunkstory=globalThis.webpackChunkstory||[]).push([[0],{"../tts-react/dist/hook.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{N:()=>useTts});var react=__webpack_require__("../../node_modules/react/index.js");const punctuationRgx=/[^\P{P}'/-]+/gu,stripPunctuation=text=>text.replace(punctuationRgx,""),noop=()=>{};var _Controller_instances,_Controller_target,_Controller_synthesizer,_Controller_dispatchBoundaries,_Controller_fetchAudioData,_Controller_marks,_Controller_text,_Controller_lang,_Controller_aborter,_Controller_initialized,_Controller_initWebSpeechVoice,_Controller_attachAudioSource,_Controller_dispatchEnd,_Controller_dispatchError,_Controller_dispatchReady,_Controller_dispatchPlaying,_Controller_dispatchPaused,_Controller_dispatchBoundary,_Controller_dispatchVolume,_Controller_dispatchRate,_Controller_dispatchPitch,_Controller_playHtmlAudio,_Controller_getPollySpeechMarkForAudioTime,_Controller_getBoundaryWordCharLength,_Controller_clamp,_Controller_recycle,_Controller_utteranceInit,_Controller_htmlAudioInit,Events,__awaiter=function(thisArg,_arguments,P,generator){return new(P||(P=Promise))((function(resolve,reject){function fulfilled(value){try{step(generator.next(value))}catch(e){reject(e)}}function rejected(value){try{step(generator.throw(value))}catch(e){reject(e)}}function step(result){result.done?resolve(result.value):function adopt(value){return value instanceof P?value:new P((function(resolve){resolve(value)}))}(result.value).then(fulfilled,rejected)}step((generator=generator.apply(thisArg,_arguments||[])).next())}))},__classPrivateFieldGet=function(receiver,state,kind,f){if("a"===kind&&!f)throw new TypeError("Private accessor was defined without a getter");if("function"==typeof state?receiver!==state||!f:!state.has(receiver))throw new TypeError("Cannot read private member from an object whose class did not declare it");return"m"===kind?f:"a"===kind?f.call(receiver):f?f.value:state.get(receiver)},__classPrivateFieldSet=function(receiver,state,value,kind,f){if("m"===kind)throw new TypeError("Private method is not writable");if("a"===kind&&!f)throw new TypeError("Private accessor was defined without a setter");if("function"==typeof state?receiver!==state||!f:!state.has(receiver))throw new TypeError("Cannot write private member to an object whose class did not declare it");return"a"===kind?f.call(receiver,value):f?f.value=value:state.set(receiver,value),value};!function(Events){Events.BOUNDARY="boundary",Events.END="end",Events.ERROR="error",Events.PAUSED="paused",Events.PITCH="pitch",Events.PLAYING="playing",Events.RATE="rate",Events.READY="ready",Events.VOLUME="volume"}(Events||(Events={}));class Controller extends EventTarget{constructor(options){var _a,_b;super(),_Controller_instances.add(this),_Controller_target.set(this,void 0),_Controller_synthesizer.set(this,void 0),_Controller_dispatchBoundaries.set(this,!0),_Controller_fetchAudioData.set(this,(()=>Promise.resolve({audio:"",marks:[]}))),_Controller_marks.set(this,[]),_Controller_text.set(this,""),_Controller_lang.set(this,""),_Controller_aborter.set(this,new AbortController),_Controller_initialized.set(this,!1),__classPrivateFieldSet(this,_Controller_lang,null!==(_a=null==options?void 0:options.lang)&&void 0!==_a?_a:__classPrivateFieldGet(this,_Controller_lang,"f"),"f"),__classPrivateFieldSet(this,_Controller_synthesizer,globalThis.speechSynthesis,"f"),__classPrivateFieldSet(this,_Controller_target,new SpeechSynthesisUtterance(__classPrivateFieldGet(this,_Controller_text,"f")),"f"),__classPrivateFieldSet(this,_Controller_dispatchBoundaries,null!==(_b=null==options?void 0:options.dispatchBoundaries)&&void 0!==_b?_b:__classPrivateFieldGet(this,_Controller_dispatchBoundaries,"f"),"f"),(null==options?void 0:options.fetchAudioData)?(__classPrivateFieldSet(this,_Controller_target,__classPrivateFieldSet(this,_Controller_synthesizer,new Audio,"f"),"f"),__classPrivateFieldSet(this,_Controller_fetchAudioData,options.fetchAudioData,"f")):(__classPrivateFieldGet(this,_Controller_instances,"m",_Controller_initWebSpeechVoice).call(this,null==options?void 0:options.voice),globalThis.speechSynthesis&&(globalThis.speechSynthesis.onvoiceschanged=()=>{__classPrivateFieldGet(this,_Controller_instances,"m",_Controller_initWebSpeechVoice).call(this,null==options?void 0:options.voice)}))}get synthesizer(){return __classPrivateFieldGet(this,_Controller_synthesizer,"f")}get target(){return __classPrivateFieldGet(this,_Controller_target,"f")}set text(value){__classPrivateFieldSet(this,_Controller_text,value,"f"),__classPrivateFieldGet(this,_Controller_target,"f")instanceof SpeechSynthesisUtterance&&(__classPrivateFieldGet(this,_Controller_target,"f").text=value)}get paused(){return __classPrivateFieldGet(this,_Controller_synthesizer,"f").paused}get rate(){return __classPrivateFieldGet(this,_Controller_synthesizer,"f")instanceof HTMLAudioElement?__classPrivateFieldGet(this,_Controller_synthesizer,"f").playbackRate:__classPrivateFieldGet(this,_Controller_target,"f").rate}set rate(value){const clamped=__classPrivateFieldGet(this,_Controller_instances,"m",_Controller_clamp).call(this,parseFloat(value.toPrecision(3)),.1,10);Number.isNaN(clamped)||(__classPrivateFieldGet(this,_Controller_instances,"m",_Controller_dispatchRate).call(this,clamped),__classPrivateFieldGet(this,_Controller_synthesizer,"f")instanceof HTMLAudioElement&&(__classPrivateFieldGet(this,_Controller_synthesizer,"f").defaultPlaybackRate=clamped,__classPrivateFieldGet(this,_Controller_synthesizer,"f").playbackRate=clamped),__classPrivateFieldGet(this,_Controller_target,"f")instanceof SpeechSynthesisUtterance&&(__classPrivateFieldGet(this,_Controller_target,"f").rate=clamped))}get pitch(){return __classPrivateFieldGet(this,_Controller_target,"f")instanceof SpeechSynthesisUtterance?__classPrivateFieldGet(this,_Controller_target,"f").pitch:-1}set pitch(value){if(__classPrivateFieldGet(this,_Controller_target,"f")instanceof SpeechSynthesisUtterance){const clamped=__classPrivateFieldGet(this,_Controller_instances,"m",_Controller_clamp).call(this,parseFloat(value.toPrecision(2)),0,2);Number.isNaN(clamped)||(__classPrivateFieldGet(this,_Controller_instances,"m",_Controller_dispatchPitch).call(this,clamped),__classPrivateFieldGet(this,_Controller_target,"f").pitch=clamped)}}get volumeMin(){return 0}get volumeMax(){return 1}get volume(){return __classPrivateFieldGet(this,_Controller_target,"f").volume}set volume(value){const clamped=__classPrivateFieldGet(this,_Controller_instances,"m",_Controller_clamp).call(this,parseFloat(value.toPrecision(2)),this.volumeMin,this.volumeMax);Number.isNaN(clamped)||(__classPrivateFieldGet(this,_Controller_instances,"m",_Controller_dispatchVolume).call(this,clamped),__classPrivateFieldGet(this,_Controller_target,"f").volume=clamped)}get preservesPitch(){return __classPrivateFieldGet(this,_Controller_synthesizer,"f")instanceof HTMLAudioElement&&__classPrivateFieldGet(this,_Controller_synthesizer,"f").preservesPitch}set preservesPitch(value){__classPrivateFieldGet(this,_Controller_synthesizer,"f")instanceof HTMLAudioElement&&(__classPrivateFieldGet(this,_Controller_synthesizer,"f").preservesPitch=value)}get lang(){return __classPrivateFieldGet(this,_Controller_lang,"f")}set lang(value){__classPrivateFieldGet(this,_Controller_target,"f")instanceof SpeechSynthesisUtterance&&(__classPrivateFieldSet(this,_Controller_lang,value,"f"),__classPrivateFieldGet(this,_Controller_target,"f").lang=value,__classPrivateFieldGet(this,_Controller_target,"f").voice=null,__classPrivateFieldGet(this,_Controller_instances,"m",_Controller_initWebSpeechVoice).call(this))}init(){return __awaiter(this,void 0,void 0,(function*(){__classPrivateFieldGet(this,_Controller_initialized,"f")||(__classPrivateFieldGet(this,_Controller_target,"f")instanceof SpeechSynthesisUtterance&&__classPrivateFieldGet(this,_Controller_instances,"m",_Controller_utteranceInit).call(this),__classPrivateFieldGet(this,_Controller_target,"f")instanceof HTMLAudioElement&&(yield __classPrivateFieldGet(this,_Controller_instances,"m",_Controller_htmlAudioInit).call(this)),__classPrivateFieldSet(this,_Controller_initialized,!0,"f"))}))}play(){return __awaiter(this,void 0,void 0,(function*(){__classPrivateFieldGet(this,_Controller_synthesizer,"f")instanceof HTMLAudioElement?yield __classPrivateFieldGet(this,_Controller_instances,"m",_Controller_playHtmlAudio).call(this):__classPrivateFieldGet(this,_Controller_synthesizer,"f").speak(__classPrivateFieldGet(this,_Controller_target,"f"))}))}pause(){__classPrivateFieldGet(this,_Controller_synthesizer,"f").pause()}resume(){return __awaiter(this,void 0,void 0,(function*(){__classPrivateFieldGet(this,_Controller_synthesizer,"f")instanceof HTMLAudioElement?yield __classPrivateFieldGet(this,_Controller_instances,"m",_Controller_playHtmlAudio).call(this):__classPrivateFieldGet(this,_Controller_synthesizer,"f").resume()}))}replay(){return __awaiter(this,void 0,void 0,(function*(){__classPrivateFieldGet(this,_Controller_synthesizer,"f")instanceof HTMLAudioElement?(__classPrivateFieldGet(this,_Controller_synthesizer,"f").load(),yield __classPrivateFieldGet(this,_Controller_instances,"m",_Controller_playHtmlAudio).call(this)):(__classPrivateFieldGet(this,_Controller_synthesizer,"f").resume(),__classPrivateFieldGet(this,_Controller_synthesizer,"f").cancel(),__classPrivateFieldGet(this,_Controller_synthesizer,"f").speak(__classPrivateFieldGet(this,_Controller_target,"f")))}))}cancel(){__classPrivateFieldGet(this,_Controller_synthesizer,"f")instanceof HTMLAudioElement?__classPrivateFieldGet(this,_Controller_synthesizer,"f").load():__classPrivateFieldGet(this,_Controller_synthesizer,"f").cancel()}mute(){return __awaiter(this,void 0,void 0,(function*(){this.volume=0,__classPrivateFieldGet(this,_Controller_synthesizer,"f")instanceof HTMLAudioElement||this.paused||!__classPrivateFieldGet(this,_Controller_synthesizer,"f").speaking||(yield this.replay())}))}unmute(volume){return __awaiter(this,void 0,void 0,(function*(){this.volume=null!=volume?volume:1,__classPrivateFieldGet(this,_Controller_synthesizer,"f")instanceof HTMLAudioElement||this.paused||!__classPrivateFieldGet(this,_Controller_synthesizer,"f").speaking||(yield this.replay())}))}}_Controller_target=new WeakMap,_Controller_synthesizer=new WeakMap,_Controller_dispatchBoundaries=new WeakMap,_Controller_fetchAudioData=new WeakMap,_Controller_marks=new WeakMap,_Controller_text=new WeakMap,_Controller_lang=new WeakMap,_Controller_aborter=new WeakMap,_Controller_initialized=new WeakMap,_Controller_instances=new WeakSet,_Controller_initWebSpeechVoice=function _Controller_initWebSpeechVoice(voice){var _a;if(__classPrivateFieldGet(this,_Controller_target,"f")instanceof SpeechSynthesisUtterance){let voices=globalThis.speechSynthesis.getVoices();voice&&(__classPrivateFieldGet(this,_Controller_target,"f").voice=voice),__classPrivateFieldGet(this,_Controller_lang,"f")&&(voices=voices.filter((voice=>voice.lang===__classPrivateFieldGet(this,_Controller_lang,"f"))),__classPrivateFieldGet(this,_Controller_target,"f").voice=null!==(_a=voices[0])&&void 0!==_a?_a:null,voice&&voice.lang===__classPrivateFieldGet(this,_Controller_lang,"f")&&(__classPrivateFieldGet(this,_Controller_target,"f").voice=voice))}},_Controller_attachAudioSource=function _Controller_attachAudioSource(){return __awaiter(this,void 0,void 0,(function*(){var _a;if(__classPrivateFieldGet(this,_Controller_synthesizer,"f")instanceof HTMLAudioElement){let data=null;try{data=yield __classPrivateFieldGet(this,_Controller_fetchAudioData,"f").call(this,__classPrivateFieldGet(this,_Controller_text,"f"))}catch(err){err instanceof Error&&__classPrivateFieldGet(this,_Controller_instances,"m",_Controller_dispatchError).call(this,err.message)}finally{(null==data?void 0:data.audio)&&(__classPrivateFieldGet(this,_Controller_synthesizer,"f").src=data.audio,__classPrivateFieldSet(this,_Controller_marks,null!==(_a=data.marks)&&void 0!==_a?_a:__classPrivateFieldGet(this,_Controller_marks,"f"),"f"))}}}))},_Controller_dispatchEnd=function _Controller_dispatchEnd(evt){this.dispatchEvent(new CustomEvent(Events.END,{detail:evt}))},_Controller_dispatchError=function _Controller_dispatchError(msg){this.dispatchEvent(new CustomEvent(Events.ERROR,{detail:msg}))},_Controller_dispatchReady=function _Controller_dispatchReady(){this.dispatchEvent(new Event(Events.READY))},_Controller_dispatchPlaying=function _Controller_dispatchPlaying(evt){this.dispatchEvent(new CustomEvent(Events.PLAYING,{detail:evt}))},_Controller_dispatchPaused=function _Controller_dispatchPaused(evt){this.dispatchEvent(new CustomEvent(Events.PAUSED,{detail:evt}))},_Controller_dispatchBoundary=function _Controller_dispatchBoundary(evt,boundary){this.dispatchEvent(new CustomEvent(Events.BOUNDARY,{detail:{evt,boundary}}))},_Controller_dispatchVolume=function _Controller_dispatchVolume(volume){this.dispatchEvent(new CustomEvent(Events.VOLUME,{detail:volume}))},_Controller_dispatchRate=function _Controller_dispatchRate(rate){this.dispatchEvent(new CustomEvent(Events.RATE,{detail:rate}))},_Controller_dispatchPitch=function _Controller_dispatchPitch(pitch){this.dispatchEvent(new CustomEvent(Events.PITCH,{detail:pitch}))},_Controller_playHtmlAudio=function _Controller_playHtmlAudio(){return __awaiter(this,void 0,void 0,(function*(){const audio=__classPrivateFieldGet(this,_Controller_synthesizer,"f");try{yield audio.play()}catch(err){err instanceof Error&&__classPrivateFieldGet(this,_Controller_instances,"m",_Controller_dispatchError).call(this,err.message)}}))},_Controller_getPollySpeechMarkForAudioTime=function _Controller_getPollySpeechMarkForAudioTime(time){const length=__classPrivateFieldGet(this,_Controller_marks,"f").length;let bestMatch=__classPrivateFieldGet(this,_Controller_marks,"f")[0],found=!1,i=1;for(;i<length&&!found;)__classPrivateFieldGet(this,_Controller_marks,"f")[i].time<=time?bestMatch=__classPrivateFieldGet(this,_Controller_marks,"f")[i]:found=!0,i++;return bestMatch},_Controller_getBoundaryWordCharLength=function _Controller_getBoundaryWordCharLength(startIndex){const match=__classPrivateFieldGet(this,_Controller_text,"f").substring(startIndex).match(/.+?\b/);return match?match[0].length:0},_Controller_clamp=function _Controller_clamp(value){let min=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,max=arguments.length>2&&void 0!==arguments[2]?arguments[2]:1;return Math.max(min,Math.min(value,max))},_Controller_recycle=function _Controller_recycle(){return __classPrivateFieldGet(this,_Controller_aborter,"f").abort(),__classPrivateFieldSet(this,_Controller_aborter,new AbortController,"f"),__classPrivateFieldGet(this,_Controller_aborter,"f").signal},_Controller_utteranceInit=function _Controller_utteranceInit(){if(__classPrivateFieldGet(this,_Controller_target,"f")instanceof SpeechSynthesisUtterance){const signal=__classPrivateFieldGet(this,_Controller_instances,"m",_Controller_recycle).call(this);__classPrivateFieldGet(this,_Controller_target,"f").addEventListener("end",__classPrivateFieldGet(this,_Controller_instances,"m",_Controller_dispatchEnd).bind(this),{signal}),__classPrivateFieldGet(this,_Controller_target,"f").addEventListener("start",__classPrivateFieldGet(this,_Controller_instances,"m",_Controller_dispatchPlaying).bind(this),{signal}),__classPrivateFieldGet(this,_Controller_target,"f").addEventListener("resume",__classPrivateFieldGet(this,_Controller_instances,"m",_Controller_dispatchPlaying).bind(this),{signal}),__classPrivateFieldGet(this,_Controller_target,"f").addEventListener("pause",__classPrivateFieldGet(this,_Controller_instances,"m",_Controller_dispatchPaused).bind(this),{signal}),__classPrivateFieldGet(this,_Controller_target,"f").addEventListener("error",(evt=>{__classPrivateFieldGet(this,_Controller_instances,"m",_Controller_dispatchError).call(this,evt.error)}),{signal}),__classPrivateFieldGet(this,_Controller_lang,"f")&&(__classPrivateFieldGet(this,_Controller_target,"f").lang=__classPrivateFieldGet(this,_Controller_lang,"f")),__classPrivateFieldGet(this,_Controller_dispatchBoundaries,"f")&&__classPrivateFieldGet(this,_Controller_target,"f").addEventListener("boundary",(evt=>{var _a;const{charIndex:startChar}=evt,endChar=startChar+(null!==(_a=evt.charLength)&&void 0!==_a?_a:__classPrivateFieldGet(this,_Controller_instances,"m",_Controller_getBoundaryWordCharLength).call(this,startChar)),word=__classPrivateFieldGet(this,_Controller_text,"f").substring(startChar,endChar);word&&!(text=>{const trimmed=text.trim();return punctuationRgx.test(trimmed)&&1===trimmed.length})(word)&&__classPrivateFieldGet(this,_Controller_instances,"m",_Controller_dispatchBoundary).call(this,evt,{word,startChar,endChar})}),{signal}),__classPrivateFieldGet(this,_Controller_instances,"m",_Controller_dispatchReady).call(this)}},_Controller_htmlAudioInit=function _Controller_htmlAudioInit(){return __awaiter(this,void 0,void 0,(function*(){if(__classPrivateFieldGet(this,_Controller_target,"f")instanceof HTMLAudioElement){const target=__classPrivateFieldGet(this,_Controller_target,"f");__classPrivateFieldGet(this,_Controller_target,"f").addEventListener("canplay",__classPrivateFieldGet(this,_Controller_instances,"m",_Controller_dispatchReady).bind(this),{once:!0}),__classPrivateFieldGet(this,_Controller_target,"f").addEventListener("playing",__classPrivateFieldGet(this,_Controller_instances,"m",_Controller_dispatchPlaying).bind(this)),__classPrivateFieldGet(this,_Controller_target,"f").addEventListener("pause",__classPrivateFieldGet(this,_Controller_instances,"m",_Controller_dispatchPaused).bind(this)),__classPrivateFieldGet(this,_Controller_target,"f").addEventListener("ended",__classPrivateFieldGet(this,_Controller_instances,"m",_Controller_dispatchEnd).bind(this)),__classPrivateFieldGet(this,_Controller_target,"f").addEventListener("error",(()=>{const error=target.error;__classPrivateFieldGet(this,_Controller_instances,"m",_Controller_dispatchError).call(this,null==error?void 0:error.message)})),__classPrivateFieldGet(this,_Controller_dispatchBoundaries,"f")&&__classPrivateFieldGet(this,_Controller_target,"f").addEventListener("timeupdate",(evt=>{const currentTime=1e3*target.currentTime,mark=__classPrivateFieldGet(this,_Controller_instances,"m",_Controller_getPollySpeechMarkForAudioTime).call(this,currentTime);mark&&!this.paused&&__classPrivateFieldGet(this,_Controller_instances,"m",_Controller_dispatchBoundary).call(this,evt,{word:mark.value,startChar:mark.start,endChar:mark.end})})),yield __classPrivateFieldGet(this,_Controller_instances,"m",_Controller_attachAudioSource).call(this)}}))};class ControllerStub{constructor(){this.lang="",this.rate=1,this.pitch=1,this.volume=1,this.volumeMin=0,this.preservesPitch=!1,this.text=""}cancel(){}init(){return Promise.resolve()}mute(){return Promise.resolve()}unmute(){return Promise.resolve()}play(){return Promise.resolve()}pause(){}resume(){return Promise.resolve()}replay(){return Promise.resolve()}addEventListener(){}removeEventListener(){}}const Highlighter=_ref2=>{let{text,mark,color,backgroundColor}=_ref2;const markStyle=(0,react.useMemo)((()=>(_ref=>{let{color,backgroundColor}=_ref;return{color,backgroundColor}})({color,backgroundColor})),[color,backgroundColor]);if(text&&mark){const textStr=text.toString(),escapedMark=mark.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&"),regex=new RegExp(`(${escapedMark})`,"gi"),parts=textStr.split(regex);if(parts.length>1)return(0,react.createElement)("span",null,...parts.map(((part,idx)=>{const key=`${part}-${idx}`;return part?regex.test(part)?(0,react.createElement)("mark",{key,style:markStyle,"data-testid":"tts-react-mark"},part):(0,react.createElement)("span",{key},part):null})))}return(0,react.createElement)(react.Fragment,null,text)};Highlighter.__docgenInfo={description:"",methods:[],displayName:"Highlighter"};var hook_awaiter=function(thisArg,_arguments,P,generator){return new(P||(P=Promise))((function(resolve,reject){function fulfilled(value){try{step(generator.next(value))}catch(e){reject(e)}}function rejected(value){try{step(generator.throw(value))}catch(e){reject(e)}}function step(result){result.done?resolve(result.value):function adopt(value){return value instanceof P?value:new P((function(resolve){resolve(value)}))}(result.value).then(fulfilled,rejected)}step((generator=generator.apply(thisArg,_arguments||[])).next())}))};const parseChildrenRecursively=_ref=>{let{children,buffer,boundary,markColor,markBackgroundColor,markTextAsSpoken}=_ref;return react.Children.map(children,(child=>{let currentChild=child;if((0,react.isValidElement)(child)){const childProps="object"==typeof(value=child.props)&&null!==value?child.props:{};currentChild=(0,react.cloneElement)(child,Object.assign(Object.assign({},childProps),{children:parseChildrenRecursively({buffer,boundary,markColor,markBackgroundColor,markTextAsSpoken,children:childProps.children})}))}var value;if((value=>"string"==typeof value||"number"==typeof value)(child)){const text=child.toString(),{word,startChar,endChar}=boundary,bufferTextLength=buffer.text.length;if(buffer.text+=`${text} `,markTextAsSpoken&&word){const start=startChar-bufferTextLength,end=endChar-bufferTextLength,prev=text.substring(0,start),found=text.substring(start,end),after=text.substring(end,text.length);if(found){const Highlight=(0,react.createElement)(Highlighter,{text:found,mark:stripPunctuation(found),color:markColor,backgroundColor:markBackgroundColor});return(0,react.createElement)(react.Fragment,{key:`tts-${start}-${end}`},prev,Highlight,after)}}}return currentChild}))},defaultBoundary={word:"",startChar:0,endChar:0},reducer=(state,action)=>{switch(action.type){case"pause":return Object.assign(Object.assign({},state),{isPlaying:!1,isPaused:!0,isError:!1});case"play":case"reset":return Object.assign(Object.assign({},state),{isPlaying:!0,isPaused:!1,isError:!1,boundary:defaultBoundary});case"end":return Object.assign(Object.assign({},state),{isPlaying:!1,isPaused:!1,isError:!1,boundary:defaultBoundary});case"error":return Object.assign(Object.assign({},state),{isPlaying:!1,isPaused:!1,isError:!0,boundary:defaultBoundary});case"ready":return Object.assign(Object.assign({},state),{isReady:!0});case"boundary":return Object.assign(Object.assign({},state),{boundary:Object.assign(Object.assign({},state.boundary),action.payload)});case"voices":return Object.assign(Object.assign({},state),{voices:action.payload});case"stop":return Object.assign(Object.assign({},state),{isPlaying:!1,isPaused:!1,isError:!1});case"muted":return Object.assign(Object.assign({},state),{isMuted:!0});case"unmuted":return Object.assign(Object.assign({},state),{isMuted:!1})}},useTts=_ref2=>{let{lang,rate,volume,voice,children,markColor,markBackgroundColor,onStart,onPause,onBoundary,onEnd,onError,onVolumeChange,onPitchChange,onRateChange,onNotSupported,fetchAudioData,autoPlay=!1,markTextAsSpoken=!1}=_ref2;const spokenTextRef=(0,react.useRef)(""),handleNotSupported=onNotSupported||noop,isSynthSupported="undefined"!=typeof globalThis&&"speechSynthesis"in globalThis,[state,dispatch]=(0,react.useReducer)(reducer,{voices:isSynthSupported?globalThis.speechSynthesis.getVoices():[],boundary:defaultBoundary,isPlaying:!1,isPaused:!1,isMuted:!1,isError:!1,isReady:isSynthSupported&&void 0===fetchAudioData}),[ttsChildren,spokenText]=(0,react.useMemo)((()=>{const buffer={text:""},parsed=parseChildrenRecursively({children,buffer,markColor,markBackgroundColor,markTextAsSpoken,boundary:state.boundary});return spokenTextRef.current=buffer.text.trim(),[parsed,spokenTextRef.current]}),[children,state.boundary,markColor,markBackgroundColor,markTextAsSpoken]),controller=(0,react.useMemo)((()=>isSynthSupported?new Controller({lang,voice,fetchAudioData}):new ControllerStub),[lang,voice,isSynthSupported,fetchAudioData]),play=(0,react.useCallback)((()=>hook_awaiter(void 0,void 0,void 0,(function*(){isSynthSupported?state.isPaused?yield controller.resume():yield controller.replay():handleNotSupported(),dispatch({type:"play"})}))),[controller,state.isPaused,isSynthSupported,handleNotSupported]),pause=(0,react.useCallback)((()=>{controller.pause(),dispatch({type:"pause"})}),[controller]),replay=(0,react.useCallback)((()=>hook_awaiter(void 0,void 0,void 0,(function*(){yield controller.replay(),dispatch({type:"reset"})}))),[controller]),stop=(0,react.useCallback)((()=>{controller.cancel(),dispatch({type:"stop"})}),[controller]),toggleMuteHandler=(0,react.useCallback)((callback=>hook_awaiter(void 0,void 0,void 0,(function*(){const wasMuted=parseFloat(controller.volume.toFixed(2))===controller.volumeMin;wasMuted?(yield controller.unmute(),dispatch({type:"unmuted"})):(yield controller.mute(),dispatch({type:"muted"})),"function"==typeof callback&&callback(wasMuted)}))),[controller]),playOrPause=(0,react.useCallback)((()=>hook_awaiter(void 0,void 0,void 0,(function*(){isSynthSupported?state.isPlaying?pause():yield play():handleNotSupported()}))),[state.isPlaying,isSynthSupported,handleNotSupported,pause,play]),playOrStop=(0,react.useCallback)((()=>hook_awaiter(void 0,void 0,void 0,(function*(){isSynthSupported?state.isPlaying?stop():yield play():handleNotSupported()}))),[state.isPlaying,isSynthSupported,handleNotSupported,stop,play]),[get,set]=(0,react.useMemo)((()=>[{lang:()=>controller.lang,rate:()=>controller.rate,pitch:()=>controller.pitch,volume:()=>controller.volume,preservesPitch:()=>controller.preservesPitch},{lang(value){controller.lang=value},rate(value){controller.rate=value},pitch(value){controller.pitch=value},volume(value){controller.volume=value},preservesPitch(value){controller.preservesPitch=value}}]),[controller]),onStartHandler=(0,react.useCallback)((evt=>{dispatch({type:"play"}),"function"==typeof onStart&&onStart(evt.detail)}),[onStart]),onPauseHandler=(0,react.useCallback)((evt=>{"function"==typeof onPause&&onPause(evt.detail)}),[onPause]),onEndHandler=(0,react.useCallback)((evt=>{dispatch({type:"end"}),"function"==typeof onEnd&&onEnd(evt.detail)}),[onEnd]),onReady=(0,react.useCallback)((()=>{dispatch({type:"ready"})}),[]),onErrorHandler=(0,react.useCallback)((evt=>{dispatch({type:"error"}),"function"==typeof onError&&onError(evt.detail)}),[onError]),onBoundaryHandler=(0,react.useCallback)((evt=>{dispatch({type:"boundary",payload:evt.detail.boundary}),"function"==typeof onBoundary&&onBoundary(evt.detail.boundary,evt.detail.evt)}),[onBoundary]),onVolume=(0,react.useCallback)((evt=>{const volume=evt.detail,min=controller.volumeMin;volume===min&&controller.volume!==min&&dispatch({type:"muted"}),volume!==min&&controller.volume===min&&dispatch({type:"unmuted"}),"function"==typeof onVolumeChange&&onVolumeChange(volume)}),[onVolumeChange,controller]),onPitch=(0,react.useCallback)((evt=>{"function"==typeof onPitchChange&&onPitchChange(evt.detail)}),[onPitchChange]),onRate=(0,react.useCallback)((evt=>{"function"==typeof onRateChange&&onRateChange(evt.detail)}),[onRateChange]);return(0,react.useEffect)((()=>{controller.text=spokenText}),[spokenText,controller]),(0,react.useEffect)((()=>{rate&&Number.isFinite(rate)&&(controller.rate=rate),volume&&Number.isFinite(volume)&&(controller.volume=volume)}),[controller,rate,volume]),(0,react.useEffect)((()=>{const onBeforeUnload=()=>{controller.cancel()};return hook_awaiter(void 0,void 0,void 0,(function*(){controller.addEventListener(Events.PLAYING,onStartHandler),controller.addEventListener(Events.PAUSED,onPauseHandler),controller.addEventListener(Events.END,onEndHandler),controller.addEventListener(Events.ERROR,onErrorHandler),controller.addEventListener(Events.READY,onReady),controller.addEventListener(Events.BOUNDARY,onBoundaryHandler),controller.addEventListener(Events.VOLUME,onVolume),controller.addEventListener(Events.PITCH,onPitch),controller.addEventListener(Events.RATE,onRate),globalThis.addEventListener("beforeunload",onBeforeUnload),yield controller.init()})).catch((err=>{err instanceof Error&&console.error(err.message)})),()=>{globalThis.removeEventListener("beforeunload",onBeforeUnload),controller.removeEventListener(Events.PLAYING,onStartHandler),controller.removeEventListener(Events.PAUSED,onPauseHandler),controller.removeEventListener(Events.END,onEndHandler),controller.removeEventListener(Events.ERROR,onErrorHandler),controller.removeEventListener(Events.READY,onReady),controller.removeEventListener(Events.BOUNDARY,onBoundaryHandler),controller.removeEventListener(Events.VOLUME,onVolume),controller.removeEventListener(Events.PITCH,onPitch),controller.removeEventListener(Events.RATE,onRate)}}),[onStartHandler,onBoundaryHandler,onPauseHandler,onEndHandler,onReady,onErrorHandler,onBoundary,onVolume,onPitch,onRate,controller]),(0,react.useEffect)((()=>{hook_awaiter(void 0,void 0,void 0,(function*(){autoPlay&&(isSynthSupported?state.isReady&&(yield controller.replay(),dispatch({type:"play"})):handleNotSupported())})).catch((err=>{err instanceof Error&&console.error(`Unable to auto play: ${err.message}`)}))}),[autoPlay,controller,state.isReady,isSynthSupported,handleNotSupported]),(0,react.useEffect)((()=>{var _a;const onVoicesChanged=()=>{dispatch({type:"voices",payload:globalThis.speechSynthesis.getVoices()})};return"function"==typeof(null===(_a=globalThis.speechSynthesis)||void 0===_a?void 0:_a.addEventListener)&&globalThis.speechSynthesis.addEventListener("voiceschanged",onVoicesChanged),()=>{var _a;"function"==typeof(null===(_a=globalThis.speechSynthesis)||void 0===_a?void 0:_a.removeEventListener)&&globalThis.speechSynthesis.removeEventListener("voiceschanged",onVoicesChanged)}}),[]),{get,set,state,spokenText,ttsChildren,isSynthSupported,play,stop,pause,replay,playOrStop,playOrPause,toggleMute:toggleMuteHandler}}}}]);