const SkeletonLoader = ({ type = 'card', count = 1, className = '' }) => {
    const skeletons = Array(count).fill(null);

    const renderSkeleton = (index) => {
        switch (type) {
            case 'card':
                return (
                    <div key={index} className={`glass-card p-6 animate-pulse ${className}`}>
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-dark-700"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-dark-700 rounded w-3/4"></div>
                                <div className="h-3 bg-dark-700 rounded w-1/2"></div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="h-3 bg-dark-700 rounded"></div>
                            <div className="h-3 bg-dark-700 rounded w-5/6"></div>
                            <div className="h-3 bg-dark-700 rounded w-4/6"></div>
                        </div>
                    </div>
                );

            case 'list':
                return (
                    <div key={index} className={`flex items-center space-x-4 p-4 animate-pulse ${className}`}>
                        <div className="w-10 h-10 rounded-full bg-dark-700"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-dark-700 rounded w-1/2"></div>
                            <div className="h-3 bg-dark-700 rounded w-1/3"></div>
                        </div>
                    </div>
                );

            case 'table-row':
                return (
                    <div key={index} className={`flex items-center space-x-4 p-4 border-b border-dark-800 animate-pulse ${className}`}>
                        <div className="w-8 h-8 rounded bg-dark-700"></div>
                        <div className="h-4 bg-dark-700 rounded w-1/4"></div>
                        <div className="h-4 bg-dark-700 rounded w-1/4"></div>
                        <div className="h-4 bg-dark-700 rounded w-1/6"></div>
                        <div className="h-4 bg-dark-700 rounded w-1/6"></div>
                    </div>
                );

            case 'profile':
                return (
                    <div key={index} className={`animate-pulse ${className}`}>
                        <div className="flex flex-col items-center space-y-4">
                            <div className="w-24 h-24 rounded-full bg-dark-700"></div>
                            <div className="h-6 bg-dark-700 rounded w-32"></div>
                            <div className="h-4 bg-dark-700 rounded w-48"></div>
                            <div className="flex space-x-4 mt-4">
                                <div className="h-10 bg-dark-700 rounded w-24"></div>
                                <div className="h-10 bg-dark-700 rounded w-24"></div>
                            </div>
                        </div>
                    </div>
                );

            case 'notification':
                return (
                    <div key={index} className={`flex items-start space-x-3 p-3 animate-pulse ${className}`}>
                        <div className="w-8 h-8 rounded-full bg-dark-700 flex-shrink-0"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-3 bg-dark-700 rounded w-full"></div>
                            <div className="h-3 bg-dark-700 rounded w-3/4"></div>
                            <div className="h-2 bg-dark-700 rounded w-1/4"></div>
                        </div>
                    </div>
                );

            default:
                return (
                    <div key={index} className={`h-4 bg-dark-700 rounded animate-pulse ${className}`}></div>
                );
        }
    };

    return (
        <div className="space-y-4">
            {skeletons.map((_, index) => renderSkeleton(index))}
        </div>
    );
};

export default SkeletonLoader;
