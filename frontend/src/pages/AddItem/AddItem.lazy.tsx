import React, { lazy, Suspense } from "react";
import { AddItemProps } from "./AddItem";
const LazyAddItem = lazy(() => import("./AddItem"));

const AddItem = (
    props: JSX.IntrinsicAttributes & {
        children?: React.ReactNode;
    } & AddItemProps,
) => (
    <Suspense fallback={null}>
        <LazyAddItem {...props} />
    </Suspense>
);

export default AddItem;
