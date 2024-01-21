import { List } from "antd";
import { Link } from "react-router-dom";
import styled from "styled-components";

export interface ListItemProps { item: any, path: string, actions: Array<any>}


const StyledListItem = styled(List.Item)`
    &:hover {
        background-color: rgba(200, 200, 235, .4);
        transition: all .15s ease-in;
    }
`


const ListItem = ({item, path, actions}: ListItemProps) => {
    return (
        <Link to={{pathname: path}}>
            <StyledListItem actions={actions.map(i => i)}>
                <List.Item.Meta title={item.name??item.item_name} />
            </StyledListItem>
        </Link>)
}

export default ListItem