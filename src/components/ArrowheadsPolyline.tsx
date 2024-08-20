import React, { useEffect, useRef } from 'react'
import { Polyline } from 'react-leaflet'
import 'leaflet-arrowheads';
import { Polyline as PolylineL } from 'leaflet'

export default function ArrowheadsPolyline({ arrowheads, positions, ...otherProps }: { arrowheads: any, positions: any } & React.ComponentProps<typeof Polyline>) {
    const polylineRef = useRef<PolylineL>(null);

    useEffect(() => {
        if (polylineRef.current) {
            if (arrowheads) {
                (polylineRef.current as any).arrowheads(arrowheads);
            }
            (polylineRef.current as any)._update();
        }
    }, [arrowheads, positions]);

    useEffect(() => {
        return () => {
            if (polylineRef.current) {
                (polylineRef.current as any).deleteArrowheads();
            }
        }
    }, []);

    return (
        <Polyline
            positions={positions}
            ref={polylineRef as React.RefObject<PolylineL>}
            {...otherProps}
        />
    )
}