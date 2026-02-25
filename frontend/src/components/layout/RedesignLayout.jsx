import React from 'react';
import SpatialBackground from './SpatialBackground';
import RedesignNavbar from './RedesignNavbar';
import { Outlet } from 'react-router-dom';

const RedesignLayout = () => {
    return (
        <div className="perspective-container min-h-screen bg-[#0A0F1F] text-white">
            {/* Navigation */}
            <RedesignNavbar />

            {/* Cinematic Background Layer */}
            <SpatialBackground />

            {/* Content Layer */}
            <div className="relative z-10 spatial-layer">
                <Outlet />
            </div>
        </div>
    );
};

export default RedesignLayout;
