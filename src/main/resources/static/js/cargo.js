let currentEditingCargoId = null;
let tables = [];

class CargoTable {
    constructor(selector) {
        this.endpoint = '/api/cargo';
        this.tableBody = document.querySelector(`${selector} tbody`);
        this.isActive = Boolean(this.tableBody);
        this.searchTerm = '';
        // 不在构造函数中自动加载，等待船舶数据加载完成后再加载
    }

    async loadCargo(searchTerm) {
        if (!this.isActive) {
            return;
        }
        if (typeof searchTerm === 'string') {
            this.searchTerm = searchTerm.trim();
        }
        const query = this.searchTerm ? `?q=${encodeURIComponent(this.searchTerm)}` : '';
        try {
            const response = await fetch(`${this.endpoint}${query}`);
            if (!response.ok) {
                throw new Error(`加载货物失败，状态码：${response.status}`);
            }
            const data = await response.json();
            this.allCargo = data; // 缓存所有数据用于筛选
            this.render(data);
        } catch (error) {
            console.error(error);
            this.tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-danger">无法加载货物数据，请稍后重试</td>
                </tr>
            `;
        }
    }

    // 带筛选条件加载货物
    async loadCargoWithFilter(filters) {
        console.log('loadCargoWithFilter 被调用，filters:', filters);
        
        if (!this.isActive) {
            console.log('表格不活动，跳过');
            return;
        }
        
        // 先确保有数据
        if (!this.allCargo || this.allCargo.length === 0) {
            console.log('缓存数据为空，重新加载');
            await this.loadCargo();
        }
        
        console.log('原始数据数量：', this.allCargo?.length || 0);
        
        let filtered = [...(this.allCargo || [])];
        
        // 按分配状态筛选
        if (filters.status === 'assigned') {
            filtered = filtered.filter(item => item.shipId != null && item.shipId > 0);
            console.log('已分配筛选后：', filtered.length);
        } else if (filters.status === 'unassigned') {
            filtered = filtered.filter(item => item.shipId == null || item.shipId === 0);
            console.log('待分配筛选后：', filtered.length);
        }
        
        // 按船舶筛选
        if (filters.shipId) {
            filtered = filtered.filter(item => item.shipId === parseInt(filters.shipId));
            console.log('船舶筛选后：', filtered.length);
        }
        
        // 按目的地筛选
        if (filters.destination) {
            const keyword = filters.destination.toLowerCase();
            filtered = filtered.filter(item => 
                (item.destination || '').toLowerCase().includes(keyword)
            );
            console.log('目的地筛选后：', filtered.length);
        }
        
        // 按重量范围筛选
        if (filters.weightMin) {
            const min = parseFloat(filters.weightMin);
            filtered = filtered.filter(item => item.weight >= min);
            console.log('最小重量筛选后：', filtered.length);
        }
        if (filters.weightMax) {
            const max = parseFloat(filters.weightMax);
            filtered = filtered.filter(item => item.weight <= max);
            console.log('最大重量筛选后：', filtered.length);
        }
        
        console.log('最终筛选结果数量：', filtered.length);
        this.render(filtered);
    }

    render(items) {
        this.tableBody.innerHTML = '';
        items.forEach((item) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="text-muted">${item.id ?? '-'}</td>
                <td class="fw-semibold">${item.description ?? '-'}</td>
                <td>${this.formatWeight(item.weight)}</td>
                <td>${item.destination ?? '-'}</td>
                <td>${this.resolveShip(item)}</td>
                <td>${this.renderStatus(item.shipId)}</td>
            `;

            const actionCell = document.createElement('td');
            actionCell.className = 'text-end';
            actionCell.innerHTML = `
                <button class="btn btn-sm btn-outline-primary me-1">编辑</button>
                <button class="btn btn-sm btn-outline-danger">删除</button>
            `;
            row.appendChild(actionCell);

            const editBtn = actionCell.querySelector('.btn-outline-primary');
            editBtn.addEventListener('click', () => openEditCargoModal(item));

            const deleteBtn = actionCell.querySelector('.btn-outline-danger');
            deleteBtn.addEventListener('click', () => handleDeleteCargo(item.id));

            this.tableBody.appendChild(row);
        });
    }

    renderStatus(shipId) {
        if (shipId == null) {
            return '<span class="badge bg-warning-subtle text-warning">待分配</span>';
        }
        return '<span class="badge bg-success-subtle text-success">已分配</span>';
    }

    resolveShip(item) {
        // 优先使用后端返回的shipName（通过JOIN查询获取）
        if (item.shipName) {
            return item.shipName;
        }
        // shipId实际上是voyage_plan_id，不能直接用来查找船舶
        // 如果后端没有返回shipName，显示航次信息或待分配
        if (item.shipId == null || item.shipId === 0) {
            return '待分配';
        }
        // 显示航次ID（等待后端重启后会显示正确的船舶名称）
        return `航次 #${item.shipId}`;
    }

    formatWeight(value) {
        if (typeof value !== 'number') {
            return '-';
        }
        return value.toFixed(2);
    }
}

async function populateShipOptions(select, selectedShipId) {
    if (!select) {
        return;
    }
    select.innerHTML = '<option value=\"\">暂不分配</option>';
    try {
        const resp = await fetch('/api/ships');
        if (!resp.ok) {
            throw new Error('加载船舶列表失败');
        }
        const ships = await resp.json();
        ships.forEach((ship) => {
            const option = document.createElement('option');
            option.value = ship.id;
            option.textContent = `#${ship.id} · ${ship.name}`;
            if (selectedShipId != null && Number(selectedShipId) === ship.id) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    } catch (error) {
        console.error(error);
        select.innerHTML = '<option value=\"\">无法获取船舶列表</option>';
    }
}

function setupCreateCargoForm(tablesRef) {
    const form = document.getElementById('createCargoForm');
    const modalElement = document.getElementById('createCargoModal');
    if (!form) {
        return;
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const payload = {
            description: form.elements.description.value.trim(),
            weight: Number(form.elements.weight.value),
            destination: form.elements.destination.value.trim(),
            shipId: form.elements.shipId.value ? Number(form.elements.shipId.value) : null
        };

        if (!payload.description || !payload.destination || Number.isNaN(payload.weight)) {
            alert('请完整填写描述、目的地与重量');
            return;
        }

        try {
            const response = await fetch('/api/cargo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                throw new Error(await response.text());
            }
            form.reset();
            if (modalElement && window.bootstrap) {
                const modal = bootstrap.Modal.getInstance(modalElement);
                modal?.hide();
            }
            await Promise.all(tablesRef.map((table) => table.loadCargo()));
        } catch (error) {
            console.error(error);
            alert('创建货物失败，请稍后重试');
        }
    });
}

async function openEditCargoModal(cargo) {
    const form = document.getElementById('editCargoForm');
    const modalElement = document.getElementById('editCargoModal');
    if (!form || !modalElement) {
        return;
    }

    const select = form.querySelector('select[name=\"shipId\"]');
    await populateShipOptions(select, cargo.shipId);

    form.elements.description.value = cargo.description ?? '';
    form.elements.weight.value = cargo.weight ?? '';
    form.elements.destination.value = cargo.destination ?? '';
    form.elements.shipId.value = cargo.shipId ?? '';

    currentEditingCargoId = cargo.id;
    if (window.bootstrap) {
        window.bootstrap.Modal.getOrCreateInstance(modalElement).show();
    }
}

function setupEditCargoForm(tablesRef) {
    const form = document.getElementById('editCargoForm');
    const modalElement = document.getElementById('editCargoModal');
    if (!form || !modalElement) {
        return;
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!currentEditingCargoId) {
            return;
        }

        const payload = {
            description: form.elements.description.value.trim(),
            weight: Number(form.elements.weight.value),
            destination: form.elements.destination.value.trim(),
            shipId: form.elements.shipId.value ? Number(form.elements.shipId.value) : null
        };

        if (!payload.description || !payload.destination || Number.isNaN(payload.weight)) {
            alert('请完整填写描述、目的地与重量');
            return;
        }

        try {
            const response = await fetch(`/api/cargo/${currentEditingCargoId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                throw new Error(await response.text());
            }
            currentEditingCargoId = null;
            if (window.bootstrap) {
                const modal = bootstrap.Modal.getInstance(modalElement);
                modal?.hide();
            }
            await Promise.all(tablesRef.map((table) => table.loadCargo()));
        } catch (error) {
            console.error(error);
            alert('更新货物失败，请稍后重试');
        }
    });
}

function setupCargoSearch(tablesRef) {
    const searchInput = document.getElementById('cargoSearchInput');
    const resetBtn = document.getElementById('cargoSearchReset');
    if (!searchInput) {
        return;
    }

    const triggerSearch = async () => {
        await Promise.all(tablesRef.map((table) => table.loadCargo(searchInput.value)));
    };

    let debounceTimer = null;
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(triggerSearch, 250);
    });

    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            clearTimeout(debounceTimer);
            triggerSearch();
        }
    });

    searchInput.addEventListener('blur', () => triggerSearch());

    if (resetBtn) {
        resetBtn.addEventListener('click', (event) => {
            event.preventDefault();
            clearTimeout(debounceTimer);
            searchInput.value = '';
            triggerSearch();
        });
    }
}

async function handleDeleteCargo(cargoId) {
    if (!cargoId) {
        return;
    }
    const confirmed = window.confirm('确认删除该货物吗？此操作无法撤销');
    if (!confirmed) {
        return;
    }
    try {
        const response = await fetch(`/api/cargo/${cargoId}`, { method: 'DELETE' });
        if (!response.ok) {
            throw new Error(await response.text());
        }
        await Promise.all(tables.map((table) => table.loadCargo()));
    } catch (error) {
        console.error(error);
        alert('删除货物失败，请稍后重试');
    }
}

// 填充筛选面板的船舶选择器
function populateFilterShipOptions() {
    const select = document.getElementById('filterShipSelect');
    if (!select) {
        console.log('筛选船舶选择器未找到');
        return;
    }
    
    select.innerHTML = '<option value="">全部</option>';
    
    if (!window.ships || window.ships.length === 0) {
        console.log('船舶数据为空，无法填充筛选选择器');
        return;
    }
    
    console.log('填充筛选船舶选择器，船舶数量：', window.ships.length);
    window.ships.forEach(ship => {
        const option = document.createElement('option');
        option.value = ship.id;
        option.textContent = `#${ship.id} · ${ship.name}`;
        select.appendChild(option);
    });
}

// 设置筛选功能
function setupCargoFilter(tablesRef) {
    const applyBtn = document.getElementById('applyCargoFilterBtn');
    const clearBtn = document.getElementById('clearCargoFilterBtn');
    const form = document.getElementById('cargoFilterForm');
    
    console.log('设置筛选功能，applyBtn:', !!applyBtn, 'form:', !!form);
    
    if (!applyBtn || !form) {
        console.error('筛选按钮或表单未找到');
        return;
    }
    
    applyBtn.addEventListener('click', async () => {
        console.log('应用筛选按钮被点击');
        
        try {
            const filters = {
                status: form.querySelector('select[name="filterStatus"]')?.value || '',
                shipId: form.querySelector('select[name="filterShip"]')?.value || '',
                destination: form.querySelector('input[name="filterDestination"]')?.value?.trim() || '',
                weightMin: form.querySelector('input[name="filterWeightMin"]')?.value || '',
                weightMax: form.querySelector('input[name="filterWeightMax"]')?.value || ''
            };
            
            console.log('筛选条件：', filters);
            
            // 应用筛选到所有表格
            for (const table of tablesRef) {
                await table.loadCargoWithFilter(filters);
            }
            
            console.log('筛选完成');
            
            // 关闭筛选面板
            const filterPanel = document.getElementById('filterPanel');
            if (filterPanel && window.bootstrap) {
                const offcanvas = bootstrap.Offcanvas.getInstance(filterPanel);
                if (offcanvas) {
                    offcanvas.hide();
                }
            }
        } catch (error) {
            console.error('筛选出错：', error);
        }
    });
    
    console.log('应用筛选按钮事件绑定成功');
    
    if (clearBtn) {
        clearBtn.addEventListener('click', async () => {
            console.log('清除筛选按钮被点击');
            form.reset();
            // 重新填充船舶选择器
            populateFilterShipOptions();
            // 重新加载所有数据
            await Promise.all(tablesRef.map(table => table.loadCargo()));
            
            // 关闭筛选面板
            const filterPanel = document.getElementById('filterPanel');
            if (filterPanel && window.bootstrap) {
                const offcanvas = bootstrap.Offcanvas.getInstance(filterPanel);
                if (offcanvas) {
                    offcanvas.hide();
                }
            }
        });
        console.log('清除筛选按钮事件绑定成功');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('货物管理页面初始化开始...');
    
    // 先加载船舶数据到全局变量
    try {
        const resp = await fetch('/api/ships');
        if (resp.ok) {
            window.ships = await resp.json();
            console.log('船舶数据加载成功，数量：', window.ships.length);
        }
    } catch (e) {
        console.error('加载船舶列表失败', e);
        window.ships = [];
    }
    
    tables = ['#cargoManagementTable', '#cargoTable']
        .map((selector) => new CargoTable(selector))
        .filter((table) => table.isActive);
    
    console.log('活动表格数量：', tables.length);
    
    // 船舶数据加载完成后，再加载货物数据
    await Promise.all(tables.map((table) => table.loadCargo()));
    
    setupCreateCargoForm(tables);
    setupEditCargoForm(tables);
    setupCargoSearch(tables);
    
    // 设置筛选功能 - 确保在DOM完全加载后执行
    console.log('开始设置筛选功能...');
    setupCargoFilter(tables);
    
    // 填充筛选面板的船舶选择器
    populateFilterShipOptions();
    
    const createSelect = document.querySelector('#createCargoModal select[name="shipId"]');
    populateShipOptions(createSelect);
    
    // 显示当前登录用户
    const currentUserEl = document.getElementById('currentUser');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (currentUserEl && user) {
        currentUserEl.textContent = `欢迎，${user.username}`;
    }
    
    // 绑定退出登录按钮
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('确定要退出登录吗？')) {
                localStorage.removeItem('user');
                window.location.href = 'login.html';
            }
        });
    }
    
    console.log('货物管理页面初始化完成');
});
