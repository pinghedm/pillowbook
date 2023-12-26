import React, { lazy, Suspense } from 'react'
import { AddActivityProps } from './AddActivity'
const LazyAddActivity = lazy(() => import('./AddActivity'))

const AddActivity = (
    props: JSX.IntrinsicAttributes & {
        children?: React.ReactNode
    } & AddActivityProps,
) => (
    <Suspense fallback={null}>
        <LazyAddActivity {...props} />
    </Suspense>
)

export default AddActivity
