class BerthTable {
    constructor(selector) {
        this.endpoint = '/api/berths';
        this.tableBody = document.querySelector(`${selector} tbody`);
        if (!this.tableBody) {
            return;
        }
        this.loadSchedules();
    }

    async loadSchedules() {
        try {
            const response = await fetch(this.endpoint);
            if (!response.ok) {
                throw new Error(`加载泊位数据失败：${response.status}`);
            }
            const schedules = await response.json();
            this.render(schedules);
        } catch (error) {
            console.error(error);
            this.tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-danger">无法加载泊位排程，请稍后重试。</td>
                </tr>
            `;
        }
    }

    render(schedules) {
        this.tableBody.innerHTML = '';
        schedules.forEach((item) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="text-muted">${item.id ?? '-'}</td>
                <td class="fw-semibold">${this.resolveShip(item.shipId)}</td>
                <td>${item.berthNumber ?? '-'}</td>
                <td>${this.formatDate(item.arrivalTime)}</td>
                <td>${this.formatDate(item.departureTime) ?? '待定'}</td>
                <td>${this.renderStatus(item.status)}</td>
            `;

            const actionCell = document.createElement('td');
            actionCell.className = 'text-end';
            actionCell.innerHTML = `
                <button class="btn btn-sm btn-outline-primary me-1" disabled>编辑</button>
                <button class="btn btn-sm btn-outline-danger" disabled>撤销</button>
            `;

            if (row.children.length < 7) {
                row.appendChild(actionCell);
            }

            this.tableBody.appendChild(row);
        });
    }

    renderStatus(status) {
        const map = {
            CONFIRMED: '<span class="badge bg-success-subtle text-success">已确认</span>',
            PLANNED: '<span class="badge bg-info-subtle text-info">计划</span>',
            DELAYED: '<span class="badge bg-warning-subtle text-warning">延迟</span>'
        };
        return map[status] || status || '-';
    }

    resolveShip(shipId) {
        if (shipId == null) {
            return '-';
        }
        return `船舶 #${shipId}`;
    }

    formatDate(dateTime) {
        if (!dateTime) {
            return '待定';
        }
        try {
            const date = new Date(dateTime);
            return date.toLocaleString();
        } catch (e) {
            return dateTime;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    ['#berthManagementTable', '#berthTable'].forEach((selector) => {
        new BerthTable(selector);
    });
});
