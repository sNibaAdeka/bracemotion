"use client";
import React from 'react';
import * as SubframeCore from '@subframe/core';
// The supplied component's core is retained. All demonstration defaults are removed
// by the outer wrapper; this renderer receives validated host-owned data only.
const SubframeUtils={twClassNames:SubframeCore.createTwClassNames(['text-caption','text-caption-bold','text-body','text-body-bold','text-heading-3','text-heading-2','text-heading-1','text-monospace-body'])};
export default function AreaChartRenderer({className,...props}:React.ComponentProps<typeof SubframeCore.AreaChart>) {
  return <SubframeCore.AreaChart className={SubframeUtils.twClassNames('h-80 w-full',className)} {...props}/>;
}
