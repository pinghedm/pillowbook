import React, { lazy, Suspense } from "react";
import { ActivityWrapperProps } from "./ActivityWrapper";
const LazyActivityWrapper = lazy(() => import("./ActivityWrapper"));

const ActivityWrapper = (
    props: JSX.IntrinsicAttributes & {
        children?: React.ReactNode;
    } & ActivityWrapperProps,
) => (
    <Suspense fallback={null}>
        <LazyActivityWrapper {...props} />
    </Suspense>
);

export default ActivityWrapper;
