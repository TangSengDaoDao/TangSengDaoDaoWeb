import React from "react";
import { Component, ReactNode } from "react";


interface SectionProps {
    title: string;
    children?: ReactNode;
}

export default class Section extends Component<SectionProps> {
    render(): ReactNode {
        return <div>
            <div style={{color:"#666",marginLeft:"10px",marginTop:"10px"}}>{this.props.title}</div>
            {this.props.children}
        </div>
    }
}