import { Alert } from "antd"
import styled from "styled-components"

export interface SuccessAlertProps {}

const AlertDiv = styled.div`
    position: absolute;
    z-index: 100;
    top: 5px;
    left: 50%;
    transform: translateX(-50%);
    width: 90%;
`

export const SuccessAlert = ({}: SuccessAlertProps) => {
    return (
        <AlertDiv>
            <Alert
                type="success"
                message="Saved"
                showIcon
                style={{ textAlign: "center"}}
            />
        </AlertDiv>
    )
}