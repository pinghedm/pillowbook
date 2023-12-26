import React, { lazy, Suspense } from 'react'
import { ActivitiesProps } from './Activities'
const LazyActivities = lazy(() => import('./Activities'))

const Activities = (
    props: JSX.IntrinsicAttributes & {
        children?: React.ReactNode
    } & ActivitiesProps,
) => (
    <Suspense fallback={null}>
        <LazyActivities {...props} />
    </Suspense>
)

export default Activities
