import React, { lazy, Suspense } from 'react'
import { HomeProps } from './Home'
const LazyHome = lazy(() => import('./Home'))

const Home = (
    props: JSX.IntrinsicAttributes & {
        children?: React.ReactNode
    } & HomeProps,
) => (
    <Suspense fallback={null}>
        <LazyHome {...props} />
    </Suspense>
)

export default Home
