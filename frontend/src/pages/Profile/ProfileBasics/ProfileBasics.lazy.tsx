import React, { lazy, Suspense } from "react";
import { ProfileBasicsProps } from "./ProfileBasics";
const LazyProfileBasics = lazy(() => import("./ProfileBasics"));

const ProfileBasics = (
    props: JSX.IntrinsicAttributes & {
        children?: React.ReactNode;
    } & ProfileBasicsProps,
) => (
    <Suspense fallback={null}>
        <LazyProfileBasics {...props} />
    </Suspense>
);

export default ProfileBasics;
