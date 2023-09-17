import { ConversationContext, FileHelper, ImageContent, WKApp } from "@tsdaodao/base";
import React from "react";
import { Component, ReactNode } from "react";

import "./index.css"


interface ImageToolbarProps {
    conversationContext: ConversationContext
    icon: string
}

interface ImageToolbarState {
    showDialog: boolean
    file?: any
    fileType?: string
    previewUrl?: any,
    fileIconInfo?: any,
    canSend?: boolean
    width?: number
    height?: number
}

export default class ImageToolbar extends Component<ImageToolbarProps, ImageToolbarState>{
    pasteListen!:(event:any)=>void
    constructor(props:any) {
        super(props)
        this.state = {
            showDialog: false,
        }
    }

    componentDidMount() {
        let self = this;

        const { conversationContext } = this.props

        this.pasteListen = function (event:any) { // 监听粘贴里的文件
            let files = event.clipboardData.files;
            if (files.length > 0) {
                self.showFile(files[0]);
            }
        }
        document.addEventListener('paste',this.pasteListen )

        conversationContext.setDragFileCallback((file)=>{
            self.showFile(file);
        })
    }

    componentWillUnmount() {
        document.removeEventListener("paste",this.pasteListen)
    }

    $fileInput: any
    onFileClick = (event: any) => {
        event.target.value = '' // 防止选中一个文件取消后不能再选中同一个文件
    }
    onFileChange() {
        let file = this.$fileInput.files[0];
        this.showFile(file);
    }
    chooseFile = () => {
        this.$fileInput.click();
    }
    showFile(file: any) {
        const self = this
        if (file.type && file.type.startsWith('image/')) {
            var reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = function (e: any) {
                self.setState({
                    file: file,
                    fileType: "image",
                    previewUrl: reader.result,
                    showDialog: true,
                });
            };
        }

    }

    onSend() {
        const {conversationContext} = this.props
        const {  file, previewUrl,width,height,fileType } = this.state
        if(fileType === "image") {
            conversationContext.sendMessage(new ImageContent(file,previewUrl,width,height))
        }
       
        this.setState({
            showDialog: false,
        });
    }
    onPreviewLoad(e: any) {
        let img = e.target;
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;
        this.setState({
            width: width,
            height: height,
            canSend: true,
        });
    }
    render(): ReactNode {
        const { icon } = this.props
        const { showDialog, canSend, fileIconInfo, file, fileType, previewUrl } = this.state
        return <div className="wk-imagetoolbar" >
            <div className="wk-imagetoolbar-content" onClick={() => {
            this.chooseFile()
        }}>
                <div className="wk-imagetoolbar-content-icon">
                    <img src={icon}></img>
                    <input onClick={this.onFileClick} onChange={this.onFileChange.bind(this)} ref={(ref) => { this.$fileInput = ref }} type="file" multiple={false} accept="image/*" style={{ display: 'none' }} />
                </div>
            </div>
            {
                showDialog ? (
                    <ImageDialog onSend={this.onSend.bind(this)} onLoad={this.onPreviewLoad.bind(this)} canSend={canSend} fileIconInfo={fileIconInfo} file={file} fileType={fileType} previewUrl={previewUrl} onClose={() => {
                        this.setState({
                            showDialog: !showDialog
                        })
                    }} />
                ) : null
            }
        </div>
    }
}


interface ImageDialogProps {
    onClose: () => void
    onSend?: () => void
    fileType?: string // image, file
    previewUrl?: string
    file?: any
    fileIconInfo?: any,
    canSend?: boolean
    onLoad: (e: any) => void
}

class ImageDialog extends Component<ImageDialogProps> {


    // 格式化文件大小
    getFileSizeFormat(size: number) {
        if (size < 1024) {
            return `${size} B`
        }
        if (size > 1024 && size < 1024 * 1024) {
            return `${(size / 1024).toFixed(2)} KB`
        }
        if (size > 1024 * 1024 && size < 1024 * 1024 * 1024) {
            return `${(size / 1024 / 1024).toFixed(2)} M`
        }
        return `${(size / (1024 * 1024 * 1024)).toFixed(2)}G`
    }

    render() {
        const { onClose, onSend, fileType, previewUrl, file, canSend, fileIconInfo, onLoad } = this.props
        return <div className="wk-imagedialog">
            <div className="wk-imagedialog-mask" onClick={onClose}></div>
            <div className="wk-imagedialog-content">
                <div className="wk-imagedialog-content-close" onClick={onClose}>
                    <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2683" ><path d="M568.92178541 508.23169412l299.36805789-299.42461715a39.13899415 39.13899415 0 0 0 0-55.1452591L866.64962537 152.02159989a39.13899415 39.13899415 0 0 0-55.08869988 0L512.19286756 451.84213173 212.76825042 151.90848141a39.13899415 39.13899415 0 0 0-55.0886999 0L155.98277331 153.54869938a38.46028327 38.46028327 0 0 0 0 55.08869987L455.46394971 508.23169412 156.03933259 807.71287052a39.13899415 39.13899415 0 0 0 0 55.08869986l1.64021795 1.6967772a39.13899415 39.13899415 0 0 0 55.08869988 0l299.42461714-299.48117638 299.36805793 299.42461714a39.13899415 39.13899415 0 0 0 55.08869984 0l1.6967772-1.64021796a39.13899415 39.13899415 0 0 0 0-55.08869987L568.86522614 508.17513487z" p-id="2684"></path></svg>
                </div>
                <div className="wk-imagedialog-content-title">发送{fileType === 'image' ? '图片' : '文件'}</div>
                <div className="wk-imagedialog-content-body">
                    {
                        fileType === 'image' ? (
                            <div className="wk-imagedialog-content-preview">
                                <img alt="" className="wk-imagedialog-content-previewImg" src={previewUrl} onLoad={onLoad} />
                            </div>
                        ) : (
                            <div className="wk-imagedialog-content-preview">
                                <div className="wk-imagedialog-content-preview-file">
                                    <div className="wk-imagedialog-content-preview-file-icon" style={{ backgroundColor: fileIconInfo?.color }}>
                                        <img alt="" className="wk-imagedialog-content-preview-file-thumbnail" src={fileIconInfo?.icon} />
                                    </div>
                                    <div className="wk-imagedialog-content-preview--filecontent">
                                        <div className="wk-imagedialog-content-preview--filecontent-name">{file?.name}</div>
                                        <div className="wk-imagedialog-content-preview--filecontent-size">{this.getFileSizeFormat(file?.size)}</div>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                    <div className="wk-imagedialog-footer" >
                        <button onClick={onClose}>取消</button>
                        <button onClick={onSend} className="wk-imagedialog-footer-okbtn" disabled={!canSend} style={{ backgroundColor: canSend ? WKApp.config.themeColor : 'gray' }}>发送</button>
                    </div>
                </div>

            </div>
        </div>
    }
}