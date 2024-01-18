import React from "react";
import ActivityDetail from "../ActivityDetail/ActivityDetail.lazy";
import AddActivity from "../AddActivity/AddActivity.lazy";
import { Spin } from "antd";
import { useParams } from "react-router-dom";

export interface ActivityWrapperProps {}

const ActivityWrapper = ({}: ActivityWrapperProps) => {
    const {token} = useParams()

    return token? (token.startsWith('A')?<ActivityDetail/>:<AddActivity/>):<Spin/>
};

export default ActivityWrapper;
