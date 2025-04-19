import WKSDK, { MediaMessageContent, Task } from "wukongimjssdk";
import React from "react";
import WKApp from "../../App";
import { MessageContentTypeConst } from "../../Service/Const";
import MessageBase from "../Base";
import { MessageCell } from "../MessageCell";
import Viewer from "react-viewer";
import "./index.css";
export class ImageContent extends MediaMessageContent {
  width!: number;
  height!: number;
  url!: string;
  imgData?: string;
  constructor(file?: File, imgData?: string, width?: number, height?: number) {
    super();
    this.file = file;
    this.imgData = imgData;
    this.width = width || 0;
    this.height = height || 0;
  }
  decodeJSON(content: any) {
    this.width = content["width"] || 0;
    this.height = content["height"] || 0;
    this.url = content["url"] || "";
    this.remoteUrl = this.url;
  }
  encodeJSON() {
    return { width: this.width || 0, height: this.height || 0, url: this.remoteUrl || "" };
  }
  get contentType() {
    return MessageContentTypeConst.image;
  }
  get conversationDigest() {
    return "[图片]";
  }
}

interface ImageCellState {
  showPreview: boolean;
  loading: boolean;
  progress: number;
}

export class ImageCell extends MessageCell<any, ImageCellState> {
  taskListener!: any;
  constructor(props: any) {
    super(props);
    this.state = {
      showPreview: false,
      loading: false,
      progress: 0,
    };
  }

  imageScale(orgWidth: number, orgHeight: number, maxWidth = 250, maxHeight = 250) {
    let actSize = { width: orgWidth, height: orgHeight };
    if (orgWidth > orgHeight) {
      //横图
      if (orgWidth > maxWidth) {
        // 横图超过最大宽度
        let rate = maxWidth / orgWidth; // 缩放比例
        actSize.width = maxWidth;
        actSize.height = orgHeight * rate;
      }
    } else if (orgWidth < orgHeight) {
      //竖图
      if (orgHeight > maxHeight) {
        let rate = maxHeight / orgHeight; // 缩放比例
        actSize.width = orgWidth * rate;
        actSize.height = maxHeight;
      }
    } else if (orgWidth === orgHeight) {
      if (orgWidth > maxWidth) {
        let rate = maxWidth / orgWidth; // 缩放比例
        actSize.width = maxWidth;
        actSize.height = orgHeight * rate;
      }
    }
    return actSize;
  }

  getImageSrc(content: ImageContent) {
    if (content.url && content.url !== "") {
      // 等待发送的消息
      let downloadURL = WKApp.dataSource.commonDataSource.getImageURL(content.url, {
        width: content.width,
        height: content.height,
      });
      if (downloadURL.indexOf("?") != -1) {
        downloadURL += "&filename=image.png";
      } else {
        downloadURL += "?filename=image.png";
      }
      return downloadURL;
    }
    return content.imgData;
  }

  getImageElement() {
    const { message } = this.props;
    const content = message.content as ImageContent;
    let scaleSize = this.imageScale(content.width, content.height);
    if (!this.taskListener && !content?.url) {
      this.taskListener = (task: Task) => {
        this.setState({
          loading: true,
          progress: Math.trunc(task.progress() * 100),
        });
        if (task.progress() === 1) {
          this.setState({
            loading: false,
            progress: 100,
          });
          WKSDK.shared().taskManager.removeListener(this.taskListener);
        }
      };
      WKSDK.shared().taskManager.addListener(this.taskListener);
    }
    return (
      <div style={{ position: "relative" }}>
        <img
          alt=""
          src={this.getImageSrc(content)}
          style={{ borderRadius: "5px", width: scaleSize.width, height: scaleSize.height }}
        />
        {this.state.loading && scaleSize.width > 32 && (
          <i className="loading-box">
            <img className="loading-icon" src={require("../../assets/loading.png")} alt="" />
            {scaleSize.height > 46 && <p className="loading-text">{this.state.progress}%</p>}
          </i>
        )}
      </div>
    );
  }

  render() {
    const { message, context } = this.props;
    const { showPreview } = this.state;
    const content = message.content as ImageContent;
    let scaleSize = this.imageScale(content.width, content.height);
    const imageURL = this.getImageSrc(content) || "";
    return (
      <MessageBase context={context} message={message}>
        <div
          style={{ width: scaleSize.width, height: scaleSize.height, cursor: "pointer" }}
          onClick={() => {
            this.setState({
              showPreview: !this.state.showPreview,
            });
          }}
        >
          {this.getImageElement()}
        </div>
        <Viewer
          visible={showPreview}
          noImgDetails={true}
          downloadable={true}
          rotatable={true}
          changeable={false}
          showTotal={false}
          onMaskClick={() => {
            this.setState({ showPreview: false });
          }}
          onClose={() => {
            this.setState({ showPreview: false });
          }}
          images={[{ src: imageURL, alt: "", downloadUrl: imageURL }]}
        />
      </MessageBase>
    );
  }
}
