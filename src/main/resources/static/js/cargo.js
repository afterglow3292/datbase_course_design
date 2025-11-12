class CargoManager {
    constructor() {
        this.tableBody = document.querySelector('#cargoManagementTable tbody');
        this.cargo = [
            { id: 1, description: '电子元器件 A', weight: 4.5, destination: '上海', ship: null, status: 'PENDING' },
            { id: 2, description: '汽车零部件', weight: 7.8, destination: '洛杉矶', ship: '海洋之星', status: 'ASSIGNED' }
        ];
        this.render();
    }

    render() {
        if (!this.tableBody) {
            return;
        }
        this.tableBody.innerHTML = '';
        this.cargo.forEach((item) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="text-muted">${item.id}</td>
                <td class="fw-semibold">${item.description}</td>
                <td>${item.weight.toFixed(2)}</td>
                <td>${item.destination}</td>
                <td>${item.ship ?? '待分配'}</td>
                <td>${this.renderStatus(item.status)}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary me-1">编辑</button>
                    <button class="btn btn-sm btn-outline-danger">删除</button>
                </td>
            `;
            this.tableBody.appendChild(row);
        });
    }

    renderStatus(status) {
        if (status === 'ASSIGNED') {
            return '<span class="badge bg-success-subtle text-success">已分配</span>';
        }
        return '<span class="badge bg-warning-subtle text-warning">待分配</span>';
    }
}

if (document.querySelector('#cargoManagementTable')) {
    new CargoManager();
}
