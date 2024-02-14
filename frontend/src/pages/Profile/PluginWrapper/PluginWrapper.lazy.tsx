import React, { lazy, Suspense } from "react";
import { PluginWrapperProps } from "./PluginWrapper";
const LazyPluginWrapper = lazy(() => import("./PluginWrapper"));

const PluginWrapper = (
    props: JSX.IntrinsicAttributes & {
        children?: React.ReactNode;
    } & PluginWrapperProps,
) => (
    <Suspense fallback={null}>
        <LazyPluginWrapper {...props} />
    </Suspense>
);

export default PluginWrapper;
