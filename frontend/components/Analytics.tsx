import React, { useRef, useEffect, useMemo } from 'react';
import { User, Vehicle, Booking, FuelDetail, Theme } from '../types';
import { useTheme } from '../contexts/ThemeContext';

// Since Chart.js is loaded from a CDN, we declare it globally to satisfy TypeScript
declare const Chart: any;

interface AnalyticsProps {
    users: User[];
    vehicles: Vehicle[];
    bookings: Booking[];
    fuelDetails: FuelDetail[];
}

const ChartCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">{title}</h3>
        <div className="h-64 sm:h-80">{children}</div>
    </div>
);

const useChart = (chartType: string, data: any, options: any) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        const chart = new Chart(ctx, {
            type: chartType,
            data: data,
            options: options,
        });

        return () => {
            chart.destroy();
        };
    }, [chartType, data, options]);

    return canvasRef;
};

const Analytics: React.FC<AnalyticsProps> = ({ users, vehicles, bookings, fuelDetails }) => {
    const { theme } = useTheme();

    const chartOptions = useMemo(() => {
        const isDark = theme === 'dark';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        const textColor = isDark ? '#E5E7EB' : '#374151';

        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top' as const,
                    labels: { color: textColor, font: { size: 12 } }
                },
                tooltip: {
                    backgroundColor: isDark ? '#374151' : '#FFFFFF',
                    titleColor: isDark ? '#F9FAFB' : '#1F2937',
                    bodyColor: isDark ? '#D1D5DB' : '#4B5563',
                    borderColor: gridColor,
                    borderWidth: 1,
                }
            },
            scales: {
                y: {
                    ticks: { color: textColor, font: { size: 12 } },
                    grid: { color: gridColor }
                },
                x: {
                    ticks: { color: textColor, font: { size: 12 } },
                    grid: { color: gridColor }
                }
            }
        };
    }, [theme]);

    // User Roles Data
    const userRolesData = useMemo(() => {
        const roles = users.reduce((acc, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            labels: Object.keys(roles).map(role => role.charAt(0).toUpperCase() + role.slice(1)),
            datasets: [{
                label: 'User Roles',
                data: Object.values(roles),
                backgroundColor: ['#3B82F6', '#10B981', '#8B5CF6'],
                borderColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                borderWidth: 2,
            }]
        };
    }, [users, theme]);

    // Vehicle Status Data
    const vehicleStatusData = useMemo(() => {
        const statuses = vehicles.reduce((acc, vehicle) => {
            acc[vehicle.status] = (acc[vehicle.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        const labels = ['available', 'in-use', 'maintenance'];
        const data = labels.map(status => statuses[status] || 0);

        return {
            labels: labels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
            datasets: [{
                label: 'Vehicle Status',
                data,
                backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
                borderRadius: 4,
            }]
        };
    }, [vehicles]);
    
    // Monthly Bookings Data
    const monthlyBookingsData = useMemo(() => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyCounts = Array(12).fill(0);
        
        bookings.forEach(booking => {
            const month = new Date(booking.date).getMonth();
            monthlyCounts[month]++;
        });

        return {
            labels: months,
            datasets: [{
                label: 'Bookings',
                data: monthlyCounts,
                fill: true,
                borderColor: '#3B82F6',
                backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                tension: 0.3,
            }]
        }
    }, [bookings, theme]);

    // Fuel Costs Data
    const fuelCostsData = useMemo(() => {
        const costs = fuelDetails.reduce((acc, detail) => {
            const cost = parseFloat(detail.cost.replace('₹', ''));
            acc[detail.vehicleNumber] = (acc[detail.vehicleNumber] || 0) + cost;
            return acc;
        }, {} as Record<string, number>);

        return {
            labels: Object.keys(costs),
            datasets: [{
                label: 'Total Fuel Cost (₹)',
                data: Object.values(costs),
                backgroundColor: '#A855F7',
                borderRadius: 4,
            }]
        };
    }, [fuelDetails]);


    const userRolesChartRef = useChart('doughnut', userRolesData, { ...chartOptions, scales: {} });
    const vehicleStatusChartRef = useChart('bar', vehicleStatusData, chartOptions);
    const monthlyBookingsChartRef = useChart('line', monthlyBookingsData, chartOptions);
    const fuelCostsChartRef = useChart('bar', fuelCostsData, { ...chartOptions, indexAxis: 'y' });


    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="User Role Distribution">
                <canvas ref={userRolesChartRef} />
            </ChartCard>
            <ChartCard title="Vehicle Status">
                <canvas ref={vehicleStatusChartRef} />
            </ChartCard>
            <div className="lg:col-span-2">
                <ChartCard title="Monthly Bookings">
                    <canvas ref={monthlyBookingsChartRef} />
                </ChartCard>
            </div>
             <div className="lg:col-span-2">
                <ChartCard title="Fuel Costs by Vehicle">
                    <canvas ref={fuelCostsChartRef} />
                </ChartCard>
            </div>
        </div>
    );
};

export default Analytics;