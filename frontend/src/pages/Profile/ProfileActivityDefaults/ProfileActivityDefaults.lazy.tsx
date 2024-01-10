import React, { lazy, Suspense } from "react";
import { ProfileActivityDefaultsProps } from "./ProfileActivityDefaults";
const LazyProfileActivityDefaults = lazy(() => import("./ProfileActivityDefaults"));

const ProfileActivityDefaults = (
    props: JSX.IntrinsicAttributes & {
        children?: React.ReactNode;
    } & ProfileActivityDefaultsProps,
) => (
    <Suspense fallback={null}>
        <LazyProfileActivityDefaults {...props} />
    </Suspense>
);

export default ProfileActivityDefaults;
