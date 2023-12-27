import React, { lazy, Suspense } from "react";
import { ProfileItemTypesProps } from "./ProfileItemTypes";
const LazyProfileItemTypes = lazy(() => import("./ProfileItemTypes"));

const ProfileItemTypes = (
    props: JSX.IntrinsicAttributes & {
        children?: React.ReactNode;
    } & ProfileItemTypesProps,
) => (
    <Suspense fallback={null}>
        <LazyProfileItemTypes {...props} />
    </Suspense>
);

export default ProfileItemTypes;
