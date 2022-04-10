
import React, { useEffect, useState, useRef, memo,useMemo } from 'react';

import { Viewer, Worker, PdfJs   } from '@react-pdf-viewer/core';

import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import zh_CN from '@react-pdf-viewer/locales/lib/zh_CN.json';
import { Progress } from 'antd';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import './App.css'


// 插件用的这个： https://react-pdf-viewer.dev/docs/

// 其余配置都参考文档api

// 打包要是报错mini-css-extract-plugin，就降低版本至2.4.0

// 允许 PDF.js 范围请求
// const PDF= new PDFJS()
// PDF.disableRange = false;

// // 禁止 PDF.js 预读取
// PDF.disableAutoFetch = true;

const timerString = (durTime) => {
  const hour = Math.floor(durTime / 3600)
  const minute = Math.floor(durTime / 60)
  const second = Math.floor(durTime)
  return `${getStr(24, hour)} : ${getStr(60, minute)} : ${getStr(60, second)}`
}

// 计时器
const Timer = memo(props => {
  return (
    <div style={{
      position: 'fixed',
      zIndex: "999",
      color: 'white',
      width: '200px',
      background: '#000000a3',
      padding: '10px',
      bottom: '30px',
      borderRadius: '8px',
      left: '50%',
      marginLeft: '-100px'
    }}>
      {`阅读时长：${props.readStr}`}
      <button onClick={props.onClick}>点击查看</button>
    </div>
  );
});
// pdf
const Pdf = memo(props => {
  const url = window.location.search.replace('?url=','')
  //https://shixiangfiles.oss-cn-hangzhou.aliyuncs.com/04f8f4ab-e69d-4b6d-a892-689444d2d23bIBM%E5%8C%BA%E5%9D%97%E9%93%BE%E6%8A%80%E6%9C%AF%EF%BC%88Blockchain%EF%BC%89%E7%AE%80%E4%BB%8B.pdf
  // 文档有提pdfjs-dist 2.12.313版本的问题，请参考文档叙述
  return <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.12.313/build/pdf.worker.min.js">
    <Viewer
      fileUrl={url}
      // fileUrl='http://127.0.0.1:3000/demo.pdf'
      plugins={[
        props.defaultLayoutPluginInstance
      ]}
      // transformGetDocumentParams={(options: PdfJs.GetDocumentParams) =>
      //       Object.assign({}, options, {
      //           disableRange: false,
      //           disableAutoFetch: true,
      //       })
      //   }
      // httpHeaders={{
      //     'range': '0-5',
      // }}
      renderPage={props.renderPage}
      localization={props.zh_CN}
      onPageChange={props.onPageChange}
      onDocumentLoad={props.onDocumentLoad}
    />
  </Worker>
})
// 工具
const getStr = (num, value) => {
  let a = Math.floor(value / num)
  a = value - (a * num)
  if (a.toString().length === 1) {
    a = `0${a}`
  }
  return a
}

function App() {

  const durTime = useRef(0)
  const durloadTime = useRef(0)
  const [timer, setTimer] = useState(null)
  const loadtimer = useRef(null)
  const [durloadTimeNow, setdurloadTimeNow] = useState(durloadTime.current)

  const load = useRef('0')
  const [durTimeNow, setdurTimeNow] = useState(durTime.current)
  const [readStr, setRead] = useState(timerString(durTime.current))
  const [pagedataTime, setPagedataTime] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  // const [percent, setPercent] = useState(0)
  const percent = useRef(0)
  
  useEffect(() => {
    return () => { 
      clearInterval(timer)
      clearInterval(loadtimer.current)
    }
  }, [])

 const increase = () => {
    let percentobj = percent.current + 1;
    if (percentobj > 100) {
      percentobj = 100;
      
    }
   
    percent.current = percentobj
  };

  const setloadTimeString = () => {
    loadtimer.current = setInterval(() => {
      durloadTime.current = durloadTime.current + 1
      setdurloadTimeNow(durloadTime.current)
      increase()
      if(durloadTime.current>100||load.current === '1'){
        clearInterval(loadtimer.current)
      }
      console.log(percent.current);
    }, 50)
  }

  const setTimeString = () => {
    const obj = setInterval(() => {
      durTime.current = durTime.current + 1
      setRead(timerString(durTime.current))
      setdurTimeNow(durTime.current)
    }, 1000)
    setTimer(obj)
  }

  useEffect(() => {
    const arr = pagedataTime
    arr[currentPage] = durTimeNow
    setPagedataTime(arr)
  }, [durTimeNow])

  useEffect(() => {
    setloadTimeString()
  }, [])

  const renderPage = (props) => (
    <>
      {props.canvasLayer.children}
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          height: '100%',
          justifyContent: 'center',
          left: 0,
          position: 'absolute',
          top: 0,
          width: '100%',
        }}
      >
        <div
          style={{
            color: 'rgba(0, 0, 0, 0.2)',
            fontSize: `${9 * props.scale}rem`,
            fontWeight: 'bold',
            textTransform: 'uppercase',
            transform: 'rotate(-45deg)',
            userSelect: 'none',
          }}
        >
          这是水印
        </div>
      </div>
      {props.annotationLayer.children}
      {props.textLayer.children}
    </>
  );
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: (defaultTabs) => [],
  });
  const onPageChange = (e) => setCurrentPage(e.currentPage)
  const onDocumentLoad = (e) => {
    load.current = '1'
    setTimeString()
  }

  const onClick = () => {
    const setArr = JSON.stringify(pagedataTime);
    const obj = JSON.parse(setArr)
    pagedataTime.map((item, index) => {
      const seconds = index > 0 ? item - pagedataTime[index - 1] : item
      obj[index] = seconds
      return item
    })
    alert(JSON.stringify(obj.map(i => { return i > 0 ? `${i}s` : '0s' })))
  }



  // 避免不必要的刷新
  const MemoPdf = useMemo(()=> <Pdf zh_CN={zh_CN} defaultLayoutPluginInstance={defaultLayoutPluginInstance} renderPage={renderPage}
  localization={zh_CN}
  onPageChange={onPageChange}
  onDocumentLoad={onDocumentLoad} />,[])

  return (
    <div className="App">
      {load.current!=='1'&&<div>
        <Progress percent={percent.current} />
      </div> }
    <div>
    <Timer onClick={onClick} readStr={readStr} />
     {MemoPdf}
   </div>  
        
     
    </div>
  );
}

export default App;
