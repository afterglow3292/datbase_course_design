// 运输任务管理模块
(function() {
    const API_BASE = '/api/transport-tasks';
    const CARGO_API = '/api/cargo';
    const WAREHOUSE_API = '/api/warehouses';
    
    let allTasks = [];
    let allCargos = [];
    let allWarehouses = [];
    let editingTaskId = null;

    // 状态映射
    const statusMap = {
        'PENDING': { text: '待执行', class: 'bg-warning' },
        'IN_TRANSIT': { text: '运输中', class: 'bg-primary' },
        'DELIVERED': { text: '已送达', class: 'bg-success' },
        'CANCELLED': { text: '已取消', class: 'bg-secondary' }
    };

    // 初始化
    document.addEventListener('DOMContentLoaded', function() {
        loadTasks();
        loadCargos();
        loadWarehouses();
        bindEvents();
    });

    // 绑定事件
    function bindEvents() {
        // 刷新按钮
        document.getElementById('refreshBtn')?.addEventListener('click', loadTasks);
        
        // 搜索
        document.getElementById('taskSearchInput')?.addEventListener('input', filterTasks);
        
        // 状态筛选
        document.getElementById('statusFilter')?.addEventListener('change', filterTasks);
        
        // 创建保存
        document.getElementById('createSaveBtn')?.addEventListener('click', createTask);
        
        // 编辑保存
        document.getElementById('editSaveBtn')?.addEventListener('click', updateTask);
        
        // 删除
        document.getElementById('editDeleteBtn')?.addEventListener('click', deleteTask);
    }

    // 加载任务列表
    async function loadTasks() {
        try {
            const response = await fetch(API_BASE);
            if (!response.ok) throw new Error('加载失败');
            allTasks = await response.json();
            renderTasks(allTasks);
        } catch (error) {
            console.error('加载运输任务失败:', error);
            showToast('加载运输任务失败', 'danger');
        }
    }

    // 加载货物列表
    async function loadCargos() {
        try {
            const response = await fetch(CARGO_API);
            if (!response.ok) throw new Error('加载失败');
            allCargos = await response.json();
            populateCargoSelects();
        } catch (error) {
            console.error('加载货物列表失败:', error);
        }
    }

    // 填充货物下拉框
    function populateCargoSelects() {
        const selects = document.querySelectorAll('select[name="cargoId"]');
        selects.forEach(select => {
            const currentValue = select.value;
            select.innerHTML = '<option value="">不关联货物</option>';
            allCargos.forEach(cargo => {
                const option = document.createElement('option');
                option.value = cargo.cargoId || cargo.id;
                option.textContent = `${cargo.cargoId || cargo.id} - ${cargo.description} (${cargo.weight}吨)`;
                select.appendChild(option);
            });
            if (currentValue) select.value = currentValue;
        });
    }

    // 加载仓库列表
    async function loadWarehouses() {
        try {
            const response = await fetch(WAREHOUSE_API);
            if (!response.ok) throw new Error('加载失败');
            allWarehouses = await response.json();
            populateWarehouseSelects();
        } catch (error) {
            console.error('加载仓库列表失败:', error);
        }
    }

    // 填充仓库下拉框（取货地点）
    function populateWarehouseSelects() {
        const selects = document.querySelectorAll('select[name="pickupLocation"]');
        selects.forEach(select => {
            const currentValue = select.value;
            select.innerHTML = '<option value="">请选择仓库</option>';
            allWarehouses.forEach(warehouse => {
                const option = document.createElement('option');
                option.value = warehouse.warehouseName;
                option.textContent = `${warehouse.warehouseName} (${warehouse.location || '未知位置'})`;
                select.appendChild(option);
            });
            if (currentValue) select.value = currentValue;
        });
    }

    // 根据货物ID获取货物信息
    function getCargoInfo(cargoId) {
        if (!cargoId) return null;
        return allCargos.find(c => (c.cargoId || c.id) === cargoId);
    }


    // 渲染任务列表
    function renderTasks(tasks) {
        const tbody = document.querySelector('#taskTable tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (tasks.length === 0) {
            tbody.innerHTML = '<tr><td colspan="11" class="text-center text-muted py-4">暂无运输任务</td></tr>';
            return;
        }
        
        tasks.forEach(task => {
            const status = statusMap[task.status] || { text: task.status, class: 'bg-secondary' };
            const cargo = getCargoInfo(task.cargoId);
            const cargoDisplay = cargo 
                ? `<span class="badge bg-info-subtle text-info">${cargo.description}</span><br><small class="text-muted">${cargo.weight}吨</small>`
                : '<span class="text-muted">-</span>';
            const driverDisplay = task.driverName 
                ? `${task.driverName}${task.driverPhone ? '<br><small class="text-muted">' + task.driverPhone + '</small>' : ''}`
                : '-';
            const tr = document.createElement('tr');
            // 列顺序：#、任务编号、关联货物、车牌号、司机、取货地点、交付地点、计划取货、计划交付、状态、操作
            tr.innerHTML = `
                <td>${task.taskId}</td>
                <td><strong>${task.taskNumber || '-'}</strong></td>
                <td>${cargoDisplay}</td>
                <td>${task.truckLicense || '-'}</td>
                <td>${driverDisplay}</td>
                <td>${task.pickupLocation || '-'}</td>
                <td>${task.deliveryLocation || '-'}</td>
                <td>${formatDateTime(task.plannedPickup)}</td>
                <td>${formatDateTime(task.plannedDelivery)}</td>
                <td><span class="badge ${status.class}">${status.text}</span></td>
                <td class="text-end">
                    <div class="btn-group btn-group-sm">
                        ${task.status === 'PENDING' ? `<button class="btn btn-outline-primary btn-start" data-id="${task.taskId}" title="开始运输"><i class="bi bi-play-fill"></i></button>` : ''}
                        ${task.status === 'IN_TRANSIT' ? `<button class="btn btn-outline-success btn-complete" data-id="${task.taskId}" title="完成配送"><i class="bi bi-check-lg"></i></button>` : ''}
                        <button class="btn btn-outline-secondary btn-edit" data-id="${task.taskId}" title="编辑"><i class="bi bi-pencil"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        // 绑定行内按钮事件
        tbody.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => openEditModal(parseInt(btn.dataset.id)));
        });
        tbody.querySelectorAll('.btn-start').forEach(btn => {
            btn.addEventListener('click', () => updateTaskStatus(parseInt(btn.dataset.id), 'IN_TRANSIT'));
        });
        tbody.querySelectorAll('.btn-complete').forEach(btn => {
            btn.addEventListener('click', () => updateTaskStatus(parseInt(btn.dataset.id), 'DELIVERED'));
        });
    }

    // 筛选任务
    function filterTasks() {
        const searchText = document.getElementById('taskSearchInput')?.value.toLowerCase() || '';
        const statusFilter = document.getElementById('statusFilter')?.value || '';
        
        const filtered = allTasks.filter(task => {
            const matchSearch = !searchText || 
                task.taskNumber?.toLowerCase().includes(searchText) ||
                task.driverName?.toLowerCase().includes(searchText) ||
                task.truckLicense?.toLowerCase().includes(searchText);
            const matchStatus = !statusFilter || task.status === statusFilter;
            return matchSearch && matchStatus;
        });
        
        renderTasks(filtered);
    }

    // 创建任务
    async function createTask() {
        const form = document.getElementById('createTaskForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        try {
            const response = await fetch(API_BASE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            
            if (result.success) {
                showToast('运输任务创建成功', 'success');
                bootstrap.Modal.getInstance(document.getElementById('createTaskModal'))?.hide();
                form.reset();
                loadTasks();
            } else {
                showToast(result.message || '创建失败', 'danger');
            }
        } catch (error) {
            console.error('创建任务失败:', error);
            showToast('创建任务失败', 'danger');
        }
    }


    // 打开编辑模态框
    function openEditModal(taskId) {
        const task = allTasks.find(t => t.taskId === taskId);
        if (!task) return;
        
        editingTaskId = taskId;
        const form = document.getElementById('editTaskForm');
        
        // 先填充下拉框选项
        populateCargoSelects();
        populateWarehouseSelects();
        
        form.querySelector('[name="taskId"]').value = task.taskId;
        form.querySelector('[name="taskNumber"]').value = task.taskNumber || '';
        form.querySelector('[name="cargoId"]').value = task.cargoId || '';
        form.querySelector('[name="truckLicense"]').value = task.truckLicense || '';
        form.querySelector('[name="driverName"]').value = task.driverName || '';
        form.querySelector('[name="driverPhone"]').value = task.driverPhone || '';
        
        // 设置取货地点（仓库选择）
        const pickupSelect = form.querySelector('[name="pickupLocation"]');
        if (pickupSelect) {
            // 尝试精确匹配，如果没有则添加一个临时选项
            const existingOption = Array.from(pickupSelect.options).find(opt => opt.value === task.pickupLocation);
            if (!existingOption && task.pickupLocation) {
                const tempOption = document.createElement('option');
                tempOption.value = task.pickupLocation;
                tempOption.textContent = task.pickupLocation + ' (历史数据)';
                pickupSelect.appendChild(tempOption);
            }
            pickupSelect.value = task.pickupLocation || '';
        }
        
        form.querySelector('[name="deliveryLocation"]').value = task.deliveryLocation || '';
        form.querySelector('[name="plannedPickup"]').value = formatDateTimeForInput(task.plannedPickup);
        form.querySelector('[name="plannedDelivery"]').value = formatDateTimeForInput(task.plannedDelivery);
        form.querySelector('[name="actualPickup"]').value = formatDateTimeForInput(task.actualPickup);
        form.querySelector('[name="actualDelivery"]').value = formatDateTimeForInput(task.actualDelivery);
        form.querySelector('[name="status"]').value = task.status || 'PENDING';
        
        new bootstrap.Modal(document.getElementById('editTaskModal')).show();
    }

    // 更新任务
    async function updateTask() {
        if (!editingTaskId) return;
        
        const form = document.getElementById('editTaskForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        try {
            const response = await fetch(`${API_BASE}/${editingTaskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            
            if (result.success) {
                showToast('运输任务更新成功', 'success');
                bootstrap.Modal.getInstance(document.getElementById('editTaskModal'))?.hide();
                loadTasks();
            } else {
                showToast(result.message || '更新失败', 'danger');
            }
        } catch (error) {
            console.error('更新任务失败:', error);
            showToast('更新任务失败', 'danger');
        }
    }

    // 更新任务状态
    async function updateTaskStatus(taskId, newStatus) {
        try {
            const response = await fetch(`${API_BASE}/${taskId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            const result = await response.json();
            
            if (result.success) {
                const statusText = statusMap[newStatus]?.text || newStatus;
                showToast(`任务状态已更新为：${statusText}`, 'success');
                loadTasks();
            } else {
                showToast(result.message || '状态更新失败', 'danger');
            }
        } catch (error) {
            console.error('更新状态失败:', error);
            showToast('更新状态失败', 'danger');
        }
    }

    // 删除任务
    async function deleteTask() {
        if (!editingTaskId) return;
        
        if (!confirm('确定要删除这个运输任务吗？')) return;
        
        try {
            const response = await fetch(`${API_BASE}/${editingTaskId}`, {
                method: 'DELETE'
            });
            const result = await response.json();
            
            if (result.success) {
                showToast('运输任务已删除', 'success');
                bootstrap.Modal.getInstance(document.getElementById('editTaskModal'))?.hide();
                loadTasks();
            } else {
                showToast(result.message || '删除失败', 'danger');
            }
        } catch (error) {
            console.error('删除任务失败:', error);
            showToast('删除任务失败', 'danger');
        }
    }

    // 格式化日期时间显示
    function formatDateTime(dateTimeStr) {
        if (!dateTimeStr) return '-';
        const date = new Date(dateTimeStr);
        return date.toLocaleString('zh-CN', { 
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
    }

    // 格式化日期时间用于input
    function formatDateTimeForInput(dateTimeStr) {
        if (!dateTimeStr) return '';
        const date = new Date(dateTimeStr);
        return date.toISOString().slice(0, 16);
    }

    // 显示提示
    function showToast(message, type = 'info') {
        // 使用简单的alert，或者可以集成更好的toast组件
        if (type === 'danger') {
            alert('错误: ' + message);
        } else if (type === 'success') {
            console.log('成功: ' + message);
        }
    }
})();
