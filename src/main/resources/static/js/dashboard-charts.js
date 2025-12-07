// ============================================
// 总览页面图表 - dashboard-charts.js
// ============================================

// 图表实例
let shipStatusChart = null;
let warehouseUsageChart = null;
let cargoTrendChart = null;

// 初始化所有图表
async function initDashboardCharts() {
    // 初始化图表实例
    const shipStatusDom = document.getElementById('shipStatusChart');
    const warehouseUsageDom = document.getElementById('warehouseUsageChart');
    const cargoTrendDom = document.getElementById('cargoTrendChart');

    if (shipStatusDom) shipStatusChart = echarts.init(shipStatusDom);
    if (warehouseUsageDom) warehouseUsageChart = echarts.init(warehouseUsageDom);
    if (cargoTrendDom) cargoTrendChart = echarts.init(cargoTrendDom);

    // 加载数据并渲染图表
    await Promise.all([
        loadShipStatusChart(),
        loadWarehouseUsageChart(),
        loadCargoTrendChart()
    ]);

    // 窗口大小变化时重新调整图表
    window.addEventListener('resize', () => {
        shipStatusChart?.resize();
        warehouseUsageChart?.resize();
        cargoTrendChart?.resize();
    });
}

// 1. 船舶状态分布（饼图）
async function loadShipStatusChart() {
    if (!shipStatusChart) return;
    
    try {
        const response = await fetch('/api/ships');
        const ships = await response.json();
        
        // 统计各状态数量
        const statusCount = {};
        ships.forEach(ship => {
            const status = ship.status || 'UNKNOWN';
            statusCount[status] = (statusCount[status] || 0) + 1;
        });

        // 状态名称映射
        const statusNames = {
            'ARRIVED': '已到港',
            'AT SEA': '在航',
            'AT_SEA': '在航',
            'SCHEDULED': '计划中',
            'LOADING': '装载中',
            'UNKNOWN': '未知'
        };

        // 转换为饼图数据
        const pieData = Object.entries(statusCount).map(([status, count]) => ({
            name: statusNames[status] || status,
            value: count
        }));

        shipStatusChart.setOption({
            tooltip: {
                trigger: 'item',
                formatter: '{b}: {c} 艘 ({d}%)'
            },
            legend: {
                orient: 'vertical',
                right: 10,
                top: 'center'
            },
            color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'],
            series: [{
                type: 'pie',
                radius: ['40%', '70%'],
                center: ['40%', '50%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 8,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: true,
                    formatter: '{b}\n{c}艘'
                },
                data: pieData.length > 0 ? pieData : [{ name: '暂无数据', value: 0 }]
            }]
        });
    } catch (error) {
        console.error('加载船舶状态图表失败:', error);
        shipStatusChart.setOption({
            title: { text: '数据加载失败', left: 'center', top: 'center', textStyle: { color: '#999' } }
        });
    }
}


// 2. 仓库使用率（柱状图）
async function loadWarehouseUsageChart() {
    if (!warehouseUsageChart) return;
    
    try {
        const response = await fetch('/api/warehouses');
        const warehouses = await response.json();
        
        // 提取仓库名称和使用率
        const names = warehouses.map(w => w.warehouseName || `仓库${w.warehouseId}`);
        const usageRates = warehouses.map(w => {
            if (!w.totalCapacity || w.totalCapacity <= 0) return 0;
            return ((w.usedCapacity || 0) / w.totalCapacity * 100).toFixed(1);
        });

        // 根据使用率设置颜色
        const colors = usageRates.map(rate => {
            if (rate >= 80) return '#ee6666';  // 红色 - 高使用率
            if (rate >= 60) return '#fac858';  // 黄色 - 中等
            return '#91cc75';  // 绿色 - 正常
        });

        warehouseUsageChart.setOption({
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: function(params) {
                    const w = warehouses[params[0].dataIndex];
                    return `${params[0].name}<br/>
                            使用率: ${params[0].value}%<br/>
                            已用: ${(w.usedCapacity || 0).toLocaleString()} m³<br/>
                            总量: ${(w.totalCapacity || 0).toLocaleString()} m³`;
                }
            },
            grid: { left: 80, right: 80, bottom: 80, top: 30 },
            xAxis: {
                type: 'category',
                data: names,
                axisLabel: { rotate: 25, fontSize: 10, interval: 0 }
            },
            yAxis: {
                type: 'value',
                name: '使用率',
                nameLocation: 'middle',
                nameGap: 50,
                max: 100,
                axisLabel: { formatter: '{value}%' }
            },
            series: [{
                type: 'bar',
                data: usageRates.map((value, index) => ({
                    value: value,
                    itemStyle: { color: colors[index] }
                })),
                barWidth: '50%',
                label: {
                    show: true,
                    position: 'top',
                    formatter: '{c}%',
                    fontSize: 10
                },
                markLine: {
                    silent: true,
                    data: [{
                        yAxis: 80,
                        lineStyle: { color: '#ee6666', type: 'dashed' },
                        label: { 
                            formatter: '警戒线80%',
                            position: 'insideEndTop',
                            fontSize: 10
                        }
                    }]
                }
            }]
        });
    } catch (error) {
        console.error('加载仓库使用率图表失败:', error);
        warehouseUsageChart.setOption({
            title: { text: '数据加载失败', left: 'center', top: 'center', textStyle: { color: '#999' } }
        });
    }
}

// 3. 货物吞吐量趋势（折线图）- 使用真实历史数据
async function loadCargoTrendChart() {
    if (!cargoTrendChart) return;
    
    try {
        // 从后端获取月度统计数据
        const response = await fetch('/api/cargo/stats/monthly');
        const monthlyStats = await response.json();
        
        // 提取月份和数据
        const months = monthlyStats.map(s => {
            const [year, month] = s.month.split('-');
            return `${parseInt(month)}月`;
        });
        const totalWeights = monthlyStats.map(s => Math.round(s.totalWeight * 100) / 100);
        const assignedWeights = monthlyStats.map(s => Math.round(s.assignedWeight * 100) / 100);
        const pendingWeights = monthlyStats.map(s => Math.round((s.totalWeight - s.assignedWeight) * 100) / 100);

        // 如果没有数据，显示提示
        if (months.length === 0) {
            cargoTrendChart.setOption({
                title: { text: '暂无历史数据', left: 'center', top: 'center', textStyle: { color: '#999', fontSize: 14 } }
            });
            return;
        }

        cargoTrendChart.setOption({
            tooltip: {
                trigger: 'axis',
                formatter: function(params) {
                    let result = params[0].name + '<br/>';
                    params.forEach(p => {
                        if (p.value !== null && p.value !== undefined) {
                            result += `${p.marker} ${p.seriesName}: ${p.value} 吨<br/>`;
                        }
                    });
                    return result;
                }
            },
            legend: {
                data: ['货物总量', '已分配', '待分配'],
                top: 5
            },
            grid: { left: 60, right: 30, bottom: 30, top: 50 },
            xAxis: {
                type: 'category',
                data: months,
                boundaryGap: false
            },
            yAxis: {
                type: 'value',
                name: '重量(吨)',
                axisLabel: { formatter: '{value}' }
            },
            series: [
                {
                    name: '货物总量',
                    type: 'line',
                    data: totalWeights,
                    smooth: true,
                    areaStyle: { opacity: 0.2 },
                    color: '#5470c6',
                    markPoint: {
                        data: [
                            { type: 'max', name: '最大值' },
                            { type: 'min', name: '最小值' }
                        ]
                    }
                },
                {
                    name: '已分配',
                    type: 'line',
                    data: assignedWeights,
                    smooth: true,
                    color: '#91cc75'
                },
                {
                    name: '待分配',
                    type: 'line',
                    data: pendingWeights,
                    smooth: true,
                    color: '#fac858'
                }
            ]
        });
    } catch (error) {
        console.error('加载货物趋势图表失败:', error);
        cargoTrendChart.setOption({
            title: { text: '数据加载失败', left: 'center', top: 'center', textStyle: { color: '#999' } }
        });
    }
}

// 页面加载完成后初始化图表
document.addEventListener('DOMContentLoaded', initDashboardCharts);
