import React, { lazy, Suspense } from "react";
import { ItemsProps } from "./Items";
const LazyItems = lazy(() => import("./Items"));

const Items = (
    props: JSX.IntrinsicAttributes & {
        children?: React.ReactNode;
    } & ItemsProps,
) => (
    <Suspense fallback={null}>
        <LazyItems {...props} />
    </Suspense>
);

export default Items;
