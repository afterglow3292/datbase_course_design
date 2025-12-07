// ============================================
// 仓库管理 - warehouses.js
// ============================================

class WarehouseTable {
    constructor(selector) {
        this.endpoint = '/api/warehouses';
        this.tableBody = document.querySelector(`${selector} tbody`);
        this.allWarehouses = [];
        if (!this.tableBody) return;
    }

    async loadWarehouses() {
        this.showLoading();
        try {
            const response = await fetch(this.endpoint);
            if (!response.ok) throw new Error('加载仓库数据失败');
            const warehouses = await response.json();
            this.allWarehouses = warehouses;
            this.render(warehouses);
        } catch (error) {
            console.error(error);
            this.tableBody.innerHTML = '<tr><td colspan="8" class="text-danger">无法加载仓库数据，请稍后重试</td></tr>';
        }
    }

    showLoading() {
        this.tableBody.innerHTML = '<tr><td colspan="8" class="text-center text-muted"><div class="spinner-border spinner-border-sm me-2"></div>正在加载...</td></tr>';
    }

    render(warehouses) {
        this.tableBody.innerHTML = '';
        if (!warehouses || warehouses.length === 0) {
            this.tableBody.innerHTML = '<tr><td colspan="8" class="text-muted text-center">暂无仓库数据</td></tr>';
            return;
        }

        warehouses.forEach(item => {
            const usageRate = this.calculateUsageRate(item);
            const row = document.createElement('tr');
            row.dataset.warehouseId = item.warehouseId;
            row.innerHTML = `
                <td class="text-muted">${item.warehouseId ?? '-'}</td>
                <td class="fw-semibold">${item.warehouseName ?? '-'}</td>
                <td>${this.renderType(item.warehouseType)}</td>
                <td>${this.formatNumber(item.totalCapacity)}</td>
                <td>${this.formatNumber(item.usedCapacity)}</td>
                <td>${this.renderUsageRate(usageRate)}</td>
                <td>${item.location ?? '-'}</td>
            `;

            const actionCell = document.createElement('td');
            actionCell.className = 'text-end';
            
            const editBtn = document.createElement('button');
            editBtn.className = 'btn btn-sm btn-outline-primary me-1';
            editBtn.textContent = '编辑';
            editBtn.onclick = () => openEditModal(item);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-sm btn-outline-danger';
            deleteBtn.textContent = '删除';
            deleteBtn.onclick = () => deleteWarehouse(item.warehouseId);

            actionCell.appendChild(editBtn);
            actionCell.appendChild(deleteBtn);
            row.appendChild(actionCell);

            this.tableBody.appendChild(row);
        });
    }

    renderType(type) {
        const map = {
            GENERAL: '<span class="badge bg-primary-subtle text-primary">综合仓库</span>',
            COLD: '<span class="badge bg-info-subtle text-info">冷藏仓库</span>',
            DANGEROUS: '<span class="badge bg-danger-subtle text-danger">危险品仓库</span>',
            CONTAINER: '<span class="badge bg-success-subtle text-success">集装箱堆场</span>'
        };
        return map[type] || type || '-';
    }

    calculateUsageRate(item) {
        if (!item.totalCapacity || item.totalCapacity <= 0) return 0;
        return ((item.usedCapacity || 0) / item.totalCapacity * 100).toFixed(1);
    }

    renderUsageRate(rate) {
        const numRate = parseFloat(rate);
        let colorClass = 'success';
        if (numRate >= 80) colorClass = 'danger';
        else if (numRate >= 60) colorClass = 'warning';
        return `<div class="progress" style="height: 20px;">
            <div class="progress-bar bg-${colorClass}" style="width: ${rate}%">${rate}%</div>
        </div>`;
    }

    formatNumber(value) {
        if (value == null) return '-';
        return parseFloat(value).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    filterByKeyword(keyword) {
        if (!keyword || keyword.trim() === '') {
            this.render(this.allWarehouses);
            return;
        }
        const lowerKeyword = keyword.toLowerCase();
        const filtered = this.allWarehouses.filter(item => {
            const name = (item.warehouseName || '').toLowerCase();
            const location = (item.location || '').toLowerCase();
            return name.includes(lowerKeyword) || location.includes(lowerKeyword);
        });
        this.render(filtered);
    }

    advancedFilter(filters) {
        let filtered = [...this.allWarehouses];
        if (filters.type) {
            filtered = filtered.filter(item => item.warehouseType === filters.type);
        }
        if (filters.minUsage !== '' && !isNaN(filters.minUsage)) {
            filtered = filtered.filter(item => this.calculateUsageRate(item) >= parseFloat(filters.minUsage));
        }
        if (filters.maxUsage !== '' && !isNaN(filters.maxUsage)) {
            filtered = filtered.filter(item => this.calculateUsageRate(item) <= parseFloat(filters.maxUsage));
        }
        this.render(filtered);
        return filtered.length;
    }
}

let warehouseTableInstance = null;
let currentEditingId = null;


// 创建仓库
async function saveWarehouse() {
    const form = document.getElementById('createWarehouseForm');
    const formData = {
        warehouseName: form.querySelector('[name="warehouseName"]').value.trim(),
        warehouseType: form.querySelector('[name="warehouseType"]').value,
        totalCapacity: parseFloat(form.querySelector('[name="totalCapacity"]').value) || 0,
        usedCapacity: parseFloat(form.querySelector('[name="usedCapacity"]').value) || 0,
        location: form.querySelector('[name="location"]').value.trim()
    };

    if (!formData.warehouseName || !formData.warehouseType || formData.totalCapacity <= 0) {
        alert('请填写仓库名称、类型和总容量！');
        return;
    }

    try {
        const response = await fetch('/api/warehouses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const result = await response.json();
        if (result.success) {
            alert('仓库创建成功！');
            const modal = bootstrap.Modal.getInstance(document.getElementById('createWarehouseModal'));
            modal.hide();
            form.reset();
            if (warehouseTableInstance) await warehouseTableInstance.loadWarehouses();
        } else {
            alert('创建失败：' + result.message);
        }
    } catch (error) {
        console.error(error);
        alert('网络错误，无法创建仓库！');
    }
}

// 打开编辑模态框
function openEditModal(warehouse) {
    currentEditingId = warehouse.warehouseId;
    const form = document.getElementById('editWarehouseForm');
    form.querySelector('[name="warehouseName"]').value = warehouse.warehouseName || '';
    form.querySelector('[name="warehouseType"]').value = warehouse.warehouseType || 'GENERAL';
    form.querySelector('[name="totalCapacity"]').value = warehouse.totalCapacity || '';
    form.querySelector('[name="usedCapacity"]').value = warehouse.usedCapacity || 0;
    form.querySelector('[name="location"]').value = warehouse.location || '';
    
    const modal = new bootstrap.Modal(document.getElementById('editWarehouseModal'));
    modal.show();
}

// 更新仓库
async function updateWarehouse() {
    if (!currentEditingId) return;
    const form = document.getElementById('editWarehouseForm');
    const formData = {
        warehouseName: form.querySelector('[name="warehouseName"]').value.trim(),
        warehouseType: form.querySelector('[name="warehouseType"]').value,
        totalCapacity: parseFloat(form.querySelector('[name="totalCapacity"]').value) || 0,
        usedCapacity: parseFloat(form.querySelector('[name="usedCapacity"]').value) || 0,
        location: form.querySelector('[name="location"]').value.trim()
    };

    if (!formData.warehouseName || !formData.warehouseType || formData.totalCapacity <= 0) {
        alert('请填写仓库名称、类型和总容量！');
        return;
    }

    try {
        const response = await fetch(`/api/warehouses/${currentEditingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const result = await response.json();
        if (result.success) {
            alert('仓库更新成功！');
            const modal = bootstrap.Modal.getInstance(document.getElementById('editWarehouseModal'));
            modal.hide();
            currentEditingId = null;
            if (warehouseTableInstance) await warehouseTableInstance.loadWarehouses();
        } else {
            alert('更新失败：' + result.message);
        }
    } catch (error) {
        console.error(error);
        alert('网络错误，无法更新仓库！');
    }
}

// 删除仓库
async function deleteWarehouse(warehouseId) {
    if (!warehouseId) return;
    if (!confirm('确定要删除此仓库吗？此操作不可恢复。')) return;

    try {
        const response = await fetch(`/api/warehouses/${warehouseId}`, { method: 'DELETE' });
        const result = await response.json();
        if (result.success) {
            alert('仓库已删除！');
            if (warehouseTableInstance) await warehouseTableInstance.loadWarehouses();
        } else {
            alert('删除失败：' + result.message);
        }
    } catch (error) {
        console.error(error);
        alert('网络错误，无法删除仓库！');
    }
}

// 页面初始化
document.addEventListener('DOMContentLoaded', async () => {
    console.log('仓库管理页面初始化...');
    
    warehouseTableInstance = new WarehouseTable('#warehouseTable');
    await warehouseTableInstance.loadWarehouses();
    
    // 搜索框事件
    const searchInput = document.getElementById('warehouseSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            if (warehouseTableInstance) warehouseTableInstance.filterByKeyword(e.target.value);
        });
    }
    
    // 刷新按钮
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            if (warehouseTableInstance) warehouseTableInstance.loadWarehouses();
            if (searchInput) searchInput.value = '';
        });
    }
    
    // 创建保存按钮
    document.getElementById('createSaveBtn')?.addEventListener('click', saveWarehouse);
    
    // 编辑保存按钮
    document.getElementById('editSaveBtn')?.addEventListener('click', updateWarehouse);
    
    // 编辑删除按钮
    document.getElementById('editDeleteBtn')?.addEventListener('click', () => {
        if (currentEditingId) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('editWarehouseModal'));
            if (modal) modal.hide();
            deleteWarehouse(currentEditingId);
        }
    });
    
    // 应用筛选按钮
    document.getElementById('applyFilterBtn')?.addEventListener('click', () => {
        const form = document.getElementById('filterForm');
        const filters = {
            type: form.querySelector('[name="filterType"]').value,
            minUsage: form.querySelector('[name="filterMinUsage"]').value,
            maxUsage: form.querySelector('[name="filterMaxUsage"]').value
        };
        if (warehouseTableInstance) warehouseTableInstance.advancedFilter(filters);
        const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('filterPanel'));
        if (offcanvas) offcanvas.hide();
    });
    
    // 清除筛选按钮
    document.getElementById('clearFilterBtn')?.addEventListener('click', () => {
        document.getElementById('filterForm').reset();
        if (warehouseTableInstance) warehouseTableInstance.render(warehouseTableInstance.allWarehouses);
        const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('filterPanel'));
        if (offcanvas) offcanvas.hide();
    });
    
    console.log('仓库管理页面初始化完成');
});
