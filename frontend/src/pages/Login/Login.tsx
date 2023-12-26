import { BookOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Checkbox, Divider, Form, Input } from 'antd'
import React, { useState } from 'react'
import { useLogin } from 'services/auth_service'

export interface LoginProps {}

const Login = ({}: LoginProps) => {
    const loginMutation = useLogin()
    const [error, setError] = useState(false)
    return (
        <div
            style={{
                width: '500px',
                margin: 'auto',
                marginTop: 'calc(50% - 250px)',
            }}
        >
            <Card
                style={{
                    fontSize: '24px',
                    width: '100%',
                }}
            >
                {error ? (
                    <Alert
                        type="error"
                        message="Login Failed"
                    />
                ) : null}
                <div>
                    P <BookOutlined />
                </div>
                <Form
                    labelAlign="left"
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 19 }}
                    onFinish={values => {
                        loginMutation.mutate(values, {
                            onError: () => {
                                setError(true)
                            },
                        })
                    }}
                    onValuesChange={() => {
                        setError(false)
                    }}
                >
                    <Divider />
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your email',
                            },
                        ]}
                    >
                        <Input
                            type="email"
                            autoComplete="email"
                        />
                    </Form.Item>
                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your password',
                            },
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <div
                        style={{
                            marginTop: '16px',
                            display: 'flex',
                            justifyContent: 'flex-end',
                        }}
                    >
                        <Button
                            type="primary"
                            size="large"
                            htmlType="submit"
                            loading={loginMutation.isPending}
                        >
                            Login
                        </Button>
                    </div>
                </Form>
            </Card>
        </div>
    )
}

export default Login
