import React, { lazy, Suspense } from 'react'
import { ActivityDetailProps } from './ActivityDetail'
const LazyActivityDetail = lazy(() => import('./ActivityDetail'))

const ActivityDetail = (
    props: JSX.IntrinsicAttributes & {
        children?: React.ReactNode
    } & ActivityDetailProps,
) => (
    <Suspense fallback={null}>
        <LazyActivityDetail {...props} />
    </Suspense>
)

export default ActivityDetail
