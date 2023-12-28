import React, { lazy, Suspense } from "react";
import { AddActivityModalProps } from "./AddActivityModal";
const LazyAddActivityModal = lazy(() => import("./AddActivityModal"));

const AddActivityModal = (
    props: JSX.IntrinsicAttributes & {
        children?: React.ReactNode;
    } & AddActivityModalProps,
) => (
    <Suspense fallback={null}>
        <LazyAddActivityModal {...props} />
    </Suspense>
);

export default AddActivityModal;
