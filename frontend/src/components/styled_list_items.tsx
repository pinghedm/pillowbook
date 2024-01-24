import { QuestionCircleOutlined, QuestionOutlined } from "@ant-design/icons";
import { List, Typography } from "antd";
import { DateTime } from "luxon";
import { Link } from "react-router-dom";
import { Activity } from "services/activities_service";
import { Item } from "services/item_service";
import { capitalizeWords } from "services/utils";
import styled from "styled-components";

export interface ItemListItemProps { 
    item: Item
    path: string
    actions?: Array<any>
    extras?: Array<any>
}
export interface ActivityListItemProps { 
    item: Activity
    path: string
    actions?: Array<any>
    extras?: Array<any>
}

const StyledListItem = styled(List.Item)`
    &:hover {
        background-color: rgba(200, 200, 235, .4);
        transition: all .15s ease-in;
    }

    & .ant-list-item-meta-content {
        align-self: center;
    }

    & .ant-list-item-meta-avatar {
        flex-basis: 10%;
        min-width: 100px;
    }
`
const StyledAvatar = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;

`
const StyledDescription = styled.div`
    margin-top: auto;
    display: flex;
    flex-direction: row;
    gap: 5px;
    align-items: center;
`

export const ItemListItem = ({item, path, actions, extras}: ItemListItemProps) => {
    return (
        <Link to={{pathname: path}}>
            <StyledListItem actions={actions?.map(i => i)} extra={extras?.map(i => i)}>
                <List.Item.Meta
                    title={item.name}
                    avatar={
                        <StyledAvatar>
                            {item.icon_url ? (
                                <img
                                    style={{ height: '50px', width: '50px' }}
                                    src={item.icon_url}
                                />
                            ) : (
                                <QuestionOutlined />
                            )}
                            {capitalizeWords(item.item_type)}
                        </StyledAvatar>
                    }
                />
            </StyledListItem>
        </Link>)
}

export const ActivityListItem = ({item, path, actions, extras}: ActivityListItemProps) => {
    return (
        <Link to={{pathname: path}}>
            <StyledListItem actions={actions?.map(i => i)} extra={extras?.map(i => i)}>
                <List.Item.Meta 
                title={item.item_name}
                avatar={
                    <StyledAvatar>
                        {item.icon_url ? (
                            <img
                                style={{ height: '50px', width: '50px' }}
                                src={item.icon_url}
                            />
                        ) : (
                            <QuestionCircleOutlined />
                        )}
                        {capitalizeWords(item.item_type)}
                    </StyledAvatar>
                }
                description={
                    <StyledDescription>
                        {item.finished ? (
                            <Typography.Text
                                type="success"
                                style={{
                                    borderRight: '1px solid lightgray',
                                    paddingRight: '5px',
                                    marginRight: '5px'
                                }}
                            >
                                Completed
                            </Typography.Text>
                        ) : (
                            ''
                        )}
                        {item.start_time
                            ? DateTime.fromISO(item.start_time).toLocaleString(
                                  DateTime.DATETIME_SHORT,
                              )
                            : '[No Start Time]'}{' '}
                        -
                        {item.end_time
                            ? DateTime.fromISO(item.end_time).toLocaleString(
                                  DateTime.DATETIME_SHORT,
                              )
                            : '[No End Time]'}
                    </StyledDescription>
                }/>
            </StyledListItem>
        </Link>)
}
