import React, { lazy, Suspense } from "react";
import { LoginProps } from "./Login";
const LazyLogin = lazy(() => import("./Login"));

const Login = (
    props: JSX.IntrinsicAttributes & {
        children?: React.ReactNode;
    } & LoginProps,
) => (
    <Suspense fallback={null}>
        <LazyLogin {...props} />
    </Suspense>
);

export default Login;
