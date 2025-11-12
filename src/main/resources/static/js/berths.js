class BerthManager {
    constructor() {
        this.tableBody = document.querySelector('#berthManagementTable tbody');
        this.berths = [
            { id: 1, ship: '海洋之星', berth: 'B-12', arrival: '2025-05-01 08:00', departure: '2025-05-02 02:00', status: 'CONFIRMED' },
            { id: 2, ship: '东方快车', berth: '锚地', arrival: '2025-05-03 14:30', departure: null, status: 'PLANNED' }
        ];
        this.render();
    }

    render() {
        if (!this.tableBody) {
            return;
        }
        this.tableBody.innerHTML = '';
        this.berths.forEach((item) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="text-muted">${item.id}</td>
                <td class="fw-semibold">${item.ship}</td>
                <td>${item.berth}</td>
                <td>${item.arrival}</td>
                <td>${item.departure ?? '待定'}</td>
                <td>${this.renderStatus(item.status)}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary me-1">编辑</button>
                    <button class="btn btn-sm btn-outline-danger">撤销</button>
                </td>
            `;
            this.tableBody.appendChild(row);
        });
    }

    renderStatus(status) {
        const map = {
            CONFIRMED: '<span class="badge bg-success-subtle text-success">已确认</span>',
            PLANNED: '<span class="badge bg-info-subtle text-info">计划</span>',
            DELAYED: '<span class="badge bg-warning-subtle text-warning">延迟</span>'
        };
        return map[status] || status;
    }
}

if (document.querySelector('#berthManagementTable')) {
    new BerthManager();
}
