import { QuestionOutlined } from '@ant-design/icons'
import { Card, Typography } from 'antd'
import React from 'react'
import { Link } from 'react-router-dom'
import { useItemTypes } from 'services/item_type_service'

export interface AddActivityModalProps {
    closeModal: () => void
}

const AddActivityModal = ({ closeModal }: AddActivityModalProps) => {
    const { data: itemTypes } = useItemTypes()
    return (
        <div>
            <Typography.Title level={3}>Add New Activity</Typography.Title>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '5px',
                    marginTop: '5px',
                    flexWrap: 'wrap',
                }}
            >
                {(itemTypes ?? []).map(it => (
                    <Link
                        key={it.slug}
                        to={{ pathname: `/activities/${it.slug}` }}
                    >
                        <Card
                            onClick={closeModal}
                            hoverable
                            style={{ width: '200px' }}
                            cover={
                                <div
                                    style={{
                                        fontSize: '32px',
                                        width: '100%',
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginTop: '10px',
                                            marginBottom: '10px',
                                        }}
                                    >
                                        {it.icon_url ? (
                                            <img
                                                style={{ height: '50px', width: '50px' }}
                                                src={it.icon_url}
                                            />
                                        ) : (
                                            <QuestionOutlined />
                                        )}
                                    </div>
                                </div>
                            }
                        >
                            <Card.Meta
                                title={it.name}
                                description={`Add a new ${it.name} activity`}
                            />
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default AddActivityModal
