import { QuestionOutlined } from '@ant-design/icons'
import { Card, List, Typography } from 'antd'
import React from 'react'
import { Link } from 'react-router-dom'
import { useItemTypes } from 'services/item_type_service'

export interface AddActivityModalProps {
    closeModal: () => void
}

const AddActivityModal = ({ closeModal }: AddActivityModalProps) => {
    const { data: itemTypes } = useItemTypes()
    return (
        <div id='add-activity-modal'>
            <Typography.Title level={3}>Add New Activity</Typography.Title>
            <List
                grid={{
                    gutter: 10,
                    column: 2,
                }}
                dataSource={itemTypes ?? []}
                renderItem={(item) => (
                    <List.Item key={item.slug}>
                        <Link
                            to={{ pathname: `/activities/${item.slug}` }}
                        >
                            <Card
                                onClick={closeModal}
                                hoverable
                                cover={
                                    <div
                                        style={{
                                            fontSize: '32px',
                                            height: '50px'
                                        }}
                                    >
                                        <div
                                            style={{
                                                textAlign: 'center',
                                                marginTop: '10px',
                                                marginBottom: '10px',
                                            }}
                                        >
                                            {item.icon_url ? (
                                                <img
                                                    style={{ height: '50px', width: '50px' }}
                                                    src={item.icon_url}
                                                />
                                            ) : (
                                                <QuestionOutlined />
                                            )}
                                        </div>
                                    </div>
                                }
                            >
                                <Card.Meta
                                    title={item.name}
                                    style={{height: '100%'}}
                                    description={`Add a new ${item.name} activity`}
                                />
                            </Card>
                        </Link>
                    </List.Item>
                )} />
        </div>
    )
}

export default AddActivityModal
