import React, { lazy, Suspense } from "react";
import { ProfileProps } from "./Profile";
const LazyProfile = lazy(() => import("./Profile"));

const Profile = (
    props: JSX.IntrinsicAttributes & {
        children?: React.ReactNode;
    } & ProfileProps,
) => (
    <Suspense fallback={null}>
        <LazyProfile {...props} />
    </Suspense>
);

export default Profile;
