const StatCard = ({ title, value, icon: Icon, color, onClick, description, statusColorClass, statusBadge }) => (
    <div
        className={`bg-white rounded-2xl shadow-lg ring-1 ring-gray-200 p-6 flex flex-col justify-between cursor-pointer 
                    transition-all duration-300 hover:scale-[1.02] hover:shadow-xl
                    ${statusColorClass || 'border-l-4 border-gray-300'}
                    border-l-4 pl-8
                  `}
        onClick={onClick}
    >
        <div className="flex items-start justify-between">
            <div>
                <p className="text-gray-500 text-sm font-medium">{title}</p>
                <div className="text-3xl font-bold text-gray-800 mt-1">{value}</div>
            </div>
            <div className={`${color} p-3 rounded-xl shadow-md`}>
                <Icon className="h-6 w-6 text-white" />
            </div>
        </div>
        {description && (
            <p className="text-sm text-gray-500 mt-2">{description}</p>
        )}
        {statusBadge && (
            <span
                className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold self-start 
                        ${statusBadge.class}`}
            >
                {statusBadge.text}
            </span>
        )}
    </div>
);
export default StatCard;