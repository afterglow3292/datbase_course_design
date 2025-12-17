// 港口管理模块
(function() {
    const API_BASE = '/api/ports';
    
    let allPorts = [];
    let editingPortId = null;

    // 初始化
    document.addEventListener('DOMContentLoaded', function() {
        loadPorts();
        bindEvents();
    });

    // 绑定事件
    function bindEvents() {
        document.getElementById('refreshBtn')?.addEventListener('click', loadPorts);
        document.getElementById('portSearchInput')?.addEventListener('input', filterPorts);
        document.getElementById('countryFilter')?.addEventListener('change', filterPorts);
        document.getElementById('createSaveBtn')?.addEventListener('click', createPort);
        document.getElementById('editSaveBtn')?.addEventListener('click', updatePort);
        document.getElementById('editDeleteBtn')?.addEventListener('click', deletePort);
    }

    // 加载港口列表
    async function loadPorts() {
        try {
            const response = await fetch(API_BASE);
            if (!response.ok) throw new Error('加载失败');
            allPorts = await response.json();
            renderPorts(allPorts);// 渲染港口列表
            populateCountryFilter();// 填充国家筛选下拉框
        } catch (error) {
            console.error('加载港口失败:', error);
            showToast('加载港口失败', 'danger');
        }
    }

    // 填充国家筛选下拉框
    function populateCountryFilter() {
        const select = document.getElementById('countryFilter');
        if (!select) return;
        
        const countries = [...new Set(allPorts.map(p => p.country))].sort();
        const currentValue = select.value;
        select.innerHTML = '<option value="">全部国家</option>';
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            select.appendChild(option);
        });
        if (currentValue) select.value = currentValue;
    }

    // 渲染港口列表
    function renderPorts(ports) {
        const tbody = document.querySelector('#portTable tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (ports.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted py-4">暂无港口数据</td></tr>';
            return;
        }
        
        ports.forEach(port => {
            const coords = (port.latitude && port.longitude) 
                ? `${port.latitude.toFixed(4)}, ${port.longitude.toFixed(4)}` 
                : '-';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${port.portId}</td>
                <td><strong>${port.portCode}</strong></td>
                <td>${port.portName}</td>
                <td>${port.country}</td>
                <td>${port.city || '-'}</td>
                <td>${port.totalBerths}</td>
                <td>${port.maxVesselSize ? port.maxVesselSize.toFixed(2) : '-'}</td>
                <td><small class="text-muted">${coords}</small></td>
                <td class="text-end">
                    <button class="btn btn-outline-secondary btn-sm btn-edit" data-id="${port.portId}" title="编辑">
                        <i class="bi bi-pencil"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        tbody.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => openEditModal(parseInt(btn.dataset.id)));
        });
    }


    // 筛选港口
    function filterPorts() {
        const searchText = document.getElementById('portSearchInput')?.value.toLowerCase() || '';
        const countryFilter = document.getElementById('countryFilter')?.value || '';
        
        const filtered = allPorts.filter(port => {
            const matchSearch = !searchText || 
                port.portCode?.toLowerCase().includes(searchText) ||
                port.portName?.toLowerCase().includes(searchText) ||
                port.city?.toLowerCase().includes(searchText);
            const matchCountry = !countryFilter || port.country === countryFilter;
            return matchSearch && matchCountry;
        });
        
        renderPorts(filtered);
    }

    // 创建港口
    async function createPort() {
        const form = document.getElementById('createPortForm');
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
                showToast('港口创建成功', 'success');
                bootstrap.Modal.getInstance(document.getElementById('createPortModal'))?.hide();
                form.reset();
                loadPorts();
            } else {
                showToast(result.message || '创建失败', 'danger');
            }
        } catch (error) {
            console.error('创建港口失败:', error);
            showToast('创建港口失败', 'danger');
        }
    }

    // 打开编辑模态框
    function openEditModal(portId) {
        const port = allPorts.find(p => p.portId === portId);
        if (!port) return;
        
        editingPortId = portId;
        const form = document.getElementById('editPortForm');
        
        form.querySelector('[name="portId"]').value = port.portId;
        form.querySelector('[name="portCode"]').value = port.portCode || '';
        form.querySelector('[name="portName"]').value = port.portName || '';
        form.querySelector('[name="country"]').value = port.country || '';
        form.querySelector('[name="city"]').value = port.city || '';
        form.querySelector('[name="latitude"]').value = port.latitude || '';
        form.querySelector('[name="longitude"]').value = port.longitude || '';
        form.querySelector('[name="totalBerths"]').value = port.totalBerths || 0;
        form.querySelector('[name="maxVesselSize"]').value = port.maxVesselSize || '';
        
        new bootstrap.Modal(document.getElementById('editPortModal')).show();
    }

    // 更新港口
    async function updatePort() {
        if (!editingPortId) return;
        
        const form = document.getElementById('editPortForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        try {
            const response = await fetch(`${API_BASE}/${editingPortId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            
            if (result.success) {
                showToast('港口更新成功', 'success');
                bootstrap.Modal.getInstance(document.getElementById('editPortModal'))?.hide();
                loadPorts();
            } else {
                showToast(result.message || '更新失败', 'danger');
            }
        } catch (error) {
            console.error('更新港口失败:', error);
            showToast('更新港口失败', 'danger');
        }
    }

    // 删除港口
    async function deletePort() {
        if (!editingPortId) return;
        
        if (!confirm('确定要删除这个港口吗？')) return;
        
        try {
            const response = await fetch(`${API_BASE}/${editingPortId}`, {
                method: 'DELETE'
            });
            const result = await response.json();
            
            if (result.success) {
                showToast('港口已删除', 'success');
                bootstrap.Modal.getInstance(document.getElementById('editPortModal'))?.hide();
                loadPorts();
            } else {
                showToast(result.message || '删除失败', 'danger');
            }
        } catch (error) {
            console.error('删除港口失败:', error);
            showToast('删除港口失败', 'danger');
        }
    }

    // 显示提示
    function showToast(message, type = 'info') {
        if (type === 'danger') {
            alert('错误: ' + message);
        } else if (type === 'success') {
            console.log('成功: ' + message);
        }
    }
})();
