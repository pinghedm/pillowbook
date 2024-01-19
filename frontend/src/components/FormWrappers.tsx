import styled from 'styled-components'

export const FormWrap = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`

export const LabeledFormRow = styled.div`
    display: flex;
    flex-direction: row;
    gap: 8px;
    width: 100%;
    max-width: 500px;

    & .ant-typography {
        width: 150px;
    }
`

export const CheckboxWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`
