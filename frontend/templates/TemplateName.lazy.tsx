import React, { lazy, Suspense } from "react";
import { TemplateNameProps } from "./TemplateName";
const LazyTemplateName = lazy(() => import("./TemplateName"));

const TemplateName = (
    props: JSX.IntrinsicAttributes & {
        children?: React.ReactNode;
    } & TemplateNameProps,
) => (
    <Suspense fallback={null}>
        <LazyTemplateName {...props} />
    </Suspense>
);

export default TemplateName;
