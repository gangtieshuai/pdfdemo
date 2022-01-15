// Core viewer
import React, { useEffect, useState, useRef } from 'react';

import { Viewer, Worker } from '@react-pdf-viewer/core';

import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import zh_CN from '@react-pdf-viewer/locales/lib/zh_CN.json';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import './App.css'


const timerString = (durTime) => {
    const hour = Math.floor(durTime / 3600)
    const minute = Math.floor(durTime / 60)
    const second = Math.floor(durTime)
    return `${getStr(24, hour)} : ${getStr(60, minute)} : ${getStr(60, second)}`
}

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
    const [timer, setTimer] = useState(null)
    const [durTimeNow, setdurTimeNow] = useState(durTime.current)
    const [readStr, setRead] = useState(timerString(durTime.current))
    const [pagedataTime, setPagedataTime] = useState([])
    const [currentPage, setCurrentPage] = useState(0)

    useEffect(() => {
        return () => { clearInterval(timer) }
    }, [])


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
    const onDocumentLoad = (e) => setTimeString()

    const onClick = () => {
        const setArr = JSON.stringify(pagedataTime);
        const obj = JSON.parse(setArr)
        pagedataTime.map((item, index) => {
            console.log(item);
            console.log(pagedataTime[index-1]);
            const seconds = index>0?item-pagedataTime[index-1]:item
            obj[index] =seconds
            return item
        })
       alert(JSON.stringify(obj.map(i=>{return i>0?`${i}s`:'0s'})))
    }

    return (
        <div className="App">
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.12.313/build/pdf.worker.min.js">
                <div style={{
                    position: 'fixed',
                    zIndex:"999",
                    color: 'white',
                    width: '200px',
                    background: '#000000a3',
                    padding: '10px',
                    bottom:'30px',
                    borderRadius: '8px',
                    left: '50%',
                    marginLeft: '-100px'
                    }}>
                        {`阅读时长：${readStr}`}
                        <button onClick={onClick}>点击查看</button>
                        </div>

                <Viewer
                    fileUrl='Update.pdf'
                    plugins={[
                        defaultLayoutPluginInstance
                    ]}
                    renderPage={renderPage}
                    localization={zh_CN}
                    onPageChange={onPageChange}
                    onDocumentLoad={onDocumentLoad}
                />
            </Worker>
        </div>
    );
}

export default App;
