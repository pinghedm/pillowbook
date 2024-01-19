import React, { lazy, Suspense } from "react";
import { ProfileHomeConfigProps } from "./ProfileHomeConfig";
const LazyProfileHomeConfig = lazy(() => import("./ProfileHomeConfig"));

const ProfileHomeConfig = (
    props: JSX.IntrinsicAttributes & {
        children?: React.ReactNode;
    } & ProfileHomeConfigProps,
) => (
    <Suspense fallback={null}>
        <LazyProfileHomeConfig {...props} />
    </Suspense>
);

export default ProfileHomeConfig;
