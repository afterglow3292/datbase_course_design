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

document.addEventListener('DOMContentLoaded', async () => {
    // 先加载船舶数据到全局变量
    try {
        const resp = await fetch('/api/ships');
        if (resp.ok) {
            window.ships = await resp.json();
        }
    } catch (e) {
        console.error('加载船舶列表失败', e);
        window.ships = [];
    }
    
    tables = ['#cargoManagementTable', '#cargoTable']
        .map((selector) => new CargoTable(selector))
        .filter((table) => table.isActive);
    
    // 船舶数据加载完成后，再加载货物数据
    await Promise.all(tables.map((table) => table.loadCargo()));
    
    setupCreateCargoForm(tables);
    setupEditCargoForm(tables);
    setupCargoSearch(tables);
    const createSelect = document.querySelector('#createCargoModal select[name=\"shipId\"]');
    populateShipOptions(createSelect);
});
