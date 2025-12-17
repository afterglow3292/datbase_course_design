// ============================================
// PortManager - 港口数据管理模块
// ============================================
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
        if (portId == null || portId === 0) return '未知港口';
        const port = this.ports.find(p => p.portId === portId);
        return port ? port.portName : '未知港口';
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

// ============================================
// ShipManager - 船舶数据管理模块
// Requirements: 1.4, 2.2
// ============================================
const ShipManager = {
    ships: [],
    loaded: false,

    // 从API加载船舶列表
    async loadShips() {
        if (this.loaded) return this.ships;
        try {
            const response = await fetch('/api/ships');
            if (!response.ok) {
                throw new Error(`加载船舶数据失败：${response.status}`);
            }
            this.ships = await response.json();
            this.loaded = true;
            // 同时设置到window.ships以保持兼容性
            window.ships = this.ships;
            return this.ships;
        } catch (error) {
            console.error('加载船舶列表失败：', error);
            return [];
        }
    },

    // 根据ID获取船舶名称
    getShipName(shipId) {
        if (shipId == null || shipId === 0) return null; // 返回null表示无船舶
        const ship = this.ships.find(s => s.id === shipId);
        return ship ? ship.name : '未知船舶';
    },

    // 填充船舶选择器
    populateSelector(selector) {
        const selectElement = typeof selector === 'string' 
            ? document.querySelector(selector) 
            : selector;
        if (!selectElement) return;

        selectElement.innerHTML = '<option value="">无船舶（空闲泊位）</option>';
        this.ships.forEach(ship => {
            const option = document.createElement('option');
            option.value = ship.id;
            option.textContent = `#${ship.id} · ${ship.name}`;
            selectElement.appendChild(option);
        });
    }
};

// ============================================
// FormManager - 表单管理模块
// Requirements: 2.3, 2.6, 3.1
// ============================================
const FormManager = {
    // 时间格式转换：datetime-local → ISO格式
    formatDateTimeForBackend(datetimeStr) {
        if (!datetimeStr || datetimeStr.trim() === '') return null;
        // datetime-local格式：2025-06-10T10:00，需要补充秒
        return datetimeStr.includes(':') && datetimeStr.split(':').length === 2 
            ? datetimeStr + ':00' 
            : datetimeStr;
    },

    // 时间格式转换：ISO格式 → datetime-local
    formatDateTimeForInput(isoStr) {
        if (!isoStr) return '';
        // ISO格式可能是 2025-06-10T10:00:00，需要截取到分钟
        return isoStr.substring(0, 16);
    },

    // 表单验证
    validateForm(formData) {
        if (!formData.berthNumber || formData.berthNumber.trim() === '') {
            return { valid: false, message: '请填写泊位编号！' };
        }
        // 如果状态是占用中，则必须选择船舶
        if (formData.status === 'OCCUPIED') {
            if (!formData.shipId || isNaN(formData.shipId) || formData.shipId <= 0) {
                return { valid: false, message: '占用状态必须选择船舶！' };
            }
            if (!formData.arrivalTime) {
                return { valid: false, message: '占用状态必须填写到港时间！' };
            }
        }
        return { valid: true };
    },

    // 填充编辑表单
    populateEditForm(schedule) {
        const form = document.querySelector('#editBerthModal form');
        if (!form || !schedule) return;

        // 存储当前编辑的排程ID
        form.dataset.scheduleId = schedule.id || schedule.berthId;

        // 填充港口选择器
        const portSelect = form.querySelector('select[name="portId"]');
        if (portSelect) portSelect.value = schedule.portId || '';

        // 填充船舶选择器
        const shipSelect = form.querySelector('select[name="shipId"]');
        if (shipSelect) shipSelect.value = schedule.shipId;

        // 填充泊位编号
        const berthInput = form.querySelector('input[name="berthNumber"]');
        if (berthInput) berthInput.value = schedule.berthNumber || '';

        // 填充状态
        const statusSelect = form.querySelector('select[name="status"]');
        if (statusSelect) statusSelect.value = schedule.status || 'PLANNED';

        // 填充时间
        const arrivalInput = form.querySelector('input[name="arrivalTime"]');
        if (arrivalInput) arrivalInput.value = this.formatDateTimeForInput(schedule.arrivalTime);

        const departureInput = form.querySelector('input[name="departureTime"]');
        if (departureInput) departureInput.value = this.formatDateTimeForInput(schedule.departureTime);
    },

    // 收集创建表单数据
    collectCreateFormData() {
        const form = document.querySelector('#createBerthModal form');
        const shipIdValue = form.querySelector('select[name="shipId"]').value;
        return {
            portId: parseInt(form.querySelector('select[name="portId"]').value) || 1,
            shipId: shipIdValue ? parseInt(shipIdValue) : 0, // 空值时为0
            berthNumber: form.querySelector('input[name="berthNumber"]').value.trim(),
            arrivalTime: this.formatDateTimeForBackend(form.querySelector('input[name="arrivalTime"]').value),
            departureTime: this.formatDateTimeForBackend(form.querySelector('input[name="departureTime"]').value),
            status: form.querySelector('select[name="status"]').value || 'AVAILABLE'
        };
    },

    // 收集编辑表单数据
    collectEditFormData() {
        const form = document.querySelector('#editBerthModal form');
        const shipIdValue = form.querySelector('select[name="shipId"]').value;
        return {
            id: parseInt(form.dataset.scheduleId),
            portId: parseInt(form.querySelector('select[name="portId"]').value) || 1,
            shipId: shipIdValue ? parseInt(shipIdValue) : 0, // 空值时为0
            berthNumber: form.querySelector('input[name="berthNumber"]').value.trim(),
            arrivalTime: this.formatDateTimeForBackend(form.querySelector('input[name="arrivalTime"]').value),
            departureTime: this.formatDateTimeForBackend(form.querySelector('input[name="departureTime"]').value),
            status: form.querySelector('select[name="status"]').value || 'AVAILABLE'
        };
    }
};

// ============================================
// BerthTable Class - 泊位排程表格
// Requirements: 1.1, 1.2, 1.3, 1.4, 5.1, 6.1, 6.2, 6.3
// ============================================
class BerthTable {
    constructor(selector) {
        this.endpoint = '/api/berths';
        this.selector = selector;
        this.tableBody = document.querySelector(`${selector} tbody`);
        this.allSchedules = []; // 缓存所有数据用于筛选
        if (!this.tableBody) {
            return;
        }
    }

    async loadSchedules() {
        this.showLoading();
        try {
            const response = await fetch(this.endpoint);
            if (!response.ok) {
                throw new Error(`加载泊位数据失败：${response.status}`);
            }
            const schedules = await response.json();
            this.allSchedules = schedules;
            this.render(schedules);
        } catch (error) {
            console.error(error);
            this.tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-danger">无法加载泊位排程，请稍后重试。</td>
                </tr>
            `;
        }
    }

    // 显示加载中
    showLoading() {
        this.tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted">
                    <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                    正在加载数据...
                </td>
            </tr>
        `;
    }

    render(schedules) {
        this.tableBody.innerHTML = '';
        if (!schedules || schedules.length === 0) {
            this.tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-muted text-center">暂无排程数据</td>
                </tr>
            `;
            return;
        }

        schedules.forEach((item) => {
            const row = document.createElement('tr');
            row.dataset.scheduleId = item.id || item.berthId;
            // 获取港口名称：优先使用返回的portName，否则通过portId查找
            const portName = item.portName || PortManager.getPortName(item.portId);
            row.innerHTML = `
                <td class="text-muted">${item.id ?? item.berthId ?? '-'}</td>
                <td><span class="badge bg-primary-subtle text-primary">${portName}</span></td>
                <td>${this.resolveShip(item)}</td>
                <td>${item.berthNumber ?? '-'}</td>
                <td>${this.formatDate(item.arrivalTime)}</td>
                <td>${this.formatDate(item.departureTime)}</td>
                <td>${this.renderStatus(item.status)}</td>
            `;

            const actionCell = document.createElement('td');
            actionCell.className = 'text-end';
            
            // 创建编辑按钮
            const editBtn = document.createElement('button');
            editBtn.className = 'btn btn-sm btn-outline-primary me-1';
            editBtn.textContent = '编辑';
            editBtn.onclick = () => openEditModal(item);

            // 创建撤销按钮
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-sm btn-outline-danger';
            deleteBtn.textContent = '撤销';
            deleteBtn.onclick = () => deleteBerthSchedule(item.id || item.berthId);

            actionCell.appendChild(editBtn);
            actionCell.appendChild(deleteBtn);
            row.appendChild(actionCell);

            this.tableBody.appendChild(row);
        });
    }

    renderStatus(status) {
        const map = {
            // 泊位状态
            AVAILABLE: '<span class="badge bg-success-subtle text-success">空闲</span>',
            OCCUPIED: '<span class="badge bg-primary-subtle text-primary">占用中</span>',
            MAINTENANCE: '<span class="badge bg-warning-subtle text-warning">维护中</span>',
            // 排程状态
            CONFIRMED: '<span class="badge bg-success-subtle text-success">已确认</span>',
            PLANNED: '<span class="badge bg-info-subtle text-info">计划中</span>',
            DELAYED: '<span class="badge bg-danger-subtle text-danger">延迟</span>',
            CANCELLED: '<span class="badge bg-secondary">已取消</span>'
        };
        return map[status] || `<span class="badge bg-secondary">${status || '-'}</span>`;
    }

    resolveShip(item) {
        // 优先使用后端返回的shipName
        if (item.shipName) {
            return `<span class="fw-semibold text-primary">${item.shipName}</span>`;
        }
        // 备用：通过ShipManager获取
        const shipName = ShipManager.getShipName(item.shipId);
        if (shipName) {
            return `<span class="fw-semibold text-primary">${shipName}</span>`;
        }
        // 无船舶时显示空闲状态
        return '<span class="text-muted fst-italic">空闲</span>';
    }

    formatDate(dateTime) {
        if (!dateTime) {
            return '待定';
        }
        try {
            const date = new Date(dateTime);
            return date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateTime;
        }
    }

    // 关键词筛选
    filterByKeyword(keyword) {
        if (!keyword || keyword.trim() === '') {
            this.render(this.allSchedules);
            return;
        }
        const lowerKeyword = keyword.toLowerCase();
        const filtered = this.allSchedules.filter(item => {
            const shipName = ShipManager.getShipName(item.shipId).toLowerCase();
            const berthNumber = (item.berthNumber || '').toLowerCase();
            return shipName.includes(lowerKeyword) || berthNumber.includes(lowerKeyword);
        });
        this.render(filtered);
    }

    // 高级筛选
    advancedFilter(filters) {
        let filtered = [...this.allSchedules];

        // 按状态筛选
        if (filters.status) {
            filtered = filtered.filter(item => item.status === filters.status);
        }

        // 按船舶筛选
        if (filters.shipId) {
            filtered = filtered.filter(item => item.shipId === parseInt(filters.shipId));
        }

        // 按泊位编号筛选
        if (filters.berthNumber) {
            const keyword = filters.berthNumber.toLowerCase();
            filtered = filtered.filter(item => 
                (item.berthNumber || '').toLowerCase().includes(keyword)
            );
        }

        // 按时间范围筛选
        if (filters.startTime) {
            const startDate = new Date(filters.startTime);
            filtered = filtered.filter(item => {
                if (!item.arrivalTime) return false;
                return new Date(item.arrivalTime) >= startDate;
            });
        }

        if (filters.endTime) {
            const endDate = new Date(filters.endTime);
            filtered = filtered.filter(item => {
                if (!item.arrivalTime) return false;
                return new Date(item.arrivalTime) <= endDate;
            });
        }

        this.render(filtered);
        return filtered.length;
    }
}

// ============================================
// 全局表格实例
// ============================================
let berthTableInstance = null;


// ============================================
// 创建排程功能
// Requirements: 2.3, 2.4, 2.5, 2.6
// ============================================
async function saveBerthSchedule() {
    console.log('=== saveBerthSchedule 开始执行 ===');
    
    try {
        const formData = FormManager.collectCreateFormData();
        console.log('收集到的表单数据：', formData);
        
        // 表单验证
        const validation = FormManager.validateForm(formData);
        if (!validation.valid) {
            alert(validation.message);
            return;
        }

        console.log('发送POST请求到 /api/berths');
        const response = await fetch('/api/berths', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.text();
        console.log('服务器响应：', response.status, result);
        
        if (response.ok) {
            alert(result || "泊位排程创建成功！");
            // 关闭模态框
            const modalEl = document.getElementById('createBerthModal');
            const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
            modal.hide();
            // 清空表单
            document.querySelector('#createBerthModal form').reset();
            // 重新填充选择器（因为reset会清空）
            PortManager.populateSelector('#createBerthModal select[name="portId"]');
            ShipManager.populateSelector('#createBerthModal select[name="shipId"]');
            // 刷新表格
            if (berthTableInstance) {
                await berthTableInstance.loadSchedules();
            }
        } else {
            alert('保存失败：' + result);
        }
    } catch (error) {
        console.error('保存排程出错：', error);
        alert('网络错误，无法保存排程！错误：' + error.message);
    }
}

// ============================================
// 编辑排程功能
// Requirements: 3.1, 3.2, 3.3, 3.4
// ============================================
function openEditModal(schedule) {
    FormManager.populateEditForm(schedule);
    const modal = new bootstrap.Modal(document.getElementById('editBerthModal'));
    modal.show();
}

async function updateBerthSchedule() {
    console.log('=== updateBerthSchedule 开始执行 ===');
    
    try {
        const formData = FormManager.collectEditFormData();
        console.log('收集到的编辑表单数据：', formData);
        
        // 表单验证
        const validation = FormManager.validateForm(formData);
        if (!validation.valid) {
            alert(validation.message);
            return;
        }

        if (!formData.id || isNaN(formData.id)) {
            alert('排程ID无效，请重新打开编辑窗口');
            return;
        }

        console.log('发送PUT请求到 /api/berths/' + formData.id);
        const response = await fetch(`/api/berths/${formData.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.text();
        console.log('服务器响应：', response.status, result);
        
        if (response.ok) {
            alert(result || "泊位排程更新成功！");
            // 关闭模态框
            const modalEl = document.getElementById('editBerthModal');
            const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
            modal.hide();
            // 刷新表格
            if (berthTableInstance) {
                await berthTableInstance.loadSchedules();
            }
        } else {
            alert('更新失败：' + result);
        }
    } catch (error) {
        console.error('更新排程出错：', error);
        alert('网络错误，无法更新排程！错误：' + error.message);
    }
}

// ============================================
// 删除排程功能
// Requirements: 4.1, 4.2, 4.3, 4.4
// ============================================
async function deleteBerthSchedule(scheduleId) {
    console.log('=== deleteBerthSchedule 开始执行，ID:', scheduleId, '===');
    
    if (!scheduleId) {
        alert('排程ID无效');
        return;
    }
    
    if (!confirm('确定要撤销此泊位排程吗？此操作不可恢复。')) {
        return;
    }

    try {
        console.log('发送DELETE请求到 /api/berths/' + scheduleId);
        const response = await fetch(`/api/berths/${scheduleId}`, {
            method: 'DELETE'
        });

        const result = await response.text();
        console.log('服务器响应：', response.status, result);

        if (response.ok) {
            alert('泊位排程已撤销！');
            // 刷新表格
            if (berthTableInstance) {
                await berthTableInstance.loadSchedules();
            }
        } else {
            alert('撤销失败：' + result);
        }
    } catch (error) {
        console.error('删除排程出错：', error);
        alert('网络错误，无法撤销排程！错误：' + error.message);
    }
}

// ============================================
// 页面初始化
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('页面初始化开始...');
    
    // 初始化表格并显示加载状态
    berthTableInstance = new BerthTable('#berthManagementTable');
    berthTableInstance.showLoading();
    
    // 并行加载港口、船舶数据和排程数据
    await Promise.all([
        PortManager.loadPorts(),
        ShipManager.loadShips(),
        berthTableInstance.loadSchedules()
    ]);
    console.log('数据加载完成，港口:', PortManager.ports.length, '条，船舶:', ShipManager.ships.length, '条');
    
    // 填充港口选择器
    PortManager.populateSelector('#createBerthModal select[name="portId"]');
    PortManager.populateSelector('#editBerthModal select[name="portId"]');
    
    // 填充船舶选择器
    ShipManager.populateSelector('#createBerthModal select[name="shipId"]');
    ShipManager.populateSelector('#editBerthModal select[name="shipId"]');
    console.log('选择器填充完成');
    
    // 4. 绑定搜索框事件
    const searchInput = document.querySelector('#berths input[type="search"]');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            if (berthTableInstance) {
                berthTableInstance.filterByKeyword(e.target.value);
            }
        });
    }
    
    // 5. 绑定刷新按钮事件
    const refreshBtn = document.querySelector('#berths .btn-outline-secondary');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            console.log('刷新按钮点击');
            if (berthTableInstance) {
                berthTableInstance.loadSchedules();
            }
            if (searchInput) searchInput.value = '';
        });
    }
    
    // 6. 绑定创建模态框保存按钮
    const createSaveBtn = document.getElementById('createSaveBtn');
    if (createSaveBtn) {
        createSaveBtn.addEventListener('click', () => {
            console.log('创建保存按钮点击');
            saveBerthSchedule();
        });
        console.log('创建保存按钮绑定成功');
    } else {
        console.error('未找到创建保存按钮');
    }
    
    // 7. 绑定编辑模态框保存按钮
    const editSaveBtn = document.getElementById('editSaveBtn');
    if (editSaveBtn) {
        editSaveBtn.addEventListener('click', () => {
            console.log('编辑保存按钮点击');
            updateBerthSchedule();
        });
        console.log('编辑保存按钮绑定成功');
    } else {
        console.error('未找到编辑保存按钮');
    }
    
    // 8. 绑定编辑模态框撤销按钮
    const editDeleteBtn = document.getElementById('editDeleteBtn');
    if (editDeleteBtn) {
        editDeleteBtn.addEventListener('click', () => {
            console.log('编辑撤销按钮点击');
            const form = document.querySelector('#editBerthModal form');
            const scheduleId = form.dataset.scheduleId;
            if (scheduleId) {
                // 关闭编辑模态框
                const modal = bootstrap.Modal.getInstance(document.getElementById('editBerthModal'));
                if (modal) modal.hide();
                // 执行删除
                deleteBerthSchedule(scheduleId);
            }
        });
        console.log('编辑撤销按钮绑定成功');
    } else {
        console.error('未找到编辑撤销按钮');
    }
    
    // 9. 填充筛选面板的船舶选择器
    ShipManager.populateSelector('#filterPanel select[name="filterShip"]');
    
    // 10. 绑定应用筛选按钮
    const applyFilterBtn = document.getElementById('applyFilterBtn');
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', () => {
            console.log('应用筛选按钮点击');
            const form = document.getElementById('filterForm');
            const filters = {
                status: form.querySelector('select[name="filterStatus"]').value,
                shipId: form.querySelector('select[name="filterShip"]').value,
                berthNumber: form.querySelector('input[name="filterBerth"]').value,
                startTime: form.querySelector('input[name="filterStartTime"]').value,
                endTime: form.querySelector('input[name="filterEndTime"]').value
            };
            console.log('筛选条件：', filters);
            
            if (berthTableInstance) {
                const count = berthTableInstance.advancedFilter(filters);
                console.log('筛选结果：', count, '条');
            }
            
            // 关闭筛选面板
            const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('filterPanel'));
            if (offcanvas) offcanvas.hide();
        });
        console.log('应用筛选按钮绑定成功');
    }
    
    // 11. 绑定清除筛选按钮
    const clearFilterBtn = document.getElementById('clearFilterBtn');
    if (clearFilterBtn) {
        clearFilterBtn.addEventListener('click', () => {
            console.log('清除筛选按钮点击');
            const form = document.getElementById('filterForm');
            form.reset();
            // 重新填充船舶选择器（因为reset会清空）
            ShipManager.populateSelector('#filterPanel select[name="filterShip"]');
            
            if (berthTableInstance) {
                berthTableInstance.render(berthTableInstance.allSchedules);
            }
            
            // 关闭筛选面板
            const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('filterPanel'));
            if (offcanvas) offcanvas.hide();
        });
        console.log('清除筛选按钮绑定成功');
    }
    
    // 12. 显示当前登录用户
    const currentUserEl = document.getElementById('currentUser');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (currentUserEl && user) {
        currentUserEl.textContent = `欢迎，${user.username}`;
    }
    
    // 13. 绑定退出登录按钮
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('确定要退出登录吗？')) {
                localStorage.removeItem('user');
                window.location.href = 'login.html';
            }
        });
    }
    
    console.log('页面初始化完成');
});
