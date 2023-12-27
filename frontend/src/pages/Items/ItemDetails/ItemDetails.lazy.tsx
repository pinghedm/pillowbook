import React, { lazy, Suspense } from "react";
import { ItemDetailsProps } from "./ItemDetails";
const LazyItemDetails = lazy(() => import("./ItemDetails"));

const ItemDetails = (
    props: JSX.IntrinsicAttributes & {
        children?: React.ReactNode;
    } & ItemDetailsProps,
) => (
    <Suspense fallback={null}>
        <LazyItemDetails {...props} />
    </Suspense>
);

export default ItemDetails;
