import { Channel } from "wukongimjssdk";
import React from "react";
import { Component, CSSProperties } from "react";
import WKApp from "../../App";
import "./index.css"

interface WKAvatarProps {
    channel?: Channel
    src?: string
    style?: CSSProperties
    random?: string
}

const defaultAvatarSVG = `
  data:image/svg+xml;charset=UTF-8,<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg">
  <rect width="50" height="50" x="0" y="0" rx="20" ry="20" fill="rgb(220,220,220)" />
</svg>
`;

export interface WKAvatarState {
    src :string
  }

export default class WKAvatar extends Component<WKAvatarProps,WKAvatarState> {

    constructor(props: any) {
        super(props);
        this.state = {
          src: '',
        };
      }
    getImageSrc() {
        const { channel, src, random } = this.props
        let imgSrc = ""
        if (src && src.trim() !== "") {
            imgSrc = src
        } else {
            if (channel) {
                imgSrc = WKApp.shared.avatarChannel(channel)
            }
        }
        if (random && random !== "") {
            imgSrc = `${imgSrc}#${random}`
        }
        return imgSrc
    }
    handleImgError() {
        this.setState({ src: defaultAvatarSVG });
    };
    handleLoad() {
        this.setState({src: this.getImageSrc()})
    }
    render() {
        const { style } = this.props
        return <img alt="" style={style} className="wk-avatar" src={this.state.src} onLoad={this.handleLoad.bind(this)} onError={this.handleImgError.bind(this)} />
    }
}