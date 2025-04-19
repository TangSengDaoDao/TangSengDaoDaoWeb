import React from "react";
import { Component, ReactNode } from "react";
import WKAvatar from "../WKAvatar";
import "./item-group.css"
interface ItemGroupProps {
    avatar: string;
    name: string;
    onClick?: () => void;
}

export default class ItemGroup extends Component<ItemGroupProps> {
    
     render(): ReactNode {
            return <div className="wk-item-group" onClick={()=>{
                if(this.props.onClick){
                    this.props.onClick()
                }
            }}>
                <WKAvatar src={this.props.avatar} style={{width:"40px",height:"40px"}}></WKAvatar>
                <div className="wk-item-group-name" dangerouslySetInnerHTML={{ __html: this.props.name }}></div>
            </div>
        }
}