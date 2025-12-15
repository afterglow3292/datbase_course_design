// ============================================
// 航次计划管理 - voyages.js
// ============================================

// 船舶管理器
const ShipManager = {
    ships: [],
    loaded: false,

    async loadShips() {
        if (this.loaded) return this.ships;
        try {
            const response = await fetch('/api/ships');
            if (!response.ok) throw new Error('加载船舶失败');
            this.ships = await response.json();
            this.loaded = true;
            return this.ships;
        } catch (error) {
            console.error('加载船舶列表失败：', error);
            return [];
        }
    },

    getShipName(shipId) {
        if (shipId == null || shipId === 0) return '无船舶';
        const ship = this.ships.find(s => s.id === shipId);
        return ship ? ship.name : '未知船舶';
    },

    populateSelector(selector) {
        const selectElement = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (!selectElement) return;
        const currentValue = selectElement.value;
        selectElement.innerHTML = '<option value="">请选择船舶</option>';
        this.ships.forEach(ship => {
            const option = document.createElement('option');
            option.value = ship.id;
            option.textContent = `#${ship.id} · ${ship.name}`;
            selectElement.appendChild(option);
        });
        if (currentValue) selectElement.value = currentValue;
    }
};

// 泊位管理器
const BerthManager = {
    berths: [],
    loaded: false,

    async loadBerths() {
        if (this.loaded) return this.berths;
        try {
            const response = await fetch('/api/berths');
            if (!response.ok) throw new Error('加载泊位失败');
            this.berths = await response.json();
            this.loaded = true;
            return this.berths;
        } catch (error) {
            console.error('加载泊位列表失败：', error);
            return [];
        }
    },

    populateSelector(selector) {
        const selectElement = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (!selectElement) return;
        const currentValue = selectElement.value;
        selectElement.innerHTML = '<option value="">暂不分配</option>';
        this.berths.forEach(berth => {
            const option = document.createElement('option');
            option.value = berth.id || berth.berthId;
            option.textContent = `泊位 ${berth.berthNumber}`;
            selectElement.appendChild(option);
        });
        if (currentValue) selectElement.value = currentValue;
    }
};

// 港口管理器
const PortManager = {
    ports: [],
    loaded: false,

    async loadPorts() {
        if (this.loaded) return this.ports;
        try {
            const response = await fetch('/api/ports');
            if (!response.ok) throw new Error('加载港口失败');
            this.ports = await response.json();
            this.loaded = true;
            return this.ports;
        } catch (error) {
            console.error('加载港口列表失败：', error);
            return [];
        }
    },

    getPortName(portId) {
        if (portId == null) return '-';
        const port = this.ports.find(p => p.portId === portId);
        return port ? port.portName : `港口 #${portId}`;
    },

    populateSelector(selector) {
        const selectElement = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (!selectElement) return;
        const currentValue = selectElement.value;
        selectElement.innerHTML = '<option value="">请选择港口</option>';
        this.ports.forEach(port => {
            const option = document.createElement('option');
            option.value = port.portId;
            option.textContent = `${port.portCode} · ${port.portName}`;
            selectElement.appendChild(option);
        });
        if (currentValue) selectElement.value = currentValue;
    }
};


// 航次表格类
class VoyageTable {
    constructor(selector) {
        this.endpoint = '/api/voyages';
        this.tableBody = document.querySelector(`${selector} tbody`);
        this.allVoyages = [];
        if (!this.tableBody) return;
    }

    async loadVoyages() {
        this.showLoading();
        try {
            const response = await fetch(this.endpoint);
            if (!response.ok) throw new Error('加载航次数据失败');
            const voyages = await response.json();
            console.log('航次数据:', voyages); // 调试：打印后端返回的数据
            this.allVoyages = voyages;
            this.render(voyages);
        } catch (error) {
            console.error(error);
            this.tableBody.innerHTML = '<tr><td colspan="9" class="text-danger">无法加载航次数据，请稍后重试</td></tr>';
        }
    }

    showLoading() {
        this.tableBody.innerHTML = '<tr><td colspan="9" class="text-center text-muted"><div class="spinner-border spinner-border-sm me-2"></div>正在加载...</td></tr>';
    }

    render(voyages) {
        this.tableBody.innerHTML = '';
        if (!voyages || voyages.length === 0) {
            this.tableBody.innerHTML = '<tr><td colspan="9" class="text-muted text-center">暂无航次数据</td></tr>';
            return;
        }

        voyages.forEach(item => {
            const row = document.createElement('tr');
            row.dataset.voyageId = item.planId;
            // 使用港口名称字段或通过ID查找
            const departurePortName = item.departurePortName || PortManager.getPortName(item.departurePortId);
            const arrivalPortName = item.arrivalPortName || PortManager.getPortName(item.arrivalPortId);
            // 优先使用后端返回的shipName
            const shipName = item.shipName || ShipManager.getShipName(item.shipId);
            row.innerHTML = `
                <td class="text-muted">${item.planId ?? '-'}</td>
                <td class="fw-semibold">${item.voyageNumber ?? '-'}</td>
                <td>${shipName}</td>
                <td>${departurePortName}</td>
                <td>${arrivalPortName}</td>
                <td>${this.formatDate(item.plannedDeparture)}</td>
                <td>${this.formatDate(item.plannedArrival)}</td>
                <td>${this.renderStatus(item.voyageStatus)}</td>
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
            deleteBtn.onclick = () => deleteVoyage(item.planId);

            actionCell.appendChild(editBtn);
            actionCell.appendChild(deleteBtn);
            row.appendChild(actionCell);

            this.tableBody.appendChild(row);
        });
    }

    renderStatus(status) {
        const map = {
            SCHEDULED: '<span class="badge bg-info-subtle text-info">计划中</span>',
            PLANNED: '<span class="badge bg-info-subtle text-info">计划中</span>',
            IN_PROGRESS: '<span class="badge bg-primary-subtle text-primary">进行中</span>',
            COMPLETED: '<span class="badge bg-success-subtle text-success">已完成</span>',
            CANCELLED: '<span class="badge bg-secondary-subtle text-secondary">已取消</span>'
        };
        return map[status] || status || '-';
    }

    formatDate(dateTime) {
        if (!dateTime) return '待定';
        try {
            const date = new Date(dateTime);
            return date.toLocaleString('zh-CN', {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit'
            });
        } catch (e) {
            return dateTime;
        }
    }

    filterByKeyword(keyword) {
        if (!keyword || keyword.trim() === '') {
            this.render(this.allVoyages);
            return;
        }
        const lowerKeyword = keyword.toLowerCase();
        const filtered = this.allVoyages.filter(item => {
            const voyageNumber = (item.voyageNumber || '').toLowerCase();
            const departurePort = (item.departurePort || '').toLowerCase();
            const arrivalPort = (item.arrivalPort || '').toLowerCase();
            return voyageNumber.includes(lowerKeyword) || departurePort.includes(lowerKeyword) || arrivalPort.includes(lowerKeyword);
        });
        this.render(filtered);
    }

    advancedFilter(filters) {
        let filtered = [...this.allVoyages];
        if (filters.status) {
            filtered = filtered.filter(item => item.voyageStatus === filters.status);
        }
        if (filters.shipId) {
            filtered = filtered.filter(item => item.shipId === parseInt(filters.shipId));
        }
        if (filters.startTime) {
            const startDate = new Date(filters.startTime);
            filtered = filtered.filter(item => item.plannedDeparture && new Date(item.plannedDeparture) >= startDate);
        }
        if (filters.endTime) {
            const endDate = new Date(filters.endTime);
            filtered = filtered.filter(item => item.plannedDeparture && new Date(item.plannedDeparture) <= endDate);
        }
        this.render(filtered);
        return filtered.length;
    }
}

let voyageTableInstance = null;
let currentEditingId = null;


// 时间格式转换
function formatDateTimeForInput(isoStr) {
    if (!isoStr) return '';
    return isoStr.substring(0, 16);
}

function formatDateTimeForBackend(datetimeStr) {
    if (!datetimeStr || datetimeStr.trim() === '') return null;
    return datetimeStr.includes(':') && datetimeStr.split(':').length === 2 ? datetimeStr + ':00' : datetimeStr;
}

// 创建航次
async function saveVoyage() {
    const form = document.getElementById('createVoyageForm');
    const formData = {
        voyageNumber: form.querySelector('[name="voyageNumber"]').value.trim(),
        shipId: parseInt(form.querySelector('[name="shipId"]').value),
        departurePortId: parseInt(form.querySelector('[name="departurePortId"]').value),
        arrivalPortId: parseInt(form.querySelector('[name="arrivalPortId"]').value),
        plannedDeparture: formatDateTimeForBackend(form.querySelector('[name="plannedDeparture"]').value),
        plannedArrival: formatDateTimeForBackend(form.querySelector('[name="plannedArrival"]').value),
        voyageStatus: form.querySelector('[name="voyageStatus"]').value,
        assignedBerthId: form.querySelector('[name="assignedBerthId"]').value || null
    };

    if (!formData.voyageNumber || !formData.shipId || !formData.departurePortId || !formData.arrivalPortId || !formData.plannedDeparture || !formData.plannedArrival) {
        alert('请填写所有必填项！');
        return;
    }

    try {
        const response = await fetch('/api/voyages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const result = await response.json();
        if (result.success) {
            alert('航次计划创建成功！');
            const modal = bootstrap.Modal.getInstance(document.getElementById('createVoyageModal'));
            modal.hide();
            form.reset();
            ShipManager.populateSelector('#createVoyageModal select[name="shipId"]');
            PortManager.populateSelector('#createVoyageModal select[name="departurePortId"]');
            PortManager.populateSelector('#createVoyageModal select[name="arrivalPortId"]');
            BerthManager.populateSelector('#createVoyageModal select[name="assignedBerthId"]');
            if (voyageTableInstance) await voyageTableInstance.loadVoyages();
        } else {
            alert('创建失败：' + result.message);
        }
    } catch (error) {
        console.error(error);
        alert('网络错误，无法创建航次！');
    }
}

// 打开编辑模态框
function openEditModal(voyage) {
    currentEditingId = voyage.planId;
    const form = document.getElementById('editVoyageForm');
    form.querySelector('[name="voyageNumber"]').value = voyage.voyageNumber || '';
    form.querySelector('[name="shipId"]').value = voyage.shipId || '';
    form.querySelector('[name="departurePortId"]').value = voyage.departurePortId || '';
    form.querySelector('[name="arrivalPortId"]').value = voyage.arrivalPortId || '';
    form.querySelector('[name="plannedDeparture"]').value = formatDateTimeForInput(voyage.plannedDeparture);
    form.querySelector('[name="plannedArrival"]').value = formatDateTimeForInput(voyage.plannedArrival);
    form.querySelector('[name="actualDeparture"]').value = formatDateTimeForInput(voyage.actualDeparture);
    form.querySelector('[name="actualArrival"]').value = formatDateTimeForInput(voyage.actualArrival);
    form.querySelector('[name="voyageStatus"]').value = voyage.voyageStatus || 'SCHEDULED';
    form.querySelector('[name="assignedBerthId"]').value = voyage.assignedBerthId || '';
    
    const modal = new bootstrap.Modal(document.getElementById('editVoyageModal'));
    modal.show();
}

// 更新航次
async function updateVoyage() {
    if (!currentEditingId) return;
    const form = document.getElementById('editVoyageForm');
    const formData = {
        voyageNumber: form.querySelector('[name="voyageNumber"]').value.trim(),
        shipId: parseInt(form.querySelector('[name="shipId"]').value),
        departurePortId: parseInt(form.querySelector('[name="departurePortId"]').value),
        arrivalPortId: parseInt(form.querySelector('[name="arrivalPortId"]').value),
        plannedDeparture: formatDateTimeForBackend(form.querySelector('[name="plannedDeparture"]').value),
        plannedArrival: formatDateTimeForBackend(form.querySelector('[name="plannedArrival"]').value),
        actualDeparture: formatDateTimeForBackend(form.querySelector('[name="actualDeparture"]').value),
        actualArrival: formatDateTimeForBackend(form.querySelector('[name="actualArrival"]').value),
        voyageStatus: form.querySelector('[name="voyageStatus"]').value,
        assignedBerthId: form.querySelector('[name="assignedBerthId"]').value || null
    };

    if (!formData.voyageNumber || !formData.shipId || !formData.departurePortId || !formData.arrivalPortId || !formData.plannedDeparture || !formData.plannedArrival) {
        alert('请填写所有必填项！');
        return;
    }

    try {
        const response = await fetch(`/api/voyages/${currentEditingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const result = await response.json();
        if (result.success) {
            alert('航次计划更新成功！');
            const modal = bootstrap.Modal.getInstance(document.getElementById('editVoyageModal'));
            modal.hide();
            currentEditingId = null;
            if (voyageTableInstance) await voyageTableInstance.loadVoyages();
        } else {
            alert('更新失败：' + result.message);
        }
    } catch (error) {
        console.error(error);
        alert('网络错误，无法更新航次！');
    }
}

// 删除航次
async function deleteVoyage(voyageId) {
    if (!voyageId) return;
    if (!confirm('确定要删除此航次计划吗？此操作不可恢复。')) return;

    try {
        const response = await fetch(`/api/voyages/${voyageId}`, { method: 'DELETE' });
        const result = await response.json();
        if (result.success) {
            alert('航次计划已删除！');
            if (voyageTableInstance) await voyageTableInstance.loadVoyages();
        } else {
            alert('删除失败：' + result.message);
        }
    } catch (error) {
        console.error(error);
        alert('网络错误，无法删除航次！');
    }
}


// 页面初始化
document.addEventListener('DOMContentLoaded', async () => {
    console.log('航次计划页面初始化...');
    
    // 初始化表格
    voyageTableInstance = new VoyageTable('#voyageTable');
    voyageTableInstance.showLoading();
    
    // 并行加载数据
    await Promise.all([
        ShipManager.loadShips(),
        BerthManager.loadBerths(),
        PortManager.loadPorts(),
        voyageTableInstance.loadVoyages()
    ]);
    
    // 填充选择器
    ShipManager.populateSelector('#createVoyageModal select[name="shipId"]');
    ShipManager.populateSelector('#editVoyageModal select[name="shipId"]');
    ShipManager.populateSelector('#filterPanel select[name="filterShip"]');
    PortManager.populateSelector('#createVoyageModal select[name="departurePortId"]');
    PortManager.populateSelector('#createVoyageModal select[name="arrivalPortId"]');
    PortManager.populateSelector('#editVoyageModal select[name="departurePortId"]');
    PortManager.populateSelector('#editVoyageModal select[name="arrivalPortId"]');
    BerthManager.populateSelector('#createVoyageModal select[name="assignedBerthId"]');
    BerthManager.populateSelector('#editVoyageModal select[name="assignedBerthId"]');
    
    // 搜索框事件
    const searchInput = document.getElementById('voyageSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            if (voyageTableInstance) voyageTableInstance.filterByKeyword(e.target.value);
        });
    }
    
    // 刷新按钮
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            if (voyageTableInstance) voyageTableInstance.loadVoyages();
            if (searchInput) searchInput.value = '';
        });
    }
    
    // 创建保存按钮
    const createSaveBtn = document.getElementById('createSaveBtn');
    if (createSaveBtn) {
        createSaveBtn.addEventListener('click', saveVoyage);
    }
    
    // 编辑保存按钮
    const editSaveBtn = document.getElementById('editSaveBtn');
    if (editSaveBtn) {
        editSaveBtn.addEventListener('click', updateVoyage);
    }
    
    // 编辑删除按钮
    const editDeleteBtn = document.getElementById('editDeleteBtn');
    if (editDeleteBtn) {
        editDeleteBtn.addEventListener('click', () => {
            if (currentEditingId) {
                const modal = bootstrap.Modal.getInstance(document.getElementById('editVoyageModal'));
                if (modal) modal.hide();
                deleteVoyage(currentEditingId);
            }
        });
    }
    
    // 应用筛选按钮
    const applyFilterBtn = document.getElementById('applyFilterBtn');
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', () => {
            const form = document.getElementById('filterForm');
            const filters = {
                status: form.querySelector('[name="filterStatus"]').value,
                shipId: form.querySelector('[name="filterShip"]').value,
                startTime: form.querySelector('[name="filterStartTime"]').value,
                endTime: form.querySelector('[name="filterEndTime"]').value
            };
            if (voyageTableInstance) voyageTableInstance.advancedFilter(filters);
            const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('filterPanel'));
            if (offcanvas) offcanvas.hide();
        });
    }
    
    // 清除筛选按钮
    const clearFilterBtn = document.getElementById('clearFilterBtn');
    if (clearFilterBtn) {
        clearFilterBtn.addEventListener('click', () => {
            const form = document.getElementById('filterForm');
            form.reset();
            ShipManager.populateSelector('#filterPanel select[name="filterShip"]');
            if (voyageTableInstance) voyageTableInstance.render(voyageTableInstance.allVoyages);
            const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('filterPanel'));
            if (offcanvas) offcanvas.hide();
        });
    }
    
    console.log('航次计划页面初始化完成');
});
